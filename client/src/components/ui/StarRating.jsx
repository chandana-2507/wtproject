import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

export default function StarRating({ value = 0, count = 5, showValue, className = '' }) {
  const stars = [];
  for (let i = 1; i <= count; i += 1) {
    if (value >= i) stars.push('full');
    else if (value >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars.map((t, idx) =>
        t === 'full' ? (
          <FaStar key={idx} className="text-amber-400" />
        ) : t === 'half' ? (
          <FaStarHalfAlt key={idx} className="text-amber-400" />
        ) : (
          <FaRegStar key={idx} className="text-slate-300" />
        )
      )}
      {showValue != null && (
        <span className="ml-1 text-xs font-medium text-slate-600">{Number(value).toFixed(1)}</span>
      )}
    </div>
  );
}
