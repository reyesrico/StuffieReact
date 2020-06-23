import CryptoJS from 'crypto-js';

const crypto = {
  encrypt: clear => CryptoJS.SHA256(clear).toString(CryptoJS.enc.Hex),
};

export default crypto;


// TODO: TRY THIS ONE
// var crypto = require('crypto');

// var password = 'monkey';

// // we will use another hash other SHA-256 during the course, this is just for demo purposes
// var hash = crypto.createHash('sha256').update(password).digest('hex');
