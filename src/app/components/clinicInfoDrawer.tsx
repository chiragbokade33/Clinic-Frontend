import React, { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string; // e.g. 'w-80', 'w-96'
  position?: "right" | "left";
  title?: string;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  widthClass = "w-110",
  position = "right",
  title = "Help Panel",
}) => {
  if (!isOpen) return null;

  const drawerPositionClasses = position === "right" ? "right-0" : "left-0";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-19 ${drawerPositionClasses} h-full bg-white shadow-2xl z-50 flex flex-col ${widthClass}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Fixed Header */}
        <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50">
          <h2 className="text-lg font-semibold">{title}</h2>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-white cursor-pointer"
            onClick={onClose}
          />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6 pb-30">
          {children}
        </div>
      </aside>
    </>
  );
};

export default Drawer;
