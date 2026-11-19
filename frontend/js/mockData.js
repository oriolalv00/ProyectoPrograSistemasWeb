

// La palabra reservada 'export' convierte esta constante en un Módulo ES6.
// Esto permite que 'apiService.js' la importe de forma controlada sin dejar
// variables sueltas en la memoria global del navegador (window).
export const mockDB = {

  // --------------------------------------------------------------------------
  //  1. TABLA: rol Entidad Java: Rol.java)
  // Define los perfiles de acceso y permisos dentro de la constructora.
  // --------------------------------------------------------------------------
  roles: [
    {
      idRol: 1,
      nombre: "ADMINISTRADOR",
      descripcion: "Control total de obras, presupuestos, aprobación de gastos y conciliación."
    },
    {
      idRol: 2,
      nombre: "INGENIERO_RESIDENTE",
      descripcion: "Supervisión técnica de obra y registro de gastos operativos."
    },
    {
      idRol: 3,
      nombre: "CLIENTE",
      descripcion: "Consulta de avance de su obra, presupuesto autorizado e ingresos depositados."
    }
  ],

  // --------------------------------------------------------------------------
  // 2. TABLA: usuario (Entidad  Usuario.java)
  // - 'rol' es un objeto anidado porque en Java es una relación @ManyToOne.
  // - 'rfc' tiene exactamente 13 caracteres (regla obligatoria de validación).
  // --------------------------------------------------------------------------
  usuarios: [
    {
      idUsuario: 1,
      rol: { idRol: 1, nombre: "ADMINISTRADOR" },
      nombre: "Ángel Fernando",
      apellidoPaterno: "Hernández",
      apellidoMaterno: "Torres",
      correo: "admin@constructora-ags.mx",
      rfc: "HETA060115AB1",
      telefono: "4491234567",
      isActivo: true
    },
    {
      idUsuario: 2,
      rol: { idRol: 2, nombre: "INGENIERO_RESIDENTE" },
      nombre: "Oriol Santiago",
      apellidoPaterno: "Álvarez",
      apellidoMaterno: "Santacruz",
      correo: "oriol.residente@constructora-ags.mx",
      rfc: "AASO050912CD4",
      telefono: "4499876543",
      isActivo: true
    },
    {
      idUsuario: 3,
      rol: { idRol: 3, nombre: "CLIENTE" },
      nombre: "Carlos Alberto",
      apellidoPaterno: "Gómez",
      apellidoMaterno: "Ruiz",
      correo: "cgomez@inmobiliaria-centro.mx",
      rfc: "GORC850410EF7",
      telefono: "4495550192",
      isActivo: true
    }
  ],

  // --------------------------------------------------------------------------
  // 3. TABLA: cuenta_bancaria (Entidad Java: CuentaBancaria.java)
  // Es requisito obligatorio (FK id_cuenta) para poder registrar un Ingreso.
  // --------------------------------------------------------------------------
  cuentasBancarias: [
    {
      idCuenta: 1,
      banco: "BBVA México",
      numeroCuenta: "0119845632",
      clabe: "012010001198456321",
      titular: "Constructora del Centro S.A. de C.V.",
      isActivo: true
    },
    {
      idCuenta: 2,
      banco: "Banorte",
      numeroCuenta: "0845123987",
      clabe: "072010008451239874",
      titular: "Constructora del Centro S.A. de C.V.",
      isActivo: true
    }
  ],

  // --------------------------------------------------------------------------
  // 4. TABLA: obra (Entidad Java: Obra.java)
  // Validada contra DESCRIBE obra:
  // - No lleva monto total Ya que ese campo pertenece a la tabla 'presupuesto').
  // - 'estado' representa la entidad federativa (default 'Aguascalientes').
  // - 'estatus' usa el ENUM: EN_PLANIFICACION, ACTIVA, PAUSADA, TERMINADA, CANCELADA.
  // --------------------------------------------------------------------------
  obras: [
    {
      idObra: 101,
      usuarioCliente: {
        idUsuario: 3,
        nombre: "Carlos Alberto",
        apellidoPaterno: "Gómez",
        rfc: "GORC850410EF7"
      },
      nombre: "Residencial Los Encinos - Etapa 1",
      descripcion: "Construcción de 4 viviendas unifamiliares de dos niveles con acabados residenciales.",
      calleNumero: "Av. Universidad 1420",
      coloniaCoto: "Coto San Telmo",
      ciudad: "Aguascalientes",
      municipio: "Aguascalientes",
      estado: "Aguascalientes",
      codigoPostal: "20120",
      fechaInicio: "2026-09-01",
      fechaFinEstimada: "2027-03-30",
      estatus: "ACTIVA"
    },
    {
      idObra: 102,
      usuarioCliente: {
        idUsuario: 3,
        nombre: "Carlos Alberto",
        apellidoPaterno: "Gómez",
        rfc: "GORC850410EF7"
      },
      nombre: "Nave Industrial Parque Logístico Sur",
      descripcion: "Cimentación profunda, estructura metálica y piso de concreto pulido (2,500 m2).",
      calleNumero: "Carretera Panamericana Sur Km 14",
      coloniaCoto: null, // En MySQL esta columna tiene Null = YES
      ciudad: "Aguascalientes",
      municipio: "Aguascalientes",
      estado: "Aguascalientes",
      codigoPostal: "20340",
      fechaInicio: "2026-12-01",
      fechaFinEstimada: "2027-06-15",
      estatus: "EN_PLANIFICACION"
    }
  ],

  // --------------------------------------------------------------------------
  // 5. TABLA: presupuesto (Entidad Java: Presupuesto.java)
  // Relación @OneToOne (UNIQUE en id_obra): cada obra tiene 1 solo presupuesto.
  // ENUM estatus: BORRADOR, APROBADO, MODIFICADO.
  // --------------------------------------------------------------------------
  presupuestos: [
    {
      idPresupuesto: 201,
      obra: {
        idObra: 101,
        nombre: "Residencial Los Encinos - Etapa 1"
      },
      montoTotal: 4850000.00,
      fechaAprobacion: "2026-08-25",
      estatus: "APROBADO"
    },
    {
      idPresupuesto: 202,
      obra: {
        idObra: 102,
        nombre: "Nave Industrial Parque Logístico Sur"
      },
      montoTotal: 8200000.00,
      fechaAprobacion: null, // Es nulo mientras el presupuesto siga en BORRADOR
      estatus: "BORRADOR"
    }
  ],

  // --------------------------------------------------------------------------
  // 6. TABLA: gasto (Entidad Java: Gasto.java)
  // Cuelga de 'presupuesto' (FK id_presupuesto).
  // ENUM estatusAprobacion: PENDIENTE, APROBADO, RECHAZADO.
  // --------------------------------------------------------------------------
  gastos: [
    {
      idGasto: 301,
      presupuesto: {
        idPresupuesto: 201,
        obra: { idObra: 101, nombre: "Residencial Los Encinos - Etapa 1" }
      },
      descripcion: "Compra de 45 toneladas de cemento gris CPC 30R y varilla corrugada 3/8",
      monto: 420500.00,
      fechaGasto: "2026-09-10",
      estatusAprobacion: "APROBADO"
    },
    {
      idGasto: 302,
      presupuesto: {
        idPresupuesto: 201,
        obra: { idObra: 101, nombre: "Residencial Los Encinos - Etapa 1" }
      },
      descripcion: "Renta de retroexcavadora por 120 horas para excavación de zapatas",
      monto: 115000.00,
      fechaGasto: "2026-10-04",
      estatusAprobacion: "PENDIENTE"
    }
  ],

  // --------------------------------------------------------------------------
  // 7. TABLA: ingreso (Entidad Java: Ingreso.java)
  // Doble llave foránea: exige 'presupuesto' (id_presupuesto) y 'cuentaBancaria' (id_cuenta).
  // ENUM estatus: PENDIENTE, CONCILIADO, CANCELADO.
  // --------------------------------------------------------------------------
  ingresos: [
    {
      idIngreso: 401,
      presupuesto: {
        idPresupuesto: 201,
        obra: { idObra: 101, nombre: "Residencial Los Encinos - Etapa 1" }
      },
      cuentaBancaria: {
        idCuenta: 1,
        banco: "BBVA México",
        numeroCuenta: "0119845632"
      },
      monto: 1940000.00,
      fechaDeposito: "2026-08-28",
      referencia: "SPEI-20260828-ANTICIPO40",
      estatus: "CONCILIADO"
    },
    {
      idIngreso: 402,
      presupuesto: {
        idPresupuesto: 201,
        obra: { idObra: 101, nombre: "Residencial Los Encinos - Etapa 1" }
      },
      cuentaBancaria: {
        idCuenta: 2,
        banco: "Banorte",
        numeroCuenta: "0845123987"
      },
      monto: 970000.00,
      fechaDeposito: "2026-11-14",
      referencia: "TRANSF-ESTIMACION-02",
      estatus: "PENDIENTE"
    }
  ]
};