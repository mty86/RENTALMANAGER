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
  Filter,
  X
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
  isOpenMobile = false,
  onCloseMobile
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
      if (diffMin < 60) return `Hace ${diffMin}m`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Hace ${diffHours}h`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return 'Reciente';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag className="w-4 h-4 text-amber-400 animate-bounce" />;
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
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Drawer Aside */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 lg:top-16 lg:z-20 w-full max-w-sm sm:max-w-md lg:w-80 xl:w-96 bg-[#0b0e1b] text-white flex flex-col border-l border-[#1a223c] select-none transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        aria-label="Panel de notificaciones y alertas"
      >
        {/* Header */}
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

          {/* Audio Toggle & Mobile Close Button */}
          <div className="flex items-center gap-1.5">
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

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10"
              title="Cerrar alertas"
            >
              <X className="w-4 h-4" />
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
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-glow-pink'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alertas
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="p-1.5 text-slate-400 hover:text-neon-cyan hover:bg-white/5 rounded-lg transition-colors"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
            )}
            {roleNotifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                title="Vaciar notificaciones"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-300">No hay alertas en esta sección</p>
              <p className="text-[11px] text-slate-500">
                {filter === 'unread'
                  ? 'Estás al día con todas las notificaciones.'
                  : 'Las alertas operativas en tiempo real aparecerán aquí.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isOverdue = notif.type === 'overdue_pickup';

              return (
                <div
                  key={notif.id}
                  onClick={() => onMarkAsRead(notif.id)}
                  className={`rounded-2xl p-3 border transition-all cursor-pointer relative group ${
                    notif.read
                      ? 'bg-[#12172b]/60 border-[#1e2642] opacity-75 hover:opacity-100 hover:border-slate-600'
                      : isOverdue
                      ? 'bg-rose-950/30 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                      : 'bg-[#12172b] border-neon-pink/40 shadow-[0_0_12px_rgba(255,46,147,0.15)]'
                  }`}
                >
                  {/* Unread Accent Dot */}
                  {!notif.read && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-neon-pink shadow-glow-pink animate-ping" />
                  )}

                  <div className="flex items-start gap-2.5">
                    {/* Notification Icon */}
                    <div className="p-2 rounded-xl bg-[#0b0e1b] border border-white/5 shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider border ${getNotificationBadgeClass(
                            notif.type
                          )}`}
                        >
                          {notif.title}
                        </span>

                        {notif.orderId && (
                          <span className="text-[10px] font-mono text-neon-cyan font-bold">
                            #{notif.orderId}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-slate-500">
                        <span>{formatTime(notif.timestamp)}</span>

                        {notif.orderId && onNavigateToOrder && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToOrder(notif.orderId);
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className="text-neon-cyan font-bold hover:underline flex items-center gap-0.5 group-hover:text-neon-pink transition-colors"
                          >
                            <span>Ver</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2.5 bg-[#0e1222] border-t border-[#1a223c] text-[10px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-neon-pink" />
            Monitoreo en Vivo
          </span>
          <span className="text-slate-400 font-mono">Rental Manager Pro</span>
        </div>
      </aside>
    </>
  );
}
