/**
 * ============================================================================
 * ARCHIVO: frontend/js/apiService.js
 * PROPÓSITO: Capa de comunicación híbrida.
 * - Intenta conectar primero con Spring Boot (http://localhost:8080/api)
 *   para Obras, Presupuestos, Gastos e Ingresos.
 * - Si el servidor está apagado o el endpoint aún no existe (Usuarios, Roles,
 *   Cuentas Bancarias), responde automáticamente usando mockDB.
 * ============================================================================
 */

import { mockDB } from "./mockData.js";

const API_BASE_URL = "http://localhost:8080/api";

function simularPeticionHttp(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(structuredClone(data));
    }, 150);
  });
}

async function fetchBackend(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let mensaje = `Error HTTP ${response.status}`;
    try {
      const body = await response.json();
      mensaje = body.message || body.error || mensaje;
    } catch (_) {
      const text = await response.text();
      if (text) mensaje = text;
    }
    throw new Error(mensaje);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const apiService = {
  // ==========================================================================
  // 1. AUTENTICACIÓN Y USUARIOS (Respaldado por mockDB hasta que exista endpoint)
  // ==========================================================================
  async login(correo) {
    const usuarioEncontrado = mockDB.usuarios.find(
        (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );

    if (!usuarioEncontrado) {
      throw new Error("No existe ningún usuario registrado con ese correo.");
    }
    if (!usuarioEncontrado.isActivo) {
      throw new Error("Esta cuenta de usuario se encuentra desactivada.");
    }

    return simularPeticionHttp(usuarioEncontrado);
  },

  async getUsuarios() {
    try {
      return await fetchBackend("/usuarios");
    } catch (_) {
      return simularPeticionHttp(mockDB.usuarios);
    }
  },

  async crearUsuario(datosUsuario) {
    if (!datosUsuario.nombre || !datosUsuario.apellidoPaterno || !datosUsuario.correo) {
      throw new Error("Nombre, apellido paterno y correo son obligatorios.");
    }
    if (!datosUsuario.rfc || datosUsuario.rfc.trim().length !== 13) {
      throw new Error("El RFC debe tener exactamente 13 caracteres.");
    }

    const rolObj = mockDB.roles.find((r) => r.idRol === Number(datosUsuario.idRol));
    if (!rolObj) {
      throw new Error("Debes seleccionar un rol válido.");
    }

    const nuevoUsuario = {
      idUsuario: Date.now(),
      rol: { idRol: rolObj.idRol, nombre: rolObj.nombre },
      nombre: datosUsuario.nombre.trim(),
      apellidoPaterno: datosUsuario.apellidoPaterno.trim(),
      apellidoMaterno: datosUsuario.apellidoMaterno ? datosUsuario.apellidoMaterno.trim() : null,
      correo: datosUsuario.correo.trim(),
      rfc: datosUsuario.rfc.trim().toUpperCase(),
      telefono: datosUsuario.telefono ? datosUsuario.telefono.trim() : null,
      isActivo: true
    };

    try {
      return await fetchBackend("/usuarios", {
        method: "POST",
        body: JSON.stringify(nuevoUsuario)
      });
    } catch (_) {
      mockDB.usuarios.push(nuevoUsuario);
      return simularPeticionHttp(nuevoUsuario);
    }
  },

  // ==========================================================================
  // 2. CUENTAS BANCARIAS
  // ==========================================================================
  async getCuentasBancarias() {
    try {
      return await fetchBackend("/cuentas-bancarias");
    } catch (_) {
      return simularPeticionHttp(mockDB.cuentasBancarias);
    }
  },

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
      saldoActual: Number(datosCuenta.saldoActual || 0),
      isActivo: true
    };

    try {
      return await fetchBackend("/cuentas-bancarias", {
        method: "POST",
        body: JSON.stringify(nuevaCuenta)
      });
    } catch (_) {
      mockDB.cuentasBancarias.push(nuevaCuenta);
      return simularPeticionHttp(nuevaCuenta);
    }
  },

  // ==========================================================================
  // 3. OBRAS -> GET /api/obras | POST /api/obras | PATCH /api/obras/{id}/estado
  // ==========================================================================
  async getObras() {
    try {
      return await fetchBackend("/obras");
    } catch (_) {
      return simularPeticionHttp(mockDB.obras);
    }
  },

  async crearObra(datosObra) {
    if (!datosObra.nombre || !datosObra.descripcion || !datosObra.calleNumero ||
        !datosObra.ciudad || !datosObra.municipio || !datosObra.codigoPostal ||
        !datosObra.fechaInicio || !datosObra.fechaFinEstimada) {
      throw new Error("Completa todos los campos obligatorios de la obra.");
    }

    if (datosObra.fechaFinEstimada < datosObra.fechaInicio) {
      throw new Error("La fecha de fin estimada no puede ser anterior a la fecha de inicio.");
    }

    const cliente = mockDB.usuarios.find(
        (u) => u.idUsuario === Number(datosObra.idUsuarioCliente)
    );

    const payloadBackend = {
      usuarioCliente: cliente ? { idUsuario: cliente.idUsuario } : null,
      nombre: datosObra.nombre.trim(),
      descripcion: datosObra.descripcion.trim(),
      calleNumero: datosObra.calleNumero.trim(),
      coloniaCoto: datosObra.coloniaCoto ? datosObra.coloniaCoto.trim() : null,
      ciudad: datosObra.ciudad.trim(),
      municipio: datosObra.municipio.trim(),
      estado: datosObra.estado || "ACTIVA",
      codigoPostal: datosObra.codigoPostal.trim(),
      fechaInicio: datosObra.fechaInicio,
      fechaFinEstimada: datosObra.fechaFinEstimada
    };

    try {
      return await fetchBackend("/obras", {
        method: "POST",
        body: JSON.stringify(payloadBackend)
      });
    } catch (_) {
      const nuevaObraMock = {
        ...payloadBackend,
        idObra: Date.now(),
        usuarioCliente: cliente || { idUsuario: 3, nombre: "Cliente", apellidoPaterno: "Demo", rfc: "XAXX010101000" }
      };
      mockDB.obras.push(nuevaObraMock);
      return simularPeticionHttp(nuevaObraMock);
    }
  },

  async actualizarEstatusObra(idObra, nuevoEstado) {
    try {
      return await fetchBackend(`/obras/${idObra}/estado?estado=${encodeURIComponent(nuevoEstado)}`, {
        method: "PATCH"
      });
    } catch (_) {
      const obra = mockDB.obras.find((o) => o.idObra === Number(idObra));
      if (!obra) throw new Error("Obra no encontrada.");
      obra.estado = nuevoEstado;
      return simularPeticionHttp(obra);
    }
  },

  // ==========================================================================
  // 4. PRESUPUESTOS -> GET /api/presupuestos | POST /api/presupuestos/obra/{id}
  // ==========================================================================
  async getPresupuestos() {
    try {
      return await fetchBackend("/presupuestos");
    } catch (_) {
      return simularPeticionHttp(mockDB.presupuestos);
    }
  },

  async crearPresupuesto(datosPresupuesto) {
    const idObraNum = Number(datosPresupuesto.idObra);
    const montoNum = Number(datosPresupuesto.montoTotal);

    if (!idObraNum) {
      throw new Error("Selecciona una obra válida.");
    }
    if (!montoNum || montoNum <= 0) {
      throw new Error("El monto total del presupuesto debe ser mayor a $0.00.");
    }

    const payloadBackend = {
      montoTotal: montoNum,
      fechaAprobacion: datosPresupuesto.fechaAprobacion || new Date().toISOString().split("T")[0],
      estatus: datosPresupuesto.estatus || "VIGENTE"
    };

    try {
      return await fetchBackend(`/presupuestos/obra/${idObraNum}`, {
        method: "POST",
        body: JSON.stringify(payloadBackend)
      });
    } catch (err) {
      // Si el backend respondió con error de negocio real (400/500), lo propagamos
      if (!err.message.includes("Failed to fetch")) {
        throw err;
      }

      const yaTiene = mockDB.presupuestos.some((p) => p.obra.idObra === idObraNum);
      if (yaTiene) {
        throw new Error("Esta obra ya cuenta con un presupuesto asignado (relación 1 a 1).");
      }

      const obra = mockDB.obras.find((o) => o.idObra === idObraNum);
      if (!obra) throw new Error("La obra seleccionada no existe.");

      const nuevoPresupuesto = {
        idPresupuesto: Date.now(),
        obra: { idObra: obra.idObra, nombre: obra.nombre },
        ...payloadBackend
      };
      mockDB.presupuestos.push(nuevoPresupuesto);
      return simularPeticionHttp(nuevoPresupuesto);
    }
  },

  // ==========================================================================
  // 5. GASTOS -> GET /api/gastos | POST /api/gastos/presupuesto/{id}
  //             PATCH /api/gastos/{id}/aprobar | PATCH /api/gastos/{id}/rechazar
  // ==========================================================================
  async getGastos() {
    try {
      return await fetchBackend("/gastos");
    } catch (_) {
      return simularPeticionHttp(mockDB.gastos);
    }
  },

  async crearGasto(datosGasto) {
    const idPresupuestoNum = Number(datosGasto.idPresupuesto);
    const montoNum = Number(datosGasto.monto);

    if (!datosGasto.descripcion || !datosGasto.fechaGasto) {
      throw new Error("La descripción y la fecha del gasto son obligatorias.");
    }
    if (!montoNum || montoNum <= 0) {
      throw new Error("El monto del gasto debe ser mayor a $0.00.");
    }

    const payloadBackend = {
      descripcion: datosGasto.descripcion.trim(),
      monto: montoNum,
      fechaGasto: datosGasto.fechaGasto
    };

    try {
      return await fetchBackend(`/gastos/presupuesto/${idPresupuestoNum}`, {
        method: "POST",
        body: JSON.stringify(payloadBackend)
      });
    } catch (err) {
      if (!err.message.includes("Failed to fetch")) {
        throw err;
      }

      const presupuesto = mockDB.presupuestos.find((p) => p.idPresupuesto === idPresupuestoNum);
      if (!presupuesto) throw new Error("Debes seleccionar un presupuesto válido.");

      const nuevoGasto = {
        idGasto: Date.now(),
        presupuesto: {
          idPresupuesto: presupuesto.idPresupuesto,
          obra: { ...presupuesto.obra }
        },
        ...payloadBackend,
        estatusAprobacion: "PENDIENTE"
      };
      mockDB.gastos.push(nuevoGasto);
      return simularPeticionHttp(nuevoGasto);
    }
  },

  async aprobarGasto(idGasto) {
    try {
      return await fetchBackend(`/gastos/${idGasto}/aprobar`, { method: "PATCH" });
    } catch (err) {
      if (!err.message.includes("Failed to fetch")) {
        throw err;
      }
      const gasto = mockDB.gastos.find((g) => g.idGasto === Number(idGasto));
      if (!gasto) throw new Error("Gasto no encontrado.");
      gasto.estatusAprobacion = "APROBADO";
      return simularPeticionHttp(gasto);
    }
  },

  async rechazarGasto(idGasto) {
    try {
      return await fetchBackend(`/gastos/${idGasto}/rechazar`, { method: "PATCH" });
    } catch (err) {
      if (!err.message.includes("Failed to fetch")) {
        throw err;
      }
      const gasto = mockDB.gastos.find((g) => g.idGasto === Number(idGasto));
      if (!gasto) throw new Error("Gasto no encontrado.");
      gasto.estatusAprobacion = "RECHAZADO";
      return simularPeticionHttp(gasto);
    }
  },

  // ==========================================================================
  // 6. INGRESOS -> GET /api/ingresos | POST /api/ingresos?idPresupuesto=&idCuenta=
  // ==========================================================================
  async getIngresos() {
    try {
      return await fetchBackend("/ingresos");
    } catch (_) {
      return simularPeticionHttp(mockDB.ingresos);
    }
  },

  async crearIngreso(datosIngreso) {
    const idPresupuestoNum = Number(datosIngreso.idPresupuesto);
    const idCuentaNum = Number(datosIngreso.idCuenta);
    const montoNum = Number(datosIngreso.monto);

    if (!datosIngreso.fechaDeposito) {
      throw new Error("La fecha de depósito es obligatoria.");
    }
    if (!montoNum || montoNum <= 0) {
      throw new Error("El monto del ingreso debe ser mayor a $0.00.");
    }

    const payloadBackend = {
      monto: montoNum,
      fechaDeposito: datosIngreso.fechaDeposito,
      referencia: datosIngreso.referencia ? datosIngreso.referencia.trim() : null,
      estatus: datosIngreso.estatus || "CONFIRMADO"
    };

    try {
      const query = `?idPresupuesto=${encodeURIComponent(idPresupuestoNum)}&idCuenta=${encodeURIComponent(idCuentaNum)}`;
      return await fetchBackend(`/ingresos${query}`, {
        method: "POST",
        body: JSON.stringify(payloadBackend)
      });
    } catch (err) {
      if (!err.message.includes("Failed to fetch")) {
        throw err;
      }

      const presupuesto = mockDB.presupuestos.find((p) => p.idPresupuesto === idPresupuestoNum);
      const cuenta = mockDB.cuentasBancarias.find((c) => c.idCuenta === idCuentaNum);
      if (!presupuesto || !cuenta) throw new Error("Presupuesto o cuenta bancaria inválidos.");

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
        ...payloadBackend
      };
      mockDB.ingresos.push(nuevoIngreso);
      return simularPeticionHttp(nuevoIngreso);
    }
  }
};