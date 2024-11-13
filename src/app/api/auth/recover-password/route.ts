import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';  // Ensure your database connection is properly configured

// Define the User type
interface User {
  UserID: number;
  Email: string;
  PasswordHash: string;
  FirstName: string;
  LastName: string;
  Role: string;
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // Validate that the email is provided
  if (!email) {
    return NextResponse.json({ message: 'Por favor ingresa un correo electrónico.' }, { status: 400 });
  }

  try {
    // Query the database to check if the email exists
    const [users] = await pool.promise().execute(
      `SELECT * FROM Users WHERE Email = ?`,
      [email]
    );

    // Ensure the result is typed as an array of users
    const user = (users as User[])[0]; // Get the first user (or undefined)

    // If no user is found, return an error message
    if (!user) {
      return NextResponse.json({ message: 'No se encuentra ningún usuario con ese correo electrónico.' }, { status: 404 });
    }

    // If the email exists, return a success message
    return NextResponse.json({ message: 'Correo verificado. Ahora puedes proceder con la recuperación de contraseña.' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error al verificar el correo:', error);

    // Handle unexpected errors gracefully
    return NextResponse.json({ message: 'Hubo un error al procesar tu solicitud. Intenta de nuevo más tarde.' }, { status: 500 });
  }
}
