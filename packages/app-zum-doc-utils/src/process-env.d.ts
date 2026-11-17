/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_MEDICAL_PRODUCT_SEARCH_URL?: string,
    }
  }
}

export {}
