# Prompt para implementar backend de links cortos (Vercel)

Usa este prompt en tu agente backend:

"""
Eres un senior full-stack engineer. Implementa un backend para compartir horarios con links cortos en este proyecto Next.js (App Router) desplegado en Vercel.

Objetivo:
- Hoy el frontend comparte un link largo en `?share=<payload_base64url>`.
- Quiero migrar a links cortos tipo `/s/{id}`.
- Debe funcionar sin autenticacion inicial.

Requisitos funcionales:
1) Crear endpoint POST `/api/share`:
   - Input JSON: `{ payload: ShareStatePayload }`
   - Validar schema estricto (zod o equivalente).
   - Guardar payload comprimido en storage persistente.
   - Responder `{ id, url }`, donde `url` es `https://dominio/s/{id}`.
2) Crear endpoint GET `/api/share/:id`:
   - Devuelve el payload para hidratar frontend.
   - 404 si no existe.
3) Crear ruta `app/s/[id]/page.tsx`:
   - Resuelve el `id`, obtiene payload y redirige a `/?sid={id}` o hidrata directo.
4) Soportar expiracion opcional:
   - default: 90 dias.
   - programar limpieza simple o validacion por fecha de expiracion.
5) Rate limit basico:
   - Proteccion por IP en POST para evitar abuso.

Requisitos tecnicos:
- Stack: Next.js App Router + TypeScript.
- Deploy: Vercel.
- DB recomendada: Vercel KV o Upstash Redis.
- Generacion de ID corto: nanoid (8-10 chars) y reintento por colision.
- Validacion de payload y sanitizacion.
- No exponer datos sensibles en logs.
- Manejar errores con respuestas JSON consistentes.

Integracion frontend:
- Agregar helper para:
  - `createShortShareLink(payload)` -> POST `/api/share`.
  - `loadSharedPayload(id)` -> GET `/api/share/:id`.
- En `Compartir link`, usar backend primero; fallback al link largo local si falla.
- Mostrar `AppAlert` con estados: exito, error, fallback.

Entregables:
- Codigo completo de rutas API y utilidades.
- Cambios frontend para consumir backend.
- Variables de entorno documentadas (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.).
- README corto con pasos de despliegue en Vercel.
- Tests minimos de validacion de payload y resolucion de link.

Criterios de aceptacion:
- Puedo crear un link corto y abrirlo en otro dispositivo.
- Se replica exactamente el horario compartido.
- Si el ID no existe, muestra error claro sin romper UI.
"""
