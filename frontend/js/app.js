/**
 * ============================================================================
 * ARCHIVO: frontend/js/app.js
 * PROPÓSITO: Controlador principal de la interfaz (Fase 2: Login, Navegación
 * por Roles y Administración de Usuarios y Cuentas Bancarias).
 * REGLA DE ARQUITECTURA: Nunca accede directo a 'mockDB'; siempre pasa por
 * 'apiService' para que en la Fase 6 la conexión al backend sea transparente.
 * ============================================================================
 */

// Importamos nuestro adaptador de servicios desde el módulo vecino.
import { apiService } from "./apiService.js";

// ============================================================================
// 1. ESTADO GLOBAL DE LA SESIÓN EN EL NAVEGADOR
// Guardamos el usuario conectado en memoria y en 'sessionStorage' para que,
// si recargas la página con F5 durante las pruebas, no pierdas la sesión.
// ============================================================================
let usuarioActual = null;

// ============================================================================
// 2. INICIALIZACIÓN AL CARGAR EL DOCUMENTO (DOMContentLoaded)
// Este evento espera a que el navegador termine de leer todo el HTML antes de
// buscar botones o contenedores con document.getElementById().
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Preparamos los eventos de los botones del menú superior (<nav>)
  configurarNavegacion();

  // 2. Verificamos si ya existía una sesión abierta en esta pestaña
  const sesionGuardada = sessionStorage.getItem("constructora_usuario");
  if (sesionGuardada) {
    usuarioActual = JSON.parse(sesionGuardada);
    iniciarInterfazAutenticada();
  } else {
    renderizarLogin();
  }
});

// ============================================================================
// 3. MÓDULO DE AUTENTICACIÓN (LOGIN Y CIERRE DE SESIÓN)
// ============================================================================

/**
 * Dibuja el formulario de inicio de sesión dentro de #login-mount y conecta
 * su evento 'submit' para validar el acceso mediante apiService.login().
 */
function renderizarLogin() {
  const loginMount = document.getElementById("login-mount");

  // Inyectamos el HTML del formulario dentro del contenedor vacío de index.html.
  // Incluimos accesos rápidos de prueba para que puedas probar los 3 roles
  // (ADMINISTRADOR, INGENIERO_RESIDENTE y CLIENTE) con un solo clic.
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

  // Escuchamos el envío ('submit') del formulario de login
  const formLogin = document.getElementById("form-login");
  formLogin.addEventListener("submit", async (evento) => {
    // e.preventDefault() evita que el navegador recargue toda la página (comportamiento
    // por defecto de HTML al enviar un formulario tradicional).
    evento.preventDefault();

    const inputCorreo = document.getElementById("login-correo");
    const feedback = document.getElementById("login-feedback");
    const btnSubmit = document.getElementById("btn-login-submit");

    // Validación básica en cliente antes de llamar al servicio
    if (!inputCorreo.value.trim()) {
      feedback.innerHTML = `<div class="alert alert-error">Por favor, ingresa tu correo electrónico.</div>`;
      return;
    }

    try {
      // Deshabilitamos el botón mientras la Promesa se resuelve (evita doble clic)
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Verificando...";
      feedback.innerHTML = "";

      // Llamamos a apiService.login() y esperamos ('await') su respuesta asíncrona
      const usuario = await apiService.login(inputCorreo.value);

      // Guardamos el usuario en memoria y en sessionStorage
      usuarioActual = usuario;
      sessionStorage.setItem("constructora_usuario", JSON.stringify(usuario));

      iniciarInterfazAutenticada();
    } catch (error) {
      // Si apiService lanza un error (correo no encontrado o inactivo), lo mostramos aquí
      feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Ingresar al Sistema";
    }
  });

  // Conectamos los 3 botones rápidos para rellenar el correo automáticamente
  document.querySelectorAll(".btn-demo-login").forEach((boton) => {
    boton.addEventListener("click", () => {
      document.getElementById("login-correo").value = boton.dataset.email;
    });
  });
}

/**
 * Configura el encabezado con los datos del usuario autenticado, filtra las
 * pestañas visibles según su Rol y abre la vista principal correspondiente.
 */
function iniciarInterfazAutenticada() {
  // 1. Ocultamos la tarjeta de Login y mostramos la barra de navegación
  document.getElementById("view-login").classList.add("hidden");
  const nav = document.getElementById("main-nav");
  nav.classList.remove("hidden");

  // 2. Actualizamos la esquina superior derecha del header con nombre, rol y botón Salir
  const sessionInfo = document.getElementById("user-session-info");
  sessionInfo.innerHTML = `
    <span class="session-user-tag">${usuarioActual.nombre} ${usuarioActual.apellidoPaterno}</span>
    <span class="session-role-pill">${usuarioActual.rol.nombre}</span>
    <button type="button" id="btn-logout" class="btn btn-primary btn-sm">Cerrar Sesión</button>
  `;

  document.getElementById("btn-logout").addEventListener("click", cerrarSesion);

  // 3. Control de acceso por Rol en el menú:
  // - CLIENTE: solo consulta Tablero y Obras/Presupuestos (no administra usuarios ni registra gastos).
  // - INGENIERO_RESIDENTE: accede a Tablero, Obras, Gastos e Ingresos, pero no administra Usuarios/Cuentas.
  // - ADMINISTRADOR: acceso completo a las 5 pestañas.
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

  // 4. Si es ADMINISTRADOR, lo llevamos directo a 'view-admin' para probar la Fase 2;
  // para otros roles, abrimos 'view-dashboard'.
  const vistaInicial = rolNombre === "ADMINISTRADOR" ? "view-admin" : "view-dashboard";
  cambiarVista(vistaInicial);
}

