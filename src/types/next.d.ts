// types/next.d.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
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
