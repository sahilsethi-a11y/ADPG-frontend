"use client";

import { useEffect } from "react";
import { CloseIcon } from "@/components/Icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  showCloseButton = false,
  children,
}: Readonly<ModalProps>) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <button
        className="fixed inset-0 bg-black/50 z-60 border-0 cursor-default"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close modal"
      />
      <dialog
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-70 bg-transparent p-0 m-0 w-fit min-w-[320px] max-w-3xl overflow-visible"
        aria-modal="true"
        open
      >
        <div className="bg-white rounded-xl shadow-xl p-4">
          {showCloseButton && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <CloseIcon />
            </button>
          )}
          {children}
        </div>
      </dialog>
    </>
  );
}
