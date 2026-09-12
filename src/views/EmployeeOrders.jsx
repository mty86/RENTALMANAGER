import React, { useState } from 'react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import RouteMap from '../components/RouteMap';
import PickupModal from '../components/PickupModal';
import RejectOrderModal from '../components/RejectOrderModal';
import {
  Check,
  X,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Truck,
  Package,
  Navigation,
  FileCheck2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Volume2,
  RotateCcw
} from 'lucide-react';

export default function EmployeeOrders({
  orders,
  baseLocation,
  onAcceptOrder,
  onDeliverOrder,
  onCancelOrder,
  onVerifyPickup,
  onSimulate24h,
  focusedOrderId,
  externalFilter,
}) {
  const [filterStatus, setFilterStatus] = useState(externalFilter || 'activos'); // 'activos' | 'pendientes' | 'todos' | 'vencidos'
  const [selectedRouteOrder, setSelectedRouteOrder] = useState(null);
  const [selectedPickupOrder, setSelectedPickupOrder] = useState(null);
  const [orderToReject, setOrderToReject] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Sync external filter changes (e.g. from notification clicks)
  React.useEffect(() => {
    if (externalFilter) {
      setFilterStatus(externalFilter);
    }
  }, [externalFilter]);

  // Scroll to focused order
  React.useEffect(() => {
    if (focusedOrderId) {
      setTimeout(() => {
        const el = document.getElementById(`employee-order-${focusedOrderId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [focusedOrderId]);

  const now = Date.now();
  const getHoursSinceDelivery = (order) => {
    if (order.hoursSinceDelivery != null) return order.hoursSinceDelivery;
    const deliveredTime = order.deliveredAt
      ? new Date(order.deliveredAt).getTime()
      : order.createdAt
      ? new Date(order.createdAt).getTime()
      : null;
    if (!deliveredTime) return 0;
    return Math.max(0, Math.floor((now - deliveredTime) / (1000 * 60 * 60)));
  };

  const isOrderOverdue = (order) => {
    if (order.isOverduePickup) return true;
    if (order.status !== 'entregado' && order.status !== 'con_incidencias') return false;
    return getHoursSinceDelivery(order) >= 24;
  };

  const overdueOrders = orders.filter(isOrderOverdue);

  // Active orders (not completed and not cancelled)
  const activeOrders = orders.filter((o) => !['completado', 'cancelado'].includes(o.status));
  const pendingOrders = orders.filter((o) => o.status === 'pendiente');

  const displayedOrders =
    filterStatus === 'vencidos'
      ? overdueOrders
      : filterStatus === 'pendientes'
      ? pendingOrders
      : filterStatus === 'activos'
      ? activeOrders
      : orders;

  const playOverdueVoiceAlert = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const count = overdueOrders.length;
    const text = `Alerta de logística en Rental Manager. Atención: Tienes ${count} ${
      count === 1
        ? 'pedido con mobiliario entregado hace más de 24 horas que no ha sido recogido'
        : 'pedidos con mobiliario entregado hace más de 24 horas que no han sido recogidos'
    }. Por favor, inicie la ruta de recolección de mobiliario y contacte al cliente.`;
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'es-MX';
    msg.rate = 0.95;
    window.speechSynthesis.speak(msg);
  };

  const handleAccept = async (order) => {
    setActionLoading(order.id);
    try {
      const updatedOrder = await onAcceptOrder(order.id, 'Personal de Logística');
      // Per user request: "AL ACEPTAR EL PEDIDO DE LE DEBE DE MOSTRAR UN MAPA DE COMO PUEDE LLEGAR A ESA DIRECCION DEL CLIENTE CON VOZ"
      setSelectedRouteOrder(updatedOrder || order);
    } catch (err) {
      alert(err.message || 'Error al aceptar el pedido');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (orderId) => {
    setActionLoading(orderId);
    try {
      await onDeliverOrder(orderId, 'Repartidor');
    } catch (err) {
      alert(err.message || 'Error al marcar como entregado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (order) => {
    setOrderToReject(order);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2642] pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Bandeja de Pedidos y Logística</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acepta solicitudes, visualiza rutas viales de entrega y audita la recogida de mobiliario.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#12172b] p-1 rounded-2xl border border-[#1e2642] self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('activos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'activos'
                ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50 shadow-glow-pink font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            En Proceso ({activeOrders.length})
          </button>

          <button
            onClick={() => setFilterStatus('pendientes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
              filterStatus === 'pendientes'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nuevas Solicitudes ({pendingOrders.length})
          </button>

          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'todos'
                ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50 shadow-glow-pink font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({orders.length})
          </button>

          {overdueOrders.length > 0 && (
            <button
              onClick={() => setFilterStatus('vencidos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                filterStatus === 'vencidos'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Vencidos (+24h)</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-700 text-white font-black">
                {overdueOrders.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 24-Hour Overdue Pickups Critical Alert Banner */}
      {overdueOrders.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-rose-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-700/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 bg-black/30 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Alerta Crítica: Mobiliario Pendiente de Recogida
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  ¡{overdueOrders.length} Pedido(s) llevan más de 24 horas entregados sin recoger!
                </h3>
              </div>
            </div>

            <button
              onClick={playOverdueVoiceAlert}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto border border-white/20"
              title="Escuchar notificación de voz en español"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Escuchar Alerta de Voz</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueOrders.map((o) => {
              const hours = getHoursSinceDelivery(o);
              const cleanPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
              const waMsg = `Hola ${o.customer?.name}, le contactamos de Rental Manager respecto a su pedido #${o.id}. Han transcurrido más de 24 horas desde la entrega de su mobiliario en ${o.customer?.address} y está pendiente la recolección. ¿A qué hora podemos pasar a recoger el equipo?`;

              return (
                <div
                  key={o.id}
                  className="bg-black/25 backdrop-blur-sm border border-rose-600/60 rounded-2xl p-4 text-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-amber-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700">
                        {o.id}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-1">{o.customer?.name}</h4>
                      <p className="text-rose-200 text-[11px] line-clamp-1">{o.customer?.address}</p>
                    </div>

                    <span className="px-2 py-1 bg-rose-600 text-white font-extrabold text-[10px] rounded-lg shrink-0">
                      +{hours}h sin recoger
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-700/50">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Avisar Recogida (WhatsApp)</span>
                    </a>

                    <a
                      href={`tel:${o.customer?.phone}`}
                      className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Llamar</span>
                    </a>

                    <button
                      onClick={() => setSelectedPickupOrder(o)}
                      className="px-3 py-1.5 bg-white text-rose-950 hover:bg-rose-50 rounded-xl font-black text-[11px] shadow-sm ml-auto"
                    >
                      Recoger Mobiliario
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orders Grid / Cards */}
      {displayedOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#12172b] rounded-3xl border border-[#1e2642]">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-base font-bold text-slate-200">No hay pedidos en esta categoría</p>
          <p className="text-xs text-slate-400 mt-1">Los nuevos pedidos de clientes aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayedOrders.map((order) => {
            const isPending = order.status === 'pendiente';
            const isAccepted = order.status === 'aceptado' || order.status === 'en_camino';
            const isDelivered = order.status === 'entregado';
            const hasIncidents = order.status === 'con_incidencias';
            const isCompleted = order.status === 'completado';
            const isCancelled = order.status === 'cancelado';
            const hoursSinceDelivery = getHoursSinceDelivery(order);
            const isOverdue = (isDelivered || hasIncidents) && isOrderOverdue(order);

            const isFocused = focusedOrderId && order.id === focusedOrderId;

            return (
              <div
                key={order.id}
                id={`employee-order-${order.id}`}
                className={`bg-[#12172b] rounded-3xl border transition-all duration-300 p-5 flex flex-col justify-between text-slate-100 shadow-xl ${
                  isFocused
                    ? 'border-amber-500 shadow-xl ring-4 ring-amber-400/50 bg-amber-950/25 border-amber-500/60 ring-2 ring-amber-400/30'
                    : isOverdue
                    ? 'border-rose-500 shadow-lg ring-2 ring-rose-500/20 bg-rose-950/25 border-rose-500/60 ring-2 ring-rose-500/30'
                    : hasIncidents
                    ? 'border-rose-300 bg-rose-50/20'
                    : isPending
                    ? 'border-amber-300 shadow-sm ring-2 ring-amber-400/20'
                    : 'border-[#1e2642] shadow-lg'
                }`}
              >
                {/* Order Top Bar */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-300 bg-[#1a223e] px-2 py-0.5 rounded-md border border-[#242e50] text-neon-pink">
                          {order.id}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">
                        {order.customer?.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <a
                          href={`tel:${order.customer?.phone}`}
                          className="flex items-center gap-1 text-neon-cyan hover:underline font-semibold"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.customer?.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${order.customer?.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-700 font-semibold hover:underline"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <OrderStatusBadge status={order.status} />
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold shadow-sm animate-pulse">
                          +{hoursSinceDelivery}h sin recoger
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Overdue Pickup High Priority Banner inside Card */}
                  {isOverdue && (
                    <div className="p-3 bg-rose-100/90 border border-rose-300 rounded-2xl text-xs text-rose-950 space-y-2">
                      <div className="flex items-center justify-between font-extrabold text-rose-900">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>¡Alerta! Mobiliario sin recoger (+24 horas)</span>
                        </span>
                        <span className="font-mono text-[10px] bg-rose-200 px-2 py-0.5 rounded-md text-rose-900 font-black">
                          {hoursSinceDelivery}h de retraso
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800">
                        Entregado el {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'hace más de 24h'}. Notifique al cliente o coordine la recolección urgente.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <a
                          href={`https://wa.me/${(order.customer?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hola ${order.customer?.name}, le contactamos de Rental Manager respecto a su pedido #${order.id}. Han transcurrido más de 24 horas desde la entrega de su mobiliario en ${order.customer?.address} y está programada la recolección. ¿A qué hora podemos pasar a recoger el equipo?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Avisar Recogida por WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${order.customer?.phone}`}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[11px] flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Llamar</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Delivered Timer & Simulation Control (When not yet overdue) */}
                  {isDelivered && !isOverdue && (
                    <div className="p-2.5 bg-[#161f36] border border-blue-500/40 rounded-2xl text-xs text-blue-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Entregado hace {hoursSinceDelivery}h (Límite: 24h)</span>
                      </div>
                      {onSimulate24h && (
                        <button
                          type="button"
                          onClick={() => onSimulate24h(order.id)}
                          className="px-2 py-0.5 bg-blue-950/80 border border-blue-400/60 text-blue-200 hover:bg-blue-900 rounded-lg text-[10px] font-bold transition-colors"
                          title="Simular que han pasado 26 horas para probar la alerta"
                        >
                          Simular &gt;24h
                        </button>
                      )}
                    </div>
                  )}

                  {/* Customer Address Card */}
                  <div className="bg-[#182038] border border-[#242e50] rounded-2xl p-3 text-xs space-y-1 text-slate-200">
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="font-medium line-clamp-2">{order.customer?.address}</span>
                    </div>
                    {order.customer?.reference && (
                      <p className="text-[11px] text-slate-500 pl-6">
                        <strong>Ref:</strong> {order.customer?.reference}
                      </p>
                    )}
                  </div>

                  {/* Furniture Items List */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Mobiliario Requerido
                    </span>
                    <div className="bg-[#182038]/60 border border-[#242e50] rounded-xl p-2.5 divide-y divide-[#242e50] text-xs">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="py-1 flex items-center justify-between">
                          <span className="text-slate-200">
                            <span className="font-bold text-neon-cyan">{item.quantity}x</span>{' '}
                            {item.productName}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">{item.quantity} uds.</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dates & Notes */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-[#182038] border border-[#242e50] p-2.5 rounded-xl">
                    <div>
                      <span className="block font-semibold text-slate-300">Fecha Evento:</span>
                      <span>{new Date(order.eventDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-300">Fecha Recogida:</span>
                      <span>{new Date(order.returnDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="text-xs text-amber-800 bg-amber-50/60 border border-amber-200 p-2 rounded-xl">
                      <strong>Nota del cliente:</strong> {order.notes}
                    </div>
                  )}

                  {/* Incident Alert if status is con_incidencias */}
                  {hasIncidents && order.pickupReport && (
                    <div className="text-xs bg-rose-50 border border-rose-300 rounded-xl p-2.5 text-rose-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-900">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Faltantes en la recogida anterior ({order.pickupReport.totalMissing} artículos)</span>
                      </div>
                      <p className="text-[11px] text-rose-700">
                        {order.pickupReport.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons according to Order Lifecycle */}
                <div className="mt-5 pt-4 border-t border-[#1e2642] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Mobiliario Solicitado</span>
                      <span className="text-sm font-black text-white">
                        {order.items?.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)} piezas
                      </span>
                    </div>

                    {/* Quick Route button available for any non-cancelled order */}
                    {!isCancelled && (
                      <button
                        onClick={() => setSelectedRouteOrder(order)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-teal-600" />
                        <span>Ver Mapa de Ruta</span>
                      </button>
                    )}
                  </div>

                  {/* Primary Stage Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Stage 1: Pendiente -> Aceptar (Opens route map automatically) */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleAccept(order)}
                          disabled={actionLoading === order.id}
                          className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>Aceptar Pedido (Ver Ruta)</span>
                        </button>

                        <button
                          onClick={() => handleRejectClick(order)}
                          disabled={actionLoading === order.id}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-400 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>
                      </>
                    )}

                    {/* Stage 2: Aceptado -> Marcar como Entregado */}
                    {isAccepted && (
                      <button
                        onClick={() => handleDeliver(order.id)}
                        disabled={actionLoading === order.id}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Marcar Mobiliario como Entregado</span>
                      </button>
                    )}

                    {/* Stage 3: Entregado / Con Incidencias -> RECOGER MOBILIARIO */}
                    {(isDelivered || hasIncidents) && (
                      <button
                        onClick={() => setSelectedPickupOrder(order)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>Recoger Mobiliario (Verificar Conteo)</span>
                      </button>
                    )}

                    {/* Stage 4: Completado */}
                    {isCompleted && (
                      <div className="w-full text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                        Pedido completado y registrado en historial
                      </div>
                    )}

                    {/* Stage 5: Cancelado / Rechazado -> Quick WhatsApp & Call Access */}
                    {isCancelled && (
                      <div className="w-full space-y-2 pt-1">
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                          <div className="font-bold flex items-center gap-1 text-rose-900">
                            <X className="w-3.5 h-3.5" />
                            <span>Solicitud Rechazada</span>
                          </div>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            Motivo: <em>"{order.cancellationReason || 'Rechazado por logística'}"</em>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${(order.customer?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola ${order.customer?.name}, sobre su pedido #${order.id} en Rental Manager que no pudimos aceptar por el motivo: "${order.cancellationReason || 'Sin disponibilidad'}". ¿Podemos apoyarle con otra fecha o mobiliario alternativo?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp al Cliente</span>
                          </a>

                          <a
                            href={`tel:${order.customer?.phone}`}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <Phone className="w-3.5 h-3.5 text-teal-400" />
                            <span>Llamar</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Route Map to Customer Address (Requirement) */}
      {selectedRouteOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#1e2642] flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">
                  Ruta de Llegada al Cliente • {selectedRouteOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRouteOrder(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <RouteMap
                baseLocation={baseLocation}
                customerLocation={selectedRouteOrder.customer?.location}
                customerAddress={selectedRouteOrder.customer?.address}
                customerName={selectedRouteOrder.customer?.name}
                customerPhone={selectedRouteOrder.customer?.phone}
              />

              <div className="bg-[#182038] border border-[#242e50] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">Contacto para entrega:</span>
                  <span className="text-slate-400">{selectedRouteOrder.customer?.name} ({selectedRouteOrder.customer?.phone})</span>
                  {selectedRouteOrder.customer?.reference && (
                    <span className="text-slate-500 block text-[11px]">Ref: {selectedRouteOrder.customer?.reference}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${(selectedRouteOrder.customer?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hola ${selectedRouteOrder.customer?.name}, su pedido #${selectedRouteOrder.id} ha sido aceptado por el equipo de Rental Manager y estamos en camino para la entrega.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${selectedRouteOrder.customer?.phone}`}
                    className="px-3 py-2 bg-white border border-[#1e2642] hover:border-slate-300 text-slate-300 rounded-xl font-semibold flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>Llamar al Cliente</span>
                  </a>
                  <button
                    onClick={() => setSelectedRouteOrder(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Strict Pickup Verification */}
      {selectedPickupOrder && (
        <PickupModal
          isOpen={Boolean(selectedPickupOrder)}
          order={selectedPickupOrder}
          onClose={() => setSelectedPickupOrder(null)}
          onVerificationSuccess={async (orderId, payload) => {
            await onVerifyPickup(orderId, payload);
          }}
        />
      )}

      {/* MODAL: Reject Order with Direct WhatsApp and Call Action */}
      {orderToReject && (
        <RejectOrderModal
          isOpen={Boolean(orderToReject)}
          order={orderToReject}
          onClose={() => setOrderToReject(null)}
          onConfirmReject={async (orderId, reason, notifiedViaWhatsApp) => {
            setActionLoading(orderId);
            try {
              await onCancelOrder(orderId, reason, notifiedViaWhatsApp);
            } finally {
              setActionLoading(null);
            }
          }}
        />
      )}
    </div>
  );
}
