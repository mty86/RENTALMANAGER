import React, { useState } from 'react';
import {
  Plus,
  Package,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';

export default function EmployeeInventory({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields for new / edited product
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mesas');
  const [totalStock, setTotalStock] = useState('');
  const [description, setDescription] = useState('');

  const categories = ['Todas', 'Mesas', 'Sillas', 'Manteles', 'Toldos y Carpas', 'Accesorios', 'Vajilla y Cristalería'];

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Mesas');
    setTotalStock('');
    setDescription('');
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setTotalStock(product.totalStock);
    setDescription(product.description);
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('El nombre del producto es obligatorio.');
      return;
    }
    if (!totalStock || Number(totalStock) < 0) {
      setErrorMessage('Ingresa una cantidad de stock válida.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        price: 0,
        totalStock: Number(totalStock),
        description: description.trim(),
        imageUrl: '',
      };

      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, payload);
      } else {
        await onCreateProduct(payload);
      }
      setIsAddModalOpen(false);
    } catch (err) {
      setErrorMessage(err.message || 'Error al guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, prodName) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${prodName}"?`)) {
      try {
        await onDeleteProduct(id);
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    filterCategory === 'Todas' ? true : p.category === filterCategory
  );

  const totalInventoryUnits = products.reduce((sum, p) => sum + p.totalStock, 0);
  const totalAvailableUnits = products.reduce((sum, p) => sum + p.availableStock, 0);
  const totalRentedUnits = totalInventoryUnits - totalAvailableUnits;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2642] pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Control de Inventario y Mobiliario</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Agrega nuevos productos al catálogo y supervisa el stock disponible y rentado.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-glow-pink transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Producto</span>
        </button>
      </div>

      {/* Inventory KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#12172b] border border-[#1e2642] rounded-3xl p-4 shadow-xl flex items-center gap-3.5 text-white">
          <div className="w-11 h-11 rounded-2xl bg-neon-pink/15 border border-neon-pink/40 flex items-center justify-center text-neon-pink shadow-glow-pink">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Stock Total Propio</div>
            <div className="text-xl font-black text-white">{totalInventoryUnits} unidades</div>
            <div className="text-[10px] text-slate-400">{products.length} tipos de productos</div>
          </div>
        </div>

        <div className="bg-[#12172b] border border-[#1e2642] rounded-3xl p-4 shadow-xl flex items-center gap-3.5 text-white">
          <div className="w-11 h-11 rounded-2xl bg-neon-cyan/15 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan shadow-glow-cyan">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-emerald-300 font-semibold uppercase">Disponible en Almacén</div>
            <div className="text-xl font-black text-emerald-300">{totalAvailableUnits} unidades</div>
            <div className="text-[10px] text-slate-400">Listos para rentar</div>
          </div>
        </div>

        <div className="bg-[#12172b] border border-[#1e2642] rounded-3xl p-4 shadow-xl flex items-center gap-3.5 text-white">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-amber-300 font-semibold uppercase">En Eventos / Rentado</div>
            <div className="text-xl font-black text-amber-300">{totalRentedUnits} unidades</div>
            <div className="text-[10px] text-slate-400">Pendientes de recolección</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50 shadow-glow-pink'
                : 'bg-[#182038] text-slate-400 border border-[#242e50] hover:text-white hover:border-slate-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-[#12172b] rounded-3xl border border-[#1e2642] overflow-hidden shadow-xl text-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0e1324] border-b border-[#1e2642] text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Stock Disponible / Total</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b223c] text-xs">
              {filteredProducts.map((p) => {
                const rented = p.totalStock - p.availableStock;
                const percentage = p.totalStock > 0 ? (p.availableStock / p.totalStock) * 100 : 0;

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neon-pink/15 border border-neon-pink/40 flex items-center justify-center text-neon-pink shadow-glow-pink shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{p.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{p.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300">{p.category}</td>

                    <td className="py-3.5 px-4">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-neon-cyan">{p.availableStock} disp.</span>
                          <span className="text-slate-400">/ {p.totalStock} tot.</span>
                        </div>
                        <div className="w-full h-2 bg-[#1b223c] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-neon-cyan to-blue-500 rounded-full transition-all shadow-glow-cyan"
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                        {rented > 0 && (
                          <div className="text-[10px] text-slate-400 font-medium">
                            {rented} en renta activa
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {p.availableStock > 0 ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-300 border border-emerald-200 rounded-full text-[11px] font-semibold">
                          Disponible
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-full text-[11px] font-bold">
                          Sin Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add / Edit Product (Requirement: "EL OTRO PERFIL DE EMPLEADO PUEDE AGREGAR PRODUCTOS NUEVOS CON STOCK") */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#0e1324] text-white rounded-3xl shadow-2xl max-w-lg w-full border border-[#1e2642] overflow-hidden border border-[#1e2642]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto con Stock'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Mobiliario *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Mesa Periquera Alta de Bar"
                  className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Categoría *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Mesas">Mesas</option>
                  <option value="Sillas">Sillas</option>
                  <option value="Manteles">Manteles</option>
                  <option value="Toldos y Carpas">Toldos y Carpas</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Vajilla y Cristalería">Vajilla y Cristalería</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Stock Total Inicial (Unidades) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={totalStock}
                  onChange={(e) => setTotalStock(e.target.value)}
                  placeholder="Ej. 50"
                  className="w-full px-3.5 py-2.5 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción o especificaciones
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dimensiones, color, materiales y capacidad..."
                  className="w-full px-3.5 py-2 bg-[#182038] border border-[#242e50] text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#1e2642] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20"
                >
                  {isSubmitting ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
