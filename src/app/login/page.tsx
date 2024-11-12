// /app/login/page.tsx
'use client'

import React from 'react'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Login from "@/components/Login"
import { useStore } from '@/store/useStore'

export default function LoginPage() {
  const { isProfessional } = useStore()
  
  return (
    <div className="flex flex-col min-h-screen">
    <div className="hidden lg:block">
      <Header />
    </div>
      <main className={`flex-grow transition-colors duration-700 ${
        isProfessional 
          ? 'bg-gradient-to-b from-green-100 to-green-300' 
          : 'bg-gradient-to-b from-blue-100 to-white'
      }`}>
        <Login />
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}