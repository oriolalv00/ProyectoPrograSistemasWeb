# Propuesta de Proyecto: Administración de Constructora mediante un Microservicio

## 1. Miembros del Equipo
* Angel Fernando Hernández Torres
* Oriol Santiago Alvarez Santacruz

## 2. Repositorio de GitHub
* (https://github.com/oriolalv00/ProyectoPrograSistemasWeb)

## 3. Stack Tecnológico
* *Frontend:* HTML, CSS, JavaScript
* *Backend:* Java con Spring Boot
* *Base de Datos:* MySQL
* *Librerías, dependencias y herramientas:* Docker (para contenerización del microservicio y base de datos).

## Requerimientos

## Requerimientos funcionales y no funcionales
### Funcionales:
• Permitir el registro, edición y eliminación de proyectos u obras de construcción.

• Asignar y modificar el presupuesto general de cada obra.

• Permitir que los administradores e ingenieros registren los gastos diarios asociados a conceptos específicos de una obra.

• Actualizar el porcentaje de avance físico de cada proyecto.

• Proporcionar una vista exclusiva para que los clientes consulten el estado de su obra, comparando el avance físico con el financiero.

### No funcionales (cómo funcionará el sistema):
• El backend estará desarrollado en Java con Spring Boot y la base de datos en MySQL.

• Todo el entorno, incluyendo el backend y la base de datos, se ejecutará mediante contenedores Docker.

• El sistema será responsivo y accesible desde navegadores web, con un frontend desarrollado en HTML, CSS y JavaScript.

## Casos de uso 

* Caso de uso 1: Gestión de obras (Administrador).
El administrador inicia sesión, accede al panel de control y crea un nuevo perfil de obra, asignándole un cliente, una ubicación y un presupuesto inicial.

• Caso de uso 2: Control de gastos (Ingeniero/Administrador).
El ingeniero o administrador selecciona una obra en curso y registra los gastos correspondientes, como la compra de materiales. El sistema actualiza el saldo disponible del presupuesto.

• Caso de uso 3: Monitoreo de inversión (Cliente).
El cliente o inversionista inicia sesión y accede a un panel de solo lectura, donde puede consultar una barra de progreso con el avance físico de su construcción y un resumen del presupuesto ejecutado.

## Modelo de entidad-relación:

Para la base de datos MySQL se manejarán principalmente cuatro entidades:

• Usuario: Almacena la información de las personas que utilizan el sistema: ID, nombre, correo, contraseña y rol (Administrador o Cliente).

• Obra: Contiene los datos del proyecto de construcción: ID, nombre, ubicación, fecha de inicio, fecha estimada de finalización y porcentaje de avance actual. Está relacionada con el usuario que es propietario de la obra.

• Presupuesto: Está ligado a una obra y almacena el monto total asignado y el saldo disponible.

• Gasto/Transacción: Está relacionado con un presupuesto y registra cada salida de dinero, incluyendo ID, concepto del gasto, monto, fecha y persona que lo registró.

<img width="1536" height="1024" alt="WhatsApp Image 2026-10-14 at 7 45 19 AM" src="https://github.com/user-attachments/assets/8ce5a9d9-b142-4283-b009-4b8fb7565fb6" />


## Historias de usuario

Historia 1: Control de gastos.
Como administrador de obra, quiero registrar los gastos de materiales en tiempo real para mantener un control preciso del presupuesto disponible, sin depender de hojas de cálculo dispersas.

Historia 2: Seguimiento del avance.
Como cliente o inversionista, quiero consultar el progreso porcentual de mi obra en el sistema para conocer el avance del proyecto sin necesidad de visitar físicamente la construcción todos los días.

## Criterios de aceptación

Para la Historia 1 (Gastos):
• El sistema debe impedir el registro de un gasto que supere el presupuesto disponible o mostrar una alerta.
• Después de guardar un gasto, el nuevo saldo disponible debe calcularse y mostrarse inmediatamente.

Para la Historia 2 (Vista del cliente):
• El cliente no debe tener acceso a opciones de edición; su interfaz será exclusivamente de consulta.
• Un cliente nunca debe poder visualizar las obras pertenecientes a otro cliente. El sistema debe garantizar la privacidad y el aislamiento de la información de cada usuario.
