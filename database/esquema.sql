-- Creación del esquema para el microservicio 
CREATE DATABASE IF NOT EXISTS db_construction_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_construction_service;

-- Limpieza previa si las tablas ya existen 
DROP TABLE IF EXISTS gasto;
DROP TABLE IF EXISTS presupuesto;
DROP TABLE IF EXISTS obra;
DROP TABLE IF EXISTS usuario;

--Tabla USUARIO
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMINISTRADOR', 'INGENIERO', 'CLIENTE') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--Tabla OBRA (Relacionada con USUARIO como cliente)
CREATE TABLE obra (
    id_obra INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE,
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00,
    CONSTRAINT fk_obra_cliente FOREIGN KEY (id_cliente) 
        REFERENCES usuario(id_usuario) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--Tabla PRESUPUESTO 
CREATE TABLE presupuesto (
    id_presupuesto INT AUTO_INCREMENT PRIMARY KEY,
    id_obra INT NOT NULL UNIQUE,
    monto_total DECIMAL(12,2) NOT NULL,
    saldo_disponible DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_presupuesto_obra FOREIGN KEY (id_obra) 
        REFERENCES obra(id_obra) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla GASTO (Relacionada con PRESUPUESTO y USUARIO que registra)
CREATE TABLE gasto (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_presupuesto INT NOT NULL,
    id_usuario INT NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gasto_presupuesto FOREIGN KEY (id_presupuesto) 
        REFERENCES presupuesto(id_presupuesto) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_gasto_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserción de datos genéricos iniciales 
INSERT INTO usuario (nombre, correo, password, rol) VALUES
('Oriol Angel', 'oriol.angel@constructora.com', '123456', 'CLIENTE');