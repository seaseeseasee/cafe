import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import Modal from '../components/Modal.jsx';

const ConfirmContext = createContext(null);

/** ใช้งาน: const confirm = useConfirm(); if (await confirm({ title, message, danger: true })) {...} */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState({ confirmText: 'ยืนยัน', cancelText: 'ยกเลิก', ...opts });
      }),
    [],
  );

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Modal
          open
          size="sm"
          onClose={() => close(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => close(false)}>
                {state.cancelText}
              </button>
              <button className={`btn ${state.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => close(true)} autoFocus>
                {state.confirmText}
              </button>
            </>
          }
        >
          <div className="confirm-body">
            <div className={`confirm-icon ${state.danger ? 'danger' : ''}`}>
              {state.danger ? <AlertTriangle size={28} /> : <HelpCircle size={28} />}
            </div>
            <h3>{state.title}</h3>
            {state.message && <p className="muted">{state.message}</p>}
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
