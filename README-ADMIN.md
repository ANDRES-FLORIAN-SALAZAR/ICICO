# Casa de Oración - Sistema de Administración Local

## 🏠 **Estructura del Proyecto**

### 📁 **Archivos para GitHub Pages (Públicos)**
- `index.html` - Página principal
- `nosotros.html` - Acerca de nosotros
- `eventos.html` - Eventos y actividades
- `galeria.html` - Galería de imágenes/videos
- `predicas.html` - Predicaciones
- `contacto.html` - Contacto
- `styles.css` - Estilos principales
- `script.js` - JavaScript público (sin admin)
- `data/content.json` - Datos del sitio
- `uploads/` - Archivos subidos

### 🔒 **Archivos Locales (No subidos a Git)**
- `admin-local.html` - Panel de admin completo
- `admin-local.js` - Funciones de admin con credenciales
- `config/admin-credentials.js` - Credenciales seguras

## 🚀 **Cómo Usar**

### **1. Administración Local (En tu computadora)**
```bash
# Iniciar servidor local
python -m http.server 8000
# o
npx serve .

# Acceder al admin
http://localhost:8000/admin-local.html
```

### **2. Sincronización con GitHub Pages**
1. **Edita contenido localmente** en `admin-local.html`
2. **Exporta datos** usando el botón "Exportar Datos"
3. **Reemplaza** `data/content.json` con el archivo exportado
4. **Sube cambios** a GitHub
5. **GitHub Pages** se actualiza automáticamente

## 🔐 **Seguridad**

✅ **Credenciales seguras**: Solo en tu computadora  
✅ **Sin admin público**: El panel no existe en GitHub Pages  
✅ **Datos encriptados**: Solo contenido público en el servidor  
✅ **Control total**: Tú decides qué se publica  

## 📋 **Flujo de Trabajo**

### **Local (Desarrollo)**
1. Abre `admin-local.html` en tu navegador
2. Inicia sesión con tu contraseña
3. Edita eventos, galería, predicas
4. Usa "Exportar Datos" para generar JSON

### **Producción (GitHub Pages)**
1. Reemplaza `data/content.json`
2. Sube cambios al repositorio
3. GitHub Pages publica automáticamente
4. El sitio se actualiza al instante

## 🛠️ **Comandos Útiles**

```bash
# Ver cambios locales
git status

# Subir solo contenido público
git add index.html styles.css script.js data/
git commit -m "Actualizar contenido del sitio"
git push origin main

# Verificar que no subas archivos locales
git diff --cached --name-only
```

## 📁 **Estructura de Archivos**

```
Casa de Oración/
├── 🌐 Públicos (GitHub Pages)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── data/content.json
├── 🔒 Locales (Tu computadora)
│   ├── admin-local.html
│   ├── admin-local.js
│   └── config/admin-credentials.js
└── 📁 uploads/
    └── (archivos multimedia)
```

## 🎯 **Ventajas**

- ✅ **100% Seguro**: Credenciales nunca salen de tu computadora
- ✅ **Fácil de usar**: Admin local intuitivo
- ✅ **Automático**: GitHub Pages se actualiza solo
- ✅ **Gratis**: Sin costos de hosting
- ✅ **Control total**: Tú decides qué publicar

## 🚨 **Importante**

- **NUNCA** subas `admin-local.html` a GitHub
- **NUNCA** compartas tu contraseña
- **SIEMPRE** usa `data/content.json` para producción
- **RECUERDA** hacer backup de tu contenido local

---

**¿Listo para comenzar?** 🚀

1. Abre `admin-local.html` localmente
2. Comienza a editar tu contenido
3. Exporta y sincroniza cuando quieras publicar
