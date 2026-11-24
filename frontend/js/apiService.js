/**
 * ============================================================================
 * ARCHIVO: frontend/js/apiService.js
 * PROPÓSITO: Capa intermedia de comunicación de datos (Patrón Adaptador).
 * FUNCIONAMIENTO:
 * - Hoy (Fases 1 a 5): Lee/escribe en 'mockDB' devolviendo Promesas asíncronas.


// Importamos nuestra base de datos simulada desde el archivo vecino.
import { mockDB } from "./mockData.js";

// URL base donde correrá el microservicio de Spring Boot en la Fase 6.
const API_BASE_URL = "http://localhost:8080/api";

/**
 * Simula una petición HTTP real hacia el servidor:
 * 1. Espera 250 milisegundos (setTimeout) para imitar la latencia de red.
 * 2. Clona los datos (structuredClone) para que la pantalla reciba una copia
 *    limpia e independiente, exactamente igual a como funciona response.json().
 *
 * @param {any} data - Los datos que se van a entregar al resolver la Promesa.
 * @returns {Promise<any>} Una Promesa que se cumple después de 250ms.
 */
function simularPeticionHttp(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(structuredClone(data));
    }, 250);
  });
}

// Exportamos el objeto 'apiService' con todos los métodos organizados por tabla.
export const apiService = {

  // ==========================================================================
  // 1. MÓDULO: AUTENTICACIÓN Y USUARIOS (Tablas: usuario, rol)
  // ==========================================================================

  /**
   * Busca un usuario activo por su correo electrónico para iniciar sesión.
   * Futuro endpoint Fase 6: POST ${API_BASE_URL}/auth/login
   */
  async login(correo) {
    // .find() recorre el arreglo y devuelve el primer elemento que cumpla la condición
    const usuarioEncontrado = mockDB.usuarios.find(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );

    // Al lanzar 'throw new Error' dentro de una función 'async', la Promesa
    // pasa automáticamente a estado rechazado (se captura con try/catch en app.js).
    if (!usuarioEncontrado) {
      throw new Error("No existe ningún usuario registrado con ese correo.");
    }

    if (!usuarioEncontrado.isActivo) {
      throw new Error("Esta cuenta de usuario se encuentra desactivada.");
    }

    return simularPeticionHttp(usuarioEncontrado);
  },

  /**
   * Devuelve la lista completa de usuarios registrados.
   * Futuro endpoint Fase 6: GET ${API_BASE_URL}/usuarios
   */
  async getUsuarios() {
    return simularPeticionHttp(mockDB.usuarios);
  },

  /**
   * Registra un nuevo usuario validando campos obligatorios y RFC de 13 caracteres.
   * Futuro endpoint Fase 6: POST ${API_BASE_URL}/usuarios
   */
  async crearUsuario(datosUsuario) {
    if (!datosUsuario.nombre || !datosUsuario.apellidoPaterno || !datosUsuario.correo) {
      throw new Error("Nombre, apellido paterno y correo son obligatorios.");
    }

    // Validación estricta de RFC (13 caracteres)
    if (!datosUsuario.rfc || datosUsuario.rfc.trim().length !== 13) {
      throw new Error("El RFC debe tener exactamente 13 caracteres.");
    }

    const rolObj = mockDB.roles.find((r) => r.idRol === Number(datosUsuario.idRol));
    if (!rolObj) {
      throw new Error("Debes seleccionar un rol válido.");
    }

    const nuevoUsuario = {
      idUsuario: Date.now(), // Genera un ID numérico único basado en la marca de tiempo actual
      rol: { idRol: rolObj.idRol, nombre: rolObj.nombre },
      nombre: datosUsuario.nombre.trim(),
      apellidoPaterno: datosUsuario.apellidoPaterno.trim(),
      apellidoMaterno: datosUsuario.apellidoMaterno ? datosUsuario.apellidoMaterno.trim() : null,
      correo: datosUsuario.correo.trim(),
      rfc: datosUsuario.rfc.trim().toUpperCase(),
      telefono: datosUsuario.telefono ? datosUsuario.telefono.trim() : null,
      isActivo: true
    };

    mockDB.usuarios.push(nuevoUsuario);
    return simularPeticionHttp(nuevoUsuario);
  },

  // ==========================================================================
  // 2. MÓDULO: CUENTAS BANCARIAS (Tabla: cuenta_bancaria)
  // ==========================================================================

  /**
   * Obtiene las cuentas bancarias registradas de la constructora.
   * Futuro endpoint Fase 6: GET ${API_BASE_URL}/cuentas-bancarias
   */
  async getCuentasBancarias() {
    return simularPeticionHttp(mockDB.cuentasBancarias);
  },

  /**
   * Da de alta una cuenta bancaria nueva (necesaria para asociar ingresos).
   * Futuro endpoint Fase 6: POST ${API_BASE_URL}/cuentas-bancarias
   */
  async crearCuentaBancaria(datosCuenta) {
    if (!datosCuenta.banco || !datosCuenta.numeroCuenta || !datosCuenta.clabe || !datosCuenta.titular) {
      throw new Error("Todos los datos de la cuenta bancaria son obligatorios.");
    }

    if (datosCuenta.clabe.trim().length !== 18) {
      throw new Error("La CLABE interbancaria debe contener exactamente 18 dígitos.");
    }

    const nuevaCuenta = {
      idCuenta: Date.now(),
      banco: datosCuenta.banco.trim(),
      numeroCuenta: datosCuenta.numeroCuenta.trim(),
      clabe: datosCuenta.clabe.trim(),
      titular: datosCuenta.titular.trim(),
      isActivo: true
    };

    mockDB.cuentasBancarias.push(nuevaCuenta);
    return simularPeticionHttp(nuevaCuenta);
  },

  // ==========================================================================
  // 3. MÓDULO: OBRAS (Tabla: obra)
  // ==========================================================================

  /**
   * Obtiene todas las obras registradas.
   * Futuro endpoint Fase 6: GET ${API_BASE_URL}/obras
   */
  async getObras() {
    return simularPeticionHttp(mockDB.obras);
  },

  /**
   * Crea una nueva obra respetando el esquema real (sin monto directo).
   * Valida que la fecha de fin estimada no sea anterior a la fecha de inicio.
   * Futuro endpoint Fase 6: POST ${API_BASE_URL}/obras
   */
  async crearObra(datosObra) {
    if (!datosObra.nombre || !datosObra.descripcion || !datosObra.calleNumero ||
        !datosObra.ciudad || !datosObra.municipio || !datosObra.codigoPostal ||
        !datosObra.fechaInicio || !datosObra.fechaFinEstimada) {
      throw new Error("Completa todos los campos obligatorios de la obra.");
    }

    // Como las fechas vienen en formato ISO 'YYYY-MM-DD', se pueden comparar directamente
    if (datosObra.fechaFinEstimada < datosObra.fechaInicio) {
      throw new Error("La fecha de fin estimada no puede ser anterior a la fecha de inicio.");
    }

    const cliente = mockDB.usuarios.find(
      (u) => u.idUsuario === Number(datosObra.idUsuarioCliente)
    );
    if (!cliente) {
      throw new Error("Debes asignar un cliente válido a la obra.");
    }

    const nuevaObra = {
      idObra: Date.now(),
      usuarioCliente: {
        idUsuario: cliente.idUsuario,
        nombre: cliente.nombre,
        apellidoPaterno: cliente.apellidoPaterno,
        rfc: cliente.rfc
      },
      nombre: datosObra.nombre.trim(),
      descripcion: datosObra.descripcion.trim(),
      calleNumero: datosObra.calleNumero.trim(),
      coloniaCoto: datosObra.coloniaCoto ? datosObra.coloniaCoto.trim() : null,
      ciudad: datosObra.ciudad.trim(),
      municipio: datosObra.municipio.trim(),
      estado: datosObra.estado ? datosObra.estado.trim() : "Aguascalientes",
      codigoPostal: datosObra.codigoPostal.trim(),
      fechaInicio: datosObra.fechaInicio,
      fechaFinEstimada: datosObra.fechaFinEstimada,
      estatus: "EN_PLANIFICACION" // Valor por defecto en MySQL
    };

    mockDB.obras.push(nuevaObra);
    return simularPeticionHttp(nuevaObra);
  },

  /**
   * Cambia el estatus operativo de una obra (ENUM EstadoObra).
   * Futuro endpoint Fase 6: PATCH ${API_BASE_URL}/obras/${idObra}/estatus
   */
  async actualizarEstatusObra(idObra, nuevoEstatus) {
    const obra = mockDB.obras.find((o) => o.idObra === Number(idObra));
    if (!obra) {
      throw new Error("Obra no encontrada.");
    }
    obra.estatus = nuevoEstatus;
    return simularPeticionHttp(obra);
  },

  // ==========================================================================
  // 4. MÓDULO: PRESUPUESTOS (Tabla: presupuesto - Relación 1:1 con obra)
  // ==========================================================================

  /**
   * Obtiene todos los presupuestos.
   * Futuro endpoint Fase 6: GET ${API_BASE_URL}/presupuestos
   */
  async getPresupuestos() {
    return simularPeticionHttp(mockDB.presupuestos);
  },

  /**
   * Asigna un presupuesto único a una obra (respeta restricción UNIQUE id_obra).
   * Futuro endpoint Fase 6: POST ${API_BASE_URL}/presupuestos
   */
  async crearPresupuesto(datosPresupuesto) {
    const idObraNum = Number(datosPresupuesto.idObra);
    const montoNum = Number(datosPresupuesto.montoTotal);

    if (!montoNum || montoNum <= 0) {
      throw new Error("El monto total del presupuesto debe ser mayor a $0.00.");
    }

    // .some() devuelve true si al menos un elemento cumple la condición.
    // Garantizamos la relación 1:1 de MySQL (una obra no puede tener 2 presupuestos).
    const yaTienePresupuesto = mockDB.presupuestos.some((p) => p.obra.idObra === idObraNum);
    if (yaTienePresupuesto) {
      throw new Error("Esta obra ya cuenta con un presupuesto asignado (relación 1 a 1).");
    }

    const obra = mockDB.obras.find((o) => o.idObra === idObraNum);
    if (!obra) {
      throw new Error("La obra seleccionada no existe.");
    }

    const nuevoPresupuesto = {
      idPresupuesto: Date.now(),
      obra: { idObra: obra.idObra, nombre: obra.nombre },
      montoTotal: montoNum,
      fechaAprobacion: null,
      estatus: "BORRADOR" // Valor por defecto en MySQL
    };

    mockDB.presupuestos.push(nuevoPresupuesto);
    return simularPeticionHttp(nuevoPresupuesto);
  },

  /**
   * Actualiza el estatus del presupuesto (BORRADOR, APROBADO, MODIFICADO).
   * Futuro endpoint Fase 6: PATCH ${API_BASE_URL}/presupuestos/${idPresupuesto}/estatus
   */
  async actualizarEstatusPresupuesto(idPresupuesto, nuevoEstatus) {
    const presupuesto = mockDB.presupuestos.find(
      (p) => p.idPresupuesto === Number(idPresupuesto)
    );
    if (!presupuesto) {
      throw new Error("Presupuesto no encontrado.");
    }

    presupuesto.estatus = nuevoEstatus;
    // Si pasa a APROBADO y aún no tiene fecha, asignamos la fecha de hoy (YYYY-MM-DD)
    if (nuevoEstatus === "APROBADO" && !presupuesto.fechaAprobacion) {
      presupuesto.fechaAprobacion = new Date().toISOString().split("T")[0];
    }

    return simularPeticionHttp(presupuesto);
  },

  // ==========================================================================
  // 5. MÓDULO: GASTOS (Tabla: gasto - Cuelga de presupuesto)
  // ==========================================================================

  /**
   * Obtiene todos los gastos registrados.
   * Futuro endpoint Fase 6: GET ${API_BASE_URL}/gastos
   */
  async getGastos() {
    return simularPeticionHttp(mockDB.gastos);
  },

  /**
   * Registra un egreso vinculado a un presupuesto existente.
   * Futuro endpoint Fase 6: POST ${API_BASE_URL}/gastos
   */
  async crearGasto(datosGasto) {
    const montoNum = Number(datosGasto.monto);

    if (!datosGasto.descripcion || !datosGasto.fechaGasto) {
      throw new Error("La descripción y la fecha del gasto son obligatorias.");
    }

    if (!montoNum || montoNum <= 0) {
      throw new Error("El monto del gasto debe ser mayor a $0.00.");
    }

    const presupuesto = mockDB.presupuestos.find(
      (p) => p.idPresupuesto === Number(datosGasto.idPresupuesto)
    );
    if (!presupuesto) {
      throw new Error("Debes seleccionar un presupuesto válido.");
    }

    const nuevoGasto = {
      idGasto: Date.now(),
      presupuesto: {
        idPresupuesto: presupuesto.idPresupuesto,
        obra: { ...presupuesto.obra }
      },
      descripcion: datosGasto.descripcion.trim(),
      monto: montoNum,
      fechaGasto: datosGasto.fechaGasto,
      estatusAprobacion: "PENDIENTE" // Valor por defecto en MySQL
    };

    mockDB.gastos.push(nuevoGasto);
    return simularPeticionHttp(nuevoGasto);
  },

  /**
   * Aprueba o rechaza un gasto (ENUM EstatusAprobacion).
   * Futuro endpoint Fase 6: PATCH ${API_BASE_URL}/gastos/${idGasto}/estatus
   */
  async actualizarEstatusGasto(idGasto, nuevoEstatus) {
    const gasto = mockDB.gastos.find((g) => g.idGasto === Number(idGasto));
    if (!gasto) {
      throw new Error("Gasto no encontrado.");
    }
    gasto.estatusAprobacion = nuevoEstatus;
    return simularPeticionHttp(gasto);
  },

  // ==========================================================================
  // 6. MÓDULO: INGRESOS (Tabla: ingreso - Exige presupuesto Y cuentaBancaria)
  // ==========================================================================

  /**
   * Obtiene todos los ingresos registrados.
   * Futuro endpoint Fase 6: GET ${API_BASE_URL}/ingresos
   */
  async getIngresos() {
    return simularPeticionHttp(mockDB.ingresos);
  },

  /**
   * Registra un ingreso vinculando obligatoriamente Presupuesto y CuentaBancaria.
   * Futuro endpoint Fase 6: POST ${API_BASE_URL}/ingresos
   */
  async crearIngreso(datosIngreso) {
    const montoNum = Number(datosIngreso.monto);

    if (!datosIngreso.fechaDeposito) {
      throw new Error("La fecha de depósito es obligatoria.");
    }

    if (!montoNum || montoNum <= 0) {
      throw new Error("El monto del ingreso debe ser mayor a $0.00.");
    }

    const presupuesto = mockDB.presupuestos.find(
      (p) => p.idPresupuesto === Number(datosIngreso.idPresupuesto)
    );
    if (!presupuesto) {
      throw new Error("Debes seleccionar un presupuesto válido.");
    }

    const cuenta = mockDB.cuentasBancarias.find(
      (c) => c.idCuenta === Number(datosIngreso.idCuenta)
    );
    if (!cuenta) {
      throw new Error("Debes seleccionar una cuenta bancaria destino válida.");
    }

    const nuevoIngreso = {
      idIngreso: Date.now(),
      presupuesto: {
        idPresupuesto: presupuesto.idPresupuesto,
        obra: { ...presupuesto.obra }
      },
      cuentaBancaria: {
        idCuenta: cuenta.idCuenta,
        banco: cuenta.banco,
        numeroCuenta: cuenta.numeroCuenta
      },
      monto: montoNum,
      fechaDeposito: datosIngreso.fechaDeposito,
      referencia: datosIngreso.referencia ? datosIngreso.referencia.trim() : null,
      estatus: "PENDIENTE" // Valor por defecto en MySQL
    };

    mockDB.ingresos.push(nuevoIngreso);
    return simularPeticionHttp(nuevoIngreso);
  },

  /**
   * Concilia o cancela un ingreso (ENUM EstatusIngreso).
   * Futuro endpoint Fase 6: PATCH ${API_BASE_URL}/ingresos/${idIngreso}/estatus
   */
  async actualizarEstatusIngreso(idIngreso, nuevoEstatus) {
    const ingreso = mockDB.ingresos.find((i) => i.idIngreso === Number(idIngreso));
    if (!ingreso) {
      throw new Error("Ingreso no encontrado.");
    }
    ingreso.estatus = nuevoEstatus;
    return simularPeticionHttp(ingreso);
  }
};