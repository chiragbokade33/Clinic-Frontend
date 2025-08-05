import React from 'react'
import ClinicHeader from './ClinicHeader';
import ClinicSidebar from './ClinicSidebar';
import ClinicFooter from './ClinicFooter';


interface HomeProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<HomeProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden custom-scrollbar">
      {/* Header - Fixed at top */}
      <header className="flex-shrink-0 z-50">
        <ClinicHeader />
      </header>

      {/* Main Content Area - Takes remaining height */}
      <div className="flex flex-1 overflow-hidden custom-scrollbar">
        {/* Sidebar - Independent scroll container */}
        <aside className="flex-shrink-0 ">
          <ClinicSidebar />
        </aside>

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

export default DefaultLayout