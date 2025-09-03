const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-1234';
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text || typeof text !== 'string') return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return as a single string with IV and encrypted data separated by a colon
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Encryption failed:', err);
    return text; // Return original if encryption fails
  }
}

function decrypt(encryptedText) {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;
  
  try {
    const [ivHex, encryptedData] = encryptedText.split(':');
    if (!ivHex || !encryptedData) return encryptedText;
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    return encryptedText; // Return original if decryption fails
  }
}

module.exports = { encrypt, decrypt };