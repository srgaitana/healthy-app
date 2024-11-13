// /components/Header.tsx
import { useStore } from '@/store/useStore'
import Logo from "./Logo"
import { useRouter } from 'next/navigation'

function Header() {
  const { isProfessional, toggleProfessional } = useStore()
  const router = useRouter()

  return (
    <header className={`${isProfessional ? 'bg-green-200' : 'bg-blue-200'}`}>
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Logo size={40} color={isProfessional ? 'green' : 'blue'} />
            <span className={`ml-3 text-xl font-semibold ${isProfessional ? 'text-green-600' : 'text-blue-600'}`}>
              Healthy
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <a href="#" className="text-gray-800 hover:text-blue-600 transition duration-300">Inicio</a>
            <a href="#" className="text-gray-800 hover:text-blue-600 transition duration-300">Servicios</a>
            <a href="#" className="text-gray-800 hover:text-blue-600 transition duration-300">Sobre Nosotros</a>
            <a href="#" className="text-gray-800 hover:text-blue-600 transition duration-300">Contacto</a>
            
          </div>
          <div className="hidden md:flex space-x-2">
          <button
              onClick={toggleProfessional}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-500 ${
                isProfessional 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProfessional ? "¿Eres un paciente?" : "¿Eres un profesional de la salud?"}
            </button>
            <button 
              onClick={() => router.push('/login')}
              className={`${
                isProfessional ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-4 py-2 rounded-full transition duration-300`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => router.push('/register')}
              className={`bg-white px-4 py-2 rounded-full border transition duration-300 ${
                isProfessional 
                  ? 'text-green-600 border-green-600 hover:bg-green-50' 
                  : 'text-blue-600 border-blue-600 hover:bg-blue-50'
              }`}
            >
              Registrarse
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header