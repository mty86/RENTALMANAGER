-- ========================================================================
-- BASE DE DATOS PARA XAMPP (MySQL / MariaDB)
-- Proyecto: Rental Manager - Sistema de Alquiler de Mobiliario y Logística
-- Perfiles: Cliente, Empleado y Superadmin
-- ========================================================================

CREATE DATABASE IF NOT EXISTS `rental_manager_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `rental_manager_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `auditoria_recogidas`;
DROP TABLE IF EXISTS `pedido_detalles`;
DROP TABLE IF EXISTS `pedidos`;
DROP TABLE IF EXISTS `productos`;
DROP TABLE IF EXISTS `clientes`;
DROP TABLE IF EXISTS `empleados`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `configuracion_base`;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------
-- 1. TABLA: CONFIGURACIÓN DE LA BASE / ALMACÉN CENTRAL (Origen de rutas)
-- ------------------------------------------------------------------------
CREATE TABLE `configuracion_base` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL DEFAULT 'Base Central Rental Manager',
  `direccion` VARCHAR(255) NOT NULL DEFAULT 'Av. Insurgentes Sur #1200, Col. Del Valle, Ciudad de México',
  `telefono` VARCHAR(50) NOT NULL DEFAULT '55 9876 5432',
  `lat` DECIMAL(10, 8) NOT NULL DEFAULT 19.37320000,
  `lng` DECIMAL(11, 8) NOT NULL DEFAULT -99.17880000,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `configuracion_base` (`id`, `nombre`, `direccion`, `telefono`, `lat`, `lng`) VALUES
(1, 'Base Central Rental Manager', 'Av. Insurgentes Sur #1200, Col. Del Valle, Ciudad de México', '55 9876 5432', 19.37320000, -99.17880000);

-- ------------------------------------------------------------------------
-- 2. TABLA: USUARIOS Y PERFILES (Superadmin, Empleado, Cliente)
-- ------------------------------------------------------------------------
CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `rol` ENUM('cliente', 'empleado', 'superadmin') NOT NULL DEFAULT 'cliente',
  `telefono` VARCHAR(50),
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `telefono`, `activo`) VALUES
(1, 'Super Administrador General', 'admin@rentalmanager.com', 'admin123', 'superadmin', '55 9876 5432', 1),
(2, 'Carlos Méndez (Chofer/Repartidor)', 'carlos.mendez@rentalmanager.com', 'empleado123', 'empleado', '55 9123 4567', 1),
(3, 'Laura Morales (Logística y Pedidos)', 'laura.morales@rentalmanager.com', 'empleado123', 'empleado', '55 9876 1234', 1),
(4, 'María Fernanda Gómez (Cliente)', 'cliente@gmail.com', 'cliente123', 'cliente', '55 4123 7890', 1);

-- ------------------------------------------------------------------------
-- 3. TABLA: EMPLEADOS Y PERSONAL DE LOGÍSTICA
-- ------------------------------------------------------------------------
CREATE TABLE `empleados` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) UNIQUE NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `telefono` VARCHAR(50) NOT NULL,
  `email` VARCHAR(150),
  `puesto` VARCHAR(100) NOT NULL DEFAULT 'Personal Operativo',
  `estado` VARCHAR(50) NOT NULL DEFAULT 'activo',
  `vehiculo_asignado` VARCHAR(150),
  `placas` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `empleados` (`id`, `codigo`, `nombre`, `telefono`, `email`, `puesto`, `estado`, `vehiculo_asignado`, `placas`) VALUES
(1, 'emp-1', 'Carlos Méndez Juárez', '5591234567', 'carlos.mendez@rentalmanager.com', 'Chofer y Repartidor', 'activo', 'Camioneta Ford Transit 2023', 'NLK-892-A'),
(2, 'emp-2', 'Laura Morales Trejo', '5598761234', 'laura.morales@rentalmanager.com', 'Encargada de Logística y Pedidos', 'activo', 'Camioneta Nissan NP300', 'PQR-456-B'),
(3, 'emp-3', 'Miguel Ángel Rivas', '5595557788', 'miguel.rivas@rentalmanager.com', 'Auditor y Control de Almacén', 'activo', NULL, NULL);

