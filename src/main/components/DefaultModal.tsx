import * as React from 'react';
import ReactModal from 'react-modal';

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

export function DefaultModal({
  isOpen,
  onRequestClose,
  children, }: Props): JSX.Element {
  return <ReactModal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    style={{
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: 0,
        border: '1px solid var(--border-color)',
        borderRadius: 0,
      },
      overlay: {
        zIndex: 1,
      }
    }}>
    {children}
  </ReactModal>;
}
