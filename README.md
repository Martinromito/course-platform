# La Mackenna - Academia de Artesanías 🏺

Bienvenido a la plataforma oficial de **La Mackenna**, una academia digital dedicada a la enseñanza de artes manuales, cestería y textiles. Esta plataforma está diseñada para ofrecer una experiencia de aprendizaje premium, artesanal y fluida.

## ✨ Características Principales

- **Doble Rol**: Experiencias personalizadas para Alumnos (Aprendizaje) y Administradores (Gestión).
- **Panel de Control Admin**: Gestión completa de módulos, lecciones y videos de YouTube.
- **Reproductor de Clases Premium**: Una interfaz minimalista y enfocada para una mejor concentración.
- **Acceso Gratuito y de Pago**: Soporte para lecciones de vista previa y contenido exclusivo.
- **Diseño Artesanal**: Paleta de colores terracota y crema con una estética moderna y limpia.

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: MongoDB (Mongoose)
- **Estilos**: Tailwind CSS
- **Autenticación**: JWT con Cookies seguras

## 🚀 Instalación y Uso

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Martinromito/course-platform.git
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env.local` con:
   ```env
   MONGODB_URI=tu_uri_de_mongodb
   JWT_SECRET=tu_secreto_super_seguro
   ```

4. **Correr en desarrollo:**
   ```bash
   npm run dev
   ```

## 📝 Notas de Desarrollo

La aplicación cuenta con un **Modo Simulación** (Mocks). Si no tienes una instancia de MongoDB corriendo localmente, la plataforma cargará automáticamente contenido de prueba para que puedas explorar la interfaz y el flujo de usuario sin configuraciones adicionales.

---
Desarrollado con ❤️ para La Mackenna.
