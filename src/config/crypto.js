import CryptoJS from 'crypto-js';

const crypto = {
  encrypt: clear => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex)
};

export default crypto;
