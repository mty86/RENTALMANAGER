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
const defaultDataset = {
  baseLocation: {
    name: "Base Central Rental Manager",
    address: "Av. Insurgentes Sur #1200, Col. Del Valle, Ciudad de México",
    phone: "55 9876 5432",
    lat: 19.3732,
    lng: -99.1788
  },
  products: [
    {
      id: "prod-1",
      name: "Mesa Redonda (10 Personas)",
      category: "Mesas",
      price: 120,
      totalStock: 40,
      availableStock: 35,
      description: "Mesa redonda de fibra de vidrio de 1.50m de diámetro, ideal para banquetes de hasta 10 personas.",
      imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-2",
      name: "Mesa Rectangular Tablón (8 Personas)",
      category: "Mesas",
      price: 95,
      totalStock: 50,
      availableStock: 50,
      description: "Tablón plegable de polietileno de alta densidad de 2.40m x 0.75m para servicio o comensales.",
      imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-3",
      name: "Silla Plegable Acojinada Negra",
      category: "Sillas",
      price: 18,
      totalStock: 300,
      availableStock: 250,
      description: "Silla metálica reforzada con asiento y respaldo acojinado en vinil negro de alta resistencia.",
      imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-4",
      name: "Silla Tiffany Elegante Blanca",
      category: "Sillas",
      price: 38,
      totalStock: 160,
      availableStock: 160,
      description: "Silla estilo Tiffany en resina monocasco blanca con cojín desmontable blanco para bodas y galas.",
      imageUrl: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-5",
      name: "Mantel Redondo Blanco Tergal",
      category: "Manteles",
      price: 45,
      totalStock: 80,
      availableStock: 75,
      description: "Mantel liso de tergal stretch de 3m de caída para mesa redonda de 10 personas, limpio y planchado.",
      imageUrl: "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-6",
      name: "Cubremantel / Camino de Mesa Dorado",
      category: "Manteles",
      price: 25,
      totalStock: 70,
      availableStock: 70,
      description: "Cubremantel en tela tafetán brillante color oro de 1.50m x 1.50m para contraste decorativo.",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-7",
      name: "Carpa Plegable 6x3m Impermeable",
      category: "Toldos y Carpas",
      price: 450,
      totalStock: 12,
      availableStock: 12,
      description: "Toldo carpa de estructura de acero reforzado con lona impermeable blanca, protección UV.",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-8",
      name: "Calentador de Patio Tipo Hongo",
      category: "Accesorios",
      price: 350,
      totalStock: 8,
      availableStock: 8,
      description: "Calefactor a gas para exteriores en acero inoxidable con tanque de gas LP incluido.",
      imageUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80"
    }
  ],
  orders: [
    {
      id: "ORD-101",
      customer: {
        name: "María Fernanda Gómez",
        phone: "55 4123 7890",
        address: "Calle Río Mixcoac #145, Col. Florida, Álvaro Obregón",
        reference: "Casa de 2 pisos con cancel negro y timbre dorado",
        location: {
          lat: 19.3598,
          lng: -99.1834
        }
      },
      items: [
        {
          productId: "prod-1",
          productName: "Mesa Redonda (10 Personas)",
          quantity: 5,
          priceUnit: 120,
          subtotal: 600
        },
        {
          productId: "prod-3",
          productName: "Silla Plegable Acojinada Negra",
          quantity: 50,
          priceUnit: 18,
          subtotal: 900
        },
        {
          productId: "prod-5",
          productName: "Mantel Redondo Blanco Tergal",
          quantity: 5,
          priceUnit: 45,
          subtotal: 225
        }
      ],
      totalAmount: 1725,
      eventDate: "2026-09-12T15:00",
      returnDate: "2026-09-13T12:00",
      notes: "Favor de entregar el sábado a las 11:00 AM para preparar montaje.",
      status: "pendiente",
      createdAt: "2026-09-08T14:30:00.000Z"
    },
    {
      id: "ORD-100",
      customer: {
        name: "Roberto Soto Aguilar",
        phone: "55 8899 2211",
        address: "Av. Universidad #820, Santa Cruz Atoyac, Benito Juárez",
        reference: "Edificio Residencial Torre B, acceso por caseta",
        location: {
          lat: 19.3789,
          lng: -99.1622
        }
      },
      items: [
        {
          productId: "prod-4",
          productName: "Silla Tiffany Elegante Blanca",
          quantity: 20,
          priceUnit: 38,
          subtotal: 760
        }
      ],
      totalAmount: 760,
      eventDate: "2026-09-06T19:00",
      returnDate: "2026-09-07T10:00",
      notes: "Evento en el salón comunal.",
      status: "completado",
      createdAt: "2026-09-05T10:00:00.000Z",
      acceptedAt: "2026-09-05T11:15:00.000Z",
      deliveredAt: "2026-09-06T16:00:00.000Z",
      pickupReport: {
        inspectedAt: "2026-09-07T11:30:00.000Z",
        inspectedBy: "Carlos M. (Logística)",
        itemsStatus: [
          {
            productId: "prod-4",
            productName: "Silla Tiffany Elegante Blanca",
            deliveredQty: 20,
            returnedGoodQty: 20,
            damagedQty: 0,
            missingQty: 0,
            notes: "Todo recibido en óptimas condiciones y limpio."
          }
        ],
        isComplete: true,
        penaltyFee: 0,
        notes: "Recogida exitosa a tiempo."
      }
    }
  ],
  customers: [
    {
      id: "cust-1",
      name: "María Fernanda Gómez",
      phone: "5541237890",
      address: "Calle Río Mixcoac #145, Col. Florida, Álvaro Obregón",
      reference: "Casa de 2 pisos con cancel negro y timbre dorado",
      location: {
        lat: 19.3598,
        lng: -99.1834
      },
      registeredBy: "Personal de Logística",
      createdAt: "2026-09-01T10:00:00.000Z"
    },
    {
      id: "cust-2",
      name: "Roberto Soto Aguilar",
      phone: "5588992211",
      address: "Av. Universidad #820, Santa Cruz Atoyac, Benito Juárez",
      reference: "Edificio Residencial Torre B, acceso por caseta",
      location: {
        lat: 19.3789,
        lng: -99.1622
      },
      registeredBy: "Personal de Logística",
      createdAt: "2026-09-02T11:20:00.000Z"
    },
    {
      id: "cust-3",
      name: "Andrea Morales Castillo",
      phone: "5523456789",
      address: "Av. División del Norte #2430, Portales Sur, Benito Juárez",
      reference: "Jardín de eventos La Pérgola, portón verde",
      location: {
        lat: 19.3621,
        lng: -99.1554
      },
      registeredBy: "Empleado Mostrador",
      createdAt: "2026-09-05T09:15:00.000Z"
    }
  ],
  employees: [
    {
      id: "emp-1",
      name: "Carlos Méndez Juárez",
      phone: "5591234567",
      email: "carlos.mendez@rentalmanager.com",
      role: "Chofer y Repartidor",
      status: "activo",
      licensePlate: "NLK-892-A",
      assignedVehicle: "Camioneta Ford Transit 2023",
      createdAt: "2026-08-15T08:00:00.000Z"
    },
    {
      id: "emp-2",
      name: "Laura Morales Trejo",
      phone: "5598761234",
      email: "laura.morales@rentalmanager.com",
      role: "Encargada de Logística y Pedidos",
      status: "activo",
      createdAt: "2026-08-10T08:30:00.000Z"
    },
    {
      id: "emp-3",
      name: "Miguel Ángel Rivas",
      phone: "5595557788",
      email: "miguel.rivas@rentalmanager.com",
      role: "Auditor y Control de Almacén",
      status: "activo",
      createdAt: "2026-08-20T09:00:00.000Z"
    }
  ]
};

