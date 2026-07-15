## 🎯 Descripción general

**Acadex** es una aplicación híbrida de gestión académica pensada para estudiantes universitarios. Centraliza en un solo lugar las **materias inscritas**, las **tareas y evaluaciones pendientes**, y el **calendario de clases**, para dejar atrás las agendas físicas, las notas sueltas y la dispersión de la información académica entre varias aplicaciones.

Con Acadex el estudiante puede registrar sus materias con su profesor y horario, crear asignaciones con fecha límite y prioridad, visualizar en un calendario qué días tiene clases o entregas, y dar seguimiento a su progreso y calificaciones desde un solo panel.

## 🖼️ Capturas de pantalla

<table align="center">
  <tr>
    <td align="center"><img width="826" height="841" alt="Captura de pantalla 2026-07-14 215133" src="https://github.com/user-attachments/assets/91e4ff50-8a39-4dd1-8d43-3f32db13251e" /><br/><sub><b>Iniciar sesión</b></sub></td>
    <td align="center"><img width="499" height="968" alt="Captura de pantalla 2026-07-14 215147" src="https://github.com/user-attachments/assets/05a30996-362e-42be-9148-fa999ea9e677" /><br/><sub><b>Crear cuenta</b></sub></td>
    <td align="center"><img width="1908" height="1045" alt="Captura de pantalla 2026-07-14 215108" src="https://github.com/user-attachments/assets/6fab20f4-095a-46e6-a116-d4d158979268" /><br/><sub><b>Inicio</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img width="1892" height="1056" alt="Captura de pantalla 2026-07-14 212810" src="https://github.com/user-attachments/assets/42772991-d80d-4d63-998e-79fd2a50fea6" /><br/><sub><b>Gestión académica</b></sub></td>
    <td align="center"><img width="1913" height="1055" alt="Captura de pantalla 2026-07-14 212751" src="https://github.com/user-attachments/assets/708736f1-f1db-4a64-8283-e4defbe7bbf4" /><br/><sub><b>Mis materias</b></sub></td>
    <td align="center"><img width="1895" height="1057" alt="Captura de pantalla 2026-07-14 212823" src="https://github.com/user-attachments/assets/dd298ab9-2966-41cd-9ddf-148e5a904ed3" /><br/><sub><b>Mi perfil</b></sub></td>
  </tr>
</table>

## ✨ Funcionalidades principales

### 🔐 Autenticación
- Inicio de sesión con correo electrónico y contraseña, con opción de mostrar u ocultar la contraseña.
- Recuperación de contraseña mediante el enlace "¿Olvidaste tu contraseña?".
- Registro de cuenta nueva con nombre, apellido, correo y contraseña; los datos de universidad, carrera y matrícula son opcionales y pueden completarse después desde el perfil.
- Validación de campos obligatorios antes de continuar.

### 📅 Calendario académico
- Vista mensual con navegación entre meses y el día actual resaltado automáticamente.
- Los días con clases o entregas programadas se destacan visualmente en la cuadrícula.
- Botón de sincronización para actualizar la vista con los cambios más recientes.
- Bloques de **"Clases de hoy"** y **"Entregas de la fecha"**, con acceso directo a Materias y un botón flotante para crear una nueva asignación sin salir del calendario.

### ✅ Gestión de tareas y asignaciones
- Barra de progreso global con porcentaje de tareas completadas y contador de racha de días.
- Formulario de nueva asignación: título, tipo, prioridad, materia, fecha límite, notas rápidas y archivo adjunto opcional.
- Listado de tareas filtrable por chips: Todas, Hoy, Próximos 7 días, Pendientes y Completadas.
- Registro y edición de calificaciones por asignación.

### 📘 Gestión de materias
- Registro de asignaturas con código, nombre, profesor/facilitador y día de clase opcional.
- Listado de materias con la cantidad de asignaciones evaluadas y el promedio actual de forma ponderada.

### 👤 Perfil de usuario
- Foto de perfil editable y resumen de tareas completadas, pendientes y materias activas.
- Perfil académico editable (universidad, carrera, matrícula).
- Preferencias de la app: tema claro/oscuro, notificaciones y anticipación del recordatorio de entrega.

## 🛠️ Tecnologías utilizadas

| Categoría | Tecnología |
|---|---|
| Frontend | Ionic Framework (Angular / TypeScript) |
| Backend | Firebase (Arquitectura Serverless) |
| Base de datos | Cloud Firestore (NoSQL) |
| Autenticación | Firebase Authentication |
| Control de versiones | Git y GitHub |

## ⚙️ Instalación y Configuración

