import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Embedded initial dataset for fallback when Aiven is connecting or during local demo
let memoryDB = {
  "baseLocation": {
    "name": "Base Central Rental Manager",
    "address": "Av. Insurgentes Sur #1200, Col. Del Valle, Ciudad de México",
    "phone": "55 9876 5432",
    "lat": 19.3732,
    "lng": -99.1788
  },
  "products": [
    {
      "id": "prod-1",
      "name": "Mesa Redonda (10 Personas)",
      "category": "Mesas",
      "price": 120,
      "totalStock": 40,
      "availableStock": 35,
      "description": "Mesa redonda de fibra de vidrio de 1.50m de diámetro, ideal para banquetes de hasta 10 personas.",
      "imageUrl": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80"
    },
    {
      "id": "prod-2",
      "name": "Mesa Rectangular Tablón (8 Personas)",
      "category": "Mesas",
      "price": 95,
      "totalStock": 50,
      "availableStock": 50,
      "description": "Tablón plegable de polietileno de alta densidad de 2.40m x 0.75m para servicio o comensales.",
      "imageUrl": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80"
    },
    {
      "id": "prod-3",
      "name": "Silla Plegable Acojinada Negra",
      "category": "Sillas",
      "price": 18,
      "totalStock": 300,
      "availableStock": 250,
      "description": "Silla metálica reforzada con asiento y respaldo acojinado en vinil negro de alta resistencia.",
      "imageUrl": "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80"
    },
    {
      "id": "prod-4",
      "name": "Silla Tiffany Elegante Blanca",
      "category": "Sillas",
      "price": 38,
      "totalStock": 160,
      "availableStock": 160,
      "description": "Silla estilo Tiffany en resina monocasco blanca con cojín desmontable blanco para bodas y galas.",
      "imageUrl": "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=600&q=80"
    },
    {
      "id": "prod-5",
      "name": "Mantel Redondo Blanco Tergal",
      "category": "Manteles",
      "price": 45,
      "totalStock": 80,
      "availableStock": 75,
      "description": "Mantel liso de tergal stretch de 3m de caída para mesa redonda de 10 personas, limpio y planchado.",
      "imageUrl": "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=600&q=80"
    },
    {
      "id": "prod-6",
      "name": "Cubremantel / Camino de Mesa Dorado",
      "category": "Manteles",
      "price": 25,
      "totalStock": 70,
      "availableStock": 70,
      "description": "Cubremantel en tela tafetán brillante color oro de 1.50m x 1.50m para contraste decorativo.",
      "imageUrl": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80"
    },
    {
      "id": "prod-7",
      "name": "Carpa Plegable 6x3m Impermeable",
      "category": "Toldos y Carpas",
      "price": 450,
      "totalStock": 12,
      "availableStock": 12,
      "description": "Toldo carpa de estructura de acero reforzado con lona impermeable blanca, protección UV.",
      "imageUrl": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80"
    },
    {
      "id": "prod-8",
      "name": "Calentador de Patio Tipo Hongo",
      "category": "Accesorios",
      "price": 350,
      "totalStock": 8,
      "availableStock": 8,
      "description": "Calefactor a gas para exteriores en acero inoxidable con tanque de gas LP incluido.",
      "imageUrl": "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80"
    }
  ],
  "orders": [
    {
      "id": "ORD-101",
      "customer": {
        "name": "María Fernanda Gómez",
        "phone": "55 4123 7890",
        "address": "Calle Río Mixcoac #145, Col. Florida, Álvaro Obregón",
        "reference": "Casa de 2 pisos con cancel negro y timbre dorado",
        "location": {
          "lat": 19.3598,
          "lng": -99.1834
        }
      },
      "items": [
        {
          "productId": "prod-1",
          "productName": "Mesa Redonda (10 Personas)",
          "quantity": 5,
          "priceUnit": 120,
          "subtotal": 600
        },
        {
          "productId": "prod-3",
          "productName": "Silla Plegable Acojinada Negra",
          "quantity": 50,
          "priceUnit": 18,
          "subtotal": 900
        },
        {
          "productId": "prod-5",
          "productName": "Mantel Redondo Blanco Tergal",
          "quantity": 5,
          "priceUnit": 45,
          "subtotal": 225
        }
      ],
      "totalAmount": 1725,
      "eventDate": "2026-09-12T15:00",
      "returnDate": "2026-09-13T12:00",
      "notes": "Favor de entregar el sábado a las 11:00 AM para preparar montaje.",
      "status": "pendiente",
      "createdAt": "2026-09-08T14:30:00.000Z"
    },
    {
      "id": "ORD-100",
      "customer": {
        "name": "Roberto Soto Aguilar",
        "phone": "55 8899 2211",
        "address": "Av. Universidad #820, Santa Cruz Atoyac, Benito Juárez",
        "reference": "Edificio Residencial Torre B, acceso por caseta",
        "location": {
          "lat": 19.3789,
          "lng": -99.1622
        }
      },
      "items": [
        {
          "productId": "prod-4",
          "productName": "Silla Tiffany Elegante Blanca",
          "quantity": 20,
          "priceUnit": 38,
          "subtotal": 760
        }
      ],
      "totalAmount": 760,
      "eventDate": "2026-09-06T19:00",
      "returnDate": "2026-09-07T10:00",
      "notes": "Evento en el salón comunal.",
      "status": "completado",
      "createdAt": "2026-09-05T10:00:00.000Z",
      "acceptedAt": "2026-09-05T11:15:00.000Z",
      "deliveredAt": "2026-09-06T16:00:00.000Z",
      "pickupReport": {
        "inspectedAt": "2026-09-07T11:30:00.000Z",
        "inspectedBy": "Carlos M. (Logística)",
        "itemsStatus": [
          {
            "productId": "prod-4",
            "productName": "Silla Tiffany Elegante Blanca",
            "deliveredQty": 20,
            "returnedQty": 20,
            "damagedQty": 0,
            "missingQty": 0,
            "notes": "Todo recibido en óptimas condiciones y limpio."
          }
        ],
        "isComplete": true,
        "penaltyFee": 0,
        "notes": "Recogida exitosa a tiempo."
      }
    }
  ],
  "customers": [
    {
      "id": "cust-1",
      "name": "María Fernanda Gómez",
      "phone": "5541237890",
      "address": "Calle Río Mixcoac #145, Col. Florida, Álvaro Obregón",
      "reference": "Casa de 2 pisos con cancel negro y timbre dorado",
      "location": {
        "lat": 19.3598,
        "lng": -99.1834
      },
      "registeredBy": "Personal de Logística",
      "createdAt": "2026-09-01T10:00:00.000Z"
    },
    {
      "id": "cust-2",
      "name": "Roberto Soto Aguilar",
      "phone": "5588992211",
      "address": "Av. Universidad #820, Santa Cruz Atoyac, Benito Juárez",
      "reference": "Edificio Residencial Torre B, acceso por caseta",
      "location": {
        "lat": 19.3789,
        "lng": -99.1622
      },
      "registeredBy": "Personal de Logística",
      "createdAt": "2026-09-02T11:20:00.000Z"
    },
    {
      "id": "cust-3",
      "name": "Andrea Morales Castillo",
      "phone": "5523456789",
      "address": "Av. División del Norte #2430, Portales Sur, Benito Juárez",
      "reference": "Jardín de eventos La Pérgola, portón verde",
      "location": {
        "lat": 19.3621,
        "lng": -99.1554
      },
      "registeredBy": "Empleado Mostrador",
      "createdAt": "2026-09-05T09:15:00.000Z"
    }
  ],
  "employees": [
    {
      "id": "emp-1",
      "name": "Carlos Méndez Juárez",
      "phone": "5591234567",
      "email": "carlos.mendez@rentalmanager.com",
      "role": "Chofer y Repartidor",
      "status": "activo",
      "licensePlate": "NLK-892-A",
      "assignedVehicle": "Camioneta Ford Transit 2023",
      "createdAt": "2026-08-15T08:00:00.000Z"
    },
    {
      "id": "emp-2",
      "name": "Laura Morales Trejo",
      "phone": "5598761234",
      "email": "laura.morales@rentalmanager.com",
      "role": "Encargada de Logística y Pedidos",
      "status": "activo",
      "createdAt": "2026-08-10T08:30:00.000Z"
    },
    {
      "id": "emp-3",
      "name": "Miguel Ángel Rivas",
      "phone": "5595557788",
      "email": "miguel.rivas@rentalmanager.com",
      "role": "Auditor y Control de Almacén",
      "status": "activo",
      "createdAt": "2026-08-20T09:00:00.000Z"
    }
  ]
};

