'use client'

import React, { useEffect } from 'react'
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import SplashScreen from "@/components/SplashScreen"
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'

export default function Main() {
  const { isProfessional } = useStore()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    // Si hay un token, redirigir al dashboard correspondiente según el rol
    if (token) {
      if (user.role === 'Healthcare Professional') {
        router.push('/professional/dashboard')
      } else if (user.role === 'Patient') {
        router.push('/user/dashboard')
      }
      return // Detener ejecución aquí si ya se redirigió
    }

    // Si no hay token, no hacer nada, solo dejar la página como está

  }, [router]) // Dependencias mínimas

  return (
    <div className="flex flex-col min-h-screen">
      <div className="hidden lg:block">
        <Header />
      </div>
      <main className={`flex-grow transition-colors duration-700 ${isProfessional ? 'bg-gradient-to-b from-green-100 to-green-300' : 'bg-gradient-to-b from-blue-100 to-white'}`}>
        <SplashScreen />
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}
