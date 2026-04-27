const express = require('express');
const router = express.Router();
const controller = require('../controllers/webhook.controller');

// Accept both JSON and URL-encoded payloads (VNPAY uses form-encoded)
router.post(
  '/payment',
  express.json({ type: 'application/json' }),
  express.urlencoded({ extended: false }),
  controller.handlePaymentWebhook
);

module.exports = router;
