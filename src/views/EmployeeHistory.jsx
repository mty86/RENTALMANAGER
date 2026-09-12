import React, { useState } from 'react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import {
  History,
  Search,
  Calendar,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Package,
  User,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function EmployeeHistory({ orders }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Filter completed and past orders (or all orders that have history events)
  const historyOrders = orders.filter((o) =>
    ['completado', 'cancelado', 'con_incidencias'].includes(o.status) || o.pickupReport
  );

  const filtered = historyOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer?.name.toLowerCase().includes(q) ||
      o.customer?.phone.includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2642] pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Historial y Auditoría de Recogidas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro permanente de pedidos completados, actas de inspección de mobiliario y cobros por reposición.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por cliente, ID o estado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#12172b] text-slate-100 border border-[#1e2642] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#12172b] text-slate-100 rounded-3xl border border-[#1e2642]">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-base font-bold text-slate-200">No hay registros en el historial</p>
          <p className="text-xs text-slate-400 mt-1">
            Los pedidos que sean recogidos y completados se registrarán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const report = order.pickupReport;

            return (
              <div
                key={order.id}
                className="bg-[#12172b] text-slate-100 rounded-3xl border border-[#1e2642] shadow-sm overflow-hidden transition-all"
              >
                {/* Order Summary Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#182038]/70 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        order.status === 'completado'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : order.status === 'con_incidencias'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <FileCheck2 className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded">
                          {order.id}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        {order.customer?.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {order.customer?.phone} • {order.customer?.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Mobiliario</span>
                      <span className="text-sm font-black text-white">
                        {order.items?.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)} pzas
                      </span>
                    </div>

                    <div className="text-left sm:text-right text-[11px] text-slate-500">
                      <div>Finalizado: {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : 'En proceso'}</div>
                      <div className="text-teal-700 font-semibold">{order.items?.length} tipos de muebles</div>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-300">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Inspection Audit Details */}
                {isExpanded && (
                  <div className="p-5 bg-[#182038] border-t border-[#1e2642] space-y-4">
                    {report ? (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#12172b] text-slate-100 p-3.5 rounded-2xl border border-[#1e2642] text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">
                              Auditoría de Recogida
                            </span>
                            <span className="font-bold text-slate-200">
                              Inspeccionado por: {report.inspectedBy || 'Personal de Recogida'}
                            </span>
                          </div>

                          <div className="text-slate-500">
                            Fecha y Hora:{' '}
                            <span className="font-semibold text-slate-300">
                              {new Date(report.inspectedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Items Checklist Result Table */}
                        <div className="bg-[#12172b] text-slate-100 rounded-2xl border border-[#1e2642] overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-[#1e2642]">
                                <th className="py-2.5 px-3">Producto</th>
                                <th className="py-2.5 px-3 text-center">Entregado</th>
                                <th className="py-2.5 px-3 text-center text-emerald-700">Buen Estado</th>
                                <th className="py-2.5 px-3 text-center text-amber-700">Dañados</th>
                                <th className="py-2.5 px-3 text-center text-rose-700">Faltantes</th>
                                <th className="py-2.5 px-3">Observaciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {report.itemsStatus?.map((item, idx) => (
                                <tr key={idx} className="hover:bg-[#182038]">
                                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                                    {item.productName}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold text-slate-300">
                                    {item.deliveredQty}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/50">
                                    {item.returnedGoodQty}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold text-amber-700 bg-amber-50/50">
                                    {item.damagedQty || 0}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold text-rose-700 bg-rose-50/50">
                                    {item.missingQty || 0}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500 italic">
                                    {item.notes || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Report Footer Notes */}
                        <div className="bg-[#12172b] text-slate-100 p-3.5 rounded-2xl border border-[#1e2642] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-300">Notas de Recogida: </span>
                            <span className="text-slate-600">{report.notes}</span>
                          </div>

                          {report.missingCount > 0 && (
                            <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Faltantes reportados: {report.missingCount} piezas</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#12172b] text-slate-100 p-4 rounded-2xl border border-[#1e2642] text-xs text-slate-500">
                        {order.status === 'cancelado'
                          ? `Pedido cancelado. Motivo: ${order.cancellationReason || 'No especificado'}`
                          : 'Este pedido aún no cuenta con acta de recogida formal.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
