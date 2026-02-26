# E4C App

## Descripción

E4C es una plataforma educativa innovadora que integra la tecnología blockchain Stellar para fomentar la participación estudiantil a través de un sistema de recompensas basado en tokens (E4C) y NFTs. Actualmente, cuenta con un marketplace completamente funcional donde los estudiantes pueden canjear sus tokens y una lógica funcional completa que soporta la asignación, validación y distribución de recompensas. Permite a docentes asignar tareas, a validadores aprobar el rendimiento, y a estudiantes canjear sus tokens en el marketplace.

## Guía de Instalación

Para configurar el proyecto y empezar a trabajar, sigue los siguientes pasos:

### 1. Requisitos Previos

Asegúrate de tener instalados los siguientes programas:

*   **Node.js** (versión 18 o superior) y **npm**
*   **Git**
*   **Supabase CLI**: Instala el CLI siguiendo las instrucciones oficiales de Supabase.

### 2. Clonar el Repositorio

Abre tu terminal y ejecuta el siguiente comando para clonar el proyecto:

```bash
git clone https://github.com/pablosebastiangomez-dev/E4C.git
cd E4C
```

### 3. Instalación de Dependencias

Una vez dentro del directorio del proyecto, instala todas las dependencias necesarias:

```bash
npm install
```

### 4. Configuración de Supabase

Este proyecto utiliza Supabase como backend. Puedes usar una instancia local o conectar a un proyecto remoto existente.

#### A. Configuración Local con Supabase CLI (Recomendado para Desarrollo)

1.  **Iniciar Supabase localmente:**
    ```bash
    supabase start
    ```
    Esto levantará los servicios de Supabase (PostgreSQL, Auth, Storage, etc.) en tu máquina local. Anota la `Project URL`, `Anon Key` y `Service Role Key` que te proporcionará el CLI.

2.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz de tu proyecto con las siguientes variables. Usa los valores proporcionados por `supabase start` para `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (aunque para Edge Functions, recuerda usar `SB_SERVICE_ROLE_KEY` como se explica más abajo).

    ```
    VITE_SUPABASE_URL="[Project URL de Supabase]"
    VITE_SUPABASE_ANON_KEY="[Anon Key de Supabase]"
    ```
    Estas variables `VITE_` son para el frontend.

3.  **Variables de Entorno para Edge Functions:**
    Para tus Edge Functions de Supabase, deberás configurar las variables directamente en el dashboard de Supabase (Project Settings > Edge Functions > Manage Secrets). Asegúrate de incluir:
    *   `SUPABASE_URL`: Tu Project URL de Supabase.
    *   `SUPABASE_ANON_KEY`: Tu Anon Key de Supabase.
    *   `SB_SERVICE_ROLE_KEY`: Tu Service Role Key de Supabase (¡Importante! Usa `SB_` en lugar de `SUPABASE_` por restricciones de nombres en Edge Functions).
    *   `E4C_ESCROW_ACCOUNT_PUBLIC_KEY`: La clave pública de tu cuenta de bóveda (escrow) Stellar.
    *   `STELLAR_NETWORK`: `TESTNET` (o `PUBLIC` si usas la red principal de Stellar).

4.  **Desplegar Edge Functions:**
    Despliega todas las Edge Functions a tu proyecto de Supabase. Es crucial que se desplieguen *después* de configurar las variables de entorno.

    ```bash
    supabase functions deploy --all --no-verify-jwt
    ```

5.  **Ejecutar Scripts SQL:**
    Ejecuta los siguientes scripts SQL en tu **SQL Editor de Supabase** para configurar las tablas y funciones necesarias. Puedes encontrarlos en la raíz del proyecto.
    *   `supabase_create_tasks_table.sql`
    *   `sync_tokens.sql`
    *   `sync_tokens_marketplace.sql` (Asegúrate de ejecutar el `DROP FUNCTION` primero si es necesario, como se indica en la documentación)

### 5. Iniciar la Aplicación

Una vez que todas las dependencias estén instaladas y Supabase configurado, puedes iniciar la aplicación en modo desarrollo:

```bash
npm run dev
```

La aplicación se abrirá en tu navegador en `http://localhost:5173` (o un puerto similar).