let memoryDB = JSON.parse(JSON.stringify(defaultDataset));

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

      await conn.query(`
        CREATE TABLE IF NOT EXISTS clientes (
          id VARCHAR(100) PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL,
          telefono VARCHAR(50),
          direccion TEXT,
          referencia TEXT,
          notas TEXT,
          lat DECIMAL(10, 7),
          lng DECIMAL(10, 7),
          registrado_por VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS empleados (
          id VARCHAR(100) PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL,
          telefono VARCHAR(50),
          email VARCHAR(100),
          rol VARCHAR(100),
          estado VARCHAR(50) DEFAULT 'activo',
          placas VARCHAR(50),
          vehiculo VARCHAR(150),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS pedidos (
          id VARCHAR(100) PRIMARY KEY,
          datos_json LONGTEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Seed initial products if empty
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

// Base Location: GET & PUT
app.get(['/api/base', '/base'], (req, res) => {
  res.json(memoryDB.baseLocation || { name: 'Base Central Rental Manager', lat: 19.3732, lng: -99.1788 });
});

app.put(['/api/base', '/base'], (req, res) => {
  memoryDB.baseLocation = { ...memoryDB.baseLocation, ...req.body };
  res.json(memoryDB.baseLocation);
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
      console.warn('Error inserting product into Aiven:', e.message);
    }
  }

  memoryDB.products.push(newProduct);
  res.status(201).json(newProduct);
});

// Products: PUT
app.put(['/api/products/:id', '/products/:id'], async (req, res) => {
  const id = req.params.id;
  const p = getAivenPool();
  const index = memoryDB.products.findIndex((prod) => prod.id === id);

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

        const updatedProd = {
          id,
          name,
          category,
          price,
          totalStock: updatedTotal,
          availableStock: updatedAvail,
          description,
          imageUrl: existing.imagen_url
        };
        if (index !== -1) memoryDB.products[index] = { ...memoryDB.products[index], ...updatedProd };
        return res.json(updatedProd);
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
  res.json({ success: true, message: 'Producto eliminado correctamente' });
});

// Orders: GET
app.get(['/api/orders', '/orders'], (req, res) => {
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

// Orders: POST (Create Order)
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

// Orders: Accept (Accepts POST and PUT)
const handleAcceptOrder = (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'aceptado';
  order.acceptedAt = new Date().toISOString();
  order.acceptedBy = req.body.employeeName || 'Personal de Operaciones';

  // Deduct available stock
  for (const item of order.items) {
    const product = memoryDB.products.find((p) => p.id === item.productId);
    if (product) {
      product.availableStock = Math.max(0, product.availableStock - item.quantity);
    }
  }

  res.json({ message: 'Pedido aceptado con éxito', order });
};
app.post(['/api/orders/:id/accept', '/orders/:id/accept'], handleAcceptOrder);
app.put(['/api/orders/:id/accept', '/orders/:id/accept'], handleAcceptOrder);

// Orders: Deliver (Accepts POST and PUT)
const handleDeliverOrder = (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'entregado';
  order.deliveredAt = new Date().toISOString();
  order.deliveredBy = req.body.employeeName || req.body.deliveredBy || 'Repartidor';
  res.json({ message: 'Mobiliario marcado como entregado al cliente', order });
};
app.post(['/api/orders/:id/deliver', '/orders/:id/deliver'], handleDeliverOrder);
app.put(['/api/orders/:id/deliver', '/orders/:id/deliver'], handleDeliverOrder);

// Orders: Cancel / Reject (Accepts POST and PUT)
const handleCancelOrder = (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  // Return stock if was accepted or on way
  if (['aceptado', 'en_camino', 'entregado'].includes(order.status)) {
    for (const item of order.items) {
      const product = memoryDB.products.find((p) => p.id === item.productId);
      if (product) {
        product.availableStock = Math.min(product.totalStock, product.availableStock + item.quantity);
      }
    }
  }

  order.status = 'cancelado';
  order.cancelledAt = new Date().toISOString();
  order.cancellationReason = req.body.reason || 'Rechazado por logística';
  order.notifiedViaWhatsApp = Boolean(req.body.notifiedViaWhatsApp);
  res.json({ message: 'Pedido cancelado', order });
};
app.post(['/api/orders/:id/cancel', '/orders/:id/cancel'], handleCancelOrder);
app.put(['/api/orders/:id/cancel', '/orders/:id/cancel'], handleCancelOrder);

// Orders: DELETE (Superadmin)
app.delete(['/api/orders/:id', '/orders/:id'], (req, res) => {
  const id = req.params.id;
  memoryDB.orders = (memoryDB.orders || []).filter((o) => o.id !== id);
  res.json({ success: true, message: 'Pedido eliminado correctamente' });
});

// Orders: Strict Pickup Verification (Supports both /pickup-verify and /pickup, POST and PUT)
const handlePickupVerification = (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  const { itemsVerification, itemsChecked, inspectedBy, notes, forceResolution, penaltyAmount } = req.body;
  const itemsList = itemsVerification || itemsChecked;

  if (!itemsList || !Array.isArray(itemsList)) {
    return res.status(400).json({ error: 'Se requiere la lista de verificación de mobiliario' });
  }

  let totalMissing = 0;
  let totalDamaged = 0;
  const verifiedItems = [];

  for (const originalItem of order.items) {
    const input = itemsList.find((v) => v.productId === originalItem.productId) || {};
    const deliveredQty = originalItem.quantity;
    const returnedQty = Math.max(0, Number(input.returnedGoodQty || input.quantityGood || 0));
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
    penaltyAmount: penaltyAmount ? Number(penaltyAmount) : 0,
    notes: notes || (isFullyComplete ? 'Todo el mobiliario recibido completo y verificado.' : 'Completado con reposición pagada por el cliente.'),
  };

  // Reintegrate returned items back into stock
  for (const item of verifiedItems) {
    const prod = memoryDB.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.availableStock = Math.min(prod.totalStock, prod.availableStock + item.returnedGoodQty);
      if (item.damagedQty > 0) {
        prod.totalStock = Math.max(0, prod.totalStock - item.damagedQty);
      }
    }
  }

  res.json({
    message: isFullyComplete
      ? '¡Recogida exitosa! Todo el mobiliario está completo y el pedido ha sido guardado en el historial como Completado.'
      : 'Pedido cerrado con resolución de faltantes/daños y archivado en el historial.',
    canComplete: true,
    order,
  });
};

app.post(['/api/orders/:id/pickup-verify', '/orders/:id/pickup-verify'], handlePickupVerification);
app.put(['/api/orders/:id/pickup-verify', '/orders/:id/pickup-verify'], handlePickupVerification);
app.post(['/api/orders/:id/pickup', '/orders/:id/pickup'], handlePickupVerification);
app.put(['/api/orders/:id/pickup', '/orders/:id/pickup'], handlePickupVerification);

// Orders: Simulate 24h overdue
app.post(['/api/orders/:id/simulate-24h', '/orders/:id/simulate-24h'], (req, res) => {
  const order = memoryDB.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'entregado';
  order.deliveredAt = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
  order.isOverduePickup = true;
  res.json({ message: 'Simulado: pedido con mobiliario entregado hace 26h', order });
});

// Customers: GET
app.get(['/api/customers', '/customers'], async (req, res) => {
  const p = getAivenPool();
  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM clientes ORDER BY created_at DESC');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r) => ({
          id: r.id,
          name: r.nombre,
          phone: r.telefono,
          address: r.direccion,
          reference: r.referencia || '',
          notes: r.notas || '',
          location: { lat: Number(r.lat || 19.3732), lng: Number(r.lng || -99.1788) },
          registeredBy: r.registrado_por || 'Personal',
          createdAt: r.created_at
        }));
        return res.json(mapped);
      }
    } catch (e) {
      console.warn('Error querying Aiven customers, using memory:', e.message);
    }
  }
  res.json(memoryDB.customers || []);
});

// Customers: POST
app.post(['/api/customers', '/customers'], async (req, res) => {
  const { name, phone, address, reference, location, notes, registeredBy } = req.body;
  if (!name || !phone || !address || !location || location.lat == null || location.lng == null) {
    return res.status(400).json({ error: 'Nombre, celular, dirección y puntero en mapa son requeridos.' });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const existing = (memoryDB.customers || []).find((c) => (c.phone || '').replace(/[^0-9]/g, '') === cleanPhone);

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
    registeredBy: registeredBy || 'Personal de Logística',
    updatedAt: new Date().toISOString(),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };

  const p = getAivenPool();
  if (p) {
    try {
      await p.query(
        'INSERT INTO clientes (id, nombre, telefono, direccion, referencia, notas, lat, lng, registrado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=?, telefono=?, direccion=?, referencia=?, notas=?, lat=?, lng=?',
        [
          newCustomer.id, newCustomer.name, newCustomer.phone, newCustomer.address, newCustomer.reference, newCustomer.notes, newCustomer.location.lat, newCustomer.location.lng, newCustomer.registeredBy,
          newCustomer.name, newCustomer.phone, newCustomer.address, newCustomer.reference, newCustomer.notes, newCustomer.location.lat, newCustomer.location.lng
        ]
      );
    } catch (e) {
      console.warn('Error inserting customer into Aiven:', e.message);
    }
  }

  memoryDB.customers = memoryDB.customers || [];
  if (existing) {
    const idx = memoryDB.customers.findIndex((c) => c.id === existing.id);
    memoryDB.customers[idx] = newCustomer;
  } else {
    memoryDB.customers.unshift(newCustomer);
  }

  res.status(201).json(newCustomer);
});

// Customers: PUT (Edit customer)
app.put(['/api/customers/:id', '/customers/:id'], async (req, res) => {
  const id = req.params.id;
  const p = getAivenPool();
  const index = (memoryDB.customers || []).findIndex((c) => c.id === id);

  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM clientes WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const existing = rows[0];
        const name = req.body.name || existing.nombre;
        const phone = req.body.phone || existing.telefono;
        const address = req.body.address || existing.direccion;
        const reference = req.body.reference !== undefined ? req.body.reference : existing.referencia;
        const notes = req.body.notes !== undefined ? req.body.notes : existing.notas;
        const lat = req.body.location?.lat != null ? Number(req.body.location.lat) : Number(existing.lat);
        const lng = req.body.location?.lng != null ? Number(req.body.location.lng) : Number(existing.lng);

        await p.query(
          'UPDATE clientes SET nombre = ?, telefono = ?, direccion = ?, referencia = ?, notas = ?, lat = ?, lng = ? WHERE id = ?',
          [name, phone, address, reference, notes, lat, lng, id]
        );

        const updated = {
          id,
          name,
          phone,
          address,
          reference,
          notes,
          location: { lat, lng },
          updatedAt: new Date().toISOString()
        };

        if (index !== -1) memoryDB.customers[index] = { ...memoryDB.customers[index], ...updated };
        return res.json(updated);
      }
    } catch (e) {
      console.warn('Error updating Aiven customer:', e.message);
    }
  }

  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const existing = memoryDB.customers[index];
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
  memoryDB.customers[index] = updated;
  res.json(updated);
});

// Customers: DELETE
app.delete(['/api/customers/:id', '/customers/:id'], async (req, res) => {
  const id = req.params.id;
  const p = getAivenPool();
  if (p) {
    try {
      await p.query('DELETE FROM clientes WHERE id = ?', [id]);
    } catch (e) {
      console.warn('Error deleting customer from Aiven:', e.message);
    }
  }

  memoryDB.customers = (memoryDB.customers || []).filter((c) => c.id !== id);
  res.json({ success: true, message: 'Cliente eliminado correctamente' });
});

// Employees: GET
app.get(['/api/employees', '/employees'], async (req, res) => {
  const p = getAivenPool();
  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM empleados ORDER BY created_at DESC');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r) => ({
          id: r.id,
          name: r.nombre,
          phone: r.telefono,
          email: r.email || '',
          role: r.rol || 'Personal',
          status: r.estado || 'activo',
          licensePlate: r.placas || '',
          assignedVehicle: r.vehiculo || '',
          createdAt: r.created_at
        }));
        return res.json(mapped);
      }
    } catch (e) {
      console.warn('Error querying Aiven employees, using memory:', e.message);
    }
  }
  res.json(memoryDB.employees || []);
});

// Employees: POST
app.post(['/api/employees', '/employees'], async (req, res) => {
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

  const p = getAivenPool();
  if (p) {
    try {
      await p.query(
        'INSERT INTO empleados (id, nombre, telefono, email, rol, estado, placas, vehiculo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newEmployee.id, newEmployee.name, newEmployee.phone, newEmployee.email, newEmployee.role, newEmployee.status, newEmployee.licensePlate, newEmployee.assignedVehicle]
      );
    } catch (e) {
      console.warn('Error inserting employee into Aiven:', e.message);
    }
  }

  memoryDB.employees = memoryDB.employees || [];
  memoryDB.employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

// Employees: PUT
app.put(['/api/employees/:id', '/employees/:id'], async (req, res) => {
  const id = req.params.id;
  const p = getAivenPool();
  const index = (memoryDB.employees || []).findIndex((e) => e.id === id);

  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM empleados WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const existing = rows[0];
        const name = req.body.name || existing.nombre;
        const phone = req.body.phone || existing.telefono;
        const email = req.body.email !== undefined ? req.body.email : existing.email;
        const role = req.body.role || existing.rol;
        const status = req.body.status || existing.estado;
        const licensePlate = req.body.licensePlate !== undefined ? req.body.licensePlate : existing.placas;
        const assignedVehicle = req.body.assignedVehicle !== undefined ? req.body.assignedVehicle : existing.vehiculo;

        await p.query(
          'UPDATE empleados SET nombre = ?, telefono = ?, email = ?, rol = ?, estado = ?, placas = ?, vehiculo = ? WHERE id = ?',
          [name, phone, email, role, status, licensePlate, assignedVehicle, id]
        );

        const updated = {
          id,
          name,
          phone,
          email,
          role,
          status,
          licensePlate,
          assignedVehicle,
          updatedAt: new Date().toISOString()
        };

        if (index !== -1) memoryDB.employees[index] = { ...memoryDB.employees[index], ...updated };
        return res.json(updated);
      }
    } catch (e) {
      console.warn('Error updating Aiven employee:', e.message);
    }
  }

  if (index === -1) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  const updated = {
    ...memoryDB.employees[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  memoryDB.employees[index] = updated;
  res.json(updated);
});

// Employees: DELETE
app.delete(['/api/employees/:id', '/employees/:id'], async (req, res) => {
  const id = req.params.id;
  const p = getAivenPool();
  if (p) {
    try {
      await p.query('DELETE FROM empleados WHERE id = ?', [id]);
    } catch (e) {
      console.warn('Error deleting employee from Aiven:', e.message);
    }
  }

  memoryDB.employees = (memoryDB.employees || []).filter((e) => e.id !== id);
  res.json({ success: true, message: 'Empleado eliminado correctamente' });
});

// Demo Reset (Supports both /api/reset-demo and /api/demo/reset)
const handleResetDemo = (req, res) => {
  memoryDB = JSON.parse(JSON.stringify(defaultDataset));
  res.json({ message: 'Datos de demostración reiniciados con éxito' });
};
app.post(['/api/reset-demo', '/reset-demo', '/api/demo/reset', '/demo/reset'], handleResetDemo);

// EXPORT FOR VERCEL SERVERLESS FUNCTIONS
export default app;
