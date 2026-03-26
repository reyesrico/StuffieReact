/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID: string;
  readonly VITE_SPOTIFY_CLIENT_SECRET: string;
  readonly VITE_AZURE_MAPS_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_API_KEY: string;
  readonly VITE_CLOUDINARY_API_SECRET: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_FB_APP_ID: string;
  readonly VITE_RESTDB_API_KEY: string;
  readonly VITE_RESTDB_SERVER_URL: string;
  readonly VITE_CODEHOOKS_API_KEY: string;
  readonly VITE_CODEHOOKS_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