## Uso

E4C ofrece diferentes paneles para cada rol de usuario, facilitando un ciclo completo de gestión educativa y recompensas blockchain:

*   **Administrador:** Accede al `AdminDashboard` para gestionar usuarios (estudiantes, docentes, validadores), configurar las cuentas Stellar necesarias (Emisor, Distribuidor, Bóveda de Canje/Redención), emitir y canjear tokens E4C, y monitorear la actividad general de la plataforma. Este rol es clave para la configuración inicial y el mantenimiento del ecosistema blockchain.
*   **Docente:** Utiliza el `TeacherDashboard` para asignar tareas a los estudiantes, revisar sus entregas y proponer recompensas en forma de tokens E4C y NFTs.
*   **Validador:** En el `ValidatorDashboard`, los validadores aprueban el cumplimiento técnico de las tareas entregadas por los estudiantes. Al aprobar una tarea, se dispara automáticamente la transferencia de tokens E4C desde la cuenta distribuidora al monedero del estudiante, utilizando la `Edge Function 'send-e4c-tokens'` para asegurar la transacción en la blockchain Stellar.
*   **Estudiante:** Desde su `StudentDashboard`, los estudiantes pueden ver las tareas asignadas, entregar su trabajo, revisar su balance de tokens E4C y NFTs. Además, tienen acceso a un `Marketplace` donde pueden canjear sus tokens E4C por NFTs únicos u otras recompensas. También pueden activar su Trustline con E4C directamente desde su dashboard para recibir tokens.

## Stack Tecnológico

El proyecto E4C está construido con las siguientes tecnologías:

*   **Frontend:**
    *   [React](https://react.dev/) (con TypeScript)
    *   [Vite](https://vitejs.dev/)
    *   [TailwindCSS](https://tailwindcss.com/)
    *   [Lucide React](https://lucide.dev/) (iconos)
    *   [Recharts](https://recharts.org/) (gráficos)
*   **Backend & Base de Datos:**
    *   [Supabase](https://supabase.com/) (PostgreSQL para base de datos, autenticación, almacenamiento)
    *   [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (escrito en Deno para lógica de servidor sin servidor)
*   **Blockchain:**
    *   [Stellar](https://stellar.org/) (red blockchain para tokens E4C y NFTs)
    *   [Stellar SDK](https://stellar.github.io/js-stellar-sdk/)
*   **Gestor de Paquetes:** [npm](https://www.npmjs.com/)

---

## Badges (Insignias)

Puedes añadir insignias a tu README para mostrar el estado del proyecto de un vistazo. Aquí algunos ejemplos de insignias comunes:

*   **Estado de Compilación (CI/CD):**
    `![Build Status](https://img.shields.io/github/workflow/status/tu-usuario/tu-repo/nombre-workflow?style=flat-square)`
*   **Cobertura de Tests:**
    `![Test Coverage](https://img.shields.io/codecov/c/github/tu-usuario/tu-repo?style=flat-square)`
*   **Versión de la Aplicación:**
    `![App Version](https://img.shields.io/github/v/release/tu-usuario/tu-repo?style=flat-square)`
*   **Licencia:**
    `![License](https://img.shields.io/github/license/tu-usuario/tu-repo?style=flat-square)`
*   **Contribuidores:**
    `![Contributors](https://img.shields.io/github/contributors/tu-usuario/tu-repo?style=flat-square)`

**Nota:** Deberás reemplazar `tu-usuario` y `tu-repo` con los datos de tu repositorio y configurar las integraciones correspondientes (ej. GitHub Actions, Codecov) para que estas insignias funcionen.

---

## 🔐 Licencia y Propiedad
Este proyecto es **software propietario** de E4C. Todos los derechos reservados a Pablo Gomez.
No se permite el uso externo sin autorización expresa.
