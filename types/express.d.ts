declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        photo?: string | null;
        role?: string;
        createdAt?: Date;
      };
    }
  }
}

export {};