// ==========================================
// AIVEN MYSQL CONNECTION POOL
// ==========================================
let pool = null;
let aivenAvailable = false;

function getAivenPool() {
  if (pool) return pool;

  const dbUrl = process.env.AIVEN_DATABASE_URL || process.env.DATABASE_URL || process.env.MYSQL_URL;

  try {
    if (dbUrl) {
      console.log('Connecting to Aiven MySQL via connection URL...');
      pool = mysql.createPool({
        uri: dbUrl,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      aivenAvailable = true;
      return pool;
    }

    const host = process.env.MYSQL_HOST || process.env.AIVEN_HOST;
    if (host) {
      console.log('Connecting to Aiven MySQL via environment parameters...');
      pool = mysql.createPool({
        host,
        port: Number(process.env.MYSQL_PORT || process.env.AIVEN_PORT || 3306),
        user: process.env.MYSQL_USER || process.env.AIVEN_USER || 'avnadmin',
        password: process.env.MYSQL_PASSWORD || process.env.AIVEN_PASSWORD,
        database: process.env.MYSQL_DATABASE || process.env.AIVEN_DATABASE || 'defaultdb',
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      aivenAvailable = true;
      return pool;
    }
  } catch (err) {
    console.warn('Aiven pool initialization failed, using fallback database:', err.message);
    aivenAvailable = false;
  }

  return null;
}

// Initialize tables in Aiven MySQL if connected
async function ensureAivenTables(p) {
  if (!p) return;
  try {
    const conn = await p.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS productos (
          id VARCHAR(100) PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL,
          categoria VARCHAR(100) NOT NULL DEFAULT 'General',
          precio DECIMAL(10,2) NOT NULL DEFAULT 0,
          stock_total INT NOT NULL DEFAULT 0,
          stock_disponible INT NOT NULL DEFAULT 0,
          descripcion TEXT,
          imagen_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Check if products are empty, insert defaults if so
      const [rows] = await conn.query('SELECT COUNT(*) as count FROM productos');
      if (rows[0].count === 0 && memoryDB.products && memoryDB.products.length > 0) {
        for (const prod of memoryDB.products) {
          await conn.query(
            'INSERT INTO productos (id, nombre, categoria, precio, stock_total, stock_disponible, descripcion, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [prod.id, prod.name, prod.category, prod.price, prod.totalStock, prod.availableStock, prod.description || '', prod.imageUrl || '']
          );
        }
      }
    } finally {
      conn.release();
    }
  } catch (e) {
    console.warn('Could not auto-create Aiven tables, will use memory fallback if needed:', e.message);
  }
}

// Ensure tables on first boot if Aiven pool available
const initialPool = getAivenPool();
if (initialPool) {
  ensureAivenTables(initialPool).catch(() => {});
}

// ==========================================
// API ROUTES (Handles both /api/... and /...)
// ==========================================

// Health / Status endpoint
app.get(['/api', '/api/status', '/api/health', '/', '/status'], async (req, res) => {
  const p = getAivenPool();
  let aivenConnected = false;
  if (p) {
    try {
      const [r] = await p.query('SELECT 1 as connected');
      aivenConnected = r && r[0] && r[0].connected === 1;
    } catch (e) {
      aivenConnected = false;
    }
  }

  res.json({
    status: 'ok',
    system: 'Rental Manager Pro Serverless API',
    aiven: aivenConnected ? 'Connected (Aiven MySQL)' : (p ? 'Aiven Configured (Testing Connection)' : 'Memory/JSON Fallback (Configure AIVEN_DATABASE_URL on Vercel)'),
    timestamp: new Date().toISOString()
  });
});

// Products: GET
app.get(['/api/products', '/products'], async (req, res) => {
  const p = getAivenPool();
  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM productos ORDER BY id ASC');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r) => ({
          id: r.id,
          name: r.nombre,
          category: r.categoria,
          price: Number(r.precio),
          totalStock: Number(r.stock_total),
          availableStock: Number(r.stock_disponible),
          description: r.descripcion,
          imageUrl: r.imagen_url
        }));
        return res.json(mapped);
      }
    } catch (err) {
      console.warn('Error querying Aiven products, falling back to memory:', err.message);
    }
  }

  res.json(memoryDB.products || []);
});