-- ------------------------------------------------------------------------
-- 4. TABLA: CLIENTES (Registrados por el empleado con celular, nombre, dirección y PUNTERO EN MAPA)
-- ------------------------------------------------------------------------
CREATE TABLE `clientes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) UNIQUE NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `celular` VARCHAR(50) NOT NULL,
  `direccion` TEXT NOT NULL,
  `referencia` TEXT,
  `lat` DECIMAL(10, 8) NOT NULL,
  `lng` DECIMAL(11, 8) NOT NULL,
  `notas` TEXT,
  `registrado_por` VARCHAR(100) DEFAULT 'Personal de Logística',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `clientes` (`id`, `codigo`, `nombre`, `celular`, `direccion`, `referencia`, `lat`, `lng`, `notas`, `registrado_por`) VALUES
(1, 'cust-1', 'María Fernanda Gómez', '5541237890', 'Calle Río Mixcoac #145, Col. Florida, Álvaro Obregón', 'Casa de 2 pisos con cancel negro y timbre dorado', 19.35980000, -99.18340000, 'Entrada amplia sin escaleras, fácil descarga', 'Personal de Logística'),
(2, 'cust-2', 'Roberto Soto Aguilar', '5588992211', 'Av. Universidad #820, Santa Cruz Atoyac, Benito Juárez', 'Edificio Residencial Torre B, acceso por caseta', 19.37890000, -99.16220000, 'Registrarse con vigilancia para ingresar elevador de carga', 'Personal de Logística'),
(3, 'cust-3', 'Andrea Morales Castillo', '5523456789', 'Av. División del Norte #2430, Portales Sur, Benito Juárez', 'Jardín de eventos La Pérgola, portón verde', 19.36210000, -99.15540000, 'Acceso para camioneta por el portón de servicio lateral', 'Empleado Mostrador');

-- ------------------------------------------------------------------------
-- 5. TABLA: PRODUCTOS / MOBILIARIO DISPONIBLE (Registrado por el empleado)
-- ------------------------------------------------------------------------
CREATE TABLE `productos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) UNIQUE NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `categoria` VARCHAR(100) NOT NULL DEFAULT 'General',
  `precio` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `stock_total` INT NOT NULL DEFAULT 0,
  `stock_disponible` INT NOT NULL DEFAULT 0,
  `descripcion` TEXT,
  `imagen_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `productos` (`id`, `codigo`, `nombre`, `categoria`, `precio`, `stock_total`, `stock_disponible`, `descripcion`, `imagen_url`) VALUES
(1, 'prod-1', 'Mesa Redonda (10 Personas)', 'Mesas', 0.00, 40, 35, 'Mesa redonda de fibra de vidrio de 1.50m de diámetro, ideal para banquetes de hasta 10 personas.', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80'),
(2, 'prod-2', 'Mesa Rectangular Tablón (8 Personas)', 'Mesas', 0.00, 50, 50, 'Tablón plegable de polietileno de alta densidad de 2.40m x 0.75m para servicio o comensales.', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80'),
(3, 'prod-3', 'Silla Plegable Acojinada Negra', 'Sillas', 0.00, 300, 250, 'Silla metálica reforzada con asiento y respaldo acojinado en vinil negro de alta resistencia.', 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80'),
(4, 'prod-4', 'Silla Tiffany Elegante Blanca', 'Sillas', 0.00, 160, 160, 'Silla estilo Tiffany en resina monocasco blanca con cojín desmontable blanco para bodas y galas.', 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=600&q=80'),
(5, 'prod-5', 'Mantel Redondo Blanco Tergal', 'Manteles', 0.00, 80, 75, 'Mantel liso de tergal stretch de 3m de caída para mesa redonda de 10 personas, limpio y planchado.', 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=600&q=80'),
(6, 'prod-6', 'Cubremantel / Camino de Mesa Dorado', 'Manteles', 0.00, 70, 70, 'Cubremantel en tela tafetán brillante color oro de 1.50m x 1.50m para contraste decorativo.', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80'),
(7, 'prod-7', 'Carpa Plegable 6x3m Impermeable', 'Toldos y Carpas', 0.00, 12, 12, 'Toldo carpa de estructura de acero reforzado con lona impermeable blanca, protección UV.', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80'),
(8, 'prod-8', 'Calentador de Patio Tipo Hongo', 'Accesorios', 0.00, 8, 8, 'Calefactor a gas para exteriores en acero inoxidable con tanque de gas LP incluido.', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80');

-- ------------------------------------------------------------------------
-- 6. TABLA: SOLICITUDES Y PEDIDOS DE ALQUILER
-- ------------------------------------------------------------------------
CREATE TABLE `pedidos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) UNIQUE NOT NULL,
  `cliente_codigo` VARCHAR(50),
  `cliente_nombre` VARCHAR(150) NOT NULL,
  `cliente_telefono` VARCHAR(50) NOT NULL,
  `cliente_direccion` TEXT NOT NULL,
  `cliente_referencia` TEXT,
  `cliente_lat` DECIMAL(10, 8) NOT NULL,
  `cliente_lng` DECIMAL(11, 8) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `fecha_evento` DATETIME NOT NULL,
  `fecha_recogida` DATETIME NOT NULL,
  `notas` TEXT,
  `estado` ENUM('pendiente', 'aceptado', 'en_camino', 'entregado', 'con_incidencias', 'completado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  `motivo_cancelacion` TEXT,
  `notificado_whatsapp` TINYINT(1) DEFAULT 0,
  `aceptado_por` VARCHAR(100),
  `aceptado_at` DATETIME,
  `entregado_por` VARCHAR(100),
  `entregado_at` DATETIME,
  `completado_at` DATETIME,
  `cancelado_at` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `pedidos` (`id`, `codigo`, `cliente_codigo`, `cliente_nombre`, `cliente_telefono`, `cliente_direccion`, `cliente_referencia`, `cliente_lat`, `cliente_lng`, `total`, `fecha_evento`, `fecha_recogida`, `notas`, `estado`, `created_at`) VALUES
(1, 'ORD-101', 'cust-1', 'María Fernanda Gómez', '5541237890', 'Calle Río Mixcoac #145, Col. Florida, Álvaro Obregón', 'Casa de 2 pisos con cancel negro y timbre dorado', 19.35980000, -99.18340000, 0.00, '2026-09-12 15:00:00', '2026-09-13 12:00:00', 'Favor de entregar el sábado a las 11:00 AM para preparar montaje.', 'pendiente', '2026-09-08 14:30:00'),
(2, 'ORD-100', 'cust-2', 'Roberto Soto Aguilar', '5588992211', 'Av. Universidad #820, Santa Cruz Atoyac, Benito Juárez', 'Edificio Residencial Torre B, acceso por caseta', 19.37890000, -99.16220000, 0.00, '2026-09-06 19:00:00', '2026-09-07 10:00:00', 'Evento en el salón comunal.', 'completado', '2026-09-05 10:00:00');

-- ------------------------------------------------------------------------
-- 7. TABLA: DETALLES DE PRODUCTOS DEL PEDIDO (Mobiliario solicitado)
-- ------------------------------------------------------------------------
CREATE TABLE `pedido_detalles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pedido_codigo` VARCHAR(50) NOT NULL,
  `producto_codigo` VARCHAR(50) NOT NULL,
  `producto_nombre` VARCHAR(150) NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  INDEX (`pedido_codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `pedido_detalles` (`pedido_codigo`, `producto_codigo`, `producto_nombre`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
('ORD-101', 'prod-1', 'Mesa Redonda (10 Personas)', 5, 120.00, 600.00),
('ORD-101', 'prod-3', 'Silla Plegable Acojinada Negra', 50, 18.00, 900.00),
('ORD-101', 'prod-5', 'Mantel Redondo Blanco Tergal', 5, 45.00, 225.00),
('ORD-100', 'prod-4', 'Silla Tiffany Elegante Blanca', 20, 38.00, 760.00);

-- ------------------------------------------------------------------------
-- 8. TABLA: AUDITORÍA DE RECOGIDAS Y CONTROL DE INCIDENCIAS / DAÑOS
-- ------------------------------------------------------------------------
CREATE TABLE `auditoria_recogidas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pedido_codigo` VARCHAR(50) NOT NULL,
  `inspeccionado_por` VARCHAR(100),
  `inspeccionado_at` DATETIME,
  `es_completo` TINYINT(1) DEFAULT 1,
  `total_faltantes` INT DEFAULT 0,
  `total_danados` INT DEFAULT 0,
  `penalizacion` DECIMAL(10, 2) DEFAULT 0.00,
  `notas` TEXT,
  INDEX (`pedido_codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `auditoria_recogidas` (`pedido_codigo`, `inspeccionado_por`, `inspeccionado_at`, `es_completo`, `total_faltantes`, `total_danados`, `penalizacion`, `notas`) VALUES
('ORD-100', 'Carlos M. (Logística)', '2026-09-07 11:30:00', 1, 0, 0, 0.00, 'Todo el mobiliario recibido completo y en óptimas condiciones.');

-- ========================================================================
-- FIN DEL SCRIPT DE BASE DE DATOS
-- ========================================================================