Para clonar y ejecutar este proyecto de forma local, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/fernandolugorodriguez26/Acadex.git](https://github.com/fernandolugorodriguez26/Acadex.git)
   cd Acadex
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Configurar Firebase:
Para conectar la app con la base de datos, debes añadir las credenciales de Firebase en el archivo de configuración de entornos de Angular. Abre el archivo src/environments/environment.ts (y environment.prod.ts para producción) e ingresa las claves de API.
```
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
```
5. Inicia la aplicación en modo desarrollo:
   ```bash
   ionic serve
   ```
6. Se abre `http://localhost:8100` en tu navegador.

### Requisitos previos
-Node.js: Versión 18 o superior.
-Navegador web: Chrome, Safari, Edge o Firefox actualizado.
-Conectividad: Conexión a internet activa para los flujos de autenticación y sincronización con Firebase.

## ▶️ Uso

Una vez dentro de la aplicación:

1. Crea tu cuenta o inicia sesión.
2. Registra tus materias en el módulo **Mis Materias**.
3. Agrega tus tareas y evaluaciones desde **Gestión Académica**, asociándolas a una materia y una fecha límite.
4. Consulta el **Calendario** para ver tus clases y entregas del día.
5. Da seguimiento a tu progreso y ajusta tus preferencias desde **Mi Perfil**.

Para una guía detallada, paso a paso y con capturas de cada pantalla, consulta el **Manual de Usuario** del proyecto (`https://drive.google.com/file/d/1fjYypJ8CSl9VlclOZdQtqfKjBEye8YO5/view?usp=sharing`)).

## 📁 Estructura del proyecto

```
src/
└── app/
    ├── core/
    │   ├── services/
    │   │   ├── auth.ts
    │   │   ├── data.ts
    │   │   └── notification.service.ts
    │   └── core-module.ts
    ├── home/
    ├── modules/
    │   ├── auth/
    │   ├── calendar/
    │   ├── dashboard/
    │   ├── profile/
    │   ├── subjects/
    │   └── tasks/
    ├── shared/
    ├── app-routing.module.ts
    ├── app.component.html
    ├── app.component.scss
    ├── app.component.spec.ts
    └── app.component.ts
```
## 📅 Historial de Desarrollo (Progreso Semanal)

El proyecto se desarrolló de manera iterativa y progresiva a lo largo de 6 semanas, aplicando un control de versiones riguroso con la metodología de commits descriptivos (Git Commit Guidelines):

* **Semana 1 (Principios de Junio 2026): Inicialización y Estructura Base**
    * `feat: inicializar arquitectura base del proyecto ionic angular`
    * `structure: organizar directorios core, shared y modules`
    * `route: configurar mapeo de rutas con carga perezosa (lazy loading)`
* **Semana 2 (Mediados de Junio 2026): Sistema de Autenticación**
    * `feat: integrar servicio de autenticación de firebase en el core`
    * `style: diseñar vistas de inicio de sesión y registro con validaciones reactivas`
    * `fix: gestionar errores de excepción para credenciales de acceso`
* **Semana 3 (Finales de Junio 2026): Gestión de Materias y Firebase**
    * `feat: configurar servicio de datos para operaciones CRUD en firestore`
    * `feat: diseñar módulo de registro de asignaturas con listado dinámico`
    * `math: implementar algoritmo de cálculo en tiempo real para calificación literal`
* **Semana 4 (Principios de Julio 2026): Tareas, Gamificación y Calendario**
    * `feat: crear panel de gestión de tareas con filtros de búsqueda por chips`
    * `feat: integrar cuadrícula de vista mensual para el calendario`
    * `ui: diseñar widgets de barra de progreso global y racha de estudio`
* **Semana 5 (Mediados de Julio 2026): Integración de APIs Nativas y Ajustes**
    * `feat: implementar servicio offline de notificaciones locales con capacitor`
    * `native: forzar diseño inmersivo (immersive sticky) de android en MainActivity`
    * `fix: corregir superposición del fondo oscuro al seleccionar modo claro`
* **Semana 6 (Entrega - Julio 15, 2026): Control de Calidad y Documentación**
    * `docs: crear manual de usuario y archivos de especificación técnica`
    * `fix: implementar handleImageError como respaldo para foto de perfil en storage`
    * `release: despliegue de versión estable de producción 1.0.0`
  
## 🤝 Contribuciones

Este es un proyecto académico. Si quieres proponer una mejora o reportar un error, abre un [issue](https://github.com/fernandolugorodriguez26/Acadex/issues) o envía un pull request.


## ✉️ Contacto

**Fernando Lugo Rodríguez** — [@fernandolugorodriguez26](https://github.com/fernandolugorodriguez26)

Enlace del proyecto: [github.com/fernandolugorodriguez26/Acadex](https://github.com/fernandolugorodriguez26/Acadex)

#Documentación Tecnica
```https://drive.google.com/file/d/1KCYBPzeKqGjBzJc6Hlg-HgXtJ8kVlMLY/view?usp=sharing```
