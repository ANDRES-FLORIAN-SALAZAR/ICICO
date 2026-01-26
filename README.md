# Casa de Oración - Sitio Web

## Descripción
Sitio web para la Casa de Oración con sistema de gestión de contenido dinámico.

## Estructura del Proyecto

### Páginas Principales
- `index.html` - Página principal
- `nosotros.html` - Sobre nosotros
- `contacto.html` - Información de contacto
- `galeria.html` - Galería de imágenes y videos
- `eventos.html` - Eventos y actividades
- `escuela.html` - Escuela dominical
- `cultos.html` - Cultos especiales
- `predicas.html` - Predicaciones

### Administración
- `admin-local.html` - Panel de administración local
- `admin-public.html` - Panel de administración público

### Recursos
- `styles.css` - Estilos CSS principales
- `script.js` - Lógica JavaScript
- `galeria.css` - Estilos específicos para galería
- `data/` - Archivos de datos JSON
- `uploads/` - Archivos multimedia

## Configuración de GitHub Pages

### Requisitos
1. Archivo `index.html` en la raíz
2. Archivos CSS y JS en la raíz
3. Estructura de carpetas correcta

### Pasos para activar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings**
3. En la sección izquierda, haz clic en **Pages**
4. En **Source**, selecciona **Deploy from a branch**
5. Elige la rama **main** (o master)
6. Selecciona la carpeta **/ (root)**
7. Haz clic en **Save**

### Estructura de archivos necesaria
```
/
├── index.html
├── styles.css
├── script.js
├── nosotros.html
├── contacto.html
├── galeria.html
├── eventos.html
├── escuela.html
├── cultos.html
├── predicas.html
├── admin-local.html
├── admin-public.html
├── galeria.css
├── data/
│   └── content.json
└── uploads/
    ├── images/
    └── videos/
```

## Desarrollo Local

### Iniciar servidor local
```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000` en tu navegador.

## Características

- **Diseño responsivo** con Bootstrap 5
- **Gestión de contenido** dinámica
- **Galería multimedia** con imágenes y videos
- **Sistema de administración** local
- **Optimizado para GitHub Pages**

## Colores del Tema

Paleta de colores principal:
- Primary: `#2c3e50` (Azul grisáceo oscuro)
- Secondary: `#34495e` (Azul grisáceo medio)
- Tertiary: `#7f8c8d` (Gris azulado)
- Accent: `#3498db` (Azul brillante)
- Light: `#ecf0f1` (Gris muy claro)
- White: `#ffffff` (Blanco)

## Licencia
© 2024 Casa de Oración. Todos los derechos reservados.
