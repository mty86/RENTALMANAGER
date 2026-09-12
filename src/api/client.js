const API_BASE = '/api';

export async function fetchBaseLocation() {
  const res = await fetch(`${API_BASE}/base`);
  if (!res.ok) throw new Error('Error al cargar la ubicación base');
  return res.json();
}

export async function updateBaseLocation(baseData) {
  const res = await fetch(`${API_BASE}/base`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(baseData),
  });
  if (!res.ok) throw new Error('Error al actualizar la base');
  return res.json();
}

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
}

export async function createProduct(productData) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al crear producto');
  }
  return res.json();
}

export async function updateProduct(id, productData) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al actualizar producto');
  }
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar producto');
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error('Error al cargar pedidos');
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al registrar pedido');
  }
  return res.json();
}

export async function acceptOrder(id, employeeName) {
  const res = await fetch(`${API_BASE}/orders/${id}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al aceptar pedido');
  }
  return res.json();
}

export async function deliverOrder(id, employeeName) {
  const res = await fetch(`${API_BASE}/orders/${id}/deliver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al marcar como entregado');
  }
  return res.json();
}

export async function cancelOrder(id, reason, notifiedViaWhatsApp = false) {
  const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, notifiedViaWhatsApp }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al cancelar pedido');
  }
  return res.json();
}

export async function deleteOrder(id) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar pedido');
  return res.json();
}

export async function verifyPickup(id, payload) {
  const res = await fetch(`${API_BASE}/orders/${id}/pickup-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    // 422 indicates incomplete verification
    const error = new Error(data.error || 'Error al verificar recogida');
    error.data = data;
    throw error;
  }
  return data;
}

export async function simulate24hOverdue(id) {
  const res = await fetch(`${API_BASE}/orders/${id}/simulate-24h`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Error al simular >24h de entrega');
  return res.json();
}

// Customers API
export async function fetchCustomers() {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('Error al cargar clientes');
  return res.json();
}

export async function createCustomer(customerData) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al registrar cliente');
  }
  return res.json();
}

export async function updateCustomer(id, customerData) {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al actualizar cliente');
  }
  return res.json();
}

export async function deleteCustomer(id) {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar cliente');
  return res.json();
}

// Employees API
export async function fetchEmployees() {
  const res = await fetch(`${API_BASE}/employees`);
  if (!res.ok) throw new Error('Error al cargar empleados');
  return res.json();
}

export async function createEmployee(employeeData) {
  const res = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al crear empleado');
  }
  return res.json();
}

export async function updateEmployee(id, employeeData) {
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al actualizar empleado');
  }
  return res.json();
}

export async function deleteEmployee(id) {
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar empleado');
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/reset-demo`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Error al reiniciar datos');
  return res.json();
}
