import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import BookingModal from './components/BookingModal'
import { useAuth } from './hooks/useAuth'

function App() {
  const [authModal, setAuthModal] = React.useState<{
    isOpen: boolean
    mode: 'login' | 'register'
  }>({ isOpen: false, mode: 'login' })
  const [bookingModal, setBookingModal] = React.useState(false)
  
  const { user } = useAuth()

  const handleBookingClick = () => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' })
    } else {
      setBookingModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero onBookingClick={handleBookingClick} />
        <Features />
      </main>
      <Footer />
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        mode={authModal.mode}
        onModeChange={(mode) => setAuthModal({ isOpen: true, mode })}
      />
      <BookingModal
        isOpen={bookingModal}
        onClose={() => setBookingModal(false)}
        user={user}
      />
    </div>
  )
}

export default App