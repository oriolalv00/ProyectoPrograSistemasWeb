/**
 * ============================================================================
 * ARCHIVO: frontend/js/app.js
 * PROPÓSITO: Controlador principal SPA (Login, Roles, Tablero General,
 * Obras y Presupuestos, Gastos, Ingresos y Administración).
 * ============================================================================
 */

import { apiService } from "./apiService.js";

let usuarioActual = null;

const CODIGOS_BANCO_CLABE = {
  "002": "Banco Nacional de México (Citibanamex)",
  "012": "BBVA México",
  "014": "Banco Santander México",
  "019": "Banjército",
  "021": "HSBC México",
  "030": "BanBajío",
  "036": "Inbursa",
  "044": "Scotiabank México",
  "058": "Banregio",
  "059": "Invex",
  "060": "Bansi",
  "062": "Afirme",
  "072": "Banorte",
  "102": "The Bank of Tokyo-Mitsubishi UFJ",
  "106": "Bank of America México",
  "108": "MUFG Bank México",
  "112": "Banco Ve Por Más (BX+)",
  "124": "Deutsche Bank México",
  "126": "Banco Azteca",
  "127": "Banco Azteca",
  "128": "Autofin México",
  "130": "Compartamos Banco",
  "132": "Multiva",
  "133": "Actinver",
  "137": "BanCoppel",
  "138": "ABC Capital",
  "140": "Consubanco",
  "143": "Inmobiliario Mexicano",
  "145": "Banco Base",
  "148": "Banco Pagatodo",
  "152": "Banco Forjadores",
  "156": "Sabadell",
  "166": "Bansefi / Banco del Bienestar",
  "168": "Banco Famsa",
  "646": "STP (Sistema de Transferencias y Pagos)",
  "659": "Opciones Empresariales del Noreste (ASP)",
  "722": "Mercado Pago W"
};

function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN"
  });
}

document.addEventListener("DOMContentLoaded", () => {
  configurarNavegacion();

  const sesionGuardada = sessionStorage.getItem("constructora_usuario");
  if (sesionGuardada) {
    usuarioActual = JSON.parse(sesionGuardada);
    iniciarInterfazAutenticada();
  } else {
    renderizarLogin();
  }
});

// ============================================================================
// 1. AUTENTICACIÓN Y NAVEGACIÓN
// ============================================================================
function renderizarLogin() {
  const loginMount = document.getElementById("login-mount");

  loginMount.innerHTML = `
    <div id="login-feedback"></div>

    <form id="form-login" novalidate>
      <div class="form-group">
        <label for="login-correo">Correo Electrónico <span class="required-mark">*</span></label>
        <input
          type="email"
          id="login-correo"
          class="form-control"
          placeholder="ej. admin@constructora-ags.mx"
          required
        />
      </div>

      <button type="submit" id="btn-login-submit" class="btn btn-primary" style="width: 100%;">
        Ingresar al Sistema
      </button>
    </form>

    <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--color-niebla-border);">
      <p class="text-muted" style="margin-bottom: 0.5rem; font-size: 0.82rem;">
        <strong>Cuentas de prueba (según roles de MySQL):</strong>
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
        <button type="button" class="btn btn-dark btn-sm btn-demo-login" data-email="admin@constructora-ags.mx">
          Administrador
        </button>
        <button type="button" class="btn btn-dark btn-sm btn-demo-login" data-email="oriol.residente@constructora-ags.mx">
          Ing. Residente
        </button>
        <button type="button" class="btn btn-dark btn-sm btn-demo-login" data-email="cgomez@inmobiliaria-centro.mx">
          Cliente
        </button>
      </div>
    </div>
  `;

  document.getElementById("form-login").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const inputCorreo = document.getElementById("login-correo");
    const feedback = document.getElementById("login-feedback");
    const btnSubmit = document.getElementById("btn-login-submit");

    if (!inputCorreo.value.trim()) {
      feedback.innerHTML = `<div class="alert alert-error">Por favor, ingresa tu correo electrónico.</div>`;
      return;
    }

    try {
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Verificando...";
      feedback.innerHTML = "";

      const usuario = await apiService.login(inputCorreo.value);
      usuarioActual = usuario;
      sessionStorage.setItem("constructora_usuario", JSON.stringify(usuario));

      iniciarInterfazAutenticada();
    } catch (error) {
      feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Ingresar al Sistema";
    }
  });

  document.querySelectorAll(".btn-demo-login").forEach((boton) => {
    boton.addEventListener("click", () => {
      document.getElementById("login-correo").value = boton.dataset.email;
    });
  });
}

