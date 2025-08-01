import React from 'react'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function MobileHeader({ title = "Page Title" }) {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1) 
  }

  return (
   <header className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 mt-5">
        <button 
          className="flex lg:hidden items-center justify-center w-10 h-10 sm:w-12 sm:h-12 sm:m-0 bg-primary rounded-full text-secondary hover:bg-shadow transition-colors flex-shrink-0"
          aria-label="Go back"
          onClick={handleGoBack}
        >
          <ArrowBack className="text-lg sm:text-xl" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-textcolor truncate">{title}</h1>
      </header>  
      )
}
