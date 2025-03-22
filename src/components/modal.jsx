import { useEffect, useRef } from "react";

// Keep track of active modals across the application
let activeModals = 0;

function Modal({ children, isOpen, handleClose, type = "large" }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      activeModals++;
      const currentModal = activeModals;

      // We'll only attach the event listener for the topmost modal
      const closeOnEscapeKey = (e) => {
        if (e.key === "Escape" && currentModal === activeModals) {
          handleClose();
        }
      };

      document.body.addEventListener("keydown", closeOnEscapeKey);

      return () => {
        document.body.removeEventListener("keydown", closeOnEscapeKey);
        activeModals--;
      };
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="modal" onClick={handleOverlayClick} ref={modalRef}>
      <div style={{ borderRadius: "10px" }} className={`modal-content-${type}`}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
