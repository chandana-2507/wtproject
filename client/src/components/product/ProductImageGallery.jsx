import { useState } from 'react';
import Modal from '../ui/Modal';

export default function ProductImageGallery({ images = [], name = 'Product' }) {
  const list = images?.length ? images : [{ url: 'https://placehold.co/800x800?text=No+image' }];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const main = list[active]?.url;

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoom(true)}
        className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-sm"
        aria-label="Enlarge image"
      >
        <img src={main} alt={name} className="h-full w-full object-cover transition group-hover:scale-105" />
        <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow">
          Click to zoom
        </span>
      </button>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {list.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActive(idx)}
            className={[
              'h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition',
              idx === active ? 'border-primary ring-2 ring-indigo-100' : 'border-slate-100 hover:border-slate-300',
            ].join(' ')}
          >
            <img src={img.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <Modal open={zoom} onClose={() => setZoom(false)} title={name} size="lg">
        <div className="rounded-xl bg-slate-50 p-2">
          <img src={main} alt={name} className="max-h-[70vh] w-full object-contain" />
        </div>
      </Modal>
    </div>
  );
}
