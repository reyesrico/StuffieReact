import config from '../config/api';
import CryptoJS from 'crypto-js';

export const defaultImageUrl =
  `${config.cloudinary.urlSingle}/stuffiers/default`;

export const userImageUrl = (userId: number | string | undefined): string =>
  `${config.cloudinary.urlSingle}/stuffiers/${userId ?? 'default'}`;

export const existImage = (publicId: string | number | undefined, folder = ''): Promise<void> => {
  const bust = Math.floor(Date.now() / 86400000);
  const url = `${config.cloudinary.urlSingle}/${folder}${publicId ?? 'default'}?v=${bust}`;
  return fetch(url, { method: 'HEAD' }).then((res) => {
    if (!res.ok) return Promise.reject(new Error('not found'));
  });
};

// Signature to Delete
export const signature = (folder: string, userId: number | string, timestamp: number | string): string => {  
  const data = `'invalidate=true&public_id=${userId}&timestamp=${timestamp}'`;
  return CryptoJS.SHA1(data).toString(CryptoJS.enc.Hex);
}

export const apiKey = config.cloudinary.apiKey || '';
