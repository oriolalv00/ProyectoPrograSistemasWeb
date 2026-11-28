USE db_construction_service;

-- 1. ROLES DEL SISTEMA
INSERT INTO rol (id_rol, nombre) VALUES
(1, 'ADMINISTRADOR'),
(2, 'INGENIERO_RESIDENTE'),
(3, 'CLIENTE');

-- 2. USUARIOS INICIALES (Coinciden con los botones de acceso rápido del frontend)
INSERT INTO usuario (id_usuario, id_rol, nombre_1, nombre_2, apellido_paterno, apellido_materno, rfc, correo, password, is_activo) VALUES
(1, 1, 'Ángel', 'Fernando', 'Hernández', 'Torres', 'HETA060115AB1', 'admin@constructora-ags.mx', 'Admin2026*', TRUE),
(2, 2, 'Oriol', 'Santiago', 'Álvarez', 'Santacruz', 'AASO050912CD4', 'oriol.residente@constructora-ags.mx', 'Residente2026*', TRUE),
(3, 3, 'Carlos', 'Alberto', 'Gómez', 'Ruiz', 'GORC850410EF7', 'cgomez@inmobiliaria-centro.mx', 'Cliente2026*', TRUE);

-- 3. CUENTAS BANCARIAS DE LA CONSTRUCTORA
INSERT INTO cuenta_bancaria (id_cuenta, nombre_banco, numero_cuenta, is_activa) VALUES
(1, 'BBVA México', '0119845632', TRUE),
(2, 'Banorte', '0845123987', TRUE);

-- 4. OBRA Y PRESUPUESTO BASE DE PRUEBA
INSERT INTO obra (id_obra, id_usuario_cliente, nombre, descripcion, calle_numero, colonia_coto, ciudad, municipio, estado, codigo_postal, fecha_inicio, fecha_fin_estimada, estatus) VALUES
(1, 3, 'Residencial Los Encinos - Etapa 1', 'Construcción de 4 viviendas unifamiliares de dos niveles con acabados residenciales.', 'Av. Universidad 1420', 'Coto San Telmo', 'Aguascalientes', 'Aguascalientes', 'Aguascalientes', '20120', '2026-09-01', '2027-03-30', 'ACTIVA');

INSERT INTO presupuesto (id_presupuesto, id_obra, monto_total, fecha_aprobacion, estatus) VALUES
(1, 1, 4850000.00, '2026-08-25', 'APROBADO');