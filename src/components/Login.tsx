import React, { useState, useEffect } from 'react';     
import Logo from './Logo';
import { useStore } from '../store/useStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const { isProfessional, toggleProfessional } = useStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const router = useRouter();

  // Comprobación de autenticación al cargar la página
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verifica que el token y el rol del usuario coincidan con lo esperado
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'Healthcare Professional' && !isProfessional) {
        // Si el rol es 'Healthcare Professional' pero no es el rol activo
        router.push('/professional/dashboard');
      } else if (user.role === 'Patient' && isProfessional) {
        // Si el rol es 'Patient' pero está seleccionado el rol de profesional
        router.push('/user/dashboard');
      } else if (user.role === 'Healthcare Professional' && isProfessional) {
        // Si el rol y el estado coinciden, redirigir al dashboard del profesional
        router.push('/professional/dashboard');
      } else if (user.role === 'Patient' && !isProfessional) {
        // Si el rol y el estado coinciden, redirigir al dashboard del paciente
        router.push('/user/dashboard');
      }
    }
  }, [router, isProfessional]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const { email, password } = formData;

    // Limpiar mensajes previos
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Inicio de sesión exitoso.');
        setMessageType('success');

        // Almacenar el token y los datos del usuario
        const token = result.token;
        const user = result.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Verificar el rol y redirigir a la página correspondiente
        if ((isProfessional && user.role === 'Healthcare Professional') ||
            (!isProfessional && user.role === 'Patient')) {
          router.push(user.role === 'Healthcare Professional' ? '/professional/dashboard' : '/user/dashboard');
        } else {
          setMessage('Acceso denegado: El rol no coincide con la selección actual.');
          setMessageType('error');
          localStorage.removeItem('token'); // Eliminar el token en caso de acceso no permitido
          localStorage.removeItem('user'); // Eliminar los datos del usuario
        }
      } else {
        setMessage(result.message || 'Error en el inicio de sesión');
        setMessageType('error');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error en la solicitud de inicio de sesión:', error.message);
        setMessage('Hubo un error al procesar la solicitud. Intenta de nuevo más tarde.');
        setMessageType('error');
      } else {
        console.error('Error desconocido:', error);
        setMessage('Error desconocido. Por favor, intenta más tarde.');
        setMessageType('error');
      }
    }
  };

  const handleGoBack = () => {
    router.push('/'); // Volver al inicio
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${isProfessional ? 'bg-gradient-to-b from-green-100 to-green-300' : 'bg-gradient-to-b from-blue-100 to-blue-300'}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8 justify-items-center">
          <Logo size={100} color={isProfessional ? 'green' : 'blue'} />
          <h1 className={`text-3xl font-bold ${isProfessional ? 'text-green-600' : 'text-blue-600'} mt-4`}>
            {isProfessional ? 'Inicio de Sesión Profesional' : 'Inicio de Sesión Paciente'}
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Contraseña
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="******************"
              />
            </div>

            <div className="flex justify-between mt-6 gap-12">
              <button
                type="button"
                onClick={handleGoBack}
                className="w-48 py-2 px-4 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold"
              >
                Regresar
              </button>
              <button
                type="submit"
                className={`w-48 py-2 px-4 rounded text-white font-bold ${isProfessional ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Iniciar Sesión
              </button>
            </div>
          </form>

          <div className="mt-4 text-center"> 
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href={{ pathname: '/register', query: { isProfessional } }} className="text-blue-600 hover:underline">
               Regístrate aquí
              </Link>
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ¿Olvidaste tu contraseña?{' '}
              <Link href="/recover-password" className="text-blue-600 hover:underline">
              Recupera tu contraseña aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
