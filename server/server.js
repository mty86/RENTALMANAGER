import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const INITIAL_DATA_PATH = path.join(__dirname, 'data', 'initialData.json');

// Initialize database if it doesn't exist
function initDB() {
  if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialData = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8');
    fs.writeFileSync(DB_PATH, initialData, 'utf-8');
  }
}

initDB();

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    let modified = false;
    if (!parsed.customers) {
      try {
        const init = JSON.parse(fs.readFileSync(INITIAL_DATA_PATH, 'utf-8'));
        parsed.customers = init.customers || [];
      } catch (e) {
        parsed.customers = [];
      }
      modified = true;
    }
    if (!parsed.employees) {
      try {
        const init = JSON.parse(fs.readFileSync(INITIAL_DATA_PATH, 'utf-8'));
        parsed.employees = init.employees || [];
      } catch (e) {
        parsed.employees = [];
      }
      modified = true;
    }
    if (modified) {
      writeDB(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB:', err);
    return { baseLocation: {}, products: [], orders: [], customers: [], employees: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// ==================== ROUTES ====================

// Base / Warehouse info
app.get('/api/base', (req, res) => {
  const db = readDB();
  res.json(db.baseLocation || {});
});

app.put('/api/base', (req, res) => {
  const db = readDB();
  db.baseLocation = { ...db.baseLocation, ...req.body };
  writeDB(db);
  res.json(db.baseLocation);
});

// Products
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products || []);
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  const { name, category, price, totalStock, description, imageUrl } = req.body;

  if (!name || totalStock == null) {
    return res.status(400).json({ error: 'Nombre y stock total son requeridos.' });
  }

  const newProduct = {
    id: 'prod-' + Date.now(),
    name: name.trim(),
    category: category || 'General',
    price: Number(price || 0),
    totalStock: Number(totalStock),
    availableStock: Number(totalStock),
    description: description ? description.trim() : '',
    imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
  };

  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const existing = db.products[index];
  const updatedTotalStock = req.body.totalStock != null ? Number(req.body.totalStock) : existing.totalStock;
  const stockDiff = updatedTotalStock - existing.totalStock;
  const updatedAvailableStock = Math.max(0, existing.availableStock + stockDiff);

  const updatedProduct = {
    ...existing,
    ...req.body,
    totalStock: updatedTotalStock,
    availableStock: req.body.availableStock != null ? Number(req.body.availableStock) : updatedAvailableStock,
  };

  db.products[index] = updatedProduct;
  writeDB(db);
  res.json(updatedProduct);
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.filter((p) => p.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Producto eliminado correctamente' });
});

// Orders
app.get('/api/orders', (req, res) => {
  const db = readDB();
  const now = Date.now();
  const orders = (db.orders || []).map((o) => {
    let isOverduePickup = false;
    let hoursSinceDelivery = 0;
    if (o.status === 'entregado' || o.status === 'con_incidencias') {
      const deliveredTime = o.deliveredAt
        ? new Date(o.deliveredAt).getTime()
        : o.createdAt
        ? new Date(o.createdAt).getTime()
        : null;
      if (deliveredTime) {
        hoursSinceDelivery = Math.max(0, Math.floor((now - deliveredTime) / (1000 * 60 * 60)));
        isOverduePickup = hoursSinceDelivery >= 24;
      }
    }
    return {
      ...o,
      isOverduePickup,
      hoursSinceDelivery,
    };
  });
  res.json(orders);
});

// Simulate >24 hours overdue for pickup
app.post('/api/orders/:id/simulate-24h', (req, res) => {
  const db = readDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'entregado';
  order.deliveredAt = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
  order.deliveredBy = order.deliveredBy || 'Repartidor';
  writeDB(db);
  res.json({ message: 'Simulado: pedido entregado hace 26 horas', order });
});

// Create order (Client)
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const { customer, items, eventDate, returnDate, notes } = req.body;

  if (!customer || !customer.name || !customer.phone || !customer.address || !customer.location) {
    return res.status(400).json({ error: 'Faltan datos de contacto o ubicación del cliente.' });
  }

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Debes seleccionar al menos un producto.' });
  }

  // Check stock availability
  for (const item of items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Producto no encontrado: ${item.productName || item.productId}` });
    }
    if (item.quantity > product.availableStock) {
      return res.status(400).json({
        error: `No hay suficiente stock para "${product.name}". Solicitado: ${item.quantity}, Disponible: ${product.availableStock}`,
      });
    }
  }

  const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

  const newOrder = {
    id: orderId,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      reference: customer.reference ? customer.reference.trim() : '',
      location: {
        lat: Number(customer.location.lat),
        lng: Number(customer.location.lng),
      },
    },
    items: items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      quantity: Number(i.quantity),
      priceUnit: 0,
      subtotal: 0,
    })),
    totalAmount: 0,
    eventDate: eventDate || new Date().toISOString(),
    returnDate: returnDate || new Date().toISOString(),
    notes: notes ? notes.trim() : '',
    status: 'pendiente', // 'pendiente' -> 'aceptado' -> 'entregado' -> 'por_recoger' -> 'completado'
    createdAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

// Accept order (Employee)
app.post('/api/orders/:id/accept', (req, res) => {
  const db = readDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  if (order.status !== 'pendiente') {
    return res.status(400).json({ error: `No se puede aceptar un pedido con estado: ${order.status}` });
  }

  // Deduct available stock
  for (const item of order.items) {
    const prod = db.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.availableStock = Math.max(0, prod.availableStock - item.quantity);
    }
  }

  order.status = 'aceptado';
  order.acceptedAt = new Date().toISOString();
  order.acceptedBy = req.body.employeeName || 'Personal de Operaciones';

  writeDB(db);
  res.json({ message: 'Pedido aceptado con éxito', order });
});

// Mark as delivered / en camino (Employee)
app.post('/api/orders/:id/deliver', (req, res) => {
  const db = readDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'entregado';
  order.deliveredAt = new Date().toISOString();
  order.deliveredBy = req.body.employeeName || 'Repartidor';

  writeDB(db);
  res.json({ message: 'Mobiliario marcado como entregado al cliente', order });
});

// Reject / Cancel order
app.post('/api/orders/:id/cancel', (req, res) => {
  const db = readDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  // If order was already accepted, restore stock
  if (['aceptado', 'en_camino', 'entregado'].includes(order.status)) {
    for (const item of order.items) {
      const prod = db.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.availableStock = Math.min(prod.totalStock, prod.availableStock + item.quantity);
      }
    }
  }

  order.status = 'cancelado';
  order.cancelledAt = new Date().toISOString();
  order.cancellationReason = req.body.reason || 'Rechazado por logística';
  order.notifiedViaWhatsApp = Boolean(req.body.notifiedViaWhatsApp);

  writeDB(db);
  res.json({ message: 'Pedido cancelado', order });
});

// Delete order (Superadmin)
app.delete('/api/orders/:id', (req, res) => {
  const db = readDB();
  db.orders = (db.orders || []).filter((o) => o.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Pedido eliminado correctamente' });
});

// Strict Pickup Verification Form ("Recoger mobiliario")
// Requisito del usuario:
// "AL RECOGER EL MOBILIARIO DEBERA DE PONER RECOGER Y DESPUES QUE AGREGUE CUANTAS RECOGIDO
// DE CADA PRODUCTO PARA VERIFICAR SI ESTAN COMPLETAS Y EN BUENAS CONDICIONES SI NO ESTAN
// COMPLEETAS NO SE DEJARA MARCAR COMO COMPLETADO GUARDA UN HISTORIAL"
app.post('/api/orders/:id/pickup-verify', (req, res) => {
  const db = readDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  const { itemsVerification, inspectedBy, notes, forceResolution } = req.body;

  if (!itemsVerification || !Array.isArray(itemsVerification)) {
    return res.status(400).json({ error: 'Se requiere la lista de verificación de mobiliario' });
  }

  let totalMissing = 0;
  let totalDamaged = 0;
  const verifiedItems = [];

  for (const originalItem of order.items) {
    const input = itemsVerification.find((v) => v.productId === originalItem.productId) || {};
    const deliveredQty = originalItem.quantity;
    const returnedQty = Math.max(0, Number(input.returnedGoodQty || 0));
    const damagedQty = Math.max(0, Number(input.damagedQty || 0));
    const itemNotes = input.notes ? input.notes.trim() : '';

    const accountedQty = returnedQty + damagedQty;
    const missingQty = Math.max(0, deliveredQty - accountedQty);

    totalMissing += missingQty;
    totalDamaged += damagedQty;

    verifiedItems.push({
      productId: originalItem.productId,
      productName: originalItem.productName,
      deliveredQty,
      returnedGoodQty: returnedQty,
      damagedQty,
      missingQty,
      notes: itemNotes,
    });
  }

  const isFullyComplete = totalMissing === 0;

  // STRICT RULE: If not complete and not explicitly resolved with penalty/settlement,
  // DO NOT ALLOW marking as completed!
  if (!isFullyComplete && !forceResolution) {
    // Save inspection progress as 'con_incidencias' / 'por_recoger'
    order.status = 'con_incidencias';
    order.pickupReport = {
      inspectedAt: new Date().toISOString(),
      inspectedBy: inspectedBy || 'Personal de Recogida',
      itemsStatus: verifiedItems,
      isComplete: false,
      totalMissing,
      totalDamaged,
      notes: notes || 'Mobiliario incompleto. Faltan artículos por entregar.',
    };

    writeDB(db);

    return res.status(422).json({
      error: 'MOBILIARIO INCOMPLETO: No se puede marcar como completado porque faltan artículos.',
      canComplete: false,
      totalMissing,
      totalDamaged,
      order,
    });
  }

  // If complete (or forced resolution by admin with payment/settlement):
  order.status = 'completado';
  order.completedAt = new Date().toISOString();
  order.pickupReport = {
    inspectedAt: new Date().toISOString(),
    inspectedBy: inspectedBy || 'Personal de Recogida',
    itemsStatus: verifiedItems,
    isComplete: isFullyComplete,
    totalMissing,
    totalDamaged,
    settledWithPayment: forceResolution ? true : false,
    penaltyAmount: req.body.penaltyAmount ? Number(req.body.penaltyAmount) : 0,
    notes: notes || (isFullyComplete ? 'Todo el mobiliario recibido completo y verificado.' : 'Completado con reposición pagada por el cliente.'),
  };

  // Reintegrate returned items back into stock
  for (const item of verifiedItems) {
    const prod = db.products.find((p) => p.id === item.productId);
    if (prod) {
      // Good condition returned items are available again
      prod.availableStock = Math.min(prod.totalStock, prod.availableStock + item.returnedGoodQty);
      // Damaged items might need repair or reduction of total stock
      if (item.damagedQty > 0) {
        prod.totalStock = Math.max(0, prod.totalStock - item.damagedQty);
      }
    }
  }

  writeDB(db);

  res.json({
    message: isFullyComplete
      ? '¡Recogida exitosa! Todo el mobiliario está completo y el pedido ha sido guardado en el historial como Completado.'
      : 'Pedido cerrado con resolución de faltantes/daños y archivado en el historial.',
    canComplete: true,
    order,
  });
});

// ==================== CUSTOMERS ROUTES ====================
app.get('/api/customers', (req, res) => {
  const db = readDB();
  res.json(db.customers || []);
});

app.post('/api/customers', (req, res) => {
  const db = readDB();
  const { name, phone, address, location, reference, notes, registeredBy } = req.body;

  if (!name || !phone || !address || !location || location.lat == null || location.lng == null) {
    return res.status(400).json({ error: 'Nombre, celular, dirección y puntero en mapa son requeridos.' });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const existing = (db.customers || []).find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);

  const newCustomer = {
    id: existing ? existing.id : 'cust-' + Date.now(),
    name: name.trim(),
    phone: phone.trim(),
    address: address.trim(),
    reference: reference ? reference.trim() : '',
    notes: notes ? notes.trim() : '',
    location: {
      lat: Number(location.lat),
      lng: Number(location.lng),
    },
    registeredBy: registeredBy || 'Empleado',
    updatedAt: new Date().toISOString(),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };

  db.customers = db.customers || [];
  if (existing) {
    const idx = db.customers.findIndex((c) => c.id === existing.id);
    db.customers[idx] = newCustomer;
  } else {
    db.customers.unshift(newCustomer);
  }

  writeDB(db);
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const db = readDB();
  db.customers = db.customers || [];
  const index = db.customers.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const existing = db.customers[index];
  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  if (req.body.location) {
    updated.location = {
      lat: Number(req.body.location.lat),
      lng: Number(req.body.location.lng),
    };
  }

  db.customers[index] = updated;
  writeDB(db);
  res.json(updated);
});

app.delete('/api/customers/:id', (req, res) => {
  const db = readDB();
  db.customers = (db.customers || []).filter((c) => c.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Cliente eliminado correctamente' });
});

// ==================== EMPLOYEES ROUTES ====================
app.get('/api/employees', (req, res) => {
  const db = readDB();
  res.json(db.employees || []);
});

app.post('/api/employees', (req, res) => {
  const db = readDB();
  const { name, phone, email, role, status, licensePlate, assignedVehicle } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nombre y teléfono son obligatorios.' });
  }

  const newEmployee = {
    id: 'emp-' + Date.now(),
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : '',
    role: role || 'Personal Operativo',
    status: status || 'activo',
    licensePlate: licensePlate ? licensePlate.trim() : '',
    assignedVehicle: assignedVehicle ? assignedVehicle.trim() : '',
    createdAt: new Date().toISOString(),
  };

  db.employees = db.employees || [];
  db.employees.push(newEmployee);
  writeDB(db);
  res.status(201).json(newEmployee);
});

app.put('/api/employees/:id', (req, res) => {
  const db = readDB();
  db.employees = db.employees || [];
  const index = db.employees.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  db.employees[index] = {
    ...db.employees[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  writeDB(db);
  res.json(db.employees[index]);
});

app.delete('/api/employees/:id', (req, res) => {
  const db = readDB();
  db.employees = (db.employees || []).filter((e) => e.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Empleado eliminado correctamente' });
});

// Restore / reset demo data endpoint
app.post('/api/reset-demo', (req, res) => {
  const initialData = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8');
  fs.writeFileSync(DB_PATH, initialData, 'utf-8');
  res.json({ message: 'Datos de demostración reiniciados con éxito' });
});

app.listen(PORT, () => {
  console.log(`Servidor de Alquiladora activo en http://localhost:${PORT}`);
});
