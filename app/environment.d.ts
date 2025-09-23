declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URL: string;
      JWT_SECRET: string;
      MAX_BACKPRESSURE: number;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