/**
 * Limpia la sesión actual y regresa la pantalla al formulario de Login.
 */
function cerrarSesion() {
  usuarioActual = null;
  sessionStorage.removeItem("constructora_usuario");

  document.getElementById("main-nav").classList.add("hidden");
  document.getElementById("user-session-info").innerHTML =
    `<span class="session-placeholder">Sin sesión iniciada</span>`;

  // Ocultamos todas las vistas internas y mostramos el login
  document.querySelectorAll(".view-section").forEach((sec) => sec.classList.add("hidden"));
  document.getElementById("view-login").classList.remove("hidden");
  renderizarLogin();
}

// ============================================================================
// 4. CONTROLADOR DE NAVEGACIÓN ENTRE VISTAS (ARQUITECTURA SPA)
// ============================================================================

/**
 * Asigna el evento 'click' a todos los botones de la barra de navegación.
 */
function configurarNavegacion() {
  const botonesNav = document.querySelectorAll(".nav-btn");

  botonesNav.forEach((boton) => {
    boton.addEventListener("click", () => {
      // Leemos el atributo personalizado data-view="view-..." del botón presionado
      const idVista = boton.dataset.view;
      cambiarVista(idVista);
    });
  });
}

/**
 * Oculta todas las secciones <section class="view-section">, muestra únicamente
 * la solicitada, marca como activo su botón y carga los datos de ese módulo.
 *
 * @param {string} idVista - El atributo 'id' de la sección HTML a mostrar.
 */
function cambiarVista(idVista) {
  // 1. Ocultar todas las secciones
  document.querySelectorAll(".view-section").forEach((seccion) => {
    seccion.classList.add("hidden");
  });

  // 2. Mostrar la sección destino
  const seccionActiva = document.getElementById(idVista);
  if (seccionActiva) {
    seccionActiva.classList.remove("hidden");
  }

  // 3. Actualizar la clase 'active' en los botones del menú
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    if (btn.dataset.view === idVista) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // 4. Ejecutar el renderizado correspondiente a la vista abierta
  if (idVista === "view-admin") {
    renderizarModuloAdmin();
  } else if (idVista === "view-dashboard") {
    document.getElementById("dashboard-mount").innerHTML =
      `<div class="card"><p class="text-muted">Tablero financiero consolidado — Se implementará en la Fase 5.</p></div>`;
  } else if (idVista === "view-obras") {
    document.getElementById("obras-mount").innerHTML =
      `<div class="card"><p class="text-muted">Catálogo de Obras y Presupuesto 1:1 — Se implementará en la Fase 3.</p></div>`;
  } else if (idVista === "view-gastos") {
    document.getElementById("gastos-mount").innerHTML =
      `<div class="card"><p class="text-muted">Control de Gastos por Presupuesto — Se implementará en la Fase 4.</p></div>`;
  } else if (idVista === "view-ingresos") {
    document.getElementById("ingresos-mount").innerHTML =
      `<div class="card"><p class="text-muted">Registro de Ingresos y Conciliación Bancaria — Se implementará en la Fase 4.</p></div>`;
  }
}

// ============================================================================
// 5. MÓDULO DE ADMINISTRACIÓN: USUARIOS Y CUENTAS BANCARIAS (FASE 2)
// Permite registrar usuarios (validando RFC de 13 caracteres) y dar de alta
// cuentas bancarias (indispensables como FK id_cuenta para registrar Ingresos).
// ============================================================================

/**
 * Construye la estructura de dos columnas en #admin-mount y carga las tablas
 * iniciales desde apiService.
 */
