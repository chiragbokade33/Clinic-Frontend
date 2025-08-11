"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
   const router = useRouter();
     const pathname = usePathname();

    const isClinicLogin = pathname === '/clinicLogin';

  const handleClick = () => {
    if (isClinicLogin) {
      router.push('/'); // if on /clinicLogin, go to /
    } else {
      router.push('/clinicLogin'); // if on /, go to /clinicLogin
    }
  };

  return (
    <header className="sticky top-0 z-50 text-white px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-[#0331B5]">
      <div className="flex justify-between mx-1 sm:mx-2 lg:mx-4 items-center">
        <div className="flex items-center text-lg sm:text-xl lg:text-2xl font-bold">
          <img
            src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
            alt="HFiles Logo"
            className="w-[154px] h-auto mr-1 sm:mr-2"
          /> 
        </div>

        <button className="bg-yellow-400 text-blue-700 text-xs sm:text-sm md:text-base font-semibold px-2 sm:px-4 lg:px-6 py-1 sm:py-2 rounded hover:bg-yellow-300 transition cursor-pointer"
        onClick={handleClick}
        >
          {isClinicLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
    </header>
  );
};

export default Header;