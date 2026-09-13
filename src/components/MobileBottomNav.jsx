import React from 'react';
import {
  ShoppingBag,
  CalendarDays,
  Users,
  Package,
  LayoutDashboard,
  Bell,
  Menu,
  Sparkles
} from 'lucide-react';

export default function MobileBottomNav({
  role,
  activeNavTab,
  onTabChange,
  clientTab,
  onClientTabChange,
  employeeTab,
  onEmployeeTabChange,
  unreadAlertsCount = 0,
  onToggleAlerts,
  onToggleMenu
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#0b0e1b]/95 backdrop-blur-2xl border-t border-[#1a223c] h-16 flex items-center justify-around px-2 select-none shadow-[0_-5px_25px_rgba(0,0,0,0.8)]"
      aria-label="Navegación inferior móvil"
    >
      {/* 1. CLIENTE ITEMS */}
      {role === 'cliente' && (
        <>
          <button
            onClick={() => onClientTabChange('catalogo')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              clientTab === 'catalogo'
                ? 'text-neon-pink'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${clientTab === 'catalogo' ? 'bg-neon-pink/15 shadow-glow-pink' : ''}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Catálogo</span>
          </button>

          <button
            onClick={() => onClientTabChange('mis_pedidos')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              clientTab === 'mis_pedidos'
                ? 'text-neon-pink'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${clientTab === 'mis_pedidos' ? 'bg-neon-pink/15 shadow-glow-pink' : ''}`}>
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Mis Pedidos</span>
          </button>
        </>
      )}

      {/* 2. EMPLEADO ITEMS */}
      {role === 'empleado' && (
        <>
          <button
            onClick={() => onEmployeeTabChange('pedidos')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              employeeTab === 'pedidos'
                ? 'text-neon-pink'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${employeeTab === 'pedidos' ? 'bg-neon-pink/15 shadow-glow-pink' : ''}`}>
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Pedidos</span>
          </button>

          <button
            onClick={() => onEmployeeTabChange('clientes')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              employeeTab === 'clientes'
                ? 'text-neon-pink'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${employeeTab === 'clientes' ? 'bg-neon-pink/15 shadow-glow-pink' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Clientes</span>
          </button>

          <button
            onClick={() => onEmployeeTabChange('inventario')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              employeeTab === 'inventario'
                ? 'text-neon-pink'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${employeeTab === 'inventario' ? 'bg-neon-pink/15 shadow-glow-pink' : ''}`}>
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Stock</span>
          </button>
        </>
      )}

      {/* 3. SUPERADMIN ITEMS */}
      {role === 'superadmin' && (
        <>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeNavTab === 'dashboard'
                ? 'text-neon-pink'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeNavTab === 'dashboard' ? 'bg-neon-pink/15 shadow-glow-pink' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('pedidos')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeNavTab === 'pedidos'
                ? 'text-neon-pink'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeNavTab === 'pedidos' ? 'bg-neon-pink/15 shadow-glow-pink' : ''}`}>
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Solicitudes</span>
          </button>

          <button
            onClick={() => onTabChange('inventario')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeNavTab === 'inventario'
                ? 'text-neon-pink'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeNavTab === 'inventario' ? 'bg-neon-pink/15 shadow-glow-pink' : ''}`}>
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Mobiliario</span>
          </button>
        </>
      )}

      {/* 4. SHARED: LIVE ALERTS BUTTON WITH BADGE */}
      <button
        onClick={onToggleAlerts}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-neon-cyan transition-all relative"
      >
        <div className="p-1 rounded-xl relative">
          <Bell className="w-5 h-5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-neon-pink text-white text-[9px] font-black flex items-center justify-center shadow-glow-pink animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold mt-0.5">Alertas</span>
      </button>

      {/* 5. SHARED: SIDEBAR MENU DRAWER TOGGLE */}
      <button
        onClick={onToggleMenu}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-white transition-all"
      >
        <div className="p-1 rounded-xl">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold mt-0.5">Menú</span>
      </button>
    </nav>
  );
}