function iniciarInterfazAutenticada() {
  document.getElementById("view-login").classList.add("hidden");
  document.getElementById("main-nav").classList.remove("hidden");

  const sessionInfo = document.getElementById("user-session-info");
  sessionInfo.innerHTML = `
    <span class="session-user-tag">${usuarioActual.nombre} ${usuarioActual.apellidoPaterno}</span>
    <span class="session-role-pill">${usuarioActual.rol.nombre}</span>
    <button type="button" id="btn-logout" class="btn btn-primary btn-sm">Cerrar Sesión</button>
  `;

  document.getElementById("btn-logout").addEventListener("click", cerrarSesion);

  const rolNombre = usuarioActual.rol.nombre;
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    const vistaDestino = btn.dataset.view;

    if (rolNombre === "CLIENTE" && ["view-gastos", "view-ingresos", "view-admin"].includes(vistaDestino)) {
      btn.classList.add("hidden");
    } else if (rolNombre === "INGENIERO_RESIDENTE" && vistaDestino === "view-admin") {
      btn.classList.add("hidden");
    } else {
      btn.classList.remove("hidden");
    }
  });

  cambiarVista("view-dashboard");
}

function cerrarSesion() {
  usuarioActual = null;
  sessionStorage.removeItem("constructora_usuario");

  document.getElementById("main-nav").classList.add("hidden");
  document.getElementById("user-session-info").innerHTML =
      `<span class="session-placeholder">Sin sesión iniciada</span>`;

  document.querySelectorAll(".view-section").forEach((sec) => sec.classList.add("hidden"));
  document.getElementById("view-login").classList.remove("hidden");
  renderizarLogin();
}

function configurarNavegacion() {
  document.querySelectorAll(".nav-btn").forEach((boton) => {
    boton.addEventListener("click", () => cambiarVista(boton.dataset.view));
  });
}

function cambiarVista(idVista) {
  document.querySelectorAll(".view-section").forEach((seccion) => seccion.classList.add("hidden"));

  const seccionActiva = document.getElementById(idVista);
  if (seccionActiva) seccionActiva.classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === idVista);
  });

  if (idVista === "view-dashboard") renderizarDashboard();
  else if (idVista === "view-obras") renderizarModuloObras();
  else if (idVista === "view-gastos") renderizarModuloGastos();
  else if (idVista === "view-ingresos") renderizarModuloIngresos();
  else if (idVista === "view-admin") renderizarModuloAdmin();
}

