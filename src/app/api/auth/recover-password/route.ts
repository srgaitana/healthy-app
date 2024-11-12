// /app/api/auth/recover-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';  // Asegúrate de tener la conexión a la base de datos correctamente configurada

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // Validación de que el correo electrónico esté presente
  if (!email) {
    return NextResponse.json({ message: 'Por favor ingresa un correo electrónico.' }, { status: 400 });
  }

  try {
    // Consultar si el correo electrónico existe en la base de datos
    const [user] = await pool.promise().execute(
      `SELECT * FROM Users WHERE Email = ?`,
      [email]
    );

    // Si no se encuentra el usuario, enviar un mensaje de error
    if ((user as any).length === 0) {
      return NextResponse.json({ message: 'No se encuentra ningún usuario con ese correo electrónico.' }, { status: 404 });
    }

    // Si el correo está registrado, devolver un mensaje de éxito
    return NextResponse.json({ message: 'Correo verificado. Ahora puedes proceder con la recuperación de contraseña.' }, { status: 200 });
  } catch (error) {
    console.error('Error al verificar el correo:', error);
    return NextResponse.json({ message: 'Hubo un error al procesar tu solicitud. Intenta de nuevo más tarde.' }, { status: 500 });
  }
}
