// types/next.d.ts
import { NextRequest } from 'next/server';

declare module 'next/server' {
  interface NextRequest {
    user?: { // El tipo de 'user' puede ser el que tengas definido
      id: number;
      email: string;
      role: string;
    };
  }
}
