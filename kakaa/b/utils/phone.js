function normalizePhoneVN(phone) {
  if (!phone) return null;

  let p = String(phone).replace(/\D/g, "");

  // 0xxx → 84xxx
  if (p.startsWith("0")) {
    p = "84" + p.slice(1);
  }

  // Nếu không phải 84 thì reject
  if (!p.startsWith("84")) {
    return null;
  }

  return p;
}

function isValidVietnamPhone(phone) {
  if (!phone) return false;

  // 84 + 9 số (VD: 84981234567)
  return /^84\d{9}$/.test(phone);
}

module.exports = {
  normalizePhoneVN,
  isValidVietnamPhone,
};