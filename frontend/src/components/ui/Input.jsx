import { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        ref={ref}
        className={`input-field ${Icon ? 'pl-10' : ''} ${
          error ? 'border-red-400 focus:ring-red-400' : ''
        } ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
