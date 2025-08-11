import React, { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: string; // Allow full Tailwind class string
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "bottom-full mb-2 left-1/2 -translate-x-1/2",
}) => {
  return (
    <div className="relative group inline-block">
      {children}

      <div
        className={`absolute ${position} 
        z-50 hidden group-hover:flex 
        px-2 py-1 bg-black text-white text-xs 
        rounded shadow-lg whitespace-nowrap pointer-events-none`}
      >
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
