Sistema de Gestión de Obras y Portal de Clientes

Sistema web para la administración de proyectos de construcción, control presupuestario, registro de gastos y seguimiento del avance físico y financiero de las obras. La plataforma busca centralizar la información y ofrecer transparencia a los clientes mediante un portal de consulta personalizado.

1. Requerimientos del sistema

1.1 Requerimientos funcionales

- RF-01. Gestión de obras: El sistema permitirá registrar, consultar, editar y eliminar proyectos u obras de construcción.
- RF-02. Gestión de presupuestos: Permitirá asignar y modificar el presupuesto general de cada obra, así como consultar el saldo disponible.
- RF-03. Registro de gastos: Los administradores e ingenieros podrán registrar los gastos diarios asociados a conceptos específicos de una obra.
- RF-04. Seguimiento del avance físico: Permitirá actualizar el porcentaje de avance físico de cada proyecto.
- RF-05. Portal de clientes: Proporcionará una interfaz exclusiva para que cada cliente consulte el estado de su obra, incluyendo el avance físico y financiero.
- RF-06. Control de acceso: El sistema restringirá las funcionalidades según el rol del usuario y garantizará que cada cliente únicamente pueda consultar la información de sus propias obras.

1.2 Requerimientos no funcionales

- RNF-01. Backend: Desarrollado en Java utilizando Spring Boot.
- RNF-02. Base de datos: Se utilizará MySQL para almacenar y administrar la información del sistema.
- RNF-03. Contenedorización: El backend y la base de datos se ejecutarán mediante contenedores Docker.
- RNF-04. Interfaz web: El frontend se desarrollará utilizando HTML, CSS y JavaScript.
- RNF-05. Diseño responsivo: La interfaz deberá adaptarse a diferentes tamaños de pantalla y ser accesible desde navegadores web.
- RNF-06. Seguridad: El sistema deberá proteger las credenciales de acceso, aplicar controles de autorización y evitar el acceso no autorizado a la información de otros clientes.

2. Casos de uso

CU-01. Gestión de obras

Actor: Administrador.

Descripción: El administrador inicia sesión y accede al panel de control para crear y administrar proyectos de construcción.

Flujo principal:

1. El administrador inicia sesión.
2. Accede al módulo de gestión de obras.
3. Registra una nueva obra con su nombre, ubicación, cliente asignado, fechas y presupuesto inicial.
4. Guarda la información.
5. El sistema registra la obra y confirma la operación.

Resultado esperado: La obra queda registrada y disponible para su administración.

CU-02. Control de gastos

Actores: Ingeniero y administrador.

Descripción: El usuario autorizado registra los gastos asociados a una obra y consulta el presupuesto disponible actualizado.

Flujo principal:

1. El usuario inicia sesión.
2. Selecciona una obra.
3. Ingresa el concepto, el monto y la fecha del gasto.
4. El sistema valida que el monto no supere el saldo disponible.
5. Si la validación es satisfactoria, registra el gasto y actualiza el saldo.
6. El sistema muestra el nuevo saldo disponible.

Resultado esperado: El gasto queda registrado y el presupuesto refleja la operación realizada.

CU-03. Monitoreo de inversión

Actor: Cliente o inversionista.

Descripción: El cliente consulta el estado de su obra mediante un panel de solo lectura.

Flujo principal:

1. El cliente inicia sesión.
2. Accede a su panel personal.
3. Consulta el porcentaje de avance físico de su obra.
4. Visualiza el presupuesto total, el monto ejecutado y el saldo disponible.
5. El sistema muestra únicamente la información autorizada para ese cliente.

Resultado esperado: El cliente puede dar seguimiento a su inversión sin modificar información del sistema ni acceder a obras de terceros.

3. Modelo entidad-relación (ER)

La base de datos estará organizada inicialmente en cuatro entidades principales.

3.1 Usuario

Almacena la información de las personas que utilizan el sistema.

Atributos principales:

- "id_usuario": identificador único.
- "nombre": nombre completo del usuario.
- "correo": correo electrónico de acceso.
- "contrasena": contraseña almacenada de forma segura mediante un hash.
- "rol": función del usuario dentro del sistema.

