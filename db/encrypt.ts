import fs from 'fs';
import crypto from 'crypto';

const {
    DB_PASSWORD,
    DB_DECRYPTED_FILE = './sqlite.db',
    DB_ENCRYPTED_FILE = '../public/encrypted-sqlite.db',
} = process.env;

async function encryptFile(inputFile: fs.PathOrFileDescriptor, outputFile: fs.PathOrFileDescriptor, password: crypto.BinaryLike | undefined) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  
  if (!password) {
    throw new Error('Password is required. Please set the DB_PASSWORD environment variable.');
  }

  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const input = fs.readFileSync(inputFile);
  
  const encrypted = Buffer.concat([
    cipher.update(input),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  const result = Buffer.concat([salt, iv, encrypted, authTag]);
  
  fs.writeFileSync(outputFile, result);
}

encryptFile(DB_DECRYPTED_FILE, DB_ENCRYPTED_FILE, DB_PASSWORD);