async function renderizarModuloAdmin() {
  const adminMount = document.getElementById("admin-mount");

  adminMount.innerHTML = `
    <div class="grid-2">
      <!-- COLUMNA IZQUIERDA: Alta de Usuarios (Tabla: usuario) -->
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

      <!-- COLUMNA DERECHA: Alta de Cuentas Bancarias (Tabla: cuenta_bancaria) -->
      <div class="card">
        <h3>Registrar Cuenta Bancaria</h3>
        <p class="text-muted" style="margin-bottom: 1rem;">
          Las cuentas registradas aquí estarán disponibles para recibir depósitos en el módulo de Ingresos.
        </p>
        <div id="cuenta-feedback"></div>

        <form id="form-nueva-cuenta" novalidate>
          <div class="form-group">
            <label for="cta-banco">Institución Bancaria <span class="required-mark">*</span></label>
            <input type="text" id="cta-banco" class="form-control" placeholder="Ej. BBVA México, Banorte, Santander" required />
          </div>

          <div class="form-group">
            <label for="cta-numero">Número de Cuenta <span class="required-mark">*</span></label>
            <input type="text" id="cta-numero" class="form-control" maxlength="20" required />
          </div>

          <div class="form-group">
            <label for="cta-clabe">CLABE Interbancaria (18 dígitos) <span class="required-mark">*</span></label>
            <input type="text" id="cta-clabe" class="form-control" maxlength="18" minlength="18" required />
          </div>

          <div class="form-group">
            <label for="cta-titular">Titular de la Cuenta <span class="required-mark">*</span></label>
            <input type="text" id="cta-titular" class="form-control" placeholder="Constructora del Centro S.A. de C.V." required />
          </div>

          <button type="submit" class="btn btn-primary">Guardar Cuenta Bancaria</button>
        </form>
      </div>
    </div>

    <!-- TABLA DE USUARIOS REGISTRADOS -->
    <div class="card">
      <h3>Directorio de Usuarios Activos</h3>
      <div id="tabla-usuarios-container" class="table-responsive">
        <p class="text-muted">Cargando usuarios...</p>
      </div>
    </div>

    <!-- TABLA DE CUENTAS BANCARIAS -->
    <div class="card">
      <h3>Cuentas Bancarias de la Constructora</h3>
      <div id="tabla-cuentas-container" class="table-responsive">
        <p class="text-muted">Cargando cuentas bancarias...</p>
      </div>
    </div>
  `;

  // Conectamos los eventos 'submit' de ambos formularios
  configurarFormularioUsuario();
  configurarFormularioCuenta();

  // Cargamos las dos tablas en paralelo usando Promise.all()
  await Promise.all([cargarTablaUsuarios(), cargarTablaCuentas()]);
}

/**
 * Configura la validación y el guardado del formulario de nuevo Usuario.
 */
function configurarFormularioUsuario() {
  const form = document.getElementById("form-nuevo-usuario");
  const feedback = document.getElementById("usuario-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.innerHTML = "";

    const rfcValor = document.getElementById("usr-rfc").value.trim().toUpperCase();

    // Validación estricta del lado del cliente: RFC de 13 caracteres
    if (rfcValor.length !== 13) {
      feedback.innerHTML = `<div class="alert alert-error">El RFC debe contener exactamente 13 caracteres (actualmente tiene ${rfcValor.length}).</div>`;
      return;
    }

    const payload = {
      idRol: document.getElementById("usr-rol").value,
      nombre: document.getElementById("usr-nombre").value,
      apellidoPaterno: document.getElementById("usr-paterno").value,
      apellidoMaterno: document.getElementById("usr-materno").value,
      correo: document.getElementById("usr-correo").value,
      rfc: rfcValor,
      telefono: document.getElementById("usr-telefono").value
    };

    try {
      await apiService.crearUsuario(payload);
      feedback.innerHTML = `<div class="alert alert-success">Usuario registrado correctamente.</div>`;
      form.reset(); // Limpia todos los campos del formulario
      await cargarTablaUsuarios(); // Refresca la tabla para mostrar el nuevo registro
    } catch (error) {
      feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
  });
}

/**
 * Configura la validación y el guardado del formulario de Cuenta Bancaria.
 */
function configurarFormularioCuenta() {
  const form = document.getElementById("form-nueva-cuenta");
  const feedback = document.getElementById("cuenta-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.innerHTML = "";

    const clabeValor = document.getElementById("cta-clabe").value.trim();
    if (!/^\d{18}$/.test(clabeValor)) {
      feedback.innerHTML = `<div class="alert alert-error">La CLABE interbancaria debe tener exactamente 18 dígitos numéricos.</div>`;
      return;
    }

    const payload = {
      banco: document.getElementById("cta-banco").value,
      numeroCuenta: document.getElementById("cta-numero").value,
      clabe: clabeValor,
      titular: document.getElementById("cta-titular").value
    };

    try {
      await apiService.crearCuentaBancaria(payload);
      feedback.innerHTML = `<div class="alert alert-success">Cuenta bancaria agregada correctamente.</div>`;
      form.reset();
      await cargarTablaCuentas();
    } catch (error) {
      feedback.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
  });
}

/**
 * Consulta los usuarios en apiService y construye la tabla HTML dinámicamente.
 */
async function cargarTablaUsuarios() {
  const container = document.getElementById("tabla-usuarios-container");
  const usuarios = await apiService.getUsuarios();

  // .map() transforma cada objeto 'u' en una fila HTML <tr>...</tr> y .join("") une todo en un solo texto
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

/**
 * Consulta las cuentas bancarias en apiService y construye su tabla HTML.
 */
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