Relaciones: Un cliente puede estar asociado a una o varias obras. Los usuarios autorizados también podrán registrar gastos.

3.2 Obra

Contiene la información general de cada proyecto de construcción.

Atributos principales:

- "id_obra": identificador único.
- "nombre": nombre del proyecto.
- "ubicacion": dirección o ubicación de la obra.
- "fecha_inicio": fecha de inicio del proyecto.
- "fecha_fin_estimada": fecha estimada de finalización.
- "porcentaje_avance": porcentaje de avance físico.
- "id_cliente": referencia al cliente propietario de la obra.

Relaciones: Cada obra pertenece a un cliente y se vincula con su presupuesto.

3.3 Presupuesto

Registra la información financiera asignada a una obra.

Atributos principales:

- "id_presupuesto": identificador único.
- "id_obra": referencia a la obra correspondiente.
- "monto_total": presupuesto total asignado.
- "saldo_disponible": cantidad restante después de considerar los gastos registrados.

Relaciones: Cada presupuesto está asociado a una obra y puede tener múltiples gastos relacionados.

3.4 Gasto o transacción

Registra las salidas de dinero realizadas durante la ejecución de una obra.

Atributos principales:

- "id_gasto": identificador único.
- "id_presupuesto": referencia al presupuesto afectado.
- "concepto": descripción del gasto.
- "monto": importe de la transacción.
- "fecha": fecha del gasto.
- "id_usuario": referencia al usuario que registró la operación.

Relaciones: Cada gasto pertenece a un presupuesto y queda asociado al usuario que lo registró.

4. Historias de usuario

HU-01. Registro y control de gastos

Como administrador o ingeniero de obra,
quiero registrar los gastos de materiales y otros conceptos en tiempo real,
para mantener un control preciso del presupuesto disponible y evitar el uso de hojas de cálculo dispersas.

HU-02. Seguimiento del avance de obra

Como cliente o inversionista,
quiero consultar el porcentaje de avance físico y el estado financiero de mi obra,
para conocer el progreso del proyecto y dar seguimiento a mi inversión sin necesidad de visitar físicamente la construcción todos los días.

5. Criterios de aceptación

CA-01. Validación de gastos

- El sistema deberá validar que el importe de un gasto sea mayor que cero.
- No se permitirá registrar un gasto cuyo monto supere el saldo disponible.
- Si el importe excede el saldo, el sistema mostrará un mensaje de error y conservará el presupuesto sin cambios.
- Cuando el gasto sea válido, se registrará la transacción y se actualizará el saldo disponible.
- El nuevo saldo deberá mostrarse inmediatamente después de confirmar la operación.
- Las operaciones financieras deberán ejecutarse de manera consistente para evitar que varios gastos simultáneos excedan el presupuesto.

CA-02. Acceso al portal de clientes

- El cliente únicamente podrá consultar las obras que tenga asignadas.
- No tendrá acceso a opciones para crear, editar o eliminar obras, presupuestos o gastos.
- El sistema verificará los permisos en el backend, no solamente mediante restricciones en la interfaz.
- Los intentos de consultar información perteneciente a otro cliente deberán ser rechazados.
- El panel mostrará el avance físico, el presupuesto total, el monto ejecutado y el saldo disponible de las obras autorizadas.

6. Tecnologías utilizadas

Tecnología| Propósito
Java| Lenguaje de programación del backend
Spring Boot| Desarrollo de la aplicación backend y sus API REST
MySQL| Gestión de la base de datos relacional
HTML5| Estructura de la interfaz web
CSS3| Diseño y adaptación responsiva
JavaScript| Interactividad del frontend y consumo de las API
Docker| Contenedorización del backend y la base de datos
Docker Compose| Orquestación del entorno de desarrollo

7. Objetivo del proyecto

Desarrollar una plataforma web que centralice la gestión administrativa y financiera de las obras de construcción, facilite el control de gastos y permita a los clientes consultar el avance de sus proyectos de forma segura, clara y transparente.

8. Estado del proyecto

Proyecto en desarrollo. La implementación de los módulos, la configuración del entorno Docker y las funcionalidades descritas se completarán progresivamente.
