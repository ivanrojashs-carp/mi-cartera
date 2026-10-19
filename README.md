# GONZA-COSITORTO

Seguimiento de inversiones (acciones, CEDEARs, bonos, cripto) en pesos y dólar CCL, con rendimiento mensual contra inflación y S&P 500, mapa de calor y desarbitrajes de CEDEARs.

**App:** https://ivanrojashs-carp.github.io/mi-cartera/

- iPhone: abrir en Safari → Compartir → *Agregar a pantalla de inicio*, y usarla siempre desde ese ícono.
- Windows 11: abrir en Edge → ⋯ → *Aplicaciones → Instalar este sitio como aplicación*.

## Sincronización entre dispositivos (Google Sheets)

Los datos se guardan en una planilla de Google propia y se actualizan solos en todos los dispositivos conectados (consulta cada 30 s y al volver a la app).

1. Crear una planilla nueva y abrir *Extensiones → Apps Script*.
2. Pegar el contenido de [`apps-script.gs`](apps-script.gs) y cambiar `CLAVE`.
3. *Implementar → Nueva implementación → Aplicación web* (Ejecutar como: Yo · Acceso: Cualquier usuario).
4. En la app: *Datos y preferencias → Sincronizar con Google Sheets* → pegar la URL `/exec` y la clave.
5. En los demás dispositivos: pegar el **código de conexión** que muestra la app.

La planilla queda con pestañas legibles (Operaciones, Portfolios, Tickers, Eventos) que también se pueden editar a mano. Para borrar operaciones, usar la app.

Fuentes de precios: data912.com, dolarapi.com, argentinadatos.com, Binance.
