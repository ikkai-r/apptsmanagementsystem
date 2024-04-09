"use client"
import LandingPage from "./LandingPage/LandingPage.jsx"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export default function Home() {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    
    <main className="min-h-screen min-w-full px-5 bg-gray-200">
      <LandingPage />
    </main>
    </LocalizationProvider>

  )
}
