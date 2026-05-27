import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly masterKey: Buffer;

  constructor() {
    const rawKey = process.env.TOKEN_ENCRYPTION_KEY || 'tgw_secure_master_key_for_meta';
    // Key must be exactly 32 bytes for AES-256
    this.masterKey = Buffer.alloc(32);
    Buffer.from(rawKey).copy(this.masterKey);
  }

  encrypt(text: string): { ciphertext: string; iv: string; authTag: string } {
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);

      let ciphertext = cipher.update(text, 'utf8', 'hex');
      ciphertext += cipher.final('hex');

      const authTag = cipher.getAuthTag().toString('hex');

      return {
        ciphertext,
        iv: iv.toString('hex'),
        authTag,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to encrypt access token.');
    }
  }

  decrypt(ciphertext: string, ivHex: string, authTagHex: string): string {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new InternalServerErrorException('Failed to decrypt access token.');
    }
  }
}
