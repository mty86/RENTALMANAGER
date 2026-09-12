import React from 'react';
import { Plus, Minus, CheckCircle, XCircle } from 'lucide-react';

export default function ProductCard({ product, selectedQuantity = 0, onQuantityChange }) {
  const isOutOfStock = (product.availableStock ?? 0) <= 0;

  const handleIncrement = () => {
    if (selectedQuantity < product.availableStock) {
      onQuantityChange(product.id, selectedQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (selectedQuantity > 0) {
      onQuantityChange(product.id, selectedQuantity - 1);
    }
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xl ${
        selectedQuantity > 0
          ? 'bg-[#161d36] border-neon-pink ring-2 ring-neon-pink/30 shadow-[0_0_20px_rgba(255,46,147,0.25)]'
          : 'bg-[#12172b] border-[#1e2642] hover:border-neon-pink/50 hover:shadow-[0_0_20px_rgba(255,46,147,0.15)] text-slate-100'
      }`}
    >
      {/* Top Category & Availability Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-300 bg-[#182038] border border-[#242e50]">
          {product.category}
        </span>

        {isOutOfStock ? (
          <span className="px-2.5 py-1 bg-rose-950/50 border border-rose-500/40 text-rose-400 rounded-xl text-[11px] font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Agotado</span>
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 rounded-xl text-[11px] font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Disponible</span>
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-1.5 flex-1">
        <h3 className="font-bold text-white text-base leading-snug">
          {product.name}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          {product.description || 'Mobiliario para eventos en óptimas condiciones.'}
        </p>
      </div>

      {/* Footer: State & Quantity Selector */}
      <div className="mt-5 pt-3.5 border-t border-[#1e2642] flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Estado</span>
          <span className={`text-xs font-bold ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isOutOfStock ? 'Sin disponibilidad' : 'Disponible'}
          </span>
        </div>

        {/* Quantity Controls */}
        {isOutOfStock ? (
          <span className="text-xs text-rose-400 font-semibold italic">No disponible</span>
        ) : (
          <div className="flex items-center gap-1 bg-[#0b0e1b] p-1 rounded-2xl border border-[#1e2642]">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={selectedQuantity <= 0}
              className="w-7 h-7 rounded-xl bg-[#182038] hover:bg-[#222c4d] border border-[#2e3a60] disabled:opacity-25 text-slate-200 hover:text-white flex items-center justify-center transition-colors shadow-sm"
              title="Disminuir cantidad"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-8 text-center text-xs font-black text-white">
              {selectedQuantity}
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={selectedQuantity >= product.availableStock}
              className="w-7 h-7 rounded-xl bg-neon-pink hover:bg-pink-600 disabled:opacity-25 text-white flex items-center justify-center transition-colors shadow-glow-pink"
              title="Aumentar cantidad"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
