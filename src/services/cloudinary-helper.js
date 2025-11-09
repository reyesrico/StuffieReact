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
  const data =
    `folder=${folder}&invalidate=true&public_id=${userId}&timestamp=${timestamp}&upload_preset=${config.cloudinary.uploadPreset}`;
  
  const data2 = `'invalidate=true&public_id=${userId}&timestamp=${timestamp}'`;
  console.log(data2);
  return sha1(data2);
}

export const apiKey = config.cloudinary.apiKey || '';
