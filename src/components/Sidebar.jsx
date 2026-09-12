import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Users,
  MapPin,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Truck,
  LogOut
} from 'lucide-react';

export default function Sidebar({
  currentRole,
  activeTab,
  onTabChange,
  pendingOrdersCount = 0,
  isCollapsed,
  onToggleCollapse,
  currentUser,
  onLogout
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['superadmin', 'empleado'],
    },
    {
      id: 'pedidos',
      label: 'Solicitudes',
      sublabel: 'Bookings',
      icon: CalendarDays,
      roles: ['superadmin', 'empleado'],
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-neon-pink text-white shadow-glow-pink',
    },
    {
      id: 'inventario',
      label: 'Mobiliario',
      sublabel: 'Stock & Catálogo',
      icon: Package,
      roles: ['superadmin', 'empleado', 'cliente'],
    },
    {
      id: 'clientes',
      label: 'Clientes',
      sublabel: 'Directorios GPS',
      icon: Users,
      roles: ['superadmin', 'empleado'],
    },
    {
      id: 'rutas',
      label: 'Logística & Rutas',
      sublabel: 'Base Central',
      icon: Truck,
      roles: ['superadmin', 'empleado'],
    },
    {
      id: 'metricas',
      label: 'Finanzas & Reportes',
      sublabel: 'Métricas Globales',
      icon: TrendingUp,
      roles: ['superadmin'],
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      sublabel: 'Ajustes del Sistema',
      icon: Settings,
      roles: ['superadmin', 'empleado'],
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(currentRole)
  );

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col justify-between bg-[#0b0e1b] border-r border-[#1a223c] transition-all duration-300 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a223c]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <img
                src="/logo.png"
                alt="Rental Manager"
                className="h-9 w-9 object-contain rounded-xl p-0.5 bg-white/5 border border-white/10 shadow-glow-pink"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-pink border-2 border-[#0b0e1b] shadow-[0_0_8px_#ff2e93]" />
            </div>

            {!isCollapsed && (
              <div className="animate-fadeIn whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wider text-white uppercase">
                    Rental
                  </span>
                  <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-neon-pink/20 text-neon-pink border border-neon-pink/40 shadow-glow-pink tracking-widest uppercase">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                  Manager System
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white items-center justify-center border border-white/5 transition-colors"
            title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5 mt-2">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Navegación
            </div>
          )}

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all relative group ${
                  isActive
                    ? 'bg-neon-pink/15 text-white border border-neon-pink/80 shadow-[0_0_20px_rgba(255,46,147,0.35)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active Indicator Accent */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-neon-pink shadow-glow-pink" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-neon-pink' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 text-left flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {isCollapsed && item.badge && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-pink shadow-glow-pink" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-[#1a223c]">
        {!isCollapsed ? (
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-slate-300">Online</span>
              </div>
              <span className="text-[10px] font-mono text-neon-cyan">v2.4 Pro</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate">
              Modo: <span className="text-slate-300 capitalize">{currentRole}</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full mt-2 pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors"
                title="Salir del sistema"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