// ============================================================================
// 2. VISTA 1: TABLERO GENERAL (KPIs Y RESUMEN POR OBRA)
// ============================================================================
async function renderizarDashboard() {
  const mount = document.getElementById("dashboard-mount");
  mount.innerHTML = `<p class="text-muted">Cargando indicadores financieros...</p>`;

  const [obras, presupuestos, gastos, ingresos] = await Promise.all([
    apiService.getObras(),
    apiService.getPresupuestos(),
    apiService.getGastos(),
    apiService.getIngresos()
  ]);

  const totalPresupuestado = presupuestos.reduce((acc, p) => acc + Number(p.montoTotal || 0), 0);
  const totalEjercido = gastos
      .filter((g) => g.estatusAprobacion === "APROBADO")
      .reduce((acc, g) => acc + Number(g.monto || 0), 0);
  const totalIngresos = ingresos
      .filter((i) => ["CONFIRMADO", "CONCILIADO"].includes(i.estatus))
      .reduce((acc, i) => acc + Number(i.monto || 0), 0);
  const disponible = totalPresupuestado - totalEjercido;

  const filasResumen = obras
      .map((o) => {
        const pres = presupuestos.find((p) => p.obra?.idObra === o.idObra);
        const ejercidoObra = pres
            ? gastos
                .filter((g) => g.presupuesto?.idPresupuesto === pres.idPresupuesto && g.estatusAprobacion === "APROBADO")
                .reduce((acc, g) => acc + Number(g.monto || 0), 0)
            : 0;
        const saldoObra = pres ? Number(pres.montoTotal) - ejercidoObra : 0;
        const estadoObra = o.estado || o.estatus || "ACTIVA";

        return `
        <tr>
          <td><strong>${o.nombre}</strong></td>
          <td><span class="badge badge-${estadoObra}">${estadoObra}</span></td>
          <td>${pres ? formatearMoneda(pres.montoTotal) : "Sin presupuesto"}</td>
          <td>${formatearMoneda(ejercidoObra)}</td>
          <td><strong>${pres ? formatearMoneda(saldoObra) : "—"}</strong></td>
        </tr>
      `;
      })
      .join("");

  mount.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Obras Registradas</div>
        <div class="kpi-value">${obras.length}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Presupuesto Total</div>
        <div class="kpi-value">${formatearMoneda(totalPresupuestado)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Gasto Aprobado (Ejercido)</div>
        <div class="kpi-value">${formatearMoneda(totalEjercido)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Saldo Presupuestal</div>
        <div class="kpi-value">${formatearMoneda(disponible)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Ingresos Confirmados</div>
        <div class="kpi-value">${formatearMoneda(totalIngresos)}</div>
      </div>
    </div>

    <div class="card">
      <h3>Estado Financiero por Obra</h3>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Obra</th>
              <th>Estado</th>
              <th>Presupuesto Asignado</th>
              <th>Ejercido (Aprobado)</th>
              <th>Saldo Disponible</th>
            </tr>
          </thead>
          <tbody>
            ${filasResumen || `<tr><td colspan="5" class="text-muted">No hay obras registradas.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// 3. VISTA 2: OBRAS Y PRESUPUESTOS (Conectado a /api/obras y /api/presupuestos)
// ============================================================================
async function renderizarModuloObras() {
  const mount = document.getElementById("obras-mount");
  const esCliente = usuarioActual.rol.nombre === "CLIENTE";

  const [usuarios, obras] = await Promise.all([
    apiService.getUsuarios(),
    apiService.getObras()
  ]);

  const clientes = usuarios.filter((u) => u.rol?.nombre === "CLIENTE");
  const opcionesClientes = clientes
      .map((c) => `<option value="${c.idUsuario}">${c.nombre} ${c.apellidoPaterno} (${c.rfc})</option>`)
      .join("");

  const opcionesObras = obras
      .map((o) => `<option value="${o.idObra}">#${o.idObra} - ${o.nombre}</option>`)
      .join("");

  mount.innerHTML = `
    ${esCliente ? "" : `
    <div class="grid-2">
      <!-- FORMULARIO NUEVA OBRA -->
      <div class="card">
        <h3>Registrar Nueva Obra</h3>
        <div id="obra-feedback"></div>

        <form id="form-nueva-obra" novalidate>
          <div class="form-group">
            <label for="obra-cliente">Cliente Asignado <span class="required-mark">*</span></label>
            <select id="obra-cliente" class="form-control" required>
              ${opcionesClientes || `<option value="3">Cliente Default</option>`}
            </select>
          </div>

          <div class="form-group">
            <label for="obra-nombre">Nombre de la Obra <span class="required-mark">*</span></label>
            <input type="text" id="obra-nombre" class="form-control" required />
          </div>

          <div class="form-group">
            <label for="obra-descripcion">Descripción <span class="required-mark">*</span></label>
            <input type="text" id="obra-descripcion" class="form-control" required />
          </div>

          <div class="form-group">
            <label for="obra-calle">Calle y Número <span class="required-mark">*</span></label>
            <input type="text" id="obra-calle" class="form-control" required />
          </div>

          <div class="grid-2" style="gap: 0.75rem;">
            <div class="form-group">
              <label for="obra-colonia">Colonia / Coto</label>
              <input type="text" id="obra-colonia" class="form-control" />
            </div>
            <div class="form-group">
              <label for="obra-cp">Código Postal <span class="required-mark">*</span></label>
              <input type="text" id="obra-cp" class="form-control" maxlength="10" value="20000" required />
            </div>
          </div>

          <div class="grid-2" style="gap: 0.75rem;">
            <div class="form-group">
              <label for="obra-ciudad">Ciudad <span class="required-mark">*</span></label>
              <input type="text" id="obra-ciudad" class="form-control" value="Aguascalientes" required />
            </div>
            <div class="form-group">
              <label for="obra-municipio">Municipio <span class="required-mark">*</span></label>
              <input type="text" id="obra-municipio" class="form-control" value="Aguascalientes" required />
            </div>
          </div>

          <div class="grid-2" style="gap: 0.75rem;">
            <div class="form-group">
              <label for="obra-inicio">Fecha Inicio <span class="required-mark">*</span></label>
              <input type="date" id="obra-inicio" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="obra-fin">Fecha Fin Estimada <span class="required-mark">*</span></label>
              <input type="date" id="obra-fin" class="form-control" required />
            </div>
          </div>

          <button type="submit" class="btn btn-primary">Guardar Obra</button>
        </form>
      </div>

      <!-- FORMULARIO NUEVO PRESUPUESTO -->
      <div class="card">
        <h3>Asignar Presupuesto a Obra</h3>
        <p class="text-muted" style="margin-bottom: 1rem;">
          Define el monto autorizado para controlar el techo de gastos de la obra.
        </p>
        <div id="presupuesto-feedback"></div>

        <form id="form-nuevo-presupuesto" novalidate>
          <div class="form-group">
            <label for="pres-obra">Obra <span class="required-mark">*</span></label>
            <select id="pres-obra" class="form-control" required>
              ${opcionesObras || `<option value="">Sin obras registradas</option>`}
            </select>
          </div>

          <div class="form-group">
            <label for="pres-monto">Monto Total Autorizado (MXN) <span class="required-mark">*</span></label>
            <input type="number" id="pres-monto" class="form-control" step="0.01" min="1" placeholder="1500000.00" required />
          </div>

          <div class="form-group">
            <label for="pres-fecha">Fecha de Aprobación</label>
            <input type="date" id="pres-fecha" class="form-control" />
          </div>

          <div class="form-group">
            <label for="pres-estatus">Estatus Inicial</label>
            <select id="pres-estatus" class="form-control">
              <option value="VIGENTE" selected>VIGENTE</option>
              <option value="BORRADOR">BORRADOR</option>
              <option value="APROBADO">APROBADO</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary">Guardar Presupuesto</button>
        </form>
      </div>
    </div>
    `}

    <div class="card">
      <h3>Listado de Obras</h3>
      <div id="tabla-obras-container" class="table-responsive"></div>
    </div>

    <div class="card">
      <h3>Presupuestos Registrados</h3>
      <div id="tabla-presupuestos-container" class="table-responsive"></div>
    </div>
  `;

  if (!esCliente) {
    document.getElementById("form-nueva-obra").addEventListener("submit", async (e) => {
      e.preventDefault();
      const feedback = document.getElementById("obra-feedback");
      feedback.innerHTML = "";

      try {
        await apiService.crearObra({
          idUsuarioCliente: document.getElementById("obra-cliente").value,
          nombre: document.getElementById("obra-nombre").value,
          descripcion: document.getElementById("obra-descripcion").value,
          calleNumero: document.getElementById("obra-calle").value,
          coloniaCoto: document.getElementById("obra-colonia").value,
          codigoPostal: document.getElementById("obra-cp").value,
          ciudad: document.getElementById("obra-ciudad").value,
          municipio: document.getElementById("obra-municipio").value,
          fechaInicio: document.getElementById("obra-inicio").value,
          fechaFinEstimada: document.getElementById("obra-fin").value
        });
        feedback.innerHTML = `<div class="alert alert-success">Obra registrada correctamente.</div>`;
        await renderizarModuloObras();
      } catch (error) {
        feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
      }
    });

    document.getElementById("form-nuevo-presupuesto").addEventListener("submit", async (e) => {
      e.preventDefault();
      const feedback = document.getElementById("presupuesto-feedback");
      feedback.innerHTML = "";

      try {
        await apiService.crearPresupuesto({
          idObra: document.getElementById("pres-obra").value,
          montoTotal: document.getElementById("pres-monto").value,
          fechaAprobacion: document.getElementById("pres-fecha").value,
          estatus: document.getElementById("pres-estatus").value
        });
        feedback.innerHTML = `<div class="alert alert-success">Presupuesto asignado correctamente.</div>`;
        await cargarTablasObrasYPresupuestos();
      } catch (error) {
        feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
      }
    });
  }

  await cargarTablasObrasYPresupuestos();
}

async function cargarTablasObrasYPresupuestos() {
  const [obras, presupuestos] = await Promise.all([
    apiService.getObras(),
    apiService.getPresupuestos()
  ]);

  const esCliente = usuarioActual.rol.nombre === "CLIENTE";

  const filasObras = obras
      .map((o) => {
        const estadoActual = o.estado || o.estatus || "ACTIVA";
        return `
        <tr>
          <td>#${o.idObra}</td>
          <td><strong>${o.nombre}</strong><br><span class="text-muted">${o.ciudad}, ${o.municipio}</span></td>
          <td>${o.fechaInicio} &rarr; ${o.fechaFinEstimada}</td>
          <td><span class="badge badge-${estadoActual}">${estadoActual}</span></td>
          ${esCliente ? "" : `
          <td>
            <select class="form-control select-estado-obra" data-id="${o.idObra}" style="padding: 0.3rem; font-size: 0.82rem;">
              <option value="ACTIVA" ${estadoActual === "ACTIVA" ? "selected" : ""}>ACTIVA</option>
              <option value="EN_PLANIFICACION" ${estadoActual === "EN_PLANIFICACION" ? "selected" : ""}>EN_PLANIFICACION</option>
              <option value="PAUSADA" ${estadoActual === "PAUSADA" ? "selected" : ""}>PAUSADA</option>
              <option value="TERMINADA" ${estadoActual === "TERMINADA" ? "selected" : ""}>TERMINADA</option>
              <option value="CANCELADA" ${estadoActual === "CANCELADA" ? "selected" : ""}>CANCELADA</option>
            </select>
          </td>`}
        </tr>
      `;
      })
      .join("");

  document.getElementById("tabla-obras-container").innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Obra / Ubicación</th>
          <th>Periodo</th>
          <th>Estado</th>
          ${esCliente ? "" : "<th>Cambiar Estado</th>"}
        </tr>
      </thead>
      <tbody>${filasObras || `<tr><td colspan="5" class="text-muted">Sin obras registradas.</td></tr>`}</tbody>
    </table>
  `;

  document.querySelectorAll(".select-estado-obra").forEach((sel) => {
    sel.addEventListener("change", async () => {
      await apiService.actualizarEstatusObra(sel.dataset.id, sel.value);
      await cargarTablasObrasYPresupuestos();
    });
  });

  const filasPres = presupuestos
      .map(
          (p) => `
      <tr>
        <td>#${p.idPresupuesto}</td>
        <td><strong>${p.obra?.nombre || "Obra #" + p.obra?.idObra}</strong></td>
        <td><strong>${formatearMoneda(p.montoTotal)}</strong></td>
        <td>${p.fechaAprobacion || "—"}</td>
        <td><span class="badge badge-${p.estatus}">${p.estatus}</span></td>
      </tr>
    `
      )
      .join("");

  document.getElementById("tabla-presupuestos-container").innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Obra</th>
          <th>Monto Autorizado</th>
          <th>Fecha Aprobación</th>
          <th>Estatus</th>
        </tr>
      </thead>
      <tbody>${filasPres || `<tr><td colspan="5" class="text-muted">Sin presupuestos registrados.</td></tr>`}</tbody>
    </table>
  `;
}

// ============================================================================
// 4. VISTA 3: GASTOS (Registro + Aprobación / Rechazo con validación de saldo)
// ============================================================================
async function renderizarModuloGastos() {
  const mount = document.getElementById("gastos-mount");
  const presupuestos = await apiService.getPresupuestos();

  const opcionesPres = presupuestos
      .map(
          (p) =>
              `<option value="${p.idPresupuesto}">#${p.idPresupuesto} - ${p.obra?.nombre || "Obra"} (${formatearMoneda(p.montoTotal)})</option>`
      )
      .join("");

  mount.innerHTML = `
    <div class="card">
      <h3>Registrar Nuevo Gasto</h3>
      <div id="gasto-feedback"></div>

      <form id="form-nuevo-gasto" class="grid-2" novalidate>
        <div class="form-group">
          <label for="gasto-presupuesto">Presupuesto Destino <span class="required-mark">*</span></label>
          <select id="gasto-presupuesto" class="form-control" required>
            ${opcionesPres || `<option value="">Sin presupuestos disponibles</option>`}
          </select>
        </div>

        <div class="form-group">
          <label for="gasto-monto">Monto del Gasto (MXN) <span class="required-mark">*</span></label>
          <input type="number" id="gasto-monto" class="form-control" step="0.01" min="1" required />
        </div>

        <div class="form-group">
          <label for="gasto-descripcion">Concepto / Descripción <span class="required-mark">*</span></label>
          <input type="text" id="gasto-descripcion" class="form-control" placeholder="Ej. Compra de varilla y cemento" required />
        </div>

        <div class="form-group">
          <label for="gasto-fecha">Fecha del Gasto <span class="required-mark">*</span></label>
          <input type="date" id="gasto-fecha" class="form-control" value="${new Date().toISOString().split("T")[0]}" required />
        </div>

        <div>
          <button type="submit" class="btn btn-primary">Registrar Gasto (PENDIENTE)</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3>Control de Gastos y Aprobaciones</h3>
      <div id="gasto-accion-feedback"></div>
      <div id="tabla-gastos-container" class="table-responsive"></div>
    </div>
  `;

  document.getElementById("form-nuevo-gasto").addEventListener("submit", async (e) => {
    e.preventDefault();
    const feedback = document.getElementById("gasto-feedback");
    feedback.innerHTML = "";

    try {
      await apiService.crearGasto({
        idPresupuesto: document.getElementById("gasto-presupuesto").value,
        monto: document.getElementById("gasto-monto").value,
        descripcion: document.getElementById("gasto-descripcion").value,
        fechaGasto: document.getElementById("gasto-fecha").value
      });
      feedback.innerHTML = `<div class="alert alert-success">Gasto registrado en estado PENDIENTE.</div>`;
      document.getElementById("gasto-descripcion").value = "";
      document.getElementById("gasto-monto").value = "";
      await cargarTablaGastos();
    } catch (error) {
      feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
  });

  await cargarTablaGastos();
}

async function cargarTablaGastos() {
  const gastos = await apiService.getGastos();
  const puedeAprobar = usuarioActual.rol.nombre === "ADMINISTRADOR";

  const filas = gastos
      .map((g) => {
        const pendiente = g.estatusAprobacion === "PENDIENTE";
        return `
        <tr>
          <td>#${g.idGasto}</td>
          <td><strong>${g.presupuesto?.obra?.nombre || "Presupuesto #" + g.presupuesto?.idPresupuesto}</strong></td>
          <td>${g.descripcion}</td>
          <td><strong>${formatearMoneda(g.monto)}</strong></td>
          <td>${g.fechaGasto}</td>
          <td><span class="badge badge-${g.estatusAprobacion}">${g.estatusAprobacion}</span></td>
          <td>
            ${
            pendiente && puedeAprobar
                ? `<button type="button" class="btn btn-success btn-sm btn-aprobar-gasto" data-id="${g.idGasto}">Aprobar</button>
                   <button type="button" class="btn btn-danger btn-sm btn-rechazar-gasto" data-id="${g.idGasto}">Rechazar</button>`
                : `<span class="text-muted">${pendiente ? "Requiere Admin" : "Procesado"}</span>`
        }
          </td>
        </tr>
      `;
      })
      .join("");

  document.getElementById("tabla-gastos-container").innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Obra</th>
          <th>Descripción</th>
          <th>Monto</th>
          <th>Fecha</th>
          <th>Estatus</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>${filas || `<tr><td colspan="7" class="text-muted">Sin gastos registrados.</td></tr>`}</tbody>
    </table>
  `;

  const accionFeedback = document.getElementById("gasto-accion-feedback");

  document.querySelectorAll(".btn-aprobar-gasto").forEach((btn) => {
    btn.addEventListener("click", async () => {
      accionFeedback.innerHTML = "";
      try {
        await apiService.aprobarGasto(btn.dataset.id);
        accionFeedback.innerHTML = `<div class="alert alert-success">Gasto #${btn.dataset.id} aprobado y descontado del saldo disponible.</div>`;
        await cargarTablaGastos();
      } catch (error) {
        accionFeedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
      }
    });
  });

  document.querySelectorAll(".btn-rechazar-gasto").forEach((btn) => {
    btn.addEventListener("click", async () => {
      accionFeedback.innerHTML = "";
      try {
        await apiService.rechazarGasto(btn.dataset.id);
        accionFeedback.innerHTML = `<div class="alert alert-info">Gasto #${btn.dataset.id} rechazado.</div>`;
        await cargarTablaGastos();
      } catch (error) {
        accionFeedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
      }
    });
  });
}

