import React from "react";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc?: string;
  title: string;
  message: string;
  dynamicName?: string;
  type?: "success" | "warning" | "error";
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const iconColor = {
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
};

const GenericConfirmModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  title,
  message,
  dynamicName,
  type = "warning",
  onConfirm,
  confirmText = "Yes, Continue",
  cancelText = "Cancel",
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/90" aria-hidden="true" />
      <Dialog.Panel className="bg-white rounded-sm max-w-sm w-full relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        {imageSrc && (
          <div className="flex justify-center mb-4 mt-6">
            <Image src={imageSrc} alt="modal icon" width={60} height={60} />
          </div>
        )}

        <Dialog.Title className="text-center font-bold text-lg">
          {title}{" "}
          {dynamicName && (
            <span className="text-blue-800 ">{dynamicName}</span>
          )}
          ?
        </Dialog.Title>

        <div className="flex justify-center mt-2">
          <div className="w-30 h-0.5 bg-black" />
        </div>

        <div className="text-center text-sm text-gray-700 mt-4 mb-4">
          {message.replace("{name}", dynamicName || "this user")}
        </div>

        <div className="border border-gray-300"></div>

        <div className="mt-6 mb-6 flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md font-medium"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium"
          >
            {cancelText}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default GenericConfirmModal;
