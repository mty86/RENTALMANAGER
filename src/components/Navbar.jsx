import React from 'react';
import {
  Sparkles,
  User,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  Search,
  Bell,
  LogOut
} from 'lucide-react';

export default function Navbar({
  currentRole,
  onRoleChange,
  pendingOrdersCount = 0,
  onRefreshData,
  isRefreshing,
  searchQuery = '',
  onSearchChange,
  unreadNotificationsCount = 0,
  currentUser,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0b0e1b]/95 backdrop-blur-xl border-b border-[#1a223c] shadow-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Left: Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Buscar pedido, cliente, mueble..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#12172b] border border-[#1e2642] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-neon-pink/70 focus:ring-1 focus:ring-neon-pink/50 transition-all"
              />
            </div>
          </div>

          {/* Center: 3-Role Switcher with Neon Highlights */}
          <div className="bg-[#12172b] p-1 rounded-2xl flex items-center border border-[#1e2642] shadow-inner">
            <button
              onClick={() => onRoleChange('cliente')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'cliente'
                  ? 'bg-gradient-to-r from-neon-cyan to-blue-600 text-slate-950 font-black shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cliente</span>
            </button>

            <button
              onClick={() => onRoleChange('empleado')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                currentRole === 'empleado'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Empleado</span>
              {pendingOrdersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onRoleChange('superadmin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'superadmin'
                  ? 'bg-gradient-to-r from-neon-pink to-purple-600 text-white font-black shadow-glow-pink'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Superadmin</span>
            </button>
          </div>

          {/* Right: Actions & Profile Avatar */}
          <div className="flex items-center gap-2.5">
            {/* Sync Refresh Button */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="p-2 text-slate-400 hover:text-neon-cyan hover:bg-white/5 rounded-xl border border-[#1e2642] transition-colors"
              title="Actualizar datos del servidor"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-neon-cyan' : ''}`} />
            </button>

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#1a223c]">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neon-pink to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-glow-pink">
                {currentRole === 'superadmin' ? 'SA' : currentRole === 'empleado' ? 'EM' : 'CL'}
              </div>
              <div className="hidden md:block text-left text-xs">
                <div className="font-bold text-white capitalize leading-tight">
                  {currentUser?.name || currentRole}
                </div>
                <div className="text-[10px] text-slate-400">En Línea</div>
              </div>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-[#1e2642] hover:border-rose-500/30 transition-colors ml-1"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
