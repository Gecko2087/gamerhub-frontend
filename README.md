# GamerHub Frontend

Interfaz React de GamerHub: perfiles de usuario, catálogo de juegos, filtros por clasificación y favoritos. El frontend consume una API independiente; no incluye una base de datos ni simula respuestas cuando el backend está fuera de línea.

## Recorrido para visitantes

Cuando el despliegue define `VITE_DEMO_MODE=true`, la pantalla de acceso ofrece **Abrir demo temporal**. Esa acción llama a `POST /auth/demo` y, si la API está disponible, recibe una sesión aislada para probar perfiles y favoritos con datos ficticios. La persistencia y la caducidad de una hora pertenecen al backend de demostración.

El frontend informa el error si no puede conectarse. No presenta un catálogo local como si fuera información del backend.

Recorrido sugerido:

1. Abrir la demo temporal.
2. Seleccionar o crear un perfil ficticio.
3. Buscar un juego en el catálogo.
4. Agregarlo a favoritos y abrir la lista del perfil.

## Desarrollo local

Requiere una versión vigente de Node.js y npm.

```bash
npm install
npm run dev
```

Vite muestra en la terminal la URL local. Para conectar la interfaz se configuran estas variables en el entorno de desarrollo o del proveedor de despliegue:

- `VITE_API_URL`: URL base de la API, incluida la ruta `/api` cuando corresponda.
- `VITE_DEMO_MODE`: `true` para mostrar el acceso temporal; cualquier otro valor lo oculta.

No se deben guardar tokens, contraseñas ni credenciales del backend en el repositorio.

## Validación

```bash
npm run lint
npm run build
```

El build genera los archivos estáticos en `dist/`. Su publicación no despliega el backend ni garantiza que la API configurada esté disponible.
