import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, className = '', id, ...props }, ref) {
  const inputId = id || (label && `input-${String(label).replace(/\s+/g, '-').toLowerCase()}`);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={[
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition',
          'placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200',
          error && 'border-red-500 focus:ring-red-200',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Input;