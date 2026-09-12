import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShieldAlert,
  Save,
  HelpCircle,
  FileCheck2,
  DollarSign
} from 'lucide-react';

export default function PickupModal({ order, isOpen, onClose, onVerificationSuccess }) {
  if (!isOpen || !order) return null;

  // Initialize verification state for each item in the order
  const [itemsStatus, setItemsStatus] = useState(() => {
    return order.items.map((item) => {
      // If order already had a pickup inspection report, initialize with previous values
      const existing = order.pickupReport?.itemsStatus?.find((p) => p.productId === item.productId);
      return {
        productId: item.productId,
        productName: item.productName,
        deliveredQty: item.quantity,
        returnedGoodQty: existing ? existing.returnedGoodQty : item.quantity,
        damagedQty: existing ? existing.damagedQty : 0,
        notes: existing ? existing.notes : '',
      };
    });
  });

  const [inspectedBy, setInspectedBy] = useState('Personal de Recolección');
  const [generalNotes, setGeneralNotes] = useState(order.pickupReport?.notes || '');
  const [settleWithPayment, setSettleWithPayment] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Handle change in good or damaged quantities
  const handleQtyChange = (productId, field, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setItemsStatus((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return { ...item, [field]: num };
        }
        return item;
      })
    );
  };

  const handleNotesChange = (productId, notes) => {
    setItemsStatus((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, notes } : item))
    );
  };

  // Calculations
  const calculatedItems = itemsStatus.map((item) => {
    const accounted = (item.returnedGoodQty || 0) + (item.damagedQty || 0);
    const missing = Math.max(0, item.deliveredQty - accounted);
    const excess = accounted > item.deliveredQty ? accounted - item.deliveredQty : 0;
    return {
      ...item,
      missingQty: missing,
      excessQty: excess,
    };
  });

  const totalDelivered = calculatedItems.reduce((acc, i) => acc + i.deliveredQty, 0);
  const totalReturnedGood = calculatedItems.reduce((acc, i) => acc + i.returnedGoodQty, 0);
  const totalDamaged = calculatedItems.reduce((acc, i) => acc + i.damagedQty, 0);
  const totalMissing = calculatedItems.reduce((acc, i) => acc + i.missingQty, 0);

  // Business rule: Completely full if totalMissing === 0
  const isComplete = totalMissing === 0;

  const handleSubmit = async (isForcedResolution = false) => {
    setValidationError('');
    setIsSubmitting(true);

    try {
      const payload = {
        inspectedBy,
        notes: generalNotes,
        forceResolution: isForcedResolution || settleWithPayment,
        penaltyAmount: settleWithPayment ? Number(penaltyAmount) : 0,
        itemsVerification: calculatedItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          returnedGoodQty: item.returnedGoodQty,
          damagedQty: item.damagedQty,
          notes: item.notes,
        })),
      };

      await onVerificationSuccess(order.id, payload);
      onClose();
    } catch (err) {
      if (err.data && err.data.error) {
        setValidationError(err.data.error);
      } else {
        setValidationError(err.message || 'Error al procesar la recogida del mobiliario.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#0e1324] text-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#1e2642] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#12172b] text-white flex items-center justify-between border-b border-[#1e2642] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Verificación de Recogida de Mobiliario
                <span className="text-xs bg-slate-800 text-teal-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  {order.id}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Cliente: <span className="text-white font-medium">{order.customer?.name}</span> • Tel: {order.customer?.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#12172b] border border-[#1e2642] rounded-2xl p-3 text-center">
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Entregados</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{totalDelivered}</div>
              <div className="text-[10px] text-slate-400">Total en contrato</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
              <div className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">Buen Estado</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{totalReturnedGood}</div>
              <div className="text-[10px] text-emerald-600">Reintegrables</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
              <div className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider">Dañados</div>
              <div className="text-xl font-extrabold text-amber-700 mt-0.5">{totalDamaged}</div>
              <div className="text-[10px] text-amber-600">Requieren arreglo</div>
            </div>

            <div
              className={`rounded-2xl p-3 text-center border ${
                totalMissing > 0
                  ? 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
                  : 'bg-teal-50 border-teal-200 text-teal-800'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider">
                {totalMissing > 0 ? 'Faltantes' : 'Sin faltantes'}
              </div>
              <div className="text-xl font-extrabold mt-0.5">{totalMissing}</div>
              <div className="text-[10px]">{totalMissing > 0 ? 'Artículos sin devolver' : 'Todo completo'}</div>
            </div>
          </div>

          {/* Validation Warning Alert (Rule requirement) */}
          {!isComplete && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  Bloqueo de Finalización: Mobiliario Incompleto ({totalMissing} {totalMissing === 1 ? 'artículo' : 'artículos'} sin entregar)
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  Por norma estricta del sistema, <strong>no se puede marcar como COMPLETADO</strong> si el cliente no entrega todo el mobiliario acordado. Puedes registrar el estatus como <em>"Incompleto / Con Incidencias"</em> para dar seguimiento, o aplicar reposición si el cliente pagó la pérdida.
                </p>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-800 font-medium">
                ¡Inventario completo! Todos los productos entregados ({totalDelivered}) han sido devueltos y están listos para finalizar el pedido.
              </p>
            </div>
          )}

          {/* Items Table */}
          <div className="border border-[#1e2642] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-[#1e2642] text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Mobiliario Rentado</span>
              <span>Conteo en Recolección</span>
            </div>

            <div className="divide-y divide-slate-100">
              {calculatedItems.map((item) => (
                <div key={item.productId} className="p-4 bg-[#12172b] hover:bg-[#182038] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Item Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-bold text-white">{item.productName}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Cantidad entregada originalmente:{' '}
                        <span className="font-semibold text-white bg-slate-100 px-2 py-0.5 rounded">
                          {item.deliveredQty} unidades
                        </span>
                      </div>
                    </div>

                    {/* Quantity Inputs */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div>
                        <label className="block text-[10px] font-semibold text-emerald-700 uppercase mb-1">
                          Buen Estado
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={item.deliveredQty}
                          value={item.returnedGoodQty}
                          onChange={(e) => handleQtyChange(item.productId, 'returnedGoodQty', e.target.value)}
                          className="w-20 px-2.5 py-1.5 text-center text-sm font-bold text-white bg-emerald-50 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-amber-700 uppercase mb-1">
                          Con Daños
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={item.deliveredQty}
                          value={item.damagedQty}
                          onChange={(e) => handleQtyChange(item.productId, 'damagedQty', e.target.value)}
                          className="w-20 px-2.5 py-1.5 text-center text-sm font-bold text-white bg-amber-50 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="text-center min-w-[70px]">
                        <span className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                          Faltante
                        </span>
                        <span
                          className={`inline-block px-2.5 py-1.5 text-sm font-extrabold rounded-xl border ${
                            item.missingQty > 0
                              ? 'bg-rose-100 text-rose-700 border-rose-300'
                              : 'bg-slate-100 text-slate-300 border-[#1e2642]'
                          }`}
                        >
                          {item.missingQty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Damages observations */}
                  <div className="mt-2.5">
                    <input
                      type="text"
                      placeholder="Observaciones de este producto (ej. mantel manchado, silla con raspón)..."
                      value={item.notes || ''}
                      onChange={(e) => handleNotesChange(item.productId, e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-[#12172b] border border-[#1e2642] rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspector and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Personal que realiza la recolección:
              </label>
              <input
                type="text"
                value={inspectedBy}
                onChange={(e) => setInspectedBy(e.target.value)}
                placeholder="Nombre del chofer o inspector"
                className="w-full px-3 py-2 text-xs border border-[#1e2642] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notas generales de la recolección:
              </label>
              <input
                type="text"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Comentarios adicionales sobre la entrega o el evento..."
                className="w-full px-3 py-2 text-xs border border-[#1e2642] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Exception Settlement Option (Admin override if customer pays for missing furniture) */}
          {!isComplete && (
            <div className="p-3.5 bg-[#0b0e1b] border border-[#1e2642] rounded-2xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settleWithPayment}
                  onChange={(e) => setSettleWithPayment(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-[#1e2642] focus:ring-teal-500"
                />
                <span className="text-xs font-bold text-white">
                  El cliente liquidó el costo de reposición por faltantes en el lugar (Permitir cerrar pedido)
                </span>
              </label>

              {settleWithPayment && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-300">Monto cobrado por reposición ($):</span>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="number"
                      min="0"
                      value={penaltyAmount}
                      onChange={(e) => setPenaltyAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-28 pl-7 pr-3 py-1.5 text-xs font-bold border border-[#1e2642] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {validationError && (
            <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0b0e1b] border-t border-[#1e2642] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Cancelar / Volver
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {/* If incomplete, allow saving as "Con Incidencias" without completing */}
            {!isComplete && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Reporte con Faltantes (Incompleto)</span>
              </button>
            )}

            {/* Strict Completion Button: disabled if missing items */}
            <button
              type="button"
              disabled={(!isComplete && !settleWithPayment) || isSubmitting}
              onClick={() => handleSubmit(true)}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                isComplete || settleWithPayment
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-[#1e2642]'
              }`}
              title={
                !isComplete && !settleWithPayment
                  ? 'No se puede completar: aún faltan artículos por devolver'
                  : 'Finalizar y archivar pedido completo'
              }
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isComplete
                  ? 'Marcar como Completado'
                  : settleWithPayment
                  ? 'Completar con Reposición Pagada'
                  : 'No se puede completar (Faltan productos)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
