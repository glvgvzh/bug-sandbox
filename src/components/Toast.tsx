interface ToastProps {
  message: string;
  tone?: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, tone = 'success', onClose }: ToastProps) {
  return (
    <div className={`toast ${tone}`} role="status">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Dismiss notification">×</button>
    </div>
  );
}
