const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

// Encrypt sensitive data
const encrypt = (text) => {
  if (!text) return null;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, SECRET_KEY);
  cipher.setAAD(Buffer.from('sensitive-data'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

// Decrypt sensitive data
const decrypt = (encryptedData) => {
  if (!encryptedData || !encryptedData.encrypted) return null;
  
  try {
    const decipher = crypto.createDecipher(ALGORITHM, SECRET_KEY);
    decipher.setAAD(Buffer.from('sensitive-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Fields that need encryption
const SENSITIVE_FIELDS = ['phone', 'pan', 'aadhaar', 'bankAccount', 'address'];

// Encrypt sensitive fields in object
const encryptSensitiveFields = (data) => {
  const encrypted = { ...data };
  
  SENSITIVE_FIELDS.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encrypt(encrypted[field]);
    }
  });
  
  return encrypted;
};

// Decrypt sensitive fields in object
const decryptSensitiveFields = (data) => {
  const decrypted = { ...data };
  
  SENSITIVE_FIELDS.forEach(field => {
    if (decrypted[field]) {
      decrypted[field] = decrypt(decrypted[field]);
    }
  });
  
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
  encryptSensitiveFields,
  decryptSensitiveFields,
  SENSITIVE_FIELDS
};