// Products: POST
app.post(['/api/products', '/products'], async (req, res) => {
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

  const p = getAivenPool();
  if (p) {
    try {
      await p.query(
        'INSERT INTO productos (id, nombre, categoria, precio, stock_total, stock_disponible, descripcion, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newProduct.id, newProduct.name, newProduct.category, newProduct.price, newProduct.totalStock, newProduct.availableStock, newProduct.description, newProduct.imageUrl]
      );
    } catch (e) {
      console.warn('Error inserting into Aiven:', e.message);
    }
  }

  memoryDB.products.push(newProduct);
  res.status(201).json(newProduct);
});

// Products: PUT
app.put(['/api/products/:id', '/products/:id'], async (req, res) => {
  const id = req.params.id;
  const p = getAivenPool();
  const index = memoryDB.products.findIndex((p) => p.id === id);

  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM productos WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const existing = rows[0];
        const updatedTotal = req.body.totalStock != null ? Number(req.body.totalStock) : Number(existing.stock_total);
        const updatedAvail = req.body.availableStock != null ? Number(req.body.availableStock) : Number(existing.stock_disponible);
        const name = req.body.name || existing.nombre;
        const category = req.body.category || existing.categoria;
        const price = req.body.price != null ? Number(req.body.price) : Number(existing.precio);
        const description = req.body.description != null ? req.body.description : existing.descripcion;

        await p.query(
          'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock_total = ?, stock_disponible = ?, descripcion = ? WHERE id = ?',
          [name, category, price, updatedTotal, updatedAvail, description, id]
        );

        return res.json({
          id,
          name,
          category,
          price,
          totalStock: updatedTotal,
          availableStock: updatedAvail,
          description,
          imageUrl: existing.imagen_url
        });
      }
    } catch (e) {
      console.warn('Error updating Aiven product:', e.message);
    }
  }

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const existing = memoryDB.products[index];
  const updatedTotalStock = req.body.totalStock != null ? Number(req.body.totalStock) : existing.totalStock;
  const stockDiff = updatedTotalStock - existing.totalStock;
  const updatedAvailableStock = Math.max(0, existing.availableStock + stockDiff);

  const updatedProduct = {
    ...existing,
    ...req.body,
    totalStock: updatedTotalStock,
    availableStock: req.body.availableStock != null ? Number(req.body.availableStock) : updatedAvailableStock,
  };

  memoryDB.products[index] = updatedProduct;
  res.json(updatedProduct);
});

// Products: DELETE
app.delete(['/api/products/:id', '/products/:id'], async (req, res) => {
  const id = req.params.id;
  const p = getAivenPool();
  if (p) {
    try {
      await p.query('DELETE FROM productos WHERE id = ?', [id]);
    } catch (e) {
      console.warn('Error deleting product from Aiven:', e.message);
    }
  }

  memoryDB.products = memoryDB.products.filter((prod) => prod.id !== id);
  res.json({ success: true, message: 'Producto eliminado' });
});

// Orders: GET
app.get(['/api/orders', '/orders'], async (req, res) => {
  const now = Date.now();
  const orders = (memoryDB.orders || []).map((o) => {
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

// Orders: POST
app.post(['/api/orders', '/orders'], (req, res) => {
  const { customer, items, eventDate, returnDate, notes } = req.body;
  if (!customer || !customer.name || !customer.phone || !customer.address || !customer.location) {
    return res.status(400).json({ error: 'Faltan datos de contacto o ubicación del cliente.' });
  }
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Debes seleccionar al menos un producto.' });
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
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  };

  memoryDB.orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// Orders: Accept
app.put(['/api/orders/:id/accept', '/orders/:id/accept'], (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'aceptado';
  order.acceptedAt = new Date().toISOString();
  order.acceptedBy = req.body.employeeName || 'Empleado';

  // Deduct available stock
  for (const item of order.items) {
    const product = memoryDB.products.find((p) => p.id === item.productId);
    if (product) {
      product.availableStock = Math.max(0, product.availableStock - item.quantity);
    }
  }

  res.json(order);
});

// Orders: Deliver
app.put(['/api/orders/:id/deliver', '/orders/:id/deliver'], (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'entregado';
  order.deliveredAt = new Date().toISOString();
  order.deliveredBy = req.body.deliveredBy || 'Chofer/Repartidor';
  res.json(order);
});

// Orders: Cancel
app.put(['/api/orders/:id/cancel', '/orders/:id/cancel'], (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  // Return stock if was accepted
  if (['aceptado', 'en_camino'].includes(order.status)) {
    for (const item of order.items) {
      const product = memoryDB.products.find((p) => p.id === item.productId);
      if (product) {
        product.availableStock = Math.min(product.totalStock, product.availableStock + item.quantity);
      }
    }
  }

  order.status = 'cancelado';
  order.cancelledAt = new Date().toISOString();
  order.cancellationReason = req.body.reason || 'Cancelado por el administrador';
  res.json(order);
});

// Orders: Verify Pickup / Complete
app.put(['/api/orders/:id/pickup', '/orders/:id/pickup'], (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  const { itemsChecked, notes, hasIncidents } = req.body;
  order.status = hasIncidents ? 'con_incidencias' : 'completado';
  order.pickedUpAt = new Date().toISOString();
  order.pickupNotes = notes || '';
  order.pickupAudit = itemsChecked || [];

  // Return stock
  if (itemsChecked && Array.isArray(itemsChecked)) {
    for (const chk of itemsChecked) {
      const product = memoryDB.products.find((p) => p.id === chk.productId);
      if (product) {
        const returnedGood = Number(chk.quantityGood || 0);
        product.availableStock = Math.min(product.totalStock, product.availableStock + returnedGood);
      }
    }
  }

  res.json(order);
});

// Orders: Simulate 24h
app.post(['/api/orders/:id/simulate-24h', '/orders/:id/simulate-24h'], (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'entregado';
  order.deliveredAt = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
  order.isOverduePickup = true;
  res.json({ message: 'Simulado: pedido con mobiliario entregado hace 26h', order });
});

// Customers
app.get(['/api/customers', '/customers'], (req, res) => {
  res.json(memoryDB.customers || []);
});

app.post(['/api/customers', '/customers'], (req, res) => {
  const { name, phone, address, reference, location, notes } = req.body;
  const newCustomer = {
    id: 'cust-' + Date.now(),
    name: name ? name.trim() : '',
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    reference: reference ? reference.trim() : '',
    location: location || { lat: 19.3732, lng: -99.1788 },
    notes: notes || '',
    createdAt: new Date().toISOString()
  };
  memoryDB.customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Employees
app.get(['/api/employees', '/employees'], (req, res) => {
  res.json(memoryDB.employees || []);
});

app.post(['/api/employees', '/employees'], (req, res) => {
  const { name, role, phone, email, status } = req.body;
  const newEmp = {
    id: 'emp-' + Date.now(),
    name: name ? name.trim() : '',
    role: role || 'chofer',
    phone: phone || '',
    email: email || '',
    status: status || 'activo',
    createdAt: new Date().toISOString()
  };
  memoryDB.employees.push(newEmp);
  res.status(201).json(newEmp);
});

// Base Warehouse
app.get(['/api/base', '/base'], (req, res) => {
  res.json(memoryDB.baseLocation || { name: 'Base Central Rental Manager', lat: 19.3732, lng: -99.1788 });
});

app.put(['/api/base', '/base'], (req, res) => {
  memoryDB.baseLocation = { ...memoryDB.baseLocation, ...req.body };
  res.json(memoryDB.baseLocation);
});

// Demo Reset
app.post(['/api/demo/reset', '/demo/reset'], (req, res) => {
  memoryDB = JSON.parse(JSON.stringify(initialData));
  res.json({ message: 'Datos reiniciados con éxito' });
});

// EXPORT FOR VERCEL SERVERLESS FUNCTIONS
export default app;
