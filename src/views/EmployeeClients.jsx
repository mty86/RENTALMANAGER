import React, { useState } from 'react';
import MapSelector from '../components/MapSelector';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  X
} from 'lucide-react';

export default function EmployeeClients({
  customers = [],
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onSelectCustomerForOrder, // optional callback to start order with this client
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedMapPreview, setSelectedMapPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState({ lat: 19.3732, lng: -99.1788 });

  const openCreateModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setAddress('');
    setReference('');
    setNotes('');
    setLocation({ lat: 19.3732, lng: -99.1788 });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setName(cust.name || '');
    setPhone(cust.phone || '');
    setAddress(cust.address || '');
    setReference(cust.reference || '');
    setNotes(cust.notes || '');
    setLocation(cust.location || { lat: 19.3732, lng: -99.1788 });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleLocationChange = ({ location: newLoc, address: newAddr }) => {
    setLocation(newLoc);
    if (!address || address.trim() === '') {
      setAddress(newAddr);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre del cliente.');
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      setFormError('Por favor ingresa un número de celular válido.');
      return;
    }
    if (!address.trim()) {
      setFormError('Por favor ingresa la dirección del domicilio.');
      return;
    }
    if (!location || location.lat == null) {
      setFormError('Por favor fija el puntero en el mapa para registrar la ubicación exacta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        reference: reference.trim(),
        notes: notes.trim(),
        location: {
          lat: Number(location.lat),
          lng: Number(location.lng),
        },
      };

      if (editingCustomer) {
        await onUpdateCustomer(editingCustomer.id, payload);
      } else {
        await onCreateCustomer(payload);
      }

      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Error al guardar los datos del cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cust) => {
    if (confirm(`¿Estás seguro de eliminar al cliente "${cust.name}"?`)) {
      try {
        await onDeleteCustomer(cust.id);
      } catch (err) {
        alert(err.message || 'Error al eliminar cliente');
      }
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.address || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2642] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <h2 className="text-xl font-black text-white">Directorio y Registro de Clientes</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registra nuevos clientes con celular, nombre, dirección y fijación exacta con puntero en el mapa.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Search bar */}
          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder="Buscar por nombre, celular..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#12172b] border border-[#1e2642] rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* New Client Button */}
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shadow-teal-600/20 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Cliente</span>
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-[#12172b] rounded-3xl border border-[#1e2642] text-slate-100">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-base font-bold text-slate-200">No hay clientes registrados</p>
          <p className="text-xs text-slate-400 mt-1">
            Usa el botón "Registrar Cliente" para dar de alta al primer contacto.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            + Registrar Nuevo Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((customer) => {
            const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(
              customer.name
            )},%20le%20contactamos%20de%20Rental%20Manager.`;

            return (
              <div
                key={customer.id}
                className="bg-[#12172b] rounded-3xl border border-[#1e2642] p-5 shadow-xl hover:border-neon-pink/50 transition-all flex flex-col justify-between space-y-4 text-slate-100"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white">{customer.name}</h3>
                      <div className="flex items-center gap-3 text-xs mt-0.5">
                        <a
                          href={`tel:${customer.phone}`}
                          className="flex items-center gap-1 text-teal-700 font-semibold hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{customer.phone}</span>
                        </a>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar datos del cliente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Address & Pinned Map Coordinates */}
                  <div className="bg-[#182038] border border-[#242e50] rounded-2xl p-3 text-slate-200 text-xs space-y-2">
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="font-medium line-clamp-2">{customer.address}</span>
                    </div>

                    {customer.reference && (
                      <p className="text-[11px] text-slate-500 pl-6">
                        <strong>Ref:</strong> {customer.reference}
                      </p>
                    )}

                    {customer.location && (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#1e2642]/60 pl-6">
                        <span className="font-mono text-slate-500">
                          GPS: {Number(customer.location.lat).toFixed(4)}, {Number(customer.location.lng).toFixed(4)}
                        </span>
                        <button
                          onClick={() => setSelectedMapPreview(customer)}
                          className="text-teal-700 font-bold hover:underline flex items-center gap-0.5"
                        >
                          <span>Ver en mapa</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {customer.notes && (
                    <p className="text-xs text-slate-600 bg-amber-50/60 border border-amber-200 rounded-xl p-2">
                      <strong>Nota:</strong> {customer.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-2 border-t border-[#1e2642] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    Reg: {new Date(customer.createdAt || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mensaje</span>
                    </a>

                    <a
                      href={`tel:${customer.phone}`}
                      className="px-3 py-1.5 bg-[#182038] hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 text-neon-cyan" />
                      <span>Llamar</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REGISTRATION / EDIT CLIENT MODAL (With Interactive Map Pin Selector) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#12172b] rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#242e50] max-h-[92vh] flex flex-col text-white">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  {editingCustomer ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente con Puntero en Mapa'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombre Completo del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. María Fernanda Gómez"
                    className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Número de Celular / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 55 4123 7890"
                    className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* CORE REQUIREMENT: PUNTERO EN MAPA PARA EXACTITUD */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-[#1e2642]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>Ubicación Exacta con Puntero en Mapa *</span>
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold">
                    Arrastra el pin al portón o acceso del cliente
                  </span>
                </div>

                <MapSelector
                  initialLocation={location}
                  initialAddress={address}
                  onLocationChange={handleLocationChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Dirección Completa (Calle, Número, Colonia, Municipio) *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle y número exterior..."
                    className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* References */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Referencias del Domicilio (Fachada, Portón, etc.)
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ej. Portón negro de 2 hojas, frente a parque"
                    className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Notas Adicionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Información sobre accesos, días hábiles, persona de contacto alternativa..."
                  className="w-full px-3.5 py-2 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#1e2642] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando...' : editingCustomer ? 'Actualizar Cliente' : 'Guardar Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK MAP PREVIEW MODAL */}
      {selectedMapPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#0e1324] text-white rounded-3xl shadow-2xl max-w-2xl w-full border border-[#1e2642] overflow-hidden border border-[#1e2642] flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <h4 className="text-sm font-bold text-white">
                  Ubicación de {selectedMapPreview.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedMapPreview(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="h-64 rounded-2xl overflow-hidden border border-[#1e2642]">
                <iframe
                  title="Ubicación Cliente"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    Number(selectedMapPreview.location?.lng) - 0.005
                  }%2C${Number(selectedMapPreview.location?.lat) - 0.005}%2C${
                    Number(selectedMapPreview.location?.lng) + 0.005
                  }%2C${
                    Number(selectedMapPreview.location?.lat) + 0.005
                  }&layer=mapnik&marker=${selectedMapPreview.location?.lat}%2C${
                    selectedMapPreview.location?.lng
                  }`}
                />
              </div>

              <div className="text-xs text-slate-300 bg-slate-50 p-3 rounded-xl space-y-1">
                <div className="font-bold text-white">{selectedMapPreview.address}</div>
                {selectedMapPreview.reference && (
                  <div className="text-slate-500">Ref: {selectedMapPreview.reference}</div>
                )}
                <div className="text-teal-700 font-mono text-[11px]">
                  Coordenadas: {selectedMapPreview.location?.lat}, {selectedMapPreview.location?.lng}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#1e2642] flex justify-end">
              <button
                onClick={() => setSelectedMapPreview(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
