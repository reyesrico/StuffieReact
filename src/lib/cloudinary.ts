import config from '../config/api';
import axios from 'axios';
import CryptoJS from 'crypto-js';

export const defaultImageUrl =
  `${config.cloudinary.urlSingle}/stuffiers/default`;

export const userImageUrl = (userId: number | string | undefined): string =>
  `${config.cloudinary.urlSingle}/stuffiers/${userId ?? 'default'}`;

export const existImage = (publicId: string | number | undefined, folder = ''): Promise<any> => {
  // Cache-bust with a daily timestamp so browsers don't cache 404s across renames
  const bust = Math.floor(Date.now() / 86400000);
  return axios.get(`${config.cloudinary.urlSingle}/${folder}${publicId ?? 'default'}?v=${bust}`)
};

// Signature to Delete
export const signature = (folder: string, userId: number | string, timestamp: number | string): string => {  
  const data = `'invalidate=true&public_id=${userId}&timestamp=${timestamp}'`;
  return CryptoJS.SHA1(data).toString(CryptoJS.enc.Hex);
}

export const apiKey = config.cloudinary.apiKey || '';
