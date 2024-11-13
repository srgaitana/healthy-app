import pool from '@/lib/db';   
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface Appointment {
  AppointmentDate: string;
  appointmentStatus: string;
  SpecialtyName: string;
}

interface UserResponse {
  message: string;
  user?: {
    userID: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    role: string;
    appointments: Appointment[];
  };
  error?: string;
  removeToken?: boolean;
}

interface DecodedToken {
  user: {
    userID: number;
    email: string;
    role: string;
  };
  iat: number;
  exp: number;
}

// Definir el tipo para los datos de usuario
interface UserData {
  UserID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber?: string;
  DateOfBirth?: string;
  Role: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<UserResponse>> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Token no proporcionado.', removeToken: true },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { message: 'Token no válido.', removeToken: true },
        { status: 403 }
      );
    }

    // Verificar y decodificar el token
    let userID: number;
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    
      if (!decodedToken?.user?.userID) {
        return NextResponse.json(
          { message: 'Token no válido.', removeToken: true },
          { status: 403 }
        );
      }
    
      userID = decodedToken.user.userID;
    } catch {
      return NextResponse.json(
        { message: 'Token no válido o expirado.', removeToken: true },
        { status: 403 }
      );
    }

    // Consultar los datos básicos del usuario
    const [userData] = await pool.promise().execute(
      `SELECT u.UserID, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.DateOfBirth, u.Role 
       FROM Users u WHERE u.UserID = ?`,
      [userID]
    );

    // Castear el resultado a un tipo más específico en lugar de 'any'
    const user = (userData as UserData[])[0];  // Aquí casteamos a UserData[]

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado.', removeToken: true },
        { status: 404 }
      );
    }

    // Consultar las citas del usuario
    const [appointmentsData] = await pool.promise().execute(
      `SELECT a.AppointmentDate, a.Status AS appointmentStatus, s.SpecialtyName 
       FROM Appointments a 
       LEFT JOIN HealthcareProfessionals hp ON a.ProfessionalID = hp.ProfessionalID
       LEFT JOIN Specialties s ON hp.SpecialtyID = s.SpecialtyID
       WHERE a.UserID = ?`,
      [userID]
    );

    const appointments = appointmentsData as Appointment[];

    return NextResponse.json({
      message: 'Datos de usuario obtenidos exitosamente.',
      user: {
        userID: user.UserID,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        phoneNumber: user.PhoneNumber,
        dateOfBirth: user.DateOfBirth,
        role: user.Role,
        appointments: appointments,
      }
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error al obtener los datos del usuario:', error);

    // Comprobación explícita del tipo de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({
      message: 'Error en el servidor.',
      error: errorMessage,
      removeToken: true
    }, { status: 500 });
  }
}
