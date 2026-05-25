import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-all duration-200 cursor-pointer',
};

const sizes = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-6 py-3',
  lg: 'text-lg px-8 py-4',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${size !== 'md' ? sizes[size] : ''} ${
        disabled || loading ? 'opacity-60 cursor-not-allowed hover:scale-100 hover:shadow-none' : ''
      } ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
