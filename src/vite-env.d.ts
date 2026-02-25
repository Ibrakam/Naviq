/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FRONTEND_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
