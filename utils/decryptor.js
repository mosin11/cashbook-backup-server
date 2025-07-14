const crypto = require('crypto');
const logger = require('./logger');

// Secret configuration
const SECRET_KEY =  process.env.SECRET_KEY;; // Should match frontend
const algorithm = 'aes-256-gcm';
function decryptData(payload) {
  logger.info('Decrypting base64 payload...');
  try {
    const iv = Buffer.from(payload.iv, 'base64');
    const encrypted = Buffer.from(payload.ciphertext, 'base64');


    // 🔑 Derive key inside the function
    const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
   
    // Extract auth tag from end
    const authTag = encrypted.slice(encrypted.length - 16);
    const actualCiphertext = encrypted.slice(0, encrypted.length - 16);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag); // Very important for AES-GCM

    const decrypted = Buffer.concat([
      decipher.update(actualCiphertext),
      decipher.final()
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  } catch (err) {
    logger.error('Decryption failed:', err);
    
    throw new Error('Invalid encrypted payload');
  }
}

module.exports = { decryptData };