// ============================================================================
// 5. VISTA 4: INGRESOS (Conectado a /api/ingresos)
// ============================================================================
async function renderizarModuloIngresos() {
  const mount = document.getElementById("ingresos-mount");
  const [presupuestos, cuentas] = await Promise.all([
    apiService.getPresupuestos(),
    apiService.getCuentasBancarias()
  ]);

  const opcionesPres = presupuestos
      .map((p) => `<option value="${p.idPresupuesto}">#${p.idPresupuesto} - ${p.obra?.nombre || "Obra"}</option>`)
      .join("");

  const opcionesCuentas = cuentas
      .map((c) => `<option value="${c.idCuenta}">${c.banco} (${c.numeroCuenta})</option>`)
      .join("");

  mount.innerHTML = `
    <div class="card">
      <h3>Registrar Nuevo Ingreso</h3>
      <div id="ingreso-feedback"></div>

      <form id="form-nuevo-ingreso" class="grid-2" novalidate>
        <div class="form-group">
          <label for="ing-presupuesto">Presupuesto / Obra <span class="required-mark">*</span></label>
          <select id="ing-presupuesto" class="form-control" required>
            ${opcionesPres}
          </select>
        </div>

        <div class="form-group">
          <label for="ing-cuenta">Cuenta Bancaria Destino <span class="required-mark">*</span></label>
          <select id="ing-cuenta" class="form-control" required>
            ${opcionesCuentas}
          </select>
        </div>

        <div class="form-group">
          <label for="ing-monto">Monto Depositado (MXN) <span class="required-mark">*</span></label>
          <input type="number" id="ing-monto" class="form-control" step="0.01" min="1" required />
        </div>

        <div class="form-group">
          <label for="ing-fecha">Fecha de Depósito <span class="required-mark">*</span></label>
          <input type="date" id="ing-fecha" class="form-control" value="${new Date().toISOString().split("T")[0]}" required />
        </div>

        <div class="form-group">
          <label for="ing-referencia">Referencia Bancaria</label>
          <input type="text" id="ing-referencia" class="form-control" placeholder="Ej. SPEI-ANTICIPO-01" />
        </div>

        <div class="form-group">
          <label for="ing-estatus">Estatus</label>
          <select id="ing-estatus" class="form-control">
            <option value="CONFIRMADO" selected>CONFIRMADO</option>
            <option value="PENDIENTE">PENDIENTE</option>
          </select>
        </div>

        <div>
          <button type="submit" class="btn btn-primary">Registrar Ingreso</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3>Historial de Ingresos</h3>
      <div id="tabla-ingresos-container" class="table-responsive"></div>
    </div>
  `;

  document.getElementById("form-nuevo-ingreso").addEventListener("submit", async (e) => {
    e.preventDefault();
    const feedback = document.getElementById("ingreso-feedback");
    feedback.innerHTML = "";

    try {
      await apiService.crearIngreso({
        idPresupuesto: document.getElementById("ing-presupuesto").value,
        idCuenta: document.getElementById("ing-cuenta").value,
        monto: document.getElementById("ing-monto").value,
        fechaDeposito: document.getElementById("ing-fecha").value,
        referencia: document.getElementById("ing-referencia").value,
        estatus: document.getElementById("ing-estatus").value
      });
      feedback.innerHTML = `<div class="alert alert-success">Ingreso registrado correctamente.</div>`;
      document.getElementById("ing-monto").value = "";
      document.getElementById("ing-referencia").value = "";
      await cargarTablaIngresos();
    } catch (error) {
      feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
  });

  await cargarTablaIngresos();
}

async function cargarTablaIngresos() {
  const ingresos = await apiService.getIngresos();

  const filas = ingresos
      .map(
          (i) => `
      <tr>
        <td>#${i.idIngreso}</td>
        <td><strong>${i.presupuesto?.obra?.nombre || "Presupuesto #" + i.presupuesto?.idPresupuesto}</strong></td>
        <td>${i.cuentaBancaria?.banco || "Cuenta #" + i.cuentaBancaria?.idCuenta}</td>
        <td><strong>${formatearMoneda(i.monto)}</strong></td>
        <td>${i.fechaDeposito}</td>
        <td>${i.referencia || "—"}</td>
        <td><span class="badge badge-${i.estatus}">${i.estatus}</span></td>
      </tr>
    `
      )
      .join("");

  document.getElementById("tabla-ingresos-container").innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Obra</th>
          <th>Cuenta Bancaria</th>
          <th>Monto</th>
          <th>Fecha</th>
          <th>Referencia</th>
          <th>Estatus</th>
        </tr>
      </thead>
      <tbody>${filas || `<tr><td colspan="7" class="text-muted">Sin ingresos registrados.</td></tr>`}</tbody>
    </table>
  `;
}

// ============================================================================
// 6. VISTA 5: ADMINISTRACIÓN (USUARIOS Y CUENTAS BANCARIAS)
// ============================================================================
async function renderizarModuloAdmin() {
  const adminMount = document.getElementById("admin-mount");

  adminMount.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <h3>Registrar Nuevo Usuario</h3>
        <div id="usuario-feedback"></div>

        <form id="form-nuevo-usuario" novalidate>
          <div class="form-group">
            <label for="usr-rol">Rol en el Sistema <span class="required-mark">*</span></label>
            <select id="usr-rol" class="form-control" required>
              <option value="1">ADMINISTRADOR</option>
              <option value="2">INGENIERO_RESIDENTE</option>
              <option value="3" selected>CLIENTE</option>
            </select>
          </div>

          <div class="form-group">
            <label for="usr-nombre">Nombre(s) <span class="required-mark">*</span></label>
            <input type="text" id="usr-nombre" class="form-control" maxlength="100" required />
          </div>

          <div class="form-group">
            <label for="usr-paterno">Apellido Paterno <span class="required-mark">*</span></label>
            <input type="text" id="usr-paterno" class="form-control" maxlength="100" required />
          </div>

          <div class="form-group">
            <label for="usr-materno">Apellido Materno (Opcional)</label>
            <input type="text" id="usr-materno" class="form-control" maxlength="100" />
          </div>

          <div class="form-group">
            <label for="usr-correo">Correo Electrónico <span class="required-mark">*</span></label>
            <input type="email" id="usr-correo" class="form-control" maxlength="150" required />
          </div>

          <div class="form-group">
            <label for="usr-rfc">RFC (13 caracteres exactos) <span class="required-mark">*</span></label>
            <input
              type="text"
              id="usr-rfc"
              class="form-control"
              maxlength="13"
              minlength="13"
              placeholder="EJ. HETA060115AB1"
              style="text-transform: uppercase;"
              required
            />
          </div>

          <div class="form-group">
            <label for="usr-telefono">Teléfono (Opcional)</label>
            <input type="tel" id="usr-telefono" class="form-control" maxlength="20" placeholder="4491234567" />
          </div>

          <button type="submit" class="btn btn-primary">Guardar Usuario</button>
        </form>
      </div>

      <div class="card">
        <h3>Registrar Cuenta Bancaria</h3>
        <p class="text-muted" style="margin-bottom: 1rem;">
          Al escribir la CLABE de 18 dígitos se detectará automáticamente la institución bancaria.
        </p>
        <div id="cuenta-feedback"></div>

        <form id="form-nueva-cuenta" novalidate>
          <div class="form-group">
            <label for="cta-banco">Institución Bancaria <span class="required-mark">*</span></label>
            <input type="text" id="cta-banco" class="form-control" placeholder="Se detecta con los primeros 3 dígitos de la CLABE" required />
          </div>

          <div class="form-group">
            <label for="cta-numero">Número de Cuenta <span class="required-mark">*</span></label>
            <input type="text" id="cta-numero" class="form-control" maxlength="20" required />
          </div>

          <div class="form-group">
            <label for="cta-clabe">CLABE Interbancaria (18 dígitos) <span class="required-mark">*</span></label>
            <input type="text" id="cta-clabe" class="form-control" maxlength="18" minlength="18" placeholder="Ej. 012010001198456321" required />
          </div>

          <div class="form-group">
            <label for="cta-titular">Titular de la Cuenta <span class="required-mark">*</span></label>
            <input type="text" id="cta-titular" class="form-control" placeholder="Constructora del Centro S.A. de C.V." required />
          </div>

          <button type="submit" class="btn btn-primary">Guardar Cuenta Bancaria</button>
        </form>
      </div>
    </div>

    <div class="card">
      <h3>Directorio de Usuarios Activos</h3>
      <div id="tabla-usuarios-container" class="table-responsive">
        <p class="text-muted">Cargando usuarios...</p>
      </div>
    </div>

    <div class="card">
      <h3>Cuentas Bancarias de la Constructora</h3>
      <div id="tabla-cuentas-container" class="table-responsive">
        <p class="text-muted">Cargando cuentas bancarias...</p>
      </div>
    </div>
  `;

  configurarFormularioUsuario();
  configurarFormularioCuenta();
  await Promise.all([cargarTablaUsuarios(), cargarTablaCuentas()]);
}

function configurarFormularioUsuario() {
  const form = document.getElementById("form-nuevo-usuario");
  const feedback = document.getElementById("usuario-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.innerHTML = "";

    const rfcValor = document.getElementById("usr-rfc").value.trim().toUpperCase();
    if (rfcValor.length !== 13) {
      feedback.innerHTML = `<div class="alert alert-error">El RFC debe contener exactamente 13 caracteres (actualmente tiene ${rfcValor.length}).</div>`;
      return;
    }

    try {
      await apiService.crearUsuario({
        idRol: document.getElementById("usr-rol").value,
        nombre: document.getElementById("usr-nombre").value,
        apellidoPaterno: document.getElementById("usr-paterno").value,
        apellidoMaterno: document.getElementById("usr-materno").value,
        correo: document.getElementById("usr-correo").value,
        rfc: rfcValor,
        telefono: document.getElementById("usr-telefono").value
      });
      feedback.innerHTML = `<div class="alert alert-success">Usuario registrado correctamente.</div>`;
      form.reset();
      await cargarTablaUsuarios();
    } catch (error) {
      feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
  });
}

function configurarFormularioCuenta() {
  const form = document.getElementById("form-nueva-cuenta");
  const inputBanco = document.getElementById("cta-banco");
  const inputClabe = document.getElementById("cta-clabe");
  const feedback = document.getElementById("cuenta-feedback");

  inputClabe.addEventListener("input", () => {
    const soloDigitos = inputClabe.value.replace(/\D/g, "").slice(0, 18);
    if (inputClabe.value !== soloDigitos) {
      inputClabe.value = soloDigitos;
    }

    if (soloDigitos.length >= 3) {
      const codigoBanco = soloDigitos.slice(0, 3);
      const bancoDetectado = CODIGOS_BANCO_CLABE[codigoBanco];
      if (bancoDetectado) {
        inputBanco.value = bancoDetectado;
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.innerHTML = "";

    const clabeValor = inputClabe.value.trim();
    if (!/^\d{18}$/.test(clabeValor)) {
      feedback.innerHTML = `<div class="alert alert-error">La CLABE interbancaria debe tener exactamente 18 dígitos numéricos.</div>`;
      return;
    }

    try {
      await apiService.crearCuentaBancaria({
        banco: inputBanco.value,
        numeroCuenta: document.getElementById("cta-numero").value,
        clabe: clabeValor,
        titular: document.getElementById("cta-titular").value
      });
      feedback.innerHTML = `<div class="alert alert-success">Cuenta bancaria agregada correctamente.</div>`;
      form.reset();
      await cargarTablaCuentas();
    } catch (error) {
      feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
  });
}

async function cargarTablaUsuarios() {
  const container = document.getElementById("tabla-usuarios-container");
  const usuarios = await apiService.getUsuarios();

  const filasHtml = usuarios
      .map(
          (u) => `
      <tr>
        <td>#${u.idUsuario}</td>
        <td><strong>${u.nombre} ${u.apellidoPaterno} ${u.apellidoMaterno || ""}</strong></td>
        <td><span class="badge badge-BORRADOR">${u.rol.nombre}</span></td>
        <td>${u.rfc}</td>
        <td>${u.correo}</td>
        <td>${u.telefono || "—"}</td>
      </tr>
    `
      )
      .join("");

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre Completo</th>
          <th>Rol</th>
          <th>RFC</th>
          <th>Correo</th>
          <th>Teléfono</th>
        </tr>
      </thead>
      <tbody>${filasHtml}</tbody>
    </table>
  `;
}

async function cargarTablaCuentas() {
  const container = document.getElementById("tabla-cuentas-container");
  const cuentas = await apiService.getCuentasBancarias();

  const filasHtml = cuentas
      .map(
          (c) => `
      <tr>
        <td>#${c.idCuenta}</td>
        <td><strong>${c.banco}</strong></td>
        <td>${c.numeroCuenta}</td>
        <td><code>${c.clabe}</code></td>
        <td>${c.titular}</td>
        <td><span class="badge ${c.isActivo ? "badge-ACTIVA" : "badge-CANCELADA"}">${c.isActivo ? "ACTIVA" : "INACTIVA"}</span></td>
      </tr>
    `
      )
      .join("");

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Banco</th>
          <th>Número de Cuenta</th>
          <th>CLABE Interbancaria</th>
          <th>Titular</th>
          <th>Estatus</th>
        </tr>
      </thead>
      <tbody>${filasHtml}</tbody>
    </table>
  `;
}