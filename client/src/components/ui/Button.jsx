export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const variants = {
    primary:
      'bg-primary text-white hover:bg-indigo-600 shadow-sm hover:shadow-md disabled:opacity-50',
    secondary:
      'bg-secondary text-white hover:bg-amber-600 shadow-sm hover:shadow-md disabled:opacity-50',
    outline:
      'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
  };

  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  return (
    <button
      type={type}
      disabled={disabled}
      className={[base, variants[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
