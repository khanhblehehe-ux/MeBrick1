const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'traffic.log');

function now() {
  return new Date().toISOString();
}

module.exports = function trafficLogger(req, res, next) {
  const start = Date.now();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  const method = req.method;
  const url = req.originalUrl || req.url;
  const reqBytes = Number(req.headers['content-length'] || 0);

  let bytesWritten = 0;
  const origWrite = res.write;
  const origEnd = res.end;

  res.write = function (chunk, encoding, cb) {
    try {
      if (chunk) {
        bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk), encoding || 'utf8');
      }
    } catch (e) {}
    return origWrite.call(this, chunk, encoding, cb);
  };

  res.end = function (chunk, encoding, cb) {
    try {
      if (chunk) {
        bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk), encoding || 'utf8');
      }
    } catch (e) {}
    const duration = Date.now() - start;
    const entry = {
      t: now(),
      ip: String(ip),
      method,
      url,
      status: res.statusCode,
      reqBytes,
      resBytes: bytesWritten,
      durationMs: duration,
      ua: ua.slice(0, 200),
    };
    try {
      fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    } catch (e) {
      // ignore
    }
    return origEnd.call(this, chunk, encoding, cb);
  };

  next();
};
