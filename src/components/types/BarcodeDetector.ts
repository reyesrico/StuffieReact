export interface BarcodeDetectorOptions {
  formats?: string[];
}

export interface DetectedBarcode {
  rawValue: string;
  format: string;
}

export interface BarcodeDetectorInstance {
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

export interface BarcodeDetectorConstructor {
  new(options?: BarcodeDetectorOptions): BarcodeDetectorInstance;
  getSupportedFormats(): Promise<string[]>;
}
