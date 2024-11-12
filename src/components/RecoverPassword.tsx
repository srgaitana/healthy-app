'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo' // Importamos el componente Logo

export default function RecoverPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  const router = useRouter()  // Para manejar la navegación

  const handleChange = (e: { target: { value: any; }; }) => {
    setEmail(e.target.value)
  }

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault()

    // Validar que el correo no esté vacío
    if (!email) {
      setMessage('Por favor ingresa un correo electrónico.')
      setMessageType('error')
      return
    }

    // Llamada a la API para verificar el correo
    try {
      const response = await fetch('/api/auth/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || 'Correo verificado con éxito.')
        setMessageType('success')
      } else {
        setMessage(result.message || 'Error al verificar el correo.')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Hubo un error en el proceso. Por favor, intenta más tarde.')
      setMessageType('error')
    }
  }

  const handleGoBack = () => {
    router.push('/login') // Volver al inicio de sesión
  }

  const handleGoHome = () => {
    router.push('/') // Volver al inicio (splash screen)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Logo size={100} color="blue" />
        </div>

        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Recuperar Contraseña</h1>

        {message && (
          <div className={`mb-6 p-3 rounded-lg ${messageType === 'success' ? 'bg-green-200' : 'bg-red-200'}`}>
            <p className={`text-sm font-bold ${messageType === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Enviar Enlace de Recuperación
            </button>
          </div>
        </form>

        {/* Opciones para regresar */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleGoBack}
            className="py-2 px-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Regresar a Iniciar Sesión
          </button>
          <button
            onClick={handleGoHome}
            className="py-2 px-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  )
}