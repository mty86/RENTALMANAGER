import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Phone,
  MessageCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function RejectOrderModal({ isOpen, order, onClose, onConfirmReject }) {
  if (!isOpen || !order) return null;

  const quickReasons = [
    'Sin disponibilidad de mobiliario para la fecha solicitada',
    'Ubicación fuera de nuestra zona de cobertura para entregas',
    'Horario no compatible con nuestra ruta de entregas del día',
    'Stock insuficiente en los productos solicitados',
    'Dirección incompleta o no accesible para el vehículo de carga',
  ];

  const [selectedReason, setSelectedReason] = useState(quickReasons[0]);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  const cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');

  const finalReasonText = customNote.trim()
    ? `${selectedReason} - ${customNote.trim()}`
    : selectedReason;

  const messageText = `Hola *${order.customer?.name}*, le contactamos de *Rental Manager*. Lamentamos informarle que su solicitud de alquiler *#${order.id}* no ha podido ser aceptada por el siguiente motivo:

"${finalReasonText}"

Si desea consultar disponibilidad para otra fecha o requiere apoyo para ajustar su pedido, puede responder directamente a este mensaje o llamarnos. Agradecemos su preferencia.`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  const phoneCallUrl = `tel:${order.customer?.phone || ''}`;

  const handleRejectSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmReject(order.id, finalReasonText, whatsappSent);
      onClose();
    } catch (err) {
      alert(err.message || 'Error al procesar el rechazo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#0e1324] text-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-[#1e2642] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between border-b border-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Rechazar Solicitud de Pedido • {order.id}
              </h3>
              <p className="text-[11px] text-rose-200">
                Cliente: {order.customer?.name} ({order.customer?.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-rose-800 hover:bg-rose-700 text-rose-200 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Motivo del Rechazo
            </label>
            <div className="space-y-1.5">
              {quickReasons.map((reason, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-rose-50/70 border-rose-400 text-rose-900 font-semibold'
                      : 'border-[#1e2642] hover:bg-[#12172b] text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detalles adicionales o mensaje personalizado (opcional):
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ej. Mobiliario reservado por otro cliente con anticipación..."
              className="w-full px-3 py-2 bg-[#12172b] border border-[#1e2642] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
          </div>

          {/* Quick Notification Section (WhatsApp & Phone Call) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Notificación Directa al Cliente
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">Requerido por protocolo</span>
            </div>

            <p className="text-xs text-emerald-800">
              Notifica al cliente de inmediato por WhatsApp con el motivo especificado o comunícate vía telefónica:
            </p>

            {/* Message preview */}
            <div className="bg-white rounded-xl p-3 border border-emerald-200 text-[11px] text-slate-300 font-mono space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Mensaje WhatsApp a enviar:</div>
              <p className="whitespace-pre-line text-slate-800 line-clamp-4">{messageText}</p>
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWhatsappSent(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir WhatsApp con Cliente</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={phoneCallUrl}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Phone className="w-4 h-4 text-teal-400" />
                <span>Llamar al {order.customer?.phone}</span>
              </a>
            </div>

            {whatsappSent && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Acceso directo a WhatsApp abierto. Ya puedes confirmar el rechazo.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#12172b] border-t border-[#1e2642] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-white"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleRejectSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{isSubmitting ? 'Guardando...' : 'Confirmar Rechazo en Sistema'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
