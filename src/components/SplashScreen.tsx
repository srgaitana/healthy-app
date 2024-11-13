'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaHeartbeat, FaCalendarAlt, FaUserMd, FaMobileAlt, FaStethoscope, FaBriefcaseMedical, FaClipboardCheck, FaHospitalAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useStore } from '@/store/useStore'
import Logo from './Logo'

const patientOnboardingSteps = [
  {
    icon: <FaHeartbeat className="text-5xl text-blue-500 mb-4" />,
    title: "Cuida tu salud",
    description: "Accede a profesionales de la salud en cualquier momento y lugar."
  },
  {
    icon: <FaCalendarAlt className="text-5xl text-green-500 mb-4" />,
    title: "Agenda fácilmente",
    description: "Programa citas con médicos de manera rápida y sencilla."
  },
  {
    icon: <FaUserMd className="text-5xl text-purple-500 mb-4" />,
    title: "Consultas virtuales",
    description: "Realiza videoconsultas desde la comodidad de tu hogar."
  },
  {
    icon: <FaMobileAlt className="text-5xl text-red-500 mb-4" />,
    title: "Todo en tu móvil",
    description: "Gestiona tu salud desde tu smartphone con nuestra app intuitiva."
  }
];

const professionalOnboardingSteps = [
  {
    icon: <FaStethoscope className="text-5xl text-green-600 mb-4" />,
    title: "Atiende pacientes",
    description: "Conéctate con pacientes y brinda atención médica en línea."
  },
  {
    icon: <FaBriefcaseMedical className="text-5xl text-blue-600 mb-4" />,
    title: "Administra citas",
    description: "Gestiona tus horarios y citas de manera organizada."
  },
  {
    icon: <FaClipboardCheck className="text-5xl text-purple-600 mb-4" />,
    title: "Historial médico",
    description: "Accede a la información médica de tus pacientes."
  },
  {
    icon: <FaHospitalAlt className="text-5xl text-red-600 mb-4" />,
    title: "Consultas en línea",
    description: "Realiza consultas virtuales de forma rápida y segura."
  }
];

export default function SplashScreen() {
  const router = useRouter()
  const { isProfessional, toggleProfessional } = useStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [currentOnboardingSteps, setCurrentOnboardingSteps] = useState(patientOnboardingSteps)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setCurrentOnboardingSteps(isProfessional ? professionalOnboardingSteps : patientOnboardingSteps)
  }, [isProfessional])

  useEffect(() => {
    startAutoPlay()
    return () => stopAutoPlay()
  }, [currentOnboardingSteps])

  const startAutoPlay = () => {
    stopAutoPlay()
    autoPlayRef.current = setInterval(() => {
      goToNextStep()
    }, 6000)
  }

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }

  const goToNextStep = () => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % currentOnboardingSteps.length)
      setFadeIn(true)
    }, 500)
  }

  const goToPrevStep = () => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentStep((prevStep) => (prevStep - 1 + currentOnboardingSteps.length) % currentOnboardingSteps.length)
      setFadeIn(true)
    }, 500)
  }

  const handleProfessionalToggle = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setFadeIn(false)
    
    setTimeout(() => {
      toggleProfessional()
      setFadeIn(true)
    }, 350)

    setTimeout(() => setIsTransitioning(false), 700)
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-700 ${
      isProfessional ? 'bg-gradient-to-b from-green-100 to-green-300' : 'bg-gradient-to-b from-blue-100 to-blue-300'
    } p-4 lg:p-8`}>
      <div className="w-full max-w-md lg:max-w-7xl">
        <div className="text-center mb-8">
          <div className={`inline-block transition-colors duration-700 ${
            isProfessional ? 'text-green-600' : 'text-blue-600'
          }`}>
            <Logo size={80} color={isProfessional ? 'green' : 'blue'} />
          </div>
          <h1 className={`text-3xl font-bold transition-colors duration-700 ${
            isProfessional ? 'text-green-600' : 'text-blue-600'
          } mt-4`}>Healthy</h1>
          <p className="text-gray-600 mt-2">Tu salud, en tus manos</p>
          
          <button
            onClick={handleProfessionalToggle}
            disabled={isTransitioning}
            className={`lg:hidden mt-6 px-6 py-2 rounded-full font-semibold transition-all duration-500 shadow-md ${
              isProfessional 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProfessional ? "¿Eres un paciente?" : "¿Eres un profesional de la salud?"}
          </button>
        </div>

        <div className="lg:hidden mb-8">
          <div className="bg-white rounded-lg shadow-xl p-6 relative">
            <div className={`transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
              {currentOnboardingSteps[currentStep].icon}
              <h2 className="text-2xl font-bold mb-2">{currentOnboardingSteps[currentStep].title}</h2>
              <p className="text-gray-600">{currentOnboardingSteps[currentStep].description}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center px-4">
            <button
              onClick={goToPrevStep}
              className={`p-2 rounded-full ${
                isProfessional ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              } hover:bg-opacity-80 transition-colors duration-300`}
              aria-label="Anterior"
            >
              <FaChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex justify-center">
              {currentOnboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    index === currentStep 
                      ? (isProfessional ? 'bg-green-500' : 'bg-blue-500') 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={goToNextStep}
              className={`p-2 rounded-full ${
                isProfessional ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              } hover:bg-opacity-80 transition-colors duration-300`}
              aria-label="Siguiente"
            >
              <FaChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-4 gap-4 mb-8">
          {currentOnboardingSteps.map((step, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow-xl p-6 transition-all duration-500 transform ${
                fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              {step.icon}
              <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 lg:flex lg:space-y-0 lg:space-x-4 max-w-md mx-auto">
          <button 
            onClick={() => router.push('/register')}
            className={`w-full lg:w-1/2 font-bold py-3 px-4 rounded-full hover:bg-opacity-80 transition duration-300 transform hover:scale-105 shadow-lg ${
              isProfessional ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            Crear Cuenta
          </button>
          <button 
            onClick={() => router.push('/login')}
            className={`w-full lg:w-1/2 bg-white font-bold py-3 px-4 rounded-full border-2 transition duration-300 transform hover:scale-105 shadow-lg ${
              isProfessional 
                ? 'text-green-600 border-green-600 hover:bg-green-50' 
                : 'text-blue-600 border-blue-600 hover:bg-blue-50'
            }`}
          >
            Iniciar Sesión
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Al crear una cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad.
        </p>
      </div>
    </div>
  )
}