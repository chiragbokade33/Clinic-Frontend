import React from "react";
import Header from "./Header";
import Footer from "./Footer";


interface HomeProps {
  children: React.ReactNode;
}

const Home: React.FC<HomeProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Scrollable Main Content */}
      <main className="flex-grow overflow-y-auto custom-scrollbar">
        {children}
      </main>


      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
