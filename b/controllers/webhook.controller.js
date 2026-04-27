const db = require('../db');
const crypto = require('crypto');

function buildVnpDataString(params) {
  return Object.keys(params)
    .filter(k => k.startsWith('vnp_') && k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType')
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
}

async function handleVnPay(req, res, params) {
  const secret = process.env.VNPAY_HASH_SECRET;
  if (!secret) {
    console.warn('Missing VNPAY_HASH_SECRET');
    return res.status(500).json({ message: 'Server misconfigured' });
  }

  const providedHash = (params.vnp_SecureHash || '').toString();
  const data = buildVnpDataString(params);
  const computed = crypto.createHmac('sha512', secret).update(data).digest('hex');
  if (computed.toLowerCase() !== providedHash.toLowerCase()) {
    console.warn('VNPAY signature mismatch', { providedHash, computed });
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const orderId = Number(params.vnp_TxnRef);
  const amount = Number(params.vnp_Amount || 0) / 100; // VNPAY amount often in cents
  const txId = params.vnp_TransactionNo || params.vnp_TransNo || null;
  const rspCode = params.vnp_ResponseCode || '99';

  if (!orderId) return res.status(400).json({ message: 'Missing vnp_TxnRef' });

  const { data: order, error: selErr } = await db
    .from('orders')
    .select('id, total_amount, pay_amount, payment_status')
    .eq('id', orderId)
    .single();

  if (selErr || !order) {
    console.warn('Order not found for VNPAY webhook', orderId, selErr);
    return res.status(404).json({ RspCode: '01', Message: 'Order not found' });
  }

  if (order.payment_status === 'paid') {
    return res.status(200).json({ RspCode: '00', Message: 'Already processed' });
  }

  const expectedAmount = order.pay_amount ?? order.total_amount;
  if (Number.isFinite(amount) && Number(amount) !== Number(expectedAmount)) {
    console.warn('VNPAY amount mismatch', { orderId, amount, expectedAmount });
    // Flag mismatch but reply success so VNPAY won't retry; mark for manual review
    await db.from('orders').update({ payment_status: 'paid_mismatch', transaction_id: txId, payment_provider: 'vnpay', paid_at: new Date().toISOString() }).eq('id', orderId);
    return res.status(200).json({ RspCode: '00', Message: 'Confirm Success (amount mismatch marked)' });
  }

  // Update order as paid
  const { data: updated, error: updErr } = await db
    .from('orders')
    .update({ payment_status: 'paid', transaction_id: txId, payment_provider: 'vnpay', paid_at: new Date().toISOString() })
    .eq('id', orderId)
    .select();

  if (updErr) {
    console.error('Failed to update order from VNPAY webhook', updErr);
    return res.status(500).json({ RspCode: '99', Message: 'Update failed' });
  }

  // Respond according to VNPAY expectation
  return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
}

// Generic handler fallback (keeps previous behavior)
async function handleGeneric(req, res, payload) {
  try {
    const signature = req.headers['x-signature'] || req.headers['x-pay-signature'];
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (secret && signature) {
      const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
      const sigBuf = Buffer.from(String(signature));
      const expBuf = Buffer.from(String(expected));
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        console.warn('Webhook signature mismatch');
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }

    const orderId = Number(payload.order_id || payload.orderId || payload.id);
    const amount = payload.amount ?? payload.total ?? payload.pay_amount;
    const txId = payload.tx_id || payload.transaction_id || payload.txid || payload.payment_id;
    const status = String(payload.status || payload.payment_status || 'unknown').toLowerCase();

    if (!orderId) {
      return res.status(400).json({ message: 'order_id is required' });
    }

    const { data: order, error: selectErr } = await db
      .from('orders')
      .select('id, total_amount, pay_amount, payment_status')
      .eq('id', orderId)
      .single();

    if (selectErr || !order) {
      console.warn('Order not found for webhook', orderId, selectErr);
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment_status === 'paid') {
      return res.status(200).json({ message: 'Already paid' });
    }

    const expectedAmount = order.pay_amount ?? order.total_amount;
    if (typeof amount === 'number' && Number(amount) !== Number(expectedAmount)) {
      console.warn('Payment amount mismatch', { orderId, amount, expectedAmount });
      return res.status(400).json({ message: 'Amount mismatch' });
    }

    const newStatus = (status === 'success' || status === 'paid' || status === 'completed') ? 'paid' : status;

    const updates = {
      payment_status: newStatus,
      payment_provider: payload.provider || null,
      transaction_id: txId || null,
      paid_at: new Date().toISOString(),
    };

    const { data: updated, error: updErr } = await db
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select();

    if (updErr) {
      console.error('Failed to update order from webhook', updErr);
      return res.status(500).json({ message: 'Update failed' });
    }

    return res.status(200).json({ success: true, order: updated?.[0] || null });
  } catch (e) {
    console.error('Generic webhook error', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.handlePaymentWebhook = async (req, res) => {
  try {
    // Merge query and body so we accept both POST form and redirect GET params
    const params = { ...req.query, ...req.body };

    // If looks like VNPAY (vnp_ prefixed parameters)
    if (Object.keys(params).some(k => k.startsWith('vnp_'))) {
      return await handleVnPay(req, res, params);
    }

    // Fallback to generic handler
    return await handleGeneric(req, res, req.body || {});
  } catch (e) {
    console.error('Webhook handler error', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
