/**
 * API Configuration - CRITICAL SETTINGS
 * 
 * This file contains the core backend configuration.
 * Change `useCodehooks` to switch between backends.
 */

// ============================================================
// BACKEND TOGGLE
// Codehooks is the ONLY active backend. RestDB is a frozen backup.
// DO NOT set this to false — RestDB writes are retired.
// ============================================================
export const useCodehooks = true;
// ============================================================

const data = {
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
    // ⚠️ BACKUP — DO NOT DELETE — RestDB is our permanent frozen backup database.
    // Keep these env vars. Keep this config block. Never write to RestDB from app code.
    // To sync after migration: run backend/scripts/sync-to-restdb.js manually.
    restdb: {
      'cache-control': 'no-cache',
      'x-apikey': import.meta.env.VITE_RESTDB_API_KEY || ''
    },
    codehooks: {
      'x-apikey': import.meta.env.VITE_CODEHOOKS_API_KEY || '',
      'Content-Type': 'application/json'
    }
  },
  server: {
    // ⚠️ BACKUP — DO NOT DELETE — See note above on restdb
    restdb: import.meta.env.VITE_RESTDB_SERVER_URL || 'https://stuffie-98b2.restdb.io/rest/',
    codehooks: import.meta.env.VITE_CODEHOOKS_SERVER_URL || 'https://stuffie-2u0v.api.codehooks.io/dev/'
  }
};

const config = {
  ...data,
  server: useCodehooks ? data.server.codehooks : data.server.restdb,
  headers: useCodehooks ? data.headers.codehooks : data.headers.restdb
}

export default config;
