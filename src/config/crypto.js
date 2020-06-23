import CryptoJS from 'crypto-js';
import cryptoLib from 'crypto';

const crypto = {
  encrypt: clear => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),
  digest: clear => cryptoLib.createHash('sha256').update(clear).digest('hex'),
  pbkdf2: (clear, salt) => {
    return new Promise((resolve, reject) => {
      cryptoLib.pbkdf2(clear, salt, 100, 256, 'sha256',
        (err, derivedKey) => err ? reject(err) : resolve(derivedKey.toString('hex'))
      );
    });
  }
};

export default crypto;
