import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Definir la interfaz del usuario que se extraerá del token
interface JWTUser {
  id: number;
  email: string;
  role: string;
}

export function middleware(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1]; // Obtener el token del header 'Authorization'

  if (!token) {
    return NextResponse.json({ message: 'No se proporcionó token de autenticación.' }, { status: 401 });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTUser;

    // Asignar los datos del usuario al objeto req
    req.user = decoded;  // Ahora podemos agregar user a req, ya que extendimos el tipo

    return NextResponse.next();  // Permitir que la solicitud continúe si el token es válido
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 401 });
  }
}
