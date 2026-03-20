import crypto from 'crypto';

// 1. 암호화 설정 (ARIA-128-CBC)
const algorithm = 'aria-128-cbc'; 
const key = Buffer.from('95fc57c09dc1c6bcde7a6058257ef99b','hex') ;
const iv = crypto.randomBytes(16);  // 16 bytes = 128 bits
console.log(iv.toString('hex'));

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 2. 실행
const plainText = '안녕. ARIA128 암호화 예제인데 잘봐.';
const encrypted = encrypt(plainText);
const decrypted = decrypt(encrypted);

console.log('원본:', plainText);
console.log('암호화:', encrypted);
console.log('복호화:', decrypted);