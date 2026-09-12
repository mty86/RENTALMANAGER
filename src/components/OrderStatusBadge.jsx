import React from 'react';
import { Clock, CheckCircle2, Truck, AlertTriangle, XCircle, PackageCheck } from 'lucide-react';

export default function OrderStatusBadge({ status }) {
  const configs = {
    pendiente: {
      label: 'Pendiente de Aceptación',
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm',
      icon: Clock,
    },
    aceptado: {
      label: 'Aceptado / En Preparación',
      bg: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40 shadow-glow-cyan',
      icon: PackageCheck,
    },
    en_camino: {
      label: 'En Camino a Entrega',
      bg: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
      icon: Truck,
    },
    entregado: {
      label: 'Entregado al Cliente',
      bg: 'bg-neon-pink/15 text-neon-pink border-neon-pink/40 shadow-glow-pink',
      icon: Truck,
    },
    con_incidencias: {
      label: 'Incompleto / Faltantes',
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-semibold',
      icon: AlertTriangle,
    },
    completado: {
      label: 'Completado y Recogido',
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
    },
    cancelado: {
      label: 'Cancelado',
      bg: 'bg-white/5 text-slate-400 border-white/10',
      icon: XCircle,
    },
  };

  const config = configs[status] || {
    label: status,
    bg: 'bg-white/5 text-slate-300 border-white/10',
    icon: Clock,
  };

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${config.bg}`}>
      <IconComponent className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
