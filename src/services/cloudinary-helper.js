import config from './config';
import axios from 'axios';
import { sha1 } from 'crypto-hash';

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
  return sha1(data);
}

export const apiKey = config.cloudinary.apiKey || '';
