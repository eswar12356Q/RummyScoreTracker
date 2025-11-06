export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  value?: string;
  onChange?: ((value: string) => void);
  placeholder?: string;
  type?: 'text' | 'number' | 'email';
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
  min?: number;
  max?: number;
  required?: boolean;
  [key: string]: any; // Allow additional props for react-hook-form
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
  onDismiss?: () => void;
}

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}