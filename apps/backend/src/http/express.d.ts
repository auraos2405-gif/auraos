declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: {
        usuarioId: string;
        empresaId: string;
        email: string;
      };
    }
  }
}

export {};

