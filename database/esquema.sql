-- 1. CREACION DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS db_construction_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_construction_service;

-- Limpieza previa si las tablas ya existen
DROP TABLE IF EXISTS ingreso;
DROP TABLE IF EXISTS cuenta_bancaria;
DROP TABLE IF EXISTS gasto;
DROP TABLE IF EXISTS presupuesto;
DROP TABLE IF EXISTS obra;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS rol;

-- 2. TABLA ROL (SEGMENTO SEPARADO)
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE COMMENT 'ADMINISTRADOR, INGENIERO, CLIENTE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA USUARIO (Con separación de nombres, RFC, contraseña segura y Soft Delete)
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre_1 VARCHAR(100) NOT NULL,
    nombre_2 VARCHAR(100),
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    rfc VARCHAR(13) NOT NULL UNIQUE COMMENT 'Formato físico o moral',
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Contraseña del cliente',
    is_activo BOOLEAN NOT NULL DEFAULT TRUE COMMENT '1 (TRUE) = Activo, 0 (FALSE) = Borrado Lógico',
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol)
        REFERENCES rol(id_rol)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA OBRA (Con ubicación desglosada y estado)
CREATE TABLE obra (
    id_obra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_cliente INT NOT NULL COMMENT 'Llave foránea al cliente',
    nombre VARCHAR(150) NOT NULL,
    descripcion   VARCHAR(1000) NOT NULL COMMENT 'Limitado a 1000 chars para proteger memoria temporal'
    calle_numero VARCHAR(150) NOT NULL,
    colonia_coto VARCHAR(100),
    ciudad VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Aguascalientes',
    codigo_postal VARCHAR(10) NOT NULL COMMENT 'Obligatorio por reglas CFDI 4.0',
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    estatus ENUM('EN_PLANIFICACION', 'ACTIVA', 'PAUSADA', 'TERMINADA', 'CANCELADA') DEFAULT 'EN_PLANIFICACION',
    CONSTRAINT fk_obra_cliente FOREIGN KEY (id_usuario_cliente)
        REFERENCES usuario(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA PRESUPUESTO (SALDO DISPONIBLE SE CALCULARA DINAMICAMENTE)
CREATE TABLE presupuesto (
    id_presupuesto INT AUTO_INCREMENT PRIMARY KEY,
    id_obra INT NOT NULL UNIQUE COMMENT 'Relación 1 a 1: Una obra tiene un presupuesto maestro',
    monto_total DECIMAL(15,2) NOT NULL COMMENT 'El costo total proyectado de la obra',
    fecha_aprobacion DATE,
    estatus ENUM('BORRADOR', 'APROBADO', 'MODIFICADO') DEFAULT 'BORRADOR',
    CONSTRAINT fk_presupuesto_obra FOREIGN KEY (id_obra)
        REFERENCES obra(id_obra)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA GASTO
CREATE TABLE gasto (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_presupuesto INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    fecha_gasto DATE NOT NULL,
    estatus_aprobacion ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') DEFAULT 'PENDIENTE',
    CONSTRAINT fk_gasto_presupuesto FOREIGN KEY (id_presupuesto)
        REFERENCES presupuesto(id_presupuesto)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLA CUENTA BANCARIA (Catalogo interno de la constructora)
CREATE TABLE cuenta_bancaria (
    id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    nombre_banco VARCHAR(50) NOT NULL,
    numero_cuenta VARCHAR(20) NOT NULL UNIQUE,
    is_activa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABLA INGRESO (Con control de cuenta destino)
CREATE TABLE ingreso (
    id_ingreso INT AUTO_INCREMENT PRIMARY KEY,
    id_presupuesto INT NOT NULL,
    id_cuenta INT NOT NULL COMMENT 'A qué cuenta de la constructora cayó el dinero',
    monto DECIMAL(15,2) NOT NULL,
    fecha_deposito DATE NOT NULL,
    referencia VARCHAR(150) COMMENT 'Folio de transferencia. Nulo si es efectivo',
    estatus ENUM('PENDIENTE', 'CONCILIADO', 'CANCELADO') DEFAULT 'PENDIENTE',
    CONSTRAINT fk_ingreso_presupuesto FOREIGN KEY (id_presupuesto)
        REFERENCES presupuesto(id_presupuesto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ingreso_cuenta FOREIGN KEY (id_cuenta)
        REFERENCES cuenta_bancaria(id_cuenta)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;