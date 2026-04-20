import { IoCheckmark } from 'react-icons/io5';

export default function Stepper({ steps = [], active = 0 }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-4">
      {steps.map((label, idx) => {
        const done = idx < active;
        const current = idx === active;
        return (
          <div key={label} className="flex flex-1 items-center gap-3">
            <div
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold',
                done || current
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500',
              ].join(' ')}
            >
              {done ? <IoCheckmark className="h-5 w-5" /> : idx + 1}
            </div>
            <div className="min-w-0">
              <p
                className={[
                  'truncate text-sm font-semibold',
                  current ? 'text-slate-900' : 'text-slate-600',
                ].join(' ')}
              >
                {label}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div className="hidden h-px flex-1 bg-slate-200 sm:block" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
