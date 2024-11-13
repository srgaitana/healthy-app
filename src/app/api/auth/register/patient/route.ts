import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Function to transform gender value to match the expected format
const transformGender = (gender: string) => { 
  switch (gender) { 
    case 'masculino': return 'male'; 
    case 'femenino': return 'female'; 
    case 'otro': return 'other'; 
    default: return gender; 
  } 
};

// Schema to validate input and match DB ENUMs
const patientSchema = z.object({
  firstName: z.string().min(1, 'El primer nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido'),
  dateOfBirth: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Fecha de nacimiento inválida'
  }),
  gender: z.enum(['male', 'female', 'other']), // Matches DB ENUM
  customGender: z.string().optional(),
});

interface DBInsertResult {
  insertId: number; // Assuming `insertId` is the only field of interest from the result
}

// Custom error interface to handle MySQL error code
interface MySQLError extends Error {
  code?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    body.gender = transformGender(body.gender); // Transform gender value
    const parsedData = patientSchema.parse(body);
    
    // Generate password hash
    const passwordHash = await bcrypt.hash(parsedData.password, 10);

    // Store custom gender identity only if gender is 'other'
    const genderIdentity = parsedData.gender === 'other' ? parsedData.customGender : null;

    // Format date for MySQL
    const formattedDateOfBirth = new Date(parsedData.dateOfBirth).toISOString().split('T')[0];

    // Insert into the database with correct ENUM values
    const [result] = await pool.promise().execute(
      `INSERT INTO Users (
        FirstName, 
        LastName, 
        Email, 
        PasswordHash, 
        PhoneNumber, 
        DateOfBirth, 
        Gender,
        GenderIdentity,
        Role,
        Status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Patient', 'Active')`,
      [
        parsedData.firstName,
        parsedData.lastName,
        parsedData.email,
        passwordHash,
        parsedData.phoneNumber || null, // Make phoneNumber optional
        formattedDateOfBirth,
        parsedData.gender, // Matches DB ENUM
        genderIdentity
      ]
    );

    console.log('Paciente registrado exitosamente:', result);

    return NextResponse.json(
      { 
        message: 'Paciente registrado con éxito.',
        userId: (result as DBInsertResult).insertId // Type cast to DBInsertResult to access insertId
      }, 
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error durante el registro del paciente:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Error en los datos de entrada.', 
          error: error.errors 
        }, 
        { status: 400 }
      );
    }

    // Check if the error is an instance of MySQLError with a 'code' property
    if ((error as MySQLError).code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'El correo electrónico ya está registrado.' }, 
        { status: 409 }
      );
    }

    // Handling other errors
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          message: 'Error en el servidor.', 
          error: error.message 
        }, 
        { status: 500 }
      );
    }

    // Fallback for unknown errors
    return NextResponse.json(
      { 
        message: 'Error en el servidor.', 
        error: 'Error desconocido' 
      }, 
      { status: 500 }
    );
  }
}