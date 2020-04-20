import config from './config';
import axios from 'axios';

export const existImage = publicId => (
  axios.get(`${config.cloudinary.url}/${publicId}`)
);
