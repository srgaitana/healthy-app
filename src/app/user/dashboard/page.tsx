'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { 
  Calendar, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Clock, 
  Bell,
  Settings,
  MessageSquare,
  CreditCard,
  Star,
  Plus,
  Search,
  Edit
} from 'lucide-react'

interface UserData {
  userID: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  role: 'Patient' | 'Healthcare Professional' | 'Admin';
  status: 'Active' | 'Inactive';
  lastLoginAt: string | null;
}

interface Appointment {
  appointmentID: number;
  professionalID: number;
  appointmentDate: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';
  type: 'First Visit' | 'Follow-up' | 'Therapy';
  reason: string;
  professionalName: string;
  specialtyName: string;
}

interface Review {
  reviewID: number;
  professionalID: number;
  appointmentID: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  professionalName: string;
}

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([]); 
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [activeMenuItem, setActiveMenuItem] = useState<string>('dashboard')
  const router = useRouter()

  const menuItems = [
    { id: 'dashboard', icon: Calendar, label: 'Dashboard' },
    { id: 'appointments', icon: Clock, label: 'Mis Citas' },
    { id: 'doctors', icon: User, label: 'Profesionales' },
    { id: 'messages', icon: MessageSquare, label: 'Mensajes' },
    { id: 'billing', icon: CreditCard, label: 'Facturación' },
    { id: 'notifications', icon: Bell, label: 'Notificaciones' },
    { id: 'settings', icon: Settings, label: 'Configuración' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return false
      }
      return true
    }

    if (!checkToken()) {
      return
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No se encontró token de autenticación')
        }

        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.')
          }
          throw new Error(data.message || 'Error al obtener datos del usuario')
        }

        console.log(data.user); // Verifica que el campo 'user' esté presente
        setUser(data.user);
        setAppointments(data.appointments || []);
        setReviews(data.reviews || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
        setError(errorMessage);
    
        if (errorMessage.includes('autenticación') || errorMessage.includes('sesión')) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-blue-400 h-20 w-20 mb-4"></div>
          <div className="h-4 bg-blue-400 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-blue-400 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-800">Error</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 text-lg font-semibold"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">Error</h2>
          <p className="text-center text-gray-600 mb-6">No se pudo encontrar la información del usuario.</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 text-lg font-semibold"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white bg-opacity-80 backdrop-blur-lg shadow-lg">
      <div className="flex gap-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <Logo size={40} color="white" lineColor='#3b82f6'/>
          <h1 className='text-white text-2xl font-semibold'>Healthy App</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenuItem(item.id)}
              className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${
                activeMenuItem === item.id ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
        <button 
          onClick={handleLogout}
          className="m-4 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header for mobile */}
        <header className="md:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <Logo size={32} color="white" />
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-lg p-1"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white bg-opacity-90 backdrop-blur-lg shadow-lg absolute top-16 left-0 right-0 z-20">
            <nav>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenuItem(item.id)
                    setMenuOpen(false)
                  }}
                  className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${
                    activeMenuItem === item.id ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 bg-red-600 text-white hover:bg-red-700 transition duration-200"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </button>
            </nav>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-blue-800 mb-6">
            Bienvenido, {user.firstName} {user.lastName}
          </h1>
          {/* Dashboard content */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Próximas Citas */}
            <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Próximas Citas</h2>
              {appointments.length > 0 ? (
                <ul className="space-y-4">
                  {appointments.slice(0, 3).map((appointment) => (
                    <li 
                      key={appointment.appointmentID} 
                      className="pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <p className="font-medium text-gray-800">{appointment.professionalName}</p>
                      <p className="text-sm text-gray-600">{appointment.specialtyName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.appointmentDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : appointment.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No tienes citas programadas.</p>
              )}
              <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-medium flex items-center justify-center">
                <Clock className="mr-2 h-4 w-4" />
                Ver todas las citas
              </button>
            </div>
            
            {/* Resumen de Salud */}
            <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Resumen de Salud</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Última consulta</p>
                  <p className="font-medium text-gray-800">
                    {appointments.length > 0 
                      ? new Date(appointments[appointments.length - 1].appointmentDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'No hay registros'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Próxima cita</p>
                  <p className="font-medium text-gray-800">
                    {appointments.length > 0 
                      ? new Date(appointments[0].appointmentDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'No hay citas programadas'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de citas</p>
                  <p className="font-medium text-gray-800">{appointments.length}</p>
                </div>
              </div>
              <button className="mt-4 w-full bg-blue-100 text-blue-800 py-2 px-4 rounded-lg hover:bg-blue-200 transition duration-300 font-medium flex items-center justify-center">
                <Calendar className="mr-2 h-4 w-4" />
                Ver historial de citas
              </button>
            </div>
            
            {/* Acciones Rápidas */}
            <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Acciones Rápidas</h2>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-medium flex items-center justify-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Nueva Cita
                </button>
                <button className="w-full bg-blue-100 text-blue-800 py-2 px-4 rounded-lg hover:bg-blue-200 transition duration-300 font-medium flex items-center justify-center">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar Profesionales
                </button>
                <button className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition duration-300 font-medium flex items-center justify-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Actualizar Perfil
                </button>
              </div>
            </div>

            {/* Últimas Reseñas */}
            <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Mis Últimas Reseñas</h2>
              {reviews.length > 0 ? (
                <ul className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <li 
                      key={review.reviewID} 
                      className="pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <p className="font-medium text-gray-800">{review.professionalName}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No has dejado ninguna reseña aún.</p>
              )}
              <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-medium flex items-center justify-center">
                <Star className="mr-2 h-4 w-4" />
                Ver todas mis reseñas
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserDashboard