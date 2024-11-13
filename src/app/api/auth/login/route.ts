import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '@/lib/db';

const LoginSchema = z.object({
  email: z.string()
    .email('Formato de correo electrónico inválido')
    .max(100, 'El correo no puede exceder 100 caracteres'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede exceder 72 caracteres')
});

interface LoginResponse {
  message: string;
  error?: string;
  user?: {
    userID: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token?: string;
}

interface User {
  UserID: number;
  Email: string;
  PasswordHash: string;
  FirstName: string;
  LastName: string;
  Role: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    const body = await req.json();
    const validatedData = LoginSchema.parse(body);
    const { email, password } = validatedData;

const [users] = await pool.promise().execute(
  'SELECT * FROM Users WHERE Email = ?',
  [email]
);

const user = (users as User[])[0];

    if (!user) {
      return NextResponse.json(
        { message: 'Credenciales inválidas.' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Credenciales inválidas.' },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }

    // Include all necessary user data in the token
    const token = jwt.sign({
      user: {
        userID: user.UserID,  // Changed from Id to UserID to match DB schema
        email: user.Email,
        role: user.Role
      }
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const userResponse = {
      userID: user.UserID,
      email: user.Email,
      firstName: user.FirstName,
      lastName: user.LastName,
      role: user.Role
    };

    return NextResponse.json({
      message: 'Login exitoso',
      user: userResponse,
      token,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error durante el login:', error);
  
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: 'Datos de entrada inválidos',
        error: error.errors[0].message
      }, { status: 400 });
    }
  
    if (error instanceof Error) {
      return NextResponse.json({
        message: 'Error en el servidor.',
        error: error.message
      }, { status: 500 });
    }
  
    return NextResponse.json({
      message: 'Error en el servidor.',
      error: 'Error desconocido'
    }, { status: 500 });
  }  
}