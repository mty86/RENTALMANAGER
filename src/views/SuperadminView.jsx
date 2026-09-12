import NeonDashboard from '../components/dashboard/NeonDashboard';
import React, { useState } from 'react';
import MapSelector from '../components/MapSelector';
import OrderStatusBadge from '../components/OrderStatusBadge';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  Briefcase,
  MapPin,
  Settings,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  Warehouse,
  Phone,
  Mail,
  Truck,
  ExternalLink,
  Search,
  FileCheck2,
  Clock,
  X
} from 'lucide-react';

export default function SuperadminView({
  orders = [],
  products = [],
  customers = [],
  employees = [],
  baseLocation,
  onUpdateBaseLocation,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onDeleteOrder,
  onResetDemoData,
  onRefreshData,
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'personal' | 'almacen' | 'pedidos'

  // Employee Form State
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState('Chofer y Repartidor');
  const [empStatus, setEmpStatus] = useState('activo');
  const [empVehicle, setEmpVehicle] = useState('');
  const [empPlate, setEmpPlate] = useState('');
  const [empError, setEmpError] = useState('');
  const [isSubmittingEmp, setIsSubmittingEmp] = useState(false);

  // Base Location Edit State
  const [baseName, setBaseName] = useState(baseLocation?.name || 'Base Central Rental Manager');
  const [baseAddress, setBaseAddress] = useState(baseLocation?.address || 'Av. Insurgentes Sur #1200, Col. Del Valle');
  const [basePhone, setBasePhone] = useState(baseLocation?.phone || '55 9876 5432');
  const [baseCoords, setBaseCoords] = useState({
    lat: baseLocation?.lat || 19.3732,
    lng: baseLocation?.lng || -99.1788,
  });
  const [isSavingBase, setIsSavingBase] = useState(false);
  const [baseSaveSuccess, setBaseSaveSuccess] = useState(false);

  // Orders Filter
  const [orderFilter, setOrderFilter] = useState('todos');
  const [orderSearch, setOrderSearch] = useState('');

  // Overdue Check (>24h since delivery)
  const isOrderOverdue = (order) => {
    if (order.status !== 'entregado' && order.status !== 'con_incidencias') return false;
    if (order.isOverduePickup) return true;
    const deliveredTime = order.deliveredAt
      ? new Date(order.deliveredAt).getTime()
      : order.createdAt
      ? new Date(order.createdAt).getTime()
      : null;
    if (!deliveredTime) return false;
    return (Date.now() - deliveredTime) >= 24 * 60 * 60 * 1000;
  };

  const overdueOrders = orders.filter(isOrderOverdue);

  // Calculations for Metrics
  const totalRevenue = orders
    .filter((o) => ['aceptado', 'en_camino', 'entregado', 'completado'].includes(o.status))
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'pendiente').length;
  const activeOrders = orders.filter((o) => ['aceptado', 'en_camino', 'entregado', 'con_incidencias'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'completado').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelado').length;

  const totalInventoryUnits = products.reduce((acc, p) => acc + (Number(p.totalStock) || 0), 0);
  const availableUnits = products.reduce((acc, p) => acc + (Number(p.availableStock) || 0), 0);
  const rentedUnits = totalInventoryUnits - availableUnits;

  // Employee modal handlers
  const openNewEmployeeModal = () => {
    setEditingEmployee(null);
    setEmpName('');
    setEmpPhone('');
    setEmpEmail('');
    setEmpRole('Chofer y Repartidor');
    setEmpStatus('activo');
    setEmpVehicle('');
    setEmpPlate('');
    setEmpError('');
    setIsEmployeeModalOpen(true);
  };

  const openEditEmployeeModal = (emp) => {
    setEditingEmployee(emp);
    setEmpName(emp.name || '');
    setEmpPhone(emp.phone || '');
    setEmpEmail(emp.email || '');
    setEmpRole(emp.role || 'Chofer y Repartidor');
    setEmpStatus(emp.status || 'activo');
    setEmpVehicle(emp.assignedVehicle || '');
    setEmpPlate(emp.licensePlate || '');
    setEmpError('');
    setIsEmployeeModalOpen(true);
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setEmpError('');

    if (!empName.trim() || !empPhone.trim()) {
      setEmpError('Nombre y teléfono son obligatorios.');
      return;
    }

    setIsSubmittingEmp(true);
    try {
      const payload = {
        name: empName.trim(),
        phone: empPhone.trim(),
        email: empEmail.trim(),
        role: empRole,
        status: empStatus,
        assignedVehicle: empVehicle.trim(),
        licensePlate: empPlate.trim(),
      };

      if (editingEmployee) {
        await onUpdateEmployee(editingEmployee.id, payload);
      } else {
        await onCreateEmployee(payload);
      }

      setIsEmployeeModalOpen(false);
    } catch (err) {
      setEmpError(err.message || 'Error al procesar empleado');
    } finally {
      setIsSubmittingEmp(false);
    }
  };

  const handleBaseSave = async (e) => {
    e.preventDefault();
    setIsSavingBase(true);
    setBaseSaveSuccess(false);
    try {
      await onUpdateBaseLocation({
        name: baseName.trim(),
        address: baseAddress.trim(),
        phone: basePhone.trim(),
        lat: Number(baseCoords.lat),
        lng: Number(baseCoords.lng),
      });
      setBaseSaveSuccess(true);
      setTimeout(() => setBaseSaveSuccess(false), 4000);
    } catch (err) {
      alert(err.message || 'Error al guardar ubicación base');
    } finally {
      setIsSavingBase(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    let matchesFilter = true;
    if (orderFilter === 'vencidos') {
      matchesFilter = isOrderOverdue(o);
    } else if (orderFilter !== 'todos') {
      matchesFilter = o.status === orderFilter;
    }
    const q = orderSearch.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(q) ||
      (o.customer?.name || '').toLowerCase().includes(q) ||
      (o.customer?.phone || '').includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Superadmin Header Banner */}
      <div className="bg-[#12172b] rounded-3xl p-6 sm:p-7 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#1e2642]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neon-pink to-purple-600 flex items-center justify-center text-white shadow-glow-pink shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-neon-pink bg-neon-pink/15 border border-neon-pink/40 shadow-glow-pink px-2 py-0.5 rounded-full uppercase tracking-wider">
                Acceso Superadmin
              </span>
              <span className="text-xs text-slate-400">Control Total del Sistema</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Panel de Administración y Operaciones Globales
            </h1>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={async () => {
              if (confirm('¿Deseas reiniciar todos los datos a los valores de prueba por defecto?')) {
                await onResetDemoData();
                await onRefreshData();
              }
            }}
            className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/50 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar Demo</span>
          </button>
        </div>
      </div>

      {/* TAB 1: METRICS & DASHBOARD */}
      {activeTab === 'dashboard' && (
        <NeonDashboard
          orders={orders}
          products={products}
          customers={customers}
          employees={employees}
          onNavigateToTab={(tab) => {
            if (tab === 'pedidos') setActiveTab('pedidos');
            else if (tab === 'personal') setActiveTab('personal');
            else if (tab === 'almacen') setActiveTab('almacen');
          }}
        />
      )}

      {/* TAB 2: STAFF & EMPLOYEES MANAGEMENT */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white">Personal Operativo y Logístico</h2>
              <p className="text-xs text-slate-500">
                Choferes, repartidores y encargados de inventario autorizados.
              </p>
            </div>

            <button
              onClick={openNewEmployeeModal}
              className="px-4 py-2 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 shadow-glow-pink text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Empleado</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-[#12172b] rounded-3xl border border-[#1e2642] p-5 shadow-xl text-slate-100 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{emp.name}</h3>
                      <span className="text-xs font-semibold text-neon-pink bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        {emp.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditEmployeeModal(emp)}
                        className="p-1.5 text-slate-400 hover:text-neon-pink rounded-lg hover:bg-slate-100"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`¿Eliminar al empleado "${emp.name}"?`)) {
                            await onDeleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 space-y-1.5 bg-[#182038] border border-[#242e50] p-3.5 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.phone}</span>
                    </div>
                    {emp.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                    )}
                    {emp.assignedVehicle && (
                      <div className="flex items-center gap-2 text-indigo-700 font-medium">
                        <Truck className="w-3.5 h-3.5" />
                        <span>{emp.assignedVehicle} {emp.licensePlate ? `(${emp.licensePlate})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                    ● {emp.status?.toUpperCase() || 'ACTIVO'}
                  </span>
                  <a
                    href={`tel:${emp.phone}`}
                    className="text-neon-pink font-bold hover:underline"
                  >
                    Contactar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WAREHOUSE BASE LOCATION CONFIGURATION */}
      {activeTab === 'almacen' && (
        <div className="space-y-6">
          <div className="bg-[#12172b] rounded-3xl border border-[#1e2642] p-6 shadow-xl text-slate-100 space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-neon-pink" />
                <span>Configuración de la Base Central (Origen de Rutas GPS)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Esta es la ubicación física del almacén desde donde salen los pedidos y se calculan las rutas de entrega y retorno.
              </p>
            </div>

            <form onSubmit={handleBaseSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre de la Base / Empresa
                  </label>
                  <input
                    type="text"
                    required
                    value={baseName}
                    onChange={(e) => setBaseName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono Central de Atención
                  </label>
                  <input
                    type="text"
                    required
                    value={basePhone}
                    onChange={(e) => setBasePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección del Almacén
                  </label>
                  <input
                    type="text"
                    required
                    value={baseAddress}
                    onChange={(e) => setBaseAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                  />
                </div>
              </div>

              {/* Base Interactive Map Pin Selector */}
              <div className="space-y-2 bg-[#12172b] p-4 rounded-2xl border border-[#1e2642]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                    <MapPin className="w-4 h-4 text-neon-pink" />
                    Puntero en Mapa para Origen de Rutas
                  </span>
                  <span className="text-[11px] text-neon-pink font-semibold">
                    Arrastra el marcador para fijar la ubicación del almacén
                  </span>
                </div>

                <MapSelector
                  initialLocation={baseCoords}
                  initialAddress={baseAddress}
                  onLocationChange={({ location, address }) => {
                    setBaseCoords(location);
                    if (address) setBaseAddress(address);
                  }}
                />
              </div>

              {baseSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>¡Ubicación y datos de la Base Central actualizados con éxito! Todas las rutas viales se calcularán desde este punto.</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingBase}
                  className="px-6 py-2.5 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 shadow-glow-pink text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingBase ? 'Guardando...' : 'Guardar Cambios de la Base'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT ALL ORDERS */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-black text-white">Auditoría Global de Solicitudes</h2>
              <p className="text-xs text-slate-500">Historial completo con filtros por estado y eliminación.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Buscar por cliente o ID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-700"
              >
                <option value="todos">Todos los Estados</option>
                <option value="vencidos">Vencidos (+24h sin recoger)</option>
                <option value="pendiente">Pendientes</option>
                <option value="aceptado">Aceptados</option>
                <option value="entregado">Entregados</option>
                <option value="con_incidencias">Con Incidencias</option>
                <option value="completado">Completados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isOverdue = isOrderOverdue(order);
              return (
              <div
                key={order.id}
                className={`bg-[#12172b] rounded-2xl border border-[#1e2642] p-4 shadow-xl text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isOverdue ? 'border-rose-300 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {order.id}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    {isOverdue && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-300 animate-pulse flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>ALERTA +24H SIN RECOGER</span>
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {order.customer?.name} • <span className="text-teal-700">{order.customer?.phone}</span>
                  </h4>
                  <p className="text-xs text-slate-500">{order.customer?.address}</p>
                  <p className="text-xs text-slate-700 font-semibold">
                    {order.items?.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={async () => {
                      if (confirm(`¿Eliminar definitivamente el pedido ${order.id}?`)) {
                        await onDeleteOrder(order.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors border border-rose-200"
                    title="Eliminar pedido de la base de datos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EMPLOYEE MODAL */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#12172b] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#242e50] text-white">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingEmployee ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
              </h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="text-purple-200 hover:text-white p-1 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Ej. Juan Gómez"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / Celular *</label>
                  <input
                    type="tel"
                    required
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="55 1234 5678"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="juan@rentalmanager.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rol / Puesto</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="Chofer y Repartidor">Chofer y Repartidor</option>
                    <option value="Encargada de Logística y Pedidos">Encargada de Logística</option>
                    <option value="Auditor y Control de Almacén">Auditor de Almacén</option>
                    <option value="Atención a Clientes y Mostrador">Atención a Clientes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo / En Descanso</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehículo Asignado (opcional)</label>
                  <input
                    type="text"
                    value={empVehicle}
                    onChange={(e) => setEmpVehicle(e.target.value)}
                    placeholder="Camioneta Nissan NP300"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Placas</label>
                  <input
                    type="text"
                    value={empPlate}
                    onChange={(e) => setEmpPlate(e.target.value)}
                    placeholder="ABC-123-D"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {empError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                  {empError}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmp}
                  className="px-5 py-2 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 shadow-glow-pink text-white rounded-xl text-xs font-bold"
                >
                  {isSubmittingEmp ? 'Guardando...' : 'Guardar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
