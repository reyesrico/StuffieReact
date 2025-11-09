
// useCodehooks = true: use Codehooks as backend
// otherwise use RestDB as backend
export const useCodehooks = false;

const data = {
  cloudinary: {
    url: `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,f_auto,w_100/v1`,
    urlSingle: `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY,
    apiSecret: process.env.REACT_APP_CLOUDINARY_API_SECRET,
    uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
  },
  cloudinary_headers: {
    'cache-control': 'no-cache',
    'x-apikey': process.env.REACT_APP_CLOUDINARY_API_KEY || ''
  },
  fb: {
    appId: process.env.REACT_APP_FB_APP_ID || ''
  },
  headers: {
    restdb: {
      'cache-control': 'no-cache',
      'x-apikey': process.env.REACT_APP_RESTDB_API_KEY || ''
    }, 
    codehooks: {
      'x-apikey': process.env.REACT_APP_CODEHOOKS_API_KEY || '',
      'Content-Type': 'application/json'
    }
  },
  server: {
    restdb: process.env.REACT_APP_RESTDB_SERVER_URL || 'https://stuffie-98b2.restdb.io/rest/',
    codehooks: process.env.REACT_APP_CODEHOOKS_SERVER_URL || 'https://stuffie-2u0v.api.codehooks.io/dev/'
  }
};

const config = {
  ...data,
  server: useCodehooks ? data.server.codehooks : data.server.restdb,
  headers: useCodehooks ? data.headers.codehooks : data.headers.restdb
}

export default config;
