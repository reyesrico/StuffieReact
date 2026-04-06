import React from 'react';

import './Modal.scss';

interface ModalProps {
  /** Called when overlay is clicked to dismiss. Omit for modals that must be closed via a button only. */
  onClose?: () => void;
  /** Modal title */
  title: string;
  /** Action buttons row (use <Button> components) */
  actions: React.ReactNode;
  /** Optional body content */
  children?: React.ReactNode;
  /** Prevent closing by clicking the overlay (e.g. while loading) */
  disableBackdropClose?: boolean;
}

const Modal = ({ onClose, title, actions, children, disableBackdropClose }: ModalProps) => {
  const handleOverlayClick = () => {
    if (!disableBackdropClose && onClose) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h4 className="modal__title">{title}</h4>
        {children && (
          <div className="modal__body">{children}</div>
        )}
        <div className="modal__actions">{actions}</div>
      </div>
    </div>
  );
};

export default Modal;
