import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import MapSelector from '../components/MapSelector';
import OrderStatusBadge from '../components/OrderStatusBadge';
import {
  ShoppingBag,
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Search,
  Truck,
  PackageCheck,
  MessageCircle,
  Check,
  HelpCircle,
  XCircle,
  Info,
  ChevronRight
} from 'lucide-react';

export default function ClientView({
  products,
  orders,
  customers = [],
  onCreateOrder,
  isSubmitting,
  externalTab,
  onTabChange,
  focusedOrderId,
}) {
  const [activeTab, setActiveTab] = useState(externalTab || 'catalogo'); // 'catalogo' | 'mis_pedidos'
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync external tab changes
  React.useEffect(() => {
    if (externalTab) {
      setActiveTab(externalTab);
    }
  }, [externalTab]);

  const handleTabSelect = (tabName) => {
    setActiveTab(tabName);
    if (onTabChange) onTabChange(tabName);
  };

  const [orderFilter, setOrderFilter] = useState('todas'); // 'todas' | 'activas' | 'entregadas' | 'completadas'

  // Human-friendly status explanation and stepper index for clients
  const getOrderStageInfo = (status) => {
    switch (status) {
      case 'pendiente':
        return {
          stepIndex: 1,
          badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
          title: 'Paso 1: Solicitud Recibida (En Revisión)',
          description: 'Hemos recibido tu solicitud de mobiliario. El equipo de Rental Manager está revisando la disponibilidad y te confirmará en breve.',
          bgColor: 'bg-amber-950/30 border-amber-500/30',
          textColor: 'text-amber-300',
          icon: <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
        };
      case 'aceptado':
      case 'en_camino':
        return {
          stepIndex: 2,
          badgeColor: 'bg-sky-950/40 text-sky-300 border-sky-500/40',
          title: 'Paso 2: ¡Solicitud Confirmada y en Camino!',
          description: '¡Tu pedido fue aceptado! El mobiliario está en preparación o el chofer ya se encuentra en camino hacia tu domicilio.',
          bgColor: 'bg-sky-950/30 border-sky-500/30',
          textColor: 'text-sky-300',
          icon: <Truck className="w-5 h-5 text-sky-400 animate-bounce" />
        };
      case 'entregado':
      case 'con_incidencias':
        return {
          stepIndex: 3,
          badgeColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
          title: 'Paso 3: Mobiliario Entregado en tu Domicilio',
          description: 'El mobiliario ya fue entregado y se encuentra en tu domicilio listo para tu evento. Será recogido por nuestro personal al finalizar el servicio.',
          bgColor: 'bg-emerald-950/30 border-emerald-500/30',
          textColor: 'text-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        };
      case 'completado':
        return {
          stepIndex: 4,
          badgeColor: 'bg-purple-950/40 text-purple-300 border-purple-500/40',
          title: 'Paso 4: Mobiliario Recogido y Pedido Finalizado',
          description: 'El personal de Rental Manager recogió y revisó todo el mobiliario. El servicio concluyó con éxito. ¡Gracias por tu preferencia!',
          bgColor: 'bg-purple-950/30 border-purple-500/30',
          textColor: 'text-purple-300',
          icon: <PackageCheck className="w-5 h-5 text-purple-400" />
        };
      case 'cancelado':
        return {
          stepIndex: 0,
          badgeColor: 'bg-rose-950/40 text-rose-300 border-rose-500/40',
          title: 'Solicitud Cancelada o Sin Disponibilidad',
          description: 'Lamentablemente no pudimos procesar este pedido en la fecha solicitada. Puedes contactarnos para apoyarte con opciones alternativas.',
          bgColor: 'bg-rose-950/30 border-rose-500/30',
          textColor: 'text-rose-300',
          icon: <XCircle className="w-5 h-5 text-rose-400" />
        };
      default:
        return {
          stepIndex: 1,
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          title: 'Estado del Pedido',
          description: 'Procesando tu solicitud de mobiliario.',
          bgColor: 'bg-slate-50 border-slate-200',
          textColor: 'text-white',
          icon: <Info className="w-5 h-5 text-slate-600" />
        };
    }
  };

  // Scroll to focused order
  React.useEffect(() => {
    if (focusedOrderId && activeTab === 'mis_pedidos') {
      setTimeout(() => {
        const el = document.getElementById(`client-order-${focusedOrderId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [focusedOrderId, activeTab]);

  // Cart state: { productId: quantity }
  const [cart, setCart] = useState({});

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const SAVED_CUSTOMER_KEY = 'rental_manager_client_profile';

  // Form customer fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [customerLocation, setCustomerLocation] = useState({ lat: 19.3598, lng: -99.1834 });
  const [isEditingCustomerData, setIsEditingCustomerData] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Load saved client profile from localStorage or pre-fill from customers prop
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_CUSTOMER_KEY) || localStorage.getItem('eventrent_client_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) setCustomerPhone(parsed.phone);
        if (parsed.address) setCustomerAddress(parsed.address);
        if (parsed.reference) setCustomerReference(parsed.reference);
        if (parsed.location) setCustomerLocation(parsed.location);
        return;
      }
    } catch (e) {}

    // Fallback: if employee already registered customers, prefill with the first one
    if (customers && customers.length > 0 && !customerName) {
      const first = customers[0];
      setCustomerName(first.name);
      setCustomerPhone(first.phone);
      setCustomerAddress(first.address);
      setCustomerReference(first.reference || '');
      if (first.location) setCustomerLocation(first.location);
    }
  }, [customers]);

  // Categories list
  const categories = ['Todas', ...new Set(products.map((p) => p.category))];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuantityChange = (productId, qty) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (qty <= 0) {
        delete copy[productId];
      } else {
        copy[productId] = qty;
      }
      return copy;
    });
  };

  // Cart calculations (Prices removed)
  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find((p) => p.id === productId);
    return {
      productId,
      productName: product?.name || 'Producto',
      priceUnit: 0,
      quantity,
      subtotal: 0,
    };
  });

  const totalItemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // Handle map change from MapSelector
  const handleLocationChange = ({ location, address }) => {
    setCustomerLocation(location);
    if (!customerAddress || customerAddress.trim() === '') {
      setCustomerAddress(address);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 7) {
      setFormError('Por favor ingresa un número de teléfono válido.');
      return;
    }
    if (!customerAddress.trim()) {
      setFormError('Por favor especifica la dirección de entrega.');
      return;
    }
    if (!customerLocation || !customerLocation.lat) {
      setFormError('Por favor selecciona tu ubicación en el mapa interactivo.');
      return;
    }
    if (cartItems.length === 0) {
      setFormError('Tu solicitud de mobiliario está vacía.');
      return;
    }

    // Persist customer data in localStorage so they never have to re-enter
    try {
      localStorage.setItem(
        SAVED_CUSTOMER_KEY,
        JSON.stringify({
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          reference: customerReference,
          location: customerLocation,
        })
      );
    } catch (e) {}

    try {
      const orderPayload = {
        customer: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          reference: customerReference,
          location: customerLocation,
        },
        items: cartItems,
        totalAmount: 0,
        eventDate: eventDate || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        returnDate: returnDate || new Date(Date.now() + 172800000).toISOString().slice(0, 16),
        notes: orderNotes,
      };

      const newOrder = await onCreateOrder(orderPayload);
      setSubmittedOrder(newOrder);
      setCart({});
      setIsCheckoutOpen(false);
      setActiveTab('mis_pedidos');
    } catch (err) {
      setFormError(err.message || 'Error al enviar la solicitud.');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#12172b] via-[#1a2340] to-[#12172b] border border-[#242e50] rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-pink/15 backdrop-blur-md text-neon-pink text-xs font-bold border border-neon-pink/30 shadow-glow-pink">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alquiler de Mobiliario para Eventos y Fiestas</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Renta Mesas, Sillas, Manteles y Más
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Selecciona el mobiliario que necesitas, marca tu domicilio en el mapa interactivo y nosotros te lo entregamos y recogemos en la puerta de tu evento.
          </p>
        </div>

        {/* Decorative Neon Blur */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Tabs: Catálogo / Mis Solicitudes */}
      <div className="flex items-center justify-between border-b border-[#1e2642] pb-3 gap-4">
        <div className="flex items-center gap-2 bg-[#12172b] p-1 rounded-2xl border border-[#1e2642]">
          <button
            onClick={() => handleTabSelect('catalogo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'catalogo'
                ? 'bg-neon-pink text-white shadow-glow-pink'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Catálogo Disponible
          </button>

          <button
            onClick={() => handleTabSelect('mis_pedidos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'mis_pedidos'
                ? 'bg-neon-pink text-white shadow-glow-pink'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Mis Solicitudes ({orders.length})
          </button>
        </div>

        {activeTab === 'catalogo' && (
          <div className="relative w-48 sm:w-64 hidden sm:block">
            <input
              type="text"
              placeholder="Buscar mobiliario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#12172b] border border-[#1e2642] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        )}
      </div>

      {/* Success Notification if order submitted */}
      {submittedOrder && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900">
                ¡Solicitud Registrada con Éxito! Código: {submittedOrder.id}
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Hemos recibido tu solicitud de alquiler para {submittedOrder.customer?.name}. El equipo de operaciones revisará el pedido y te contactará al {submittedOrder.customer?.phone}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmittedOrder(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg transition-colors"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW: CATALOG */}
      {activeTab === 'catalogo' && (
        <div className="space-y-6">
          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-neon-pink text-white shadow-glow-pink border border-neon-pink'
                    : 'bg-[#12172b] text-slate-400 border border-[#1e2642] hover:text-white hover:border-slate-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selectedQuantity={cart[product.id] || 0}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-[#12172b] rounded-3xl border border-[#1e2642]">
              <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No se encontraron productos en esta categoría</p>
              <p className="text-xs text-slate-400 mt-1">Intenta seleccionar otra categoría o cambiar tu búsqueda.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW: MY ORDERS (Redesigned with Visual Progress Tracker & Clear Explanations) */}
      {activeTab === 'mis_pedidos' && (
        <div className="space-y-6">
          {/* Explanatory Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-teal-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-400 bg-teal-900/60 border border-teal-700/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Seguimiento Paso a Paso
                </span>
                <span className="text-xs text-slate-300">Actualización en tiempo real</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Estado y Progreso de tus Solicitudes
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cada tarjeta te muestra con claridad en qué etapa se encuentra tu mobiliario: desde la revisión inicial, pasando por la entrega en tu domicilio, hasta la recogida al finalizar tu evento.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center sm:text-right border border-white/10 shrink-0">
              <span className="text-[11px] text-teal-200 block font-semibold">Tus Solicitudes</span>
              <span className="text-2xl font-black text-white">{orders.length}</span>
            </div>
          </div>

          {/* Filter Pills for the Client */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none touch-pan-x">
            <button
              onClick={() => setOrderFilter('todas')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                orderFilter === 'todas'
                  ? 'bg-neon-pink text-white shadow-glow-pink border border-neon-pink'
                  : 'bg-[#12172b] text-slate-400 border border-[#1e2642] hover:bg-[#182038] hover:text-white'
              }`}
            >
              Todas ({orders.length})
            </button>
            <button
              onClick={() => setOrderFilter('activas')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                orderFilter === 'activas'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-[#12172b] text-slate-400 border border-[#1e2642] hover:bg-[#182038] hover:text-white'
              }`}
            >
              En Revisión / Camino ({orders.filter((o) => ['pendiente', 'aceptado', 'en_camino'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setOrderFilter('entregadas')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                orderFilter === 'entregadas'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'bg-[#12172b] text-slate-400 border border-[#1e2642] hover:bg-[#182038] hover:text-white'
              }`}
            >
              En Mi Evento ({orders.filter((o) => ['entregado', 'con_incidencias'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setOrderFilter('completadas')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                orderFilter === 'completadas'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                  : 'bg-[#12172b] text-slate-400 border border-[#1e2642] hover:bg-[#182038] hover:text-white'
              }`}
            >
              Recogidas ({orders.filter((o) => o.status === 'completado').length})
            </button>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-[#12172b] rounded-3xl border border-[#1e2642]">
              <FileText className="w-12 h-12 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">Aún no tienes solicitudes registradas</p>
              <p className="text-xs text-slate-400 mt-1">
                Explora el catálogo y selecciona el mobiliario que necesitas para tu evento.
              </p>
              <button
                onClick={() => handleTabSelect('catalogo')}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white rounded-xl text-xs font-bold shadow-glow-pink"
              >
                Ver Catálogo de Mobiliario
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {orders
                .filter((o) => {
                  if (orderFilter === 'activas') return ['pendiente', 'aceptado', 'en_camino'].includes(o.status);
                  if (orderFilter === 'entregadas') return ['entregado', 'con_incidencias'].includes(o.status);
                  if (orderFilter === 'completadas') return o.status === 'completado';
                  return true;
                })
                .map((order) => {
                  const stageInfo = getOrderStageInfo(order.status);
                  const isFocused = focusedOrderId && order.id === focusedOrderId;
                  const itemsCount = order.items?.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0) || 0;

                  return (
                    <div
                      key={order.id}
                      id={`client-order-${order.id}`}
                      className={`bg-[#12172b] rounded-3xl border p-5 shadow-xl hover:border-neon-pink/40 transition-all space-y-4 ${
                        isFocused
                          ? 'border-neon-pink ring-4 ring-neon-pink/20 bg-[#161d36] shadow-glow-pink'
                          : 'border-[#1e2642]'
                      }`}
                    >
                      {/* 1. Header: Order ID, Date & Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#1e2642] pb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-neon-cyan bg-[#0b0e1b] px-2.5 py-1 rounded-lg border border-[#1e2642]">
                            {order.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Registrado: {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>

                      {/* 2. PROMINENT HUMAN-FRIENDLY STATUS CALLOUT */}
                      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${stageInfo.bgColor}`}>
                        <div className="p-2 rounded-xl bg-[#0b0e1b] shadow-inner border border-[#1e2642] shrink-0 mt-0.5">
                          {stageInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-black uppercase tracking-wide ${stageInfo.textColor}`}>
                            {stageInfo.title}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {order.status === 'cancelado' && order.cancellationReason
                              ? `Motivo: "${order.cancellationReason}". Puedes contactarnos para apoyarte con otra fecha u opción.`
                              : stageInfo.description}
                          </p>
                        </div>
                      </div>

                      {/* 3. VISUAL 4-STEP PROGRESS STEPPER */}
                      {order.status !== 'cancelado' && (
                        <div className="bg-[#0b0e1b] rounded-2xl p-4 border border-[#1e2642]">
                          <div className="flex items-center justify-between relative">
                            {/* Background progress connector bar */}
                            <div className="absolute left-6 right-6 top-3.5 -translate-y-1/2 h-1 bg-[#1e2642] -z-0">
                              <div
                                className="h-full bg-neon-pink shadow-glow-pink transition-all duration-500"
                                style={{
                                  width:
                                    stageInfo.stepIndex === 1
                                      ? '0%'
                                      : stageInfo.stepIndex === 2
                                      ? '33%'
                                      : stageInfo.stepIndex === 3
                                      ? '66%'
                                      : '100%',
                                }}
                              />
                            </div>

                            {/* Step icons & titles */}
                            {[
                              { step: 1, label: 'Enviada', desc: 'Recibida' },
                              { step: 2, label: 'Aceptada', desc: 'En camino' },
                              { step: 3, label: 'Entregada', desc: 'En evento' },
                              { step: 4, label: 'Recogida', desc: 'Finalizada' },
                            ].map((s) => {
                              const isPassed = stageInfo.stepIndex > s.step;
                              const isCurrent = stageInfo.stepIndex === s.step;

                              return (
                                <div key={s.step} className="flex flex-col items-center text-center relative z-10">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                                      isPassed
                                        ? 'bg-neon-pink text-white ring-2 ring-neon-pink shadow-glow-pink'
                                        : isCurrent
                                        ? 'bg-neon-cyan text-slate-950 ring-4 ring-neon-cyan/40 font-black scale-110 shadow-glow-cyan'
                                        : 'bg-[#182038] border-2 border-[#242e50] text-slate-500'
                                    }`}
                                  >
                                    {isPassed ? <Check className="w-3.5 h-3.5 text-white stroke-[3]" /> : s.step}
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold mt-1 whitespace-nowrap ${
                                      isCurrent ? 'text-neon-cyan font-black' : isPassed ? 'text-neon-pink font-bold' : 'text-slate-500'
                                    }`}
                                  >
                                    {s.label}
                                  </span>
                                  <span className="text-[9px] text-slate-400 hidden sm:block">
                                    {s.desc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 4. Furniture Summary */}
                      <div className="space-y-2 border-t border-[#1e2642] pt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Mobiliario Solicitado
                          </span>
                          <span className="text-neon-cyan font-bold bg-[#0b0e1b] border border-[#1e2642] px-2.5 py-0.5 rounded-full text-[10px]">
                            {itemsCount} piezas en total
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {order.items?.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#182038] border border-[#242e50] text-slate-200 text-xs font-medium"
                            >
                              <strong className="text-neon-pink font-bold">{item.quantity}x</strong>
                              <span>{item.productName}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 5. Address & Event Details */}
                      <div className="bg-[#0b0e1b] rounded-2xl p-3 text-xs text-slate-300 space-y-1.5 border border-[#1e2642]">
                        <div className="flex items-start gap-1.5 font-medium text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-neon-cyan shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.customer?.address}</span>
                        </div>
                        {order.customer?.reference && (
                          <p className="text-[11px] text-slate-400 pl-5">
                            <strong className="text-slate-300">Referencia:</strong> {order.customer?.reference}
                          </p>
                        )}
                      </div>

                      {/* 6. Customer Support Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#1e2642]">
                        <a
                          href={`https://wa.me/525598765432?text=${encodeURIComponent(
                            `Hola Rental Manager, tengo una consulta sobre el estado de mi solicitud #${order.id} a nombre de ${order.customer?.name}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Consultar por WhatsApp</span>
                        </a>

                        <a
                          href="tel:5598765432"
                          className="px-3.5 py-2 bg-[#182038] hover:bg-[#222c4d] border border-[#2e3a60] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                          title="Llamar a atención al cliente"
                        >
                          <Phone className="w-3.5 h-3.5 text-neon-cyan" />
                          <span>Llamar</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Cart Bar (When items are in cart) */}
      {totalItemCount > 0 && activeTab === 'catalogo' && (
        <div className="fixed bottom-20 md:bottom-4 left-3 right-3 sm:left-4 sm:right-4 max-w-2xl mx-auto z-40 bg-[#0b0e1b]/95 text-white rounded-3xl p-3 sm:p-4 shadow-glow-pink border border-neon-pink/50 backdrop-blur-md flex items-center justify-between gap-3 sm:gap-4 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neon-pink text-white flex items-center justify-center font-black text-sm shadow-glow-pink">
              {totalItemCount}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Mobiliario seleccionado</div>
              <div className="text-sm font-extrabold text-white">
                <span className="text-teal-400">{totalItemCount} piezas</span> listas para solicitar
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-glow-pink hover:shadow-glow-pink-lg transition-all"
          >
            <span>Continuar Solicitud</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CHECKOUT MODAL: Customer info + Map location */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#12172b] rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#242e50] max-h-[92vh] flex flex-col text-white">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0b0e1b] text-white flex items-center justify-between border-b border-[#1e2642] shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-neon-pink" />
                <h3 className="text-base font-bold text-white">
                  Confirmar Solicitud de Alquiler de Mobiliario
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#182038] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-[#242e50]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form & Map Body */}
            <form onSubmit={handleCheckoutSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* Items summary */}
              <div className="bg-[#0b0e1b] border border-[#1e2642] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Resumen de Mobiliario Solicitado
                </h4>
                <div className="divide-y divide-[#1e2642] text-xs">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-200 font-medium">
                        <strong className="text-neon-pink">{item.quantity}x</strong> {item.productName}
                      </span>
                      <span className="text-slate-400 font-semibold">{item.quantity} piezas</span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between font-extrabold text-sm text-white">
                    <span>Total de piezas a solicitar:</span>
                    <span className="text-neon-cyan text-base font-black">{totalItemCount} piezas</span>
                  </div>
                </div>
              </div>

              {/* Customer Contact & Delivery Address */}
              <div className="space-y-4">
                {Boolean(customerName && customerPhone && customerAddress) && !isEditingCustomerData ? (
                  <div className="bg-[#0b0e1b] border border-neon-cyan/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-neon-cyan">
                        <CheckCircle2 className="w-4 h-4 text-neon-cyan shrink-0" />
                        <span>Tus datos de entrega ya están registrados y listos:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingCustomerData(true)}
                        className="text-xs font-bold text-neon-pink hover:underline"
                      >
                        Cambiar datos o mover mapa
                      </button>
                    </div>

                    <div className="bg-[#12172b] p-3.5 rounded-xl border border-[#1e2642] text-xs space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-sm">{customerName}</span>
                        <span className="font-mono text-neon-cyan font-bold">{customerPhone}</span>
                      </div>
                      <p className="text-slate-300 flex items-start gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-neon-pink shrink-0 mt-0.5" />
                        <span>{customerAddress}</span>
                      </p>
                      {customerReference && (
                        <p className="text-[11px] text-slate-400 pl-5">
                          <strong>Ref:</strong> {customerReference}
                        </p>
                      )}
                      <p className="text-[11px] font-mono text-slate-500 pl-5">
                        Punto GPS: {customerLocation?.lat?.toFixed(5)}, {customerLocation?.lng?.toFixed(5)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 bg-[#0b0e1b] p-4 rounded-2xl border border-[#1e2642]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-neon-pink" />
                        <span>Datos de Contacto y Dirección</span>
                      </h4>
                      {Boolean(customerName && customerPhone && customerAddress) && (
                        <button
                          type="button"
                          onClick={() => setIsEditingCustomerData(false)}
                          className="text-xs font-bold text-neon-cyan hover:underline"
                        >
                          Listo, mantener datos
                        </button>
                      )}
                    </div>

                    {customers && customers.length > 0 && (
                      <div className="p-3 bg-[#12172b] border border-[#242e50] rounded-xl space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 block">
                          ¿Ya fuiste registrado previamente por nuestro personal?
                        </label>
                        <select
                          onChange={(e) => {
                            const found = customers.find((c) => c.id === e.target.value);
                            if (found) {
                              setCustomerName(found.name || '');
                              setCustomerPhone(found.phone || '');
                              setCustomerAddress(found.address || '');
                              setCustomerReference(found.reference || '');
                              if (found.location) setCustomerLocation(found.location);
                              setIsEditingCustomerData(false);
                            }
                          }}
                          defaultValue=""
                          className="w-full px-3 py-2 bg-[#0b0e1b] border border-[#1e2642] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-neon-pink"
                        >
                          <option value="">-- Selecciona tu nombre para cargar tu ubicación del mapa --</option>
                          {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.phone}) - {c.address}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ej. Juan Pérez García"
                          className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] rounded-xl text-xs text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Número Telefónico / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Ej. 55 1234 5678"
                          className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] rounded-xl text-xs text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                        />
                      </div>
                    </div>

                    {/* MAP SELECTOR */}
                    <div className="space-y-2 pt-2 border-t border-[#1e2642]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                          <MapPin className="w-4 h-4 text-neon-pink" />
                          Ubicación Exacta de Entrega en el Mapa *
                        </span>
                        <span className="text-[11px] text-neon-cyan font-medium">
                          Arrastra el pin al portón o entrada
                        </span>
                      </div>

                      <MapSelector
                        initialLocation={customerLocation}
                        initialAddress={customerAddress}
                        onLocationChange={handleLocationChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Dirección Completa (Calle, Número, Colonia) *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Calle y número exterior/interior"
                          className="w-full px-3.5 py-2 bg-[#182038] border border-[#242e50] rounded-xl text-xs text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Referencias de Entrega (Opcional)
                        </label>
                        <input
                          type="text"
                          value={customerReference}
                          onChange={(e) => setCustomerReference(e.target.value)}
                          placeholder="Ej. Portón blanco, frente a la tienda"
                          className="w-full px-3.5 py-2 bg-[#182038] border border-[#242e50] rounded-xl text-xs text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                        />
                      </div>
                    </div>

                    {Boolean(customerName && customerPhone && customerAddress) && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingCustomerData(false)}
                          className="px-4 py-1.5 bg-neon-cyan text-slate-950 rounded-xl text-xs font-black shadow-glow-cyan"
                        >
                          Guardar datos para solicitudes futuras
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Indicaciones especiales o notas para el montaje
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="¿Hay escaleras? ¿Horario específico para descargar?"
                    className="w-full px-3.5 py-2 bg-[#182038] border border-[#242e50] rounded-xl text-xs text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#1e2642] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-glow-pink flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registrando...' : 'Confirmar Solicitud de Pedido'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
