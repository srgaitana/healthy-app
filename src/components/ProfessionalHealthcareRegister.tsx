import React, { useState } from 'react';
import Logo from './Logo';
import { useRouter } from 'next/navigation';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  specialty: string;
  gender: string;
  customGender: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  specialty?: string;
  gender?: string;
  customGender?: string;
}

export default function ProfessionalHealthcareRegister() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    dateOfBirth: '',
    specialty: '',
    gender: '',
    customGender: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!formData.firstName) errors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName) errors.lastName = 'El apellido es obligatorio';
    if (!formData.email) errors.email = 'El correo es obligatorio';
    if (!formData.password) errors.password = 'La contraseña es obligatoria';
    if (!formData.phoneNumber) errors.phoneNumber = 'El número de teléfono es obligatorio';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'La fecha de nacimiento es obligatoria';
    if (!formData.specialty) errors.specialty = 'La especialidad es obligatoria';
    if (!formData.gender) errors.gender = 'El género es obligatorio';
    if (formData.gender === 'Otro' && !formData.customGender) {
      errors.customGender = 'Por favor, especifica tu género';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage('Por favor, completa todos los campos obligatorios.');
      setMessageType('error');
      return;
    }

    const userPayload = {
      ...formData,
      role: 'Healthcare Professional',
      gender: formData.gender === 'Otro' ? 'other' : formData.gender.toLowerCase(),
      genderIdentity: formData.gender === 'Otro' ? formData.customGender : null,
    };

    try {
      const response = await fetch('/api/auth/register/professionalhealthcare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Registro exitoso. Ahora puedes iniciar sesión.');
        setMessageType('success');
        setTimeout(() => {
          router.push('/login?isProfessional=true');
        }, 3000);
      } else {
        setMessage(result.message || 'Error en el registro');
        setMessageType('error');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error en la solicitud de registro:', error.message);
        setMessage('Hubo un error al procesar la solicitud. Intenta de nuevo más tarde.');
      } else {
        console.error('Error desconocido:', error);
        setMessage('Error desconocido. Por favor, intenta más tarde.');
      }
      setMessageType('error');
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-green-100 to-green-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 justify-items-center">
          <Logo size={100} color="green" />
          <h1 className="text-3xl font-bold text-green-600 mt-4">
            Registro Profesional
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {message && (
            <div className={`mb-6 text-center p-3 rounded-lg ${messageType === 'success' ? 'bg-green-200' : 'bg-red-200'}`}>
              <p className={`text-sm font-bold ${messageType === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                Primer Nombre
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.firstName ? 'border-red-500' : ''}`}
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
              />
              {errors.firstName && <p className="text-red-500 text-xs italic">{errors.firstName}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                Apellidos
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.lastName ? 'border-red-500' : ''}`}
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Pérez Gómez"
              />
              {errors.lastName && <p className="text-red-500 text-xs italic">{errors.lastName}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                Género
              </label>
              <select
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.gender ? 'border-red-500' : ''}`}
                id="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Seleccione una opción</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs italic">{errors.gender}</p>}
            </div>

            {formData.gender === 'Otro' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customGender">
                  Especificar Género
                </label>
                <input
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.customGender ? 'border-red-500' : ''}`}
                  id="customGender"
                  type="text"
                  value={formData.customGender}
                  onChange={handleChange}
                  placeholder="Ingrese su género"
                />
                {errors.customGender && <p className="text-red-500 text-xs italic">{errors.customGender}</p>}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Contraseña
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
              />
              {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                Número de Teléfono
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.phoneNumber ? 'border-red-500' : ''}`}
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="555-1234-5678"
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs italic">{errors.phoneNumber}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateOfBirth">
                Fecha de Nacimiento
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs italic">{errors.dateOfBirth}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialty">
                Especialidad
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.specialty ? 'border-red-500' : ''}`}
                id="specialty"
                type="text"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="Especialidad del profesional"
              />
              {errors.specialty && <p className="text-red-500 text-xs italic">{errors.specialty}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded text-white font-bold bg-green-600 hover:bg-green-700"
            >
              Registrar
            </button>
          </form>

          <div className="text-center mt-4">
            <button onClick={handleGoBack} className="text-sm text-blue-600 hover:underline">
              Volver a la página principal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
