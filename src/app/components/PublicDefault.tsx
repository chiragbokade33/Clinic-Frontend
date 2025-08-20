import React from 'react'
import ClinicFooter from './ClinicFooter';
import PublicHeader from './PublicHeader';


interface HomeProps {
  children: React.ReactNode;
}

const PublicDefault: React.FC<HomeProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden custom-scrollbar">
      {/* Header - Fixed at top */}
      <header className="flex-shrink-0 z-50">
        <PublicHeader />
      </header>

      {/* Main Content Area - Takes remaining height */}
      <div className="flex flex-1 overflow-hidden custom-scrollbar">

        {/* Main Content - Completely independent scroll */}
        <main className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden bg-white">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Footer - Fixed at bottom */}
      <footer className="flex-shrink-0 z-50">
        <ClinicFooter />
      </footer>
    </div>
  )
}

export default PublicDefault