import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  PackageCheck,
  XCircle,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  Trash2,
  Filter
} from 'lucide-react';

export default function NotificationSidebar({
  role, // 'cliente' | 'empleado' | 'superadmin'
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDeleteNotification,
  onNavigateToOrder,
  soundEnabled,
  onToggleSound,
}) {
  const [filter, setFilter] = useState('todas'); // 'todas' | 'unread' | 'alertas'

  // Filter notifications relevant to current role (superadmin sees all)
  const roleNotifications = useMemo(() => {
    if (role === 'superadmin') return notifications;
    return notifications.filter((n) => !n.role || n.role === role);
  }, [notifications, role]);

  const unreadCount = useMemo(() => {
    return roleNotifications.filter((n) => !n.read).length;
  }, [roleNotifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return roleNotifications.filter((n) => !n.read);
    }
    if (filter === 'alertas') {
      return roleNotifications.filter((n) => n.type === 'overdue_pickup' || n.type === 'cancelled' || n.type === 'new_order');
    }
    return roleNotifications;
  }, [roleNotifications, filter]);

  // Format relative time
  const formatTime = (isoString) => {
    if (!isoString) return 'Hace un momento';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Hace unos seg';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays} d`;
    } catch (e) {
      return 'Reciente';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-neon-cyan" />;
      case 'delivered':
        return <Truck className="w-4 h-4 text-neon-pink" />;
      case 'completed':
        return <PackageCheck className="w-4 h-4 text-purple-400" />;
      case 'overdue_pickup':
        return <Clock className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNotificationBadgeClass = (type) => {
    switch (type) {
      case 'new_order':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold';
      case 'accepted':
        return 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan font-bold shadow-glow-cyan';
      case 'delivered':
        return 'bg-neon-pink/15 border-neon-pink/40 text-neon-pink font-bold shadow-glow-pink';
      case 'completed':
        return 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold';
      case 'overdue_pickup':
        return 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-black shadow-glow-pink animate-pulse';
      case 'cancelled':
        return 'bg-rose-950/40 border-rose-800/40 text-rose-400';
      default:
        return 'bg-white/5 border-white/10 text-slate-300';
    }
  };

  return (
    <aside
      className="hidden lg:flex fixed top-16 right-0 bottom-0 w-80 xl:w-96 bg-[#0b0e1b] text-white z-20 flex-col border-l border-[#1a223c] select-none"
      aria-label="Panel permanente de notificaciones y alertas"
    >
      {/* Header: Always open, cannot be closed */}
      <div className="px-4 py-3.5 bg-[#12172b] text-white flex items-center justify-between border-b border-[#1e2642]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neon-pink/15 border border-neon-pink/40 flex items-center justify-center text-neon-pink shadow-glow-pink shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Alertas en Vivo</span>
              {unreadCount > 0 && (
                <span className="bg-neon-pink text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-glow-pink">
                  {unreadCount} nuevas
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400 capitalize">
              Modo: <strong className="text-neon-cyan">{role}</strong>
            </p>
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg text-xs transition-colors border ${
              soundEnabled
                ? 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10 hover:bg-neon-cyan/20'
                : 'text-slate-500 border-white/5 hover:bg-white/5'
            }`}
            title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Filter and Quick Actions Bar */}
      <div className="px-3 py-2 bg-[#0e1222] border-b border-[#1a223c] flex items-center justify-between gap-1 text-xs">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#12172b] p-0.5 rounded-xl border border-[#1e2642]">
          <button
            onClick={() => setFilter('todas')}
            className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all ${
              filter === 'todas'
                ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/40 shadow-glow-pink'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({roleNotifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all ${
              filter === 'unread'
                ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/40 shadow-glow-pink'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            No leídas ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('alertas')}
            className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all ${
              filter === 'alertas'
                ? 'bg-rose-600 text-white shadow-glow-pink'
                : 'text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            Alertas
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="p-1 text-slate-400 hover:text-neon-cyan hover:bg-white/5 rounded-lg transition-colors"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
          {roleNotifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Limpiar notificaciones"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 px-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center mx-auto mb-2.5">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-300">Sin notificaciones pendientes</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              {role === 'cliente'
                ? 'Aquí verás avisos inmediatos del avance de tus solicitudes.'
                : 'Aquí verás avisos en tiempo real de nuevas solicitudes y alertas de recogida.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isOverdue = notif.type === 'overdue_pickup';
            const isNewOrder = notif.type === 'new_order';

            return (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                className={`p-3 rounded-2xl border transition-all text-xs relative group cursor-pointer ${
                  notif.read
                    ? 'bg-[#12172b] border-[#1e2642] opacity-75 hover:opacity-100 hover:border-slate-600'
                    : isOverdue
                    ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/40 shadow-glow-pink'
                    : isNewOrder
                    ? 'bg-amber-950/30 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-[#141b33] border-neon-pink/40 shadow-glow-pink'
                }`}
              >
                {/* Unread indicator */}
                {!notif.read && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-neon-pink shadow-glow-pink" />
                )}

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-xl bg-[#1b223c] border border-white/10 shadow-sm shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getNotificationBadgeClass(notif.type)}`}>
                        {notif.title}
                      </span>
                      {notif.orderId && (
                        <span className="font-mono text-[9px] font-semibold text-slate-400 bg-white/5 px-1 py-0.2 rounded border border-white/10">
                          #{notif.orderId}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-200 text-[11px] leading-snug">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1e2642]">
                      <span className="text-[9px] text-slate-400 font-mono">
                        {formatTime(notif.timestamp)}
                      </span>

                      {/* CTA REDIRECTION BUTTON */}
                      {notif.orderId && onNavigateToOrder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notif.id);
                            onNavigateToOrder(notif);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all ${
                            isOverdue
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-glow-pink'
                              : isNewOrder
                              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                              : 'bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white shadow-glow-pink'
                          }`}
                        >
                          <span>
                            {role === 'empleado'
                              ? isOverdue
                                ? 'Atender'
                                : 'Atender'
                              : 'Ver'}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dismiss Single Notification */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNotification(notif.id);
                  }}
                  className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 bg-[#12172b] border-t border-[#1e2642] text-[10px] text-slate-400 flex items-center justify-between px-4">
        <span>{roleNotifications.length} avisos</span>
        <span className="text-neon-cyan font-mono font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          En Vivo
        </span>
      </div>
    </aside>
  );
}
