# 🚀 Instrucciones de Configuración y Despliegue

Esta plataforma es una base sólida para vender cursos online. Sigue estos pasos para ponerla en marcha.

## 1. Requisitos Previos
- **Node.js** v18+ y **npm**.
- **MongoDB**: Una instancia local o en la nube (MongoDB Atlas).
- **Mercado Pago**: Una cuenta de vendedor para obtener las credenciales.

## 2. Configuración de Variables de Entorno
Copia el contenido de `.env.local` y asegúrate de completar los siguientes campos:

### Mercado Pago
1. Ve al [Panel de Desarrolladores de Mercado Pago](https://www.mercadopago.com.ar/developers/panel).
2. Crea una aplicación.
3. En **Credenciales de producción**, obtén tu `Access Token` y `Public Key`.
4. Para pruebas, usa las **Credenciales de prueba** (sandbox).

### Email (Nodemailer)
- Si usas Gmail, necesitas crear una ["Contraseña de aplicación"](https://myaccount.google.com/apppasswords) para `SMTP_PASS`.

## 3. Ejecución en Local

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`.

## 4. Configuración del Webhook (Crucial)
Mercado Pago necesita notificar a tu servidor cuando un pago es aprobado.
1. En el panel de MP, ve a **Webhooks**.
2. Configura la URL: `https://tu-dominio.com/api/payments/webhook`.
3. Selecciona el evento: `pagos` (payments).

> **TIP**: Para probar el webhook localmente, usa una herramienta como **ngrok**:
> `ngrok http 3000`
> Luego usa la URL generada por ngrok en `NEXT_PUBLIC_APP_URL` y en el panel de MP.

## 5. Gestión de Contenido (Admin)
Para acceder al panel admin:
1. Regístrate con el email que definas en `ADMIN_EMAIL` en el archivo `.env`.
2. El sistema te asignará automáticamente el rol de `admin`.
3. Podrás crear módulos y ver la lista de alumnos.

## 6. Despliegue
La plataforma está optimizada para **Vercel**:
1. Sube tu código a GitHub.
2. Importa el proyecto en Vercel.
3. Configura todas las variables de entorno en el panel de Vercel.
4. ¡Listo!

---

### Notas de Seguridad
- El sistema valida los pagos consultando directamente a la API de Mercado Pago en el webhook, por lo que es inmune a manipulaciones en el frontend.
- Las rutas de API y páginas de dashboard están protegidas por middlewares de autenticación.
- Las contraseñas se guardan con hash (bcrypt).
