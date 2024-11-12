import React, { useState } from 'react'; 
import Logo from './Logo';
import { useStore } from '../store/useStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const { isProfessional, toggleProfessional } = useStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    dateOfBirth: '',
    role: 'Patient',
    licenseNumber: '',
    specialty: '',
    education: '',
    consultationFee: ''
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validateForm = () => {
    const errors: any = {};
    // Validaciones de los campos
    if (!formData.firstName) errors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName) errors.lastName = 'El apellido es obligatorio';
    if (!formData.email) errors.email = 'El correo es obligatorio';
    if (!formData.password) errors.password = 'La contraseña es obligatoria';
    if (!formData.phoneNumber) errors.phoneNumber = 'El número de teléfono es obligatorio';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'La fecha de nacimiento es obligatoria';

    // Si es un profesional de la salud, validamos los campos adicionales
    if (isProfessional) {
      if (!formData.licenseNumber) errors.licenseNumber = 'El número de licencia es obligatorio';
      if (!formData.specialty) errors.specialty = 'La especialidad es obligatoria';
      if (!formData.education) errors.education = 'La educación es obligatoria';
      if (!formData.consultationFee) errors.consultationFee = 'La tarifa de consulta es obligatoria';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validamos el formulario
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage('Por favor, completa todos los campos obligatorios.');
      setMessageType('error');
      return;
    }

    const { firstName, lastName, email, password, phoneNumber, dateOfBirth, role, licenseNumber, specialty, education, consultationFee } = formData;

    const userPayload = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      role: isProfessional ? 'Healthcare Professional' : 'Patient',
      ...(isProfessional && { licenseNumber, specialty, education, consultationFee })
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Registro exitoso. Ahora puedes iniciar sesión.');
        setMessageType('success');
        setTimeout(() => {
          router.push(isProfessional ? '/login?isProfessional=true' : '/login?isProfessional=false');
        }, 3000); // Redirigir al login después de 3 segundos
      } else {
        // Si la respuesta del servidor no es exitosa, mostramos un mensaje de error
        setMessage(result.message || 'Error en el registro');
        setMessageType('error');
      }
    } catch (error) {
      if (error instanceof Error) {
        // Error al hacer la solicitud de red
        console.error('Error en la solicitud de registro:', error.message);
        setMessage('Hubo un error al procesar la solicitud. Intenta de nuevo más tarde.');
      } else {
        // Error desconocido
        console.error('Error desconocido:', error);
        setMessage('Error desconocido. Por favor, intenta más tarde.');
      }
      setMessageType('error');
    }
  };

  const handleGoBack = () => {
    router.push('/'); // Redirigir a la página principal (inicio)
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${isProfessional ? 'bg-gradient-to-b from-green-100 to-white' : 'bg-gradient-to-b from-blue-100 to-white'}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8 justify-items-center">
          <Logo size={100} color={isProfessional ? 'green' : 'blue'} />
          <h1 className={`text-3xl font-bold ${isProfessional ? 'text-green-600' : 'text-blue-600'} mt-4`}>
            {isProfessional ? 'Registro Profesional' : 'Registro Paciente'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Botón para alternar entre usuario y profesional */}
          <div className="mb-4 text-center">
            <button
              onClick={toggleProfessional}
              className={`w-full py-2 px-4 rounded text-white font-bold ${isProfessional ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isProfessional ? '¿Eres un paciente?' : '¿Eres un profesional de la salud?'}
            </button>
          </div>

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
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="******************"
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
                type="text"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="123-456-7890"
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

            {isProfessional && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="licenseNumber">
                    Número de Licencia
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.licenseNumber ? 'border-red-500' : ''}`}
                    id="licenseNumber"
                    type="text"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Número de licencia"
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-xs italic">{errors.licenseNumber}</p>}
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
                    placeholder="Especialidad médica"
                  />
                  {errors.specialty && <p className="text-red-500 text-xs italic">{errors.specialty}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="education">
                    Educación
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.education ? 'border-red-500' : ''}`}
                    id="education"
                    type="text"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="Institución educativa"
                  />
                  {errors.education && <p className="text-red-500 text-xs italic">{errors.education}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="consultationFee">
                    Tarifa de Consulta
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.consultationFee ? 'border-red-500' : ''}`}
                    id="consultationFee"
                    type="text"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    placeholder="Costo de la consulta"
                  />
                  {errors.consultationFee && <p className="text-red-500 text-xs italic">{errors.consultationFee}</p>}
                </div>
              </>
            )}

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded text-white font-bold ${isProfessional ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Registrar
            </button>
          </form>

          <div className="text-center mt-4">
            <button onClick={handleGoBack} className="text-sm text-blue-600 hover:underline">Volver a la página principal</button>
          </div>
        </div>
      </div>
    </div>
  );
}
