
// useCodehooks = true: use Codehooks as backend
// otherwise use RestDB as backend
export const useCodehooks = true; // false;

const data = {
  cloudinary: {
    url: 'https://res.cloudinary.com/reyesrico/image/upload/c_scale,f_auto,w_100/v1',
    urlSingle: 'https://res.cloudinary.com/reyesrico/image/upload',
    cloudName: 'reyesrico',
    apiKey: '981789986692969',
    apiSecret: process.env.REACT_APP_CLOUDINARY_API_SECRET,
    uploadPreset: 'itzef221'
  },
  cloudinary_headers: {
    'cache-control': 'no-cache',
    'x-apikey': '981789986692969'
  },
  fb: {
    appId: "1458399831108421"
  },
  headers: {
    restdb: {
      'cache-control': 'no-cache',
      'x-apikey': '5c932ad1cac6621685acc11e' //'20596935c72a29593312b65ac2075c86eb1ac',  
    }, 
    codehooks: {
      'x-apikey': '9c08fdfb-ef7d-426e-922a-9ccbb9e70771',
      'Content-Type': 'application/json'
    }
  },
  server: {
    restdb: 'https://stuffie-98b2.restdb.io/rest/',
    codehooks: 'https://stuffie-2u0v.api.codehooks.io/dev/'
  }
};

const config = {
  ...data,
  server: useCodehooks ? data.server.codehooks : data.server.restdb,
  headers: useCodehooks ? data.headers.codehooks : data.headers.restdb
}

export default config;
