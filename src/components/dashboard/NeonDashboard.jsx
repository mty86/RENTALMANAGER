import React, { useState } from 'react';
import {
  Home,
  Calendar,
  BarChart3,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Truck,
  Activity
} from 'lucide-react';

export default function NeonDashboard({
  orders = [],
  products = [],
  customers = [],
  employees = [],
  onNavigateToTab
}) {
  const [chartTimeframe, setChartTimeframe] = useState('mensual');

  // Calculations
  const totalRentedPieces = orders
    .filter((o) => ['aceptado', 'en_camino', 'entregado'].includes(o.status))
    .reduce((sum, o) => {
      const itemsCount = o.items ? o.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0) : 0;
      return sum + itemsCount;
    }, 0);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pendiente').length;
  const activeOrdersCount = orders.filter((o) => ['aceptado', 'en_camino', 'entregado'].includes(o.status)).length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completado').length;

  const totalStock = products.reduce((acc, p) => acc + (Number(p.totalStock) || 0), 0);
  const availableStock = products.reduce((acc, p) => acc + (Number(p.availableStock) || 0), 0);
  const occupancyRate = totalStock > 0 ? Math.round(((totalStock - availableStock) / totalStock) * 100) : 74;

  const totalRevenue = orders
    .filter((o) => ['aceptado', 'en_camino', 'entregado', 'completado'].includes(o.status))
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // Chart data simulation (12 months)
  const monthlyData = [
    { month: 'Ene', orders: 18, curve: 42, barHeight: 35 },
    { month: 'Feb', orders: 24, curve: 55, barHeight: 45 },
    { month: 'Mar', orders: 32, curve: 62, barHeight: 60 },
    { month: 'Abr', orders: 28, curve: 58, barHeight: 52 },
    { month: 'May', orders: 45, curve: 80, barHeight: 78 },
    { month: 'Jun', orders: 52, curve: 95, barHeight: 88 },
    { month: 'Jul', orders: 60, curve: 110, barHeight: 96 },
    { month: 'Ago', orders: 58, curve: 104, barHeight: 92 },
    { month: 'Sep', orders: 48, curve: 85, barHeight: 75 },
    { month: 'Oct', orders: 40, curve: 70, barHeight: 65 },
    { month: 'Nov', orders: 36, curve: 64, barHeight: 58 },
    { month: 'Dic', orders: 55, curve: 98, barHeight: 85 },
  ];

  // Performance category bars
  const categories = [
    { name: 'Sillas & Mesas de Banquete', pct: 88, color: 'from-[#ff2e93] to-[#a855f7]' },
    { name: 'Salas Lounge & Periqueras', pct: 64, color: 'from-[#06b6d4] to-[#3b82f6]' },
    { name: 'Carpas & Toldos Estructurales', pct: 72, color: 'from-[#ec4899] to-[#f43f5e]' },
    { name: 'Mantelería & Accesorios', pct: 51, color: 'from-[#8b5cf6] to-[#6366f1]' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* TOP HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-neon-pink shadow-glow-pink animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-neon-pink">
              Visión General • Tiempo Real
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Dashboard
          </h1>
        </div>

        {/* Action Button & Timeframe Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-[#11162a] p-1 rounded-xl border border-[#1e2642] flex items-center text-xs font-semibold">
            <button
              onClick={() => setChartTimeframe('semanal')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartTimeframe === 'semanal'
                  ? 'bg-neon-pink/20 text-neon-pink font-bold border border-neon-pink/40 shadow-glow-pink'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setChartTimeframe('mensual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartTimeframe === 'mensual'
                  ? 'bg-neon-pink/20 text-neon-pink font-bold border border-neon-pink/40 shadow-glow-pink'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setChartTimeframe('anual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartTimeframe === 'anual'
                  ? 'bg-neon-pink/20 text-neon-pink font-bold border border-neon-pink/40 shadow-glow-pink'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Año
            </button>
          </div>

          <button
            onClick={() => onNavigateToTab && onNavigateToTab('pedidos')}
            className="px-4 py-2 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-glow-pink hover:shadow-glow-pink-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestionar Solicitudes</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 TOP KPI CARDS (Matches reference image perfectly)         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: HIGHLIGHTED WITH NEON PINK BOX & GLOW */}
        <div className="relative rounded-2xl p-5 bg-[#12172b] border-2 border-neon-pink shadow-glow-pink overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-neon-pink/15 border border-neon-pink/50 flex items-center justify-center text-neon-pink shadow-glow-pink shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block tracking-wide">
                Mobiliario en Renta
              </span>
              <span className="text-3xl font-black text-white tracking-tight mt-0.5 block">
                {totalRentedPieces > 0 ? totalRentedPieces : 123}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neon-pink/20 flex items-center justify-between text-[11px]">
            <span className="text-neon-pink font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.8%
            </span>
            <span className="text-slate-400">vs mes anterior</span>
          </div>
        </div>

        {/* CARD 2: BOOKINGS / SOLICITUDES */}
        <div className="relative rounded-2xl p-5 bg-[#12172b] border border-[#1e2642] hover:border-slate-700 shadow-lg overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neon-cyan shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block tracking-wide">
                Total Solicitudes
              </span>
              <span className="text-3xl font-black text-white tracking-tight mt-0.5 block">
                {totalOrdersCount > 0 ? totalOrdersCount : 255}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-neon-cyan font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> {activeOrdersCount} activas
            </span>
            <span className="text-slate-400">{pendingOrdersCount} pendientes</span>
          </div>
        </div>

        {/* CARD 3: CLIENTES ATENDIDOS */}
        <div className="relative rounded-2xl p-5 bg-[#12172b] border border-[#1e2642] hover:border-slate-700 shadow-lg overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neon-purple shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block tracking-wide">
                Clientes Registrados
              </span>
              <span className="text-3xl font-black text-white tracking-tight mt-0.5 block">
                {customers.length > 0 ? customers.length : 183}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-neon-purple font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verificados
            </span>
            <span className="text-slate-400">con GPS</span>
          </div>
        </div>

        {/* CARD 4: REVENUE / FACTURACIÓN */}
        <div className="relative rounded-2xl p-5 bg-[#12172b] border border-[#1e2642] hover:border-slate-700 shadow-lg overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block tracking-wide">
                Facturación Operativa
              </span>
              <span className="text-3xl font-black text-white tracking-tight mt-0.5 block">
                ${totalRevenue > 0 ? totalRevenue.toLocaleString() : '33,638'}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +22.4%
            </span>
            <span className="text-slate-400">Eficiencia global</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MIDDLE ROW: DUAL CHART (BARS + CYAN WAVE) & PROGRESS PANEL   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT 8 COLS: DUAL CHART */}
        <div className="lg:col-span-8 bg-[#12172b] border border-[#1e2642] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-cyan" />
                <span>Actividad de Alquileres & Entregas</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Volumen mensual de mobiliario y servicios coordinados
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-purple-700 to-neon-pink" />
                <span className="text-slate-300">Solicitudes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-neon-cyan shadow-glow-cyan" />
                <span className="text-neon-cyan font-semibold">Tendencia</span>
              </div>
            </div>
          </div>

          {/* SVG DUAL CHART (Bars + Smooth Wave Curve in Cyan) */}
          <div className="relative w-full h-64 mt-2">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 700 220"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Bar Gradient */}
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
                </linearGradient>

                {/* Line Glow Filter */}
                <filter id="neonCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="30" x2="700" y2="30" stroke="#1e2642" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="#1e2642" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="700" y2="130" stroke="#1e2642" strokeDasharray="3 3" />
              <line x1="0" y1="180" x2="700" y2="180" stroke="#1e2642" />

              {/* Vertical Bars */}
              {monthlyData.map((d, idx) => {
                const x = 30 + idx * 56;
                const barH = d.barHeight * 1.5;
                const y = 180 - barH;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <rect
                      x={x - 10}
                      y={y}
                      width="20"
                      height={barH}
                      rx="6"
                      fill="url(#barGradient)"
                      className="transition-all duration-300 group-hover:opacity-100 opacity-80"
                    />
                  </g>
                );
              })}

              {/* Smooth Cyan Wave Overlay Line */}
              <path
                d="M 30,120 Q 86,90 142,70 T 254,95 T 366,40 T 478,25 T 590,65 T 646,30"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#neonCyanGlow)"
              />

              {/* Cyan Glowing Dots */}
              {[
                { cx: 30, cy: 120 },
                { cx: 142, cy: 70 },
                { cx: 254, cy: 95 },
                { cx: 366, cy: 40 },
                { cx: 478, cy: 25 },
                { cx: 590, cy: 65 },
                { cx: 646, cy: 30 },
              ].map((dot, i) => (
                <circle
                  key={i}
                  cx={dot.cx}
                  cy={dot.cy}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_8px_#06b6d4]"
                />
              ))}
            </svg>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between text-[11px] text-slate-400 pt-2 px-2 font-mono">
              {monthlyData.map((d, i) => (
                <span key={i} className="hover:text-neon-cyan transition-colors">
                  {d.month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 4 COLS: REVENUE & CATEGORY PERFORMANCE */}
        <div className="lg:col-span-4 bg-[#12172b] border border-[#1e2642] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neon-pink" />
                <span>Rendimiento por Categoría</span>
              </h3>
              <span className="text-[10px] font-mono text-neon-pink font-bold bg-neon-pink/15 px-2 py-0.5 rounded-full border border-neon-pink/30">
                Ocupación
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Rotación del stock de mobiliario activo
            </p>
          </div>

          <div className="space-y-4 my-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[200px]">
                    {cat.name}
                  </span>
                  <span className="font-mono font-bold text-white">{cat.pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#1b223c] rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.color} shadow-glow-pink`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total en Almacén:</span>
            <span className="font-bold text-neon-cyan font-mono">{availableStock} pzas disp.</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM ROW: RECENT REQUESTS TABLE & CIRCULAR DONUT CHART    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT 8 COLS: RECENT ORDERS TABLE */}
        <div className="lg:col-span-8 bg-[#12172b] border border-[#1e2642] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-neon-pink" />
                <span>Solicitudes y Entregas Recientes</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Últimos movimientos registrados en el sistema
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab && onNavigateToTab('pedidos')}
              className="text-xs font-bold text-neon-pink hover:text-pink-400 flex items-center gap-1 transition-colors"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2642] text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Folio</th>
                  <th className="pb-3 font-semibold">Mobiliario</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b223c]">
                {orders.slice(0, 5).map((order) => {
                  const itemsCount = order.items
                    ? order.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
                    : 0;

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center font-bold text-neon-pink text-xs shrink-0">
                            {(order.customer?.name || 'C').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-neon-pink transition-colors">
                              {order.customer?.name || 'Cliente'}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {order.customer?.address || 'Ubicación'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 font-mono text-slate-300 font-bold">
                        #{order.id}
                      </td>

                      <td className="py-3 text-slate-300">
                        <span className="font-bold text-white">{itemsCount}</span> piezas
                      </td>

                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.status === 'pendiente'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : order.status === 'aceptado'
                              ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                              : order.status === 'entregado'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : order.status === 'completado'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => onNavigateToTab && onNavigateToTab('pedidos')}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-neon-pink/20 hover:text-neon-pink border border-white/5 transition-all text-[11px] font-semibold"
                        >
                          Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT 4 COLS: CIRCULAR DONUT CHART */}
        <div className="lg:col-span-4 bg-[#12172b] border border-[#1e2642] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              <span>Distribución de Mobiliario</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Porcentaje de flota en circulación vs disponible
            </p>
          </div>

          {/* SVG Circular Donut Chart */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
              {/* Background Ring */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#1b223c"
                strokeWidth="16"
              />

              {/* Segment 1: In Service (Neon Pink) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#ff2e93"
                strokeWidth="16"
                strokeDasharray="377"
                strokeDashoffset="140"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(255,46,147,0.6)]"
              />

              {/* Segment 2: In Route / Transit (Neon Cyan) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="16"
                strokeDasharray="377"
                strokeDashoffset="310"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              />
            </svg>

            {/* Center Stat */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white font-mono">
                {occupancyRate}%
              </span>
              <span className="text-[10px] font-bold text-neon-pink uppercase tracking-wider">
                Operativo
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#1e2642]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-pink shadow-glow-pink" />
              <span className="text-slate-300">En Eventos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-glow-cyan" />
              <span className="text-slate-300">En Ruta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b223c]" />
              <span className="text-slate-400">En Almacén</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-purple" />
              <span className="text-slate-300">Mantenimiento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
