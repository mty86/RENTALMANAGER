import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import MobileBottomNav from './components/MobileBottomNav';
import InstallPwaModal from './components/InstallPwaModal';
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import NotificationSidebar from './components/NotificationSidebar';
import { playNotificationChime } from './utils/audio';
import ClientView from './views/ClientView';
import EmployeeOrders from './views/EmployeeOrders';
import EmployeeClients from './views/EmployeeClients';
import EmployeeInventory from './views/EmployeeInventory';
import EmployeeHistory from './views/EmployeeHistory';
import SuperadminView from './views/SuperadminView';
import {
  fetchBaseLocation,
  updateBaseLocation,
  fetchProducts,
  fetchOrders,
  createOrder,
  acceptOrder,
  deliverOrder,
  cancelOrder,
  deleteOrder,
  verifyPickup,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  simulate24hOverdue,
  resetDemoData
} from './api/client';
import { Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function App() {
  const handleLogin = (user) => {
    setCurrentUser(user);
    setRole(user.role);
    if (user.role === 'superadmin') setActiveNavTab('dashboard');
    else if (user.role === 'empleado') setActiveNavTab('pedidos');
    else if (user.role === 'cliente') {
      setActiveNavTab('inventario');
      setClientTab('catalogo');
    }
    showToast(`Bienvenido ${user.name || ''}`);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('rental_manager_auth_user');
    } catch (e) {}
    setCurrentUser(null);
    showToast('Sesión cerrada correctamente.', 'info');
  };

  const handleSidebarTabChange = (tabId) => {
    setActiveNavTab(tabId);
    if (tabId === 'dashboard') {
      setRole('superadmin');
    } else if (tabId === 'pedidos') {
      if (role === 'cliente') {
        setClientTab('mis_solicitudes');
      } else {
        setRole('empleado');
        setEmployeeTab('pedidos');
      }
    } else if (tabId === 'inventario') {
      if (role === 'cliente') {
        setClientTab('catalogo');
      } else {
        setRole('empleado');
        setEmployeeTab('inventario');
      }
    } else if (tabId === 'clientes') {
      setRole('empleado');
      setEmployeeTab('clientes');
    } else if (tabId === 'rutas') {
      setRole('empleado');
      setEmployeeTab('pedidos');
    } else if (tabId === 'metricas') {
      setRole('superadmin');
    } else if (tabId === 'configuracion') {
      setRole('superadmin');
    }
  };
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rental_manager_auth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [role, setRole] = useState(() => {
    try {
      const saved = localStorage.getItem('rental_manager_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      }
    } catch (e) {}
    return 'superadmin';
  }); // Default to superadmin to showcase the requested dashboard
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileAlertsOpen, setIsMobileAlertsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState(''); // 'cliente' | 'empleado' | 'superadmin'
  const [employeeTab, setEmployeeTab] = useState('pedidos'); // 'pedidos' | 'clientes' | 'inventario' | 'historial'

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [baseLocation, setBaseLocation] = useState({
    name: 'Base Alquiladora',
    lat: 19.3732,
    lng: -99.1788,
  });

  // Notification System State & Persistence
  const NOTIFICATIONS_STORAGE_KEY = 'rental_manager_notifications_v3';
  const SOUND_STORAGE_KEY = 'rental_manager_sound_enabled';

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'init-notif-emp-1',
        role: 'empleado',
        type: 'new_order',
        orderId: 'ORD-101',
        title: '¡Nueva Solicitud Recibida!',
        message: 'El cliente Juan Carlos Pérez envió la solicitud #ORD-101. Requiere revisión y confirmación.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        read: false,
      },
      {
        id: 'init-notif-emp-2',
        role: 'empleado',
        type: 'overdue_pickup',
        orderId: 'ORD-102',
        title: '¡Alerta: Mobiliario +24h sin recoger!',
        message: 'El pedido #ORD-102 (María Fernanda López) lleva más de 28 horas entregado y aún no ha sido recogido.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
      },
      {
        id: 'init-notif-cli-1',
        role: 'cliente',
        type: 'accepted',
        orderId: 'ORD-100',
        title: '¡Solicitud Aceptada!',
        message: 'Tu solicitud #ORD-100 ha sido aceptada por el equipo de Rental Manager y estamos en camino.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: false,
      }
    ];
  });

  const [focusedOrderId, setFocusedOrderId] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState('activos');
  const [clientTab, setClientTab] = useState('catalogo');

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      } catch (e) {}
      return next;
    });
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
    if (soundEnabled) {
      playNotificationChime(notif.type === 'overdue_pickup' ? 'urgent' : 'standard');
    }
  };

  const handleMarkAsRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.role === role || !n.role ? { ...n, read: true } : n))
    );
  };

  const handleClearAll = () => {
    setNotifications((prev) => prev.filter((n) => n.role && n.role !== role));
  };

  const handleDeleteNotification = (notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const handleNavigateToOrder = (notif) => {
    setIsNotificationDrawerOpen(false);
    setFocusedOrderId(notif.orderId);

    if (notif.role === 'empleado' || role === 'empleado') {
      setRole('empleado');
      setEmployeeTab('pedidos');
      if (notif.type === 'overdue_pickup') {
        setEmployeeFilter('vencidos');
      } else if (notif.type === 'new_order') {
        setEmployeeFilter('pendientes');
      } else {
        setEmployeeFilter('activos');
      }
    } else {
      setRole('cliente');
      setClientTab('mis_pedidos');
    }

    setTimeout(() => {
      setFocusedOrderId(null);
    }, 6000);
  };

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const [baseData, productsData, ordersData, customersData, employeesData] = await Promise.all([
        fetchBaseLocation().catch(() => ({
          name: 'Base Alquiladora Central',
          address: 'Av. Insurgentes Sur #1200, Col. Del Valle',
          phone: '55 9876 5432',
          lat: 19.3732,
          lng: -99.1788,
        })),
        fetchProducts().catch(() => []),
        fetchOrders().catch(() => []),
        fetchCustomers().catch(() => []),
        fetchEmployees().catch(() => []),
      ]);

      setBaseLocation(baseData);
      setProducts(productsData);
      setOrders(ordersData);
      setCustomers(customersData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setErrorMessage('No se pudo conectar con el servidor local. Asegúrate de que el servidor Express esté iniciado.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);

    // Auto-refresh every 12 seconds to keep orders & state synced
    const interval = setInterval(() => {
      loadData(false);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Background orders tracking to detect new orders and transitions
  const prevOrdersRef = useRef(null);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    if (prevOrdersRef.current === null) {
      const map = {};
      orders.forEach((o) => {
        map[o.id] = { status: o.status, deliveredAt: o.deliveredAt };
      });
      prevOrdersRef.current = map;
      return;
    }

    const prevMap = prevOrdersRef.current;
    const currentMap = {};

    orders.forEach((o) => {
      currentMap[o.id] = { status: o.status, deliveredAt: o.deliveredAt };
      const prev = prevMap[o.id];

      if (!prev && o.status === 'pendiente') {
        const alreadyNotified = notifications.some(
          (n) => n.orderId === o.id && n.type === 'new_order'
        );
        if (!alreadyNotified) {
          addNotification({
            id: `notif-poll-${Date.now()}-${o.id}`,
            role: 'empleado',
            type: 'new_order',
            orderId: o.id,
            title: '¡Nueva Solicitud Recibida!',
            message: `El cliente ${o.customer?.name} envió la solicitud #${o.id}. Requiere atención.`,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }
    });

    prevOrdersRef.current = currentMap;
  }, [orders]);

  // Order Handlers
  const handleCreateOrder = async (orderPayload) => {
    const newOrder = await createOrder(orderPayload);
    await loadData(false);
    showToast(`¡Solicitud ${newOrder.id} enviada con éxito!`);

    // Immediate Employee notification for new incoming order
    addNotification({
      id: `notif-new-${Date.now()}-${newOrder.id}`,
      role: 'empleado',
      type: 'new_order',
      orderId: newOrder.id,
      title: '¡Nueva Solicitud Recibida!',
      message: `El cliente ${newOrder.customer?.name} envió la solicitud #${newOrder.id}. Haz clic para atenderla en el panel de pedidos.`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return newOrder;
  };

  const handleAcceptOrder = async (orderId, employeeName) => {
    const res = await acceptOrder(orderId, employeeName);
    await loadData(false);
    showToast(`Pedido ${orderId} aceptado.`);

    // Client Notification: Solicitud Aceptada
    addNotification({
      id: `notif-accepted-${Date.now()}-${orderId}`,
      role: 'cliente',
      type: 'accepted',
      orderId: orderId,
      title: '¡Solicitud Aceptada!',
      message: `Tu solicitud #${orderId} ha sido aceptada por el equipo de Rental Manager y estamos en camino para la entrega.`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return res.order;
  };

  const handleDeliverOrder = async (orderId, employeeName) => {
    const res = await deliverOrder(orderId, employeeName);
    await loadData(false);
    showToast(`Pedido ${orderId} marcado como entregado.`);

    // Client Notification: Solicitud Entregada
    addNotification({
      id: `notif-delivered-${Date.now()}-${orderId}`,
      role: 'cliente',
      type: 'delivered',
      orderId: orderId,
      title: '¡Mobiliario Entregado!',
      message: `El mobiliario de tu pedido #${orderId} ha sido entregado en tu domicilio.`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return res.order;
  };

  const handleCancelOrder = async (orderId, reason, notifiedViaWhatsApp = false) => {
    const res = await cancelOrder(orderId, reason, notifiedViaWhatsApp);
    await loadData(false);
    showToast(`Pedido ${orderId} cancelado. Motivo registrado.`, 'info');

    // Client Notification: Solicitud Rechazada/Cancelada
    addNotification({
      id: `notif-cancelled-${Date.now()}-${orderId}`,
      role: 'cliente',
      type: 'cancelled',
      orderId: orderId,
      title: 'Solicitud No Disponible',
      message: `Tu solicitud #${orderId} no pudo ser aceptada: "${reason || 'Sin disponibilidad'}".`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return res.order;
  };

  const handleDeleteOrder = async (orderId) => {
    await deleteOrder(orderId);
    await loadData(false);
    showToast(`Pedido ${orderId} eliminado.`);
  };

  const handleVerifyPickup = async (orderId, payload) => {
    const res = await verifyPickup(orderId, payload);
    await loadData(false);
    showToast(res.message || 'Recogida procesada');

    // Client Notification: Solicitud Recogida y Finalizada
    addNotification({
      id: `notif-pickup-${Date.now()}-${orderId}`,
      role: 'cliente',
      type: 'completed',
      orderId: orderId,
      title: '¡Mobiliario Recogido con Éxito!',
      message: `El mobiliario de tu pedido #${orderId} fue recogido y verificado. ¡Pedido completado!`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return res.order;
  };

  const handleSimulate24h = async (orderId) => {
    const res = await simulate24hOverdue(orderId);
    await loadData(false);
    showToast(`Pedido ${orderId} simulado como vencido (+25h).`, 'info');

    // Employee Notification: Alerta +24h sin recoger
    addNotification({
      id: `notif-overdue-${Date.now()}-${orderId}`,
      role: 'empleado',
      type: 'overdue_pickup',
      orderId: orderId,
      title: '¡Alerta: Mobiliario +24h sin recoger!',
      message: `El pedido #${orderId} cumplió más de 24 horas entregado y aún no ha sido recogido por el personal.`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return res.order;
  };

  // Customer Handlers (Employee & Superadmin)
  const handleCreateCustomer = async (payload) => {
    const newCust = await createCustomer(payload);
    await loadData(false);
    showToast(`Cliente "${newCust.name}" registrado con puntero en mapa.`);
    return newCust;
  };

  const handleUpdateCustomer = async (id, payload) => {
    const updated = await updateCustomer(id, payload);
    await loadData(false);
    showToast(`Cliente "${updated.name}" actualizado.`);
    return updated;
  };

  const handleDeleteCustomer = async (id) => {
    await deleteCustomer(id);
    await loadData(false);
    showToast('Cliente eliminado del directorio.', 'info');
  };

  // Product Handlers
  const handleCreateProduct = async (productPayload) => {
    const newProd = await createProduct(productPayload);
    await loadData(false);
    showToast(`Producto "${newProd.name}" agregado al inventario.`);
    return newProd;
  };

  const handleUpdateProduct = async (id, productPayload) => {
    const updated = await updateProduct(id, productPayload);
    await loadData(false);
    showToast(`Producto "${updated.name}" actualizado.`);
    return updated;
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    await loadData(false);
    showToast('Producto eliminado del catálogo.', 'info');
  };

  // Employee Handlers (Superadmin)
  const handleCreateEmployee = async (payload) => {
    const newEmp = await createEmployee(payload);
    await loadData(false);
    showToast(`Empleado "${newEmp.name}" registrado.`);
    return newEmp;
  };

  const handleUpdateEmployee = async (id, payload) => {
    const updated = await updateEmployee(id, payload);
    await loadData(false);
    showToast(`Empleado "${updated.name}" actualizado.`);
    return updated;
  };

  const handleDeleteEmployee = async (id) => {
    await deleteEmployee(id);
    await loadData(false);
    showToast('Empleado eliminado.', 'info');
  };

  // Base Location Handler (Superadmin)
  const handleUpdateBaseLocation = async (payload) => {
    const updated = await updateBaseLocation(payload);
    setBaseLocation(updated);
    showToast('Ubicación de la Base actualizada.');
    return updated;
  };

  const pendingCount = orders.filter((o) => o.status === 'pendiente').length;

  const overdueOrdersCount = orders.filter((o) => {
    if (o.status !== 'entregado' && o.status !== 'con_incidencias') return false;
    if (o.isOverduePickup) return true;
    const deliveredTime = o.deliveredAt
      ? new Date(o.deliveredAt).getTime()
      : o.createdAt
      ? new Date(o.createdAt).getTime()
      : null;
    if (!deliveredTime) return false;
    return (Date.now() - deliveredTime) >= 24 * 60 * 60 * 1000;
  }).length;

  const unreadNotificationsCount = notifications.filter(
    (n) => (!n.role || n.role === role) && !n.read
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
        <div className="text-center">
          <h2 className="text-lg font-bold">Iniciando Rental Manager</h2>
          <p className="text-xs text-slate-400 mt-1">Cargando catálogo, mapas y pedidos...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex selection:bg-neon-pink selection:text-white relative">
      {/* Fixed Left Vertical Sidebar */}
      <Sidebar
        currentRole={role}
        activeTab={activeNavTab}
        onTabChange={handleSidebarTabChange}
        pendingOrdersCount={pendingCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content Area Shifted by Sidebar Width (Left) and Permanent Alerts Panel (Right) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      } lg:mr-80 xl:mr-96 pb-20 md:pb-6`}>
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-slideDown">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-bold ${
              toastMessage.type === 'info'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentRole={role}
        onRoleChange={(newRole) => {
          setRole(newRole);
          if (newRole === 'superadmin') setActiveNavTab('dashboard');
          else if (newRole === 'empleado') setActiveNavTab('pedidos');
          else if (newRole === 'cliente') setActiveNavTab('inventario');
        }}
        pendingOrdersCount={pendingCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onRefreshData={() => loadData(false)}
        isRefreshing={isRefreshing}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onToggleMobileAlerts={() => setIsMobileAlertsOpen((prev) => !prev)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Connection error banner if any */}
      {errorMessage && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{errorMessage}</span>
          <button
            onClick={() => loadData(true)}
            className="underline font-bold hover:text-amber-900 ml-2"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Profile 1: CLIENTE */}
        {role === 'cliente' && (
          <ClientView
            products={products}
            orders={orders}
            customers={customers}
            onCreateOrder={handleCreateOrder}
            externalTab={clientTab}
            onTabChange={setClientTab}
            focusedOrderId={focusedOrderId}
          />
        )}

        {/* Profile 2: EMPLEADO */}
        {role === 'empleado' && (
          <div className="space-y-6">
            {employeeTab === 'pedidos' && (
              <EmployeeOrders
                orders={orders}
                baseLocation={baseLocation}
                onAcceptOrder={handleAcceptOrder}
                onDeliverOrder={handleDeliverOrder}
                onCancelOrder={handleCancelOrder}
                onVerifyPickup={handleVerifyPickup}
                onSimulate24h={handleSimulate24h}
                focusedOrderId={focusedOrderId}
                externalFilter={employeeFilter}
              />
            )}

            {employeeTab === 'clientes' && (
              <EmployeeClients
                customers={customers}
                onCreateCustomer={handleCreateCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}

            {employeeTab === 'inventario' && (
              <EmployeeInventory
                products={products}
                onCreateProduct={handleCreateProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {employeeTab === 'historial' && (
              <EmployeeHistory orders={orders} />
            )}
          </div>
        )}

        {/* Profile 3: SUPERADMIN */}
        {role === 'superadmin' && (
          <SuperadminView
            orders={orders}
            products={products}
            customers={customers}
            employees={employees}
            baseLocation={baseLocation}
            onUpdateBaseLocation={handleUpdateBaseLocation}
            onCreateEmployee={handleCreateEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onDeleteOrder={handleDeleteOrder}
            onResetDemoData={async () => {
              await resetDemoData();
              await loadData(true);
              showToast('Datos reiniciados al estado inicial.');
            }}
            onRefreshData={() => loadData(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0b0e1b] border-t border-[#1a223c] py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-pink shadow-glow-pink"></span>
            Rental Manager Pro &copy; 2026 • Sistema de Control y Logística de Mobiliario
          </span>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Base: {baseLocation.name}</span>
            <button
              onClick={async () => {
                if (confirm('¿Reiniciar datos de prueba al estado inicial?')) {
                  await resetDemoData();
                  await loadData(true);
                  showToast('Datos reiniciados');
                }
              }}
              className="text-neon-pink hover:underline"
            >
              Reiniciar Datos Demo
            </button>
          </div>
        </div>
      </footer>
      </div>

      {/* Permanent Live Alerts Column for All Roles (Superadmin, Empleado, Cliente) */}
      <NotificationSidebar
        role={role}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        onDeleteNotification={handleDeleteNotification}
        onNavigateToOrder={(orderId) => {
          handleNavigateToOrder(orderId);
          setIsMobileAlertsOpen(false);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        isOpenMobile={isMobileAlertsOpen}
        onCloseMobile={() => setIsMobileAlertsOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav
        role={role}
        activeNavTab={activeNavTab}
        onTabChange={handleSidebarTabChange}
        clientTab={clientTab}
        onClientTabChange={(t) => {
          setClientTab(t);
          setActiveNavTab('inventario');
        }}
        employeeTab={employeeTab}
        onEmployeeTabChange={(t) => {
          setEmployeeTab(t);
          setActiveNavTab(t === 'pedidos' ? 'pedidos' : t === 'clientes' ? 'clientes' : 'inventario');
        }}
        unreadAlertsCount={unreadNotificationsCount}
        onToggleAlerts={() => setIsMobileAlertsOpen((prev) => !prev)}
        onToggleMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
      />
      {/* PWA Install / Download Web App Modal */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
