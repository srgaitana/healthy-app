import bcrypt from 'bcrypt'; 
import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type Data = {
  message: string;
  error?: string;
};

// Definir el esquema de validación usando Zod
const userSchema = z.object({
  firstName: z.string().min(1, 'El primer nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  // Aplicar regex a un string no opcional y luego hacerlo opcional si es necesario
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido').optional(),
  dateOfBirth: z.string().optional().refine(date => {
    return date ? !isNaN(Date.parse(date)) : true; // Si hay fecha, validamos; si no, la omitimos
  }, 'Fecha de nacimiento inválida'),
  role: z.enum(['Healthcare Professional', 'Patient']).refine(role => ['Healthcare Professional', 'Patient'].includes(role), {
    message: 'Rol inválido',
  }),
});

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, password, phoneNumber, dateOfBirth, role } = await req.json();

  try {
    // Validar los datos usando el esquema Zod
    const parsedData = userSchema.parse({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      role,
    });

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(parsedData.password, 10);

    // Insertar en la base de datos
    const [result] = await pool.promise().execute(
      `INSERT INTO Users (FirstName, LastName, Email, PasswordHash, PhoneNumber, DateOfBirth, Role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [parsedData.firstName, parsedData.lastName, parsedData.email, passwordHash, parsedData.phoneNumber, parsedData.dateOfBirth, parsedData.role]
    );

    console.log('Resultado de la inserción:', result);

    return NextResponse.json({ message: 'Usuario registrado con éxito.' }, { status: 201 });
  } catch (error: any) {
    console.error('Error durante el registro:', error);

    if (error instanceof z.ZodError) {
      // Si la validación falla, devolver un mensaje con los errores de Zod
      return NextResponse.json({ message: 'Error en los datos de entrada.', error: error.errors }, { status: 400 });
    }

    // Manejar otros errores
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'El correo electrónico ya está registrado.' }, { status: 409 });
    } else {
      return NextResponse.json({ message: 'Error en el servidor.', error: error.message }, { status: 500 });
    }
  }
}
