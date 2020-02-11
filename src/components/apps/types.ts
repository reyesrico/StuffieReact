import Tesseract from 'tesseract.js';

export default interface TicketsState {
  fileName: Tesseract.ImageLike,
  progressValue: number,
  textFromImage: string
};
