'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { 
  Calendar, 
  Users, 
  Settings, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Clock, 
  FileText, 
  DollarSign,
  Bell,
  Plus
} from 'lucide-react'

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  speciality: string;
  appointments: Array<{
    AppointmentDate: string;
    PatientName: string;
    appointmentStatus: string;
  }>;
}

const ProfessionalDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [activeMenuItem, setActiveMenuItem] = useState<string>('dashboard')
  const router = useRouter()

  const menuItems = [
    { id: 'dashboard', icon: Calendar, label: 'Dashboard' },
    { id: 'availability', icon: Clock, label: 'Disponibilidad' },
    { id: 'patients', icon: Users, label: 'Pacientes Activos' },
    { id: 'records', icon: FileText, label: 'Registros Médicos' },
    { id: 'billing', icon: DollarSign, label: 'Facturación' },
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
  
        setUser(data.user)
        
        // Directly call checkProfessionalRole inline here:
        if (data.user.role !== 'Healthcare Professional') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado'
        setError(errorMessage)
        
        if (errorMessage.includes('autenticación') || errorMessage.includes('sesión')) {
          localStorage.removeItem('token')
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }
  
    fetchUserData()
  }, [router])  // No need to add checkProfessionalRole to dependencies
  

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-green-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-green-400 h-20 w-20 mb-4"></div>
          <div className="h-4 bg-green-400 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-green-400 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-green-50 p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-800">Error</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 text-lg font-semibold"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-green-50 p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-800">Error</h2>
          <p className="text-center text-gray-600 mb-6">No se pudo encontrar la información del profesional.</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 text-lg font-semibold"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white bg-opacity-80 backdrop-blur-lg shadow-lg">
        <div className="flex gap-4 p-4 bg-gradient-to-r from-green-600 to-teal-600">
          <Logo size={40} color="white" lineColor='#16a34a'/>
          <h1 className='text-white text-2xl font-semibold'>Healthy App</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenuItem(item.id)}
              className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${
                activeMenuItem === item.id ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-green-50'
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
        <header className="md:hidden bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <Logo size={40} color="white" lineColor='#3bf682'/>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:bg-green-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
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
                    activeMenuItem === item.id ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-green-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-600 text-white hover:bg-red-700 transition duration-300 flex items-center justify-center"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </button>
            </nav>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-6">
            Bienvenido, Dr. {user.lastName}
          </h1>
          
          {/* Dashboard content */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Próximas Citas */}
            <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-700 mb-4">Próximas Citas</h2>
              {user.appointments.length > 0 ? (
                <ul className="space-y-4">
                  {user.appointments.slice(0, 3).map((appointment, index) => (
                    <li 
                      key={index} 
                      className="pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <p className="font-medium text-gray-800">{appointment.PatientName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.AppointmentDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        appointment.appointmentStatus === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : appointment.appointmentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.appointmentStatus === 'confirmed' ? 'Confirmada' : 
                         appointment.appointmentStatus === 'pending' ? 'Pendiente' : 
                         appointment.appointmentStatus}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No hay citas programadas.</p>
              )}
            </div>
            
            {/* Resumen */}
            <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-700 mb-4">Resumen</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Especialidad</p>
                  <p className="font-medium text-gray-800">{user.speciality}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pacientes activos</p>
                  <p className="font-medium text-gray-800">{user.appointments.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Próxima cita</p>
                  <p className="font-medium text-gray-800">
                    {user.appointments.length > 0 
                      ? new Date(user.appointments[0].AppointmentDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'No hay citas programadas'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Acciones Rápidas */}
            <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-700 mb-4">Acciones Rápidas</h2>
              <div className="space-y-3">
                <button className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition duration-300 font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                  <Plus className="mr-2 h-4 w-4" /> Agendar Nueva Cita
                </button>
                <button className="w-full py-2 px-4 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition duration-300 font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                  <Users className="mr-2 h-4 w-4" /> Ver Todos los Pacientes
                </button>
                <button className="w-full py-2 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition duration-300 font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                  <Clock className="mr-2 h-4 w-4" /> Gestionar Disponibilidad
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProfessionalDashboard