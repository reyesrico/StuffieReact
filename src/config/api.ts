/**
 * API Configuration
 */

const config = {
  cloudinary: {
    url: `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,f_auto,w_100/v1`,
    urlSingle: `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  },
  cloudinary_headers: {
    'cache-control': 'no-cache',
    'x-apikey': import.meta.env.VITE_CLOUDINARY_API_KEY || ''
  },
  fb: {
    appId: import.meta.env.VITE_FB_APP_ID || ''
  },
  headers: {
    'x-apikey': import.meta.env.VITE_CODEHOOKS_API_KEY || '',
    'Content-Type': 'application/json'
  },
  server: import.meta.env.VITE_CODEHOOKS_SERVER_URL || 'https://stuffie-2u0v.api.codehooks.io/dev/'
};

export default config;
