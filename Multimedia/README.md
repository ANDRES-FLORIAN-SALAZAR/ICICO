# Carpeta de Assets - Casa de Oración

## 📁 Estructura

```
assets/
├── images/     # Aquí guarda tus imágenes
├── videos/     # Aquí guarda tus videos
└── README.md   # Este archivo
```

## 🖼️ Imágenes

Guarda tus imágenes en la carpeta `assets/images/`:
- Formatos: JPG, PNG, GIF, WebP
- Nombres recomendados: nombre-descriptivo.jpg
- Tamaño optimizado para web

## 🎥 Videos

Guarda tus videos en la carpeta `assets/videos/`:
- Formatos: MP4, WebM, OGG
- Nombres recomendados: nombre-descriptivo.mp4
- Optimizados para streaming web

## 🔗 Cómo usar en la galería

Para agregar imágenes a la galería, edita `galeria.html` y agrega:

```html
<div class="gallery-item">
    <img src="assets/images/tu-imagen.jpg" alt="Descripción" class="img-fluid rounded">
    <div class="gallery-overlay">
        <h6>Título de la imagen</h6>
    </div>
</div>
```

Para agregar videos:

```html
<div class="gallery-item">
    <video controls class="img-fluid rounded">
        <source src="assets/videos/tu-video.mp4" type="video/mp4">
    </video>
    <div class="gallery-overlay">
        <h6>Título del video</h6>
    </div>
</div>
```

## 📝 Notas

- Los archivos deben estar en estas carpetas para que funcionen correctamente
- Usa nombres de archivo sin espacios ni caracteres especiales
- Optimiza las imágenes antes de subirlas para mejor rendimiento
