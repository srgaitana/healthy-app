import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Función para transformar valores de género
const transformGender = (gender: string) => { 
  switch (gender) { 
    case 'masculino': return 'male'; 
    case 'femenino': return 'female'; 
    case 'otro': return 'other'; 
    default: return gender; 
  } 
};

// Esquema para validar profesionales de la salud
const healthcareProfessionalSchema = z.object({
  firstName: z.string().min(1, 'El primer nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido'),
  dateOfBirth: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Fecha de nacimiento inválida'
  }),
  gender: z.enum(['male', 'female', 'other']),
  customGender: z.string().optional(),
  specialty: z.string().min(1, 'La especialidad es obligatoria'),
  education: z.string().min(1, 'La educación es obligatoria').optional(),
  consultationFee: z.string().refine(fee => !isNaN(Number(fee)) && Number(fee) >= 0, {
    message: 'La tarifa de consulta debe ser un número válido mayor o igual a 0'
  }).optional(),
  experience: z.number().min(0, 'La experiencia debe ser un número mayor o igual a 0').optional(),
  licenseNumber: z.string().min(1, 'El número de licencia es obligatorio').optional() // Opcional
});

// Tipos para el resultado de las consultas MySQL
interface UserInsertResult {
  insertId: number;
}

interface SpecialtyResult {
  SpecialtyID: number;
}

export async function POST(req: NextRequest) {
  const connection = await pool.promise().getConnection();
  
  try {
    await connection.beginTransaction();
    
    const body = await req.json();
    body.gender = transformGender(body.gender); // Transformar género
    const parsedData = healthcareProfessionalSchema.parse(body);
    
    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(parsedData.password, 10);

    // Guardar identidad de género solo si el género es 'other'
    const genderIdentity = parsedData.gender === 'other' ? parsedData.customGender : null;

    // Formatear fecha de nacimiento para MySQL
    const formattedDateOfBirth = new Date(parsedData.dateOfBirth).toISOString().split('T')[0];

    // 1. Insertar usuario
    const [userResult] = await connection.execute(
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Healthcare Professional', 'Active')`,
      [
        parsedData.firstName,
        parsedData.lastName,
        parsedData.email,
        passwordHash,
        parsedData.phoneNumber,
        formattedDateOfBirth,
        parsedData.gender,
        genderIdentity
      ]
    );

    const userId = (userResult as UserInsertResult).insertId;

    // 2. Verificar o crear especialidad
    const [specialtyResults] = await connection.execute(
      'SELECT SpecialtyID FROM Specialties WHERE SpecialtyName = ?',
      [parsedData.specialty]
    );

    let specialtyId: number;
    if ((specialtyResults as SpecialtyResult[]).length === 0) {
      // Crear nueva especialidad si no existe
      const [newSpecialty] = await connection.execute(
        'INSERT INTO Specialties (SpecialtyName) VALUES (?)',
        [parsedData.specialty]
      );
      specialtyId = (newSpecialty as UserInsertResult).insertId;
    } else {
      specialtyId = (specialtyResults as SpecialtyResult[])[0].SpecialtyID;
    }

    // 3. Insertar profesional de salud
    await connection.execute(
      `INSERT INTO HealthcareProfessionals (
        UserID,
        SpecialtyID,
        Experience,
        LicenseNumber,
        Education,
        ConsultationFee,
        Status
      ) VALUES (?, ?, ?, ?, ?, ?, 'Available')`,
      [
        userId,
        specialtyId,
        parsedData.experience ?? null, // Campo opcional
        parsedData.licenseNumber ?? null, // Campo opcional
        parsedData.education ?? null, // Campo opcional
        parsedData.consultationFee ? parseFloat(parsedData.consultationFee) : null // Campo opcional
      ]
    );

    await connection.commit();

    return NextResponse.json(
      { 
        message: 'Profesional de la salud registrado con éxito',
        userId: userId 
      }, 
      { status: 201 }
    );

  } catch (error: unknown) {
    await connection.rollback();

    console.error('Error durante el registro del profesional:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Error en los datos de entrada', 
          error: error.errors 
        }, 
        { status: 400 }
      );
    }

    // Comprobar si el error es un error de consulta de MySQL
    if (error instanceof Error && 'code' in error && 'message' in error) {
      const mysqlError = error as { code: string; message: string };
      
      if (mysqlError.code === 'ER_DUP_ENTRY') {
        if (mysqlError.message.includes('Email')) {
          return NextResponse.json(
            { message: 'El correo electrónico ya está registrado' }, 
            { status: 409 }
          );
        }
        if (mysqlError.message.includes('LicenseNumber')) {
          return NextResponse.json(
            { message: 'El número de licencia ya está registrado' }, 
            { status: 409 }
          );
        }
        return NextResponse.json(
          { message: 'Información duplicada detectada' }, 
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { 
        message: 'Error en el servidor', 
        error: (error as Error).message 
      }, 
      { status: 500 }
    );

  } finally {
    connection.release();
  }
}
