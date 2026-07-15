---

## 📑 Tabla de contenido

1. Descripción general
2. Capturas de pantalla
3. Funcionalidades principales
4. Tecnologías utilizadas
5. Instalación
6. Uso
7. Estructura del proyecto
8. Contribuciones
9. Contacto

> GitHub genera automáticamente un índice navegable con los encabezados de este archivo: usa el ícono ☰ en la esquina superior izquierda del documento renderizado para saltar a cualquier sección.

## 🎯 Descripción general

**Acadex** es una aplicación híbrida de gestión académica pensada para estudiantes universitarios. Centraliza en un solo lugar las **materias inscritas**, las **tareas y evaluaciones pendientes**, y el **calendario de clases**, para dejar atrás las agendas físicas, las notas sueltas y la dispersión de la información académica entre varias aplicaciones.

Con Acadex el estudiante puede registrar sus materias con su profesor y horario, crear asignaciones con fecha límite y prioridad, visualizar en un calendario qué días tiene clases o entregas, y dar seguimiento a su progreso y calificaciones desde un solo panel.

## 🖼️ Capturas de pantalla

<table align="center">
  <tr>
    <td align="center"><img width="826" height="841" alt="Captura de pantalla 2026-07-14 215133" src="https://github.com/user-attachments/assets/91e4ff50-8a39-4dd1-8d43-3f32db13251e" /><br/><sub><b>Iniciar sesión</b></sub></td>

    <td align="center"><img src="docs/screenshots/registro.png" width="220"/><br/><sub><b>Crear cuenta</b></sub></td>
    <td align="center"><img src="docs/screenshots/calendario.png" width="280"/><br/><sub><b>Calendario</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/tareas.png" width="280"/><br/><sub><b>Gestión académica</b></sub></td>
    <td align="center"><img src="docs/screenshots/materias.png" width="280"/><br/><sub><b>Mis materias</b></sub></td>
    <td align="center"><img src="docs/screenshots/perfil.png" width="220"/><br/><sub><b>Mi perfil</b></sub></td>
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
- Listado de materias con la cantidad de asignaciones evaluadas y el promedio actual.

### 👤 Perfil de usuario
- Foto de perfil editable y resumen de tareas completadas, pendientes y materias activas.
- Perfil académico editable (universidad, carrera, matrícula).
- Preferencias de la app: tema claro/oscuro, notificaciones y anticipación del recordatorio de entrega.

## 🛠️ Tecnologías utilizadas

> *Completa esta sección con el stack real del proyecto; se deja la estructura sugerida a modo de guía.*

| Categoría | Tecnología |
|---|---|
| Frontend | _por definir_ |
| Backend | _por definir_ |
| Base de datos | _por definir_ |
| Autenticación | _por definir_ |
| Control de versiones | Git y GitHub |

## ⚙️ Instalación

> Ajusta estos pasos según el stack final del proyecto.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/fernandolugorodriguez26/Acadex.git
   cd Acadex
   ```
2. Instala las dependencias del proyecto (por ejemplo, si es un proyecto Node.js):
   ```bash
   npm install
   ```
3. Configura las variables de entorno necesarias (credenciales de base de datos, autenticación, etc.) en un archivo `.env`.
4. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
5. Abre `http://localhost:8100` (o el puerto que corresponda) en tu navegador.

### Requisitos previos
- Navegador actualizado (Chrome, Safari, Edge o Firefox).
- Conexión a internet para iniciar sesión y sincronizar el calendario.
- Node.js 18 o superior, si el proyecto lo requiere.

## ▶️ Uso

Una vez dentro de la aplicación:

1. Crea tu cuenta o inicia sesión.
2. Registra tus materias en el módulo **Mis Materias**.
3. Agrega tus tareas y evaluaciones desde **Gestión Académica**, asociándolas a una materia y una fecha límite.
4. Consulta el **Calendario** para ver tus clases y entregas del día.
5. Da seguimiento a tu progreso y ajusta tus preferencias desde **Mi Perfil**.

Para una guía detallada, paso a paso y con capturas de cada pantalla, consulta el **Manual de Usuario** del proyecto (`docs/Manual_Usuario_Acadex.docx`).

## 📁 Estructura del proyecto

> *Ajusta este árbol a la estructura real de carpetas del repositorio.*

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

## 🤝 Contribuciones

Este es un proyecto académico. Si quieres proponer una mejora o reportar un error, abre un [issue](https://github.com/fernandolugorodriguez26/Acadex/issues) o envía un pull request.


## ✉️ Contacto

**Fernando Lugo Rodríguez** — [@fernandolugorodriguez26](https://github.com/fernandolugorodriguez26)

Enlace del proyecto: [github.com/fernandolugorodriguez26/Acadex](https://github.com/fernandolugorodriguez26/Acadex)
