import config from './config';
import axios from 'axios';
import CryptoJS from 'crypto-js';

export const defaultImageUrl =
  `${config.cloudinary.urlSingle}/stuffiers/default`;

export const userImageUrl = userId =>
  `${config.cloudinary.urlSingle}/stuffiers/${userId}`;

export const existImage = (publicId, folder = '') => {
  return axios.get(`${config.cloudinary.urlSingle}/${folder}${publicId}`)
};

// Signature to Delete
export const signature = (folder, userId, timestamp) => {  
  const data = `'invalidate=true&public_id=${userId}&timestamp=${timestamp}'`;
  return CryptoJS.SHA1(data).toString(CryptoJS.enc.Hex);
}

export const apiKey = config.cloudinary.apiKey || '';
