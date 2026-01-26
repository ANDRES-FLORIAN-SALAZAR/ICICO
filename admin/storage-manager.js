// Gestor de almacenamiento avanzado sin limitaciones
class StorageManager {
    constructor() {
        this.dbName = 'CasaOracionDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear almacenes para diferentes tipos de contenido
                if (!db.objectStoreNames.contains('anuncios')) {
                    db.createObjectStore('anuncios', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('eventos')) {
                    db.createObjectStore('eventos', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('predicas')) {
                    db.createObjectStore('predicas', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('galeria')) {
                    db.createObjectStore('galeria', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('archivos')) {
                    db.createObjectStore('archivos', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    // Guardar archivo grande en chunks
    async saveFile(file, metadata) {
        await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['archivos'], 'readwrite');
            const store = transaction.objectStore('archivos');
            
            // Procesar archivo en chunks si es muy grande
            if (file.size > 50 * 1024 * 1024) { // Más de 50MB
                this.saveFileInChunks(file, metadata).then(resolve).catch(reject);
            } else {
                // Para archivos más pequeños, usar FileReader normal
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result,
                        metadata: metadata,
                        uploadDate: new Date().toISOString()
                    };
                    
                    const request = store.add(fileData);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Guardar archivo en chunks para archivos muy grandes
    async saveFileInChunks(file, metadata) {
        const chunkSize = 10 * 1024 * 1024; // 10MB por chunk
        const totalChunks = Math.ceil(file.size / chunkSize);
        const fileId = Date.now() + '_' + file.name;
        
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            
            await this.saveChunk(chunk, fileId, i, totalChunks, file, metadata);
        }
        
        return fileId;
    }

    async saveChunk(chunk, fileId, chunkIndex, totalChunks, originalFile, metadata) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const transaction = this.db.transaction(['archivos'], 'readwrite');
                const store = transaction.objectStore('archivos');
                
                const chunkData = {
                    fileId: fileId,
                    chunkIndex: chunkIndex,
                    totalChunks: totalChunks,
                    data: e.target.result,
                    originalName: originalFile.name,
                    type: originalFile.type,
                    size: originalFile.size,
                    metadata: metadata,
                    uploadDate: new Date().toISOString()
                };
                
                const request = store.add(chunkData);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            };
            reader.readAsDataURL(chunk);
        });
    }

    // Recuperar archivo completo
    async getFile(fileId) {
        await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['archivos'], 'readonly');
            const store = transaction.objectStore('archivos');
            
            // Buscar por fileId o por id
            const request = store.get(fileId);
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    if (result.fileId) {
                        // Es un chunk, necesitamos reconstruir el archivo
                        this.reconstructFile(result.fileId).then(resolve).catch(reject);
                    } else {
                        // Es un archivo completo
                        resolve(result);
                    }
                } else {
                    // Intentar buscar por fileId
                    this.getFileByFileId(fileId).then(resolve).catch(reject);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getFileByFileId(fileId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['archivos'], 'readonly');
            const store = transaction.objectStore('archivos');
            const index = store.index('fileId'); // Necesitamos crear este índice
            
            const request = index.getAll(fileId);
            request.onsuccess = () => {
                const chunks = request.result;
                if (chunks && chunks.length > 0) {
                    this.reconstructFileFromChunks(chunks).then(resolve).catch(reject);
                } else {
                    reject(new Error('Archivo no encontrado'));
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async reconstructFile(fileId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['archivos'], 'readonly');
            const store = transaction.objectStore('archivos');
            
            const request = store.getAll();
            request.onsuccess = () => {
                const allFiles = request.result;
                const chunks = allFiles.filter(file => file.fileId === fileId);
                
                if (chunks.length === 0) {
                    reject(new Error('No se encontraron chunks para este archivo'));
                    return;
                }
                
                this.reconstructFileFromChunks(chunks).then(resolve).catch(reject);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async reconstructFileFromChunks(chunks) {
        // Ordenar chunks por índice
        chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
        
        // Unir todos los chunks
        let completeData = '';
        for (const chunk of chunks) {
            // Extraer solo la parte de datos del dataURL
            const dataPart = chunk.data.split(',')[1];
            completeData += dataPart;
        }
        
        // Reconstruir el dataURL completo
        const firstChunk = chunks[0];
        const mimeType = firstChunk.type || 'application/octet-stream';
        const completeDataURL = `data:${mimeType};base64,${completeData}`;
        
        return {
            id: firstChunk.fileId,
            name: firstChunk.originalName,
            type: firstChunk.type,
            size: firstChunk.size,
            data: completeDataURL,
            metadata: firstChunk.metadata,
            uploadDate: firstChunk.uploadDate
        };
    }

    // Guardar contenido regular con manejo de claves duplicadas
    async saveContent(type, content) {
        await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([type], 'readwrite');
            const store = transaction.objectStore(type);
            
            // Si no tiene ID, generar uno nuevo
            if (!content.id) {
                content.id = Date.now() + Math.random();
            }
            
            const contentWithTimestamp = {
                ...content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            const request = store.put(contentWithTimestamp);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => {
                // Si es error de clave duplicada, intentar con nuevo ID
                if (event.target.error && event.target.error.name === 'ConstraintError') {
                    console.warn('⚠️ Clave duplicada, generando nuevo ID...');
                    contentWithTimestamp.id = Date.now() + Math.random();
                    const retryRequest = store.put(contentWithTimestamp);
                    retryRequest.onsuccess = () => resolve(retryRequest.result);
                    retryRequest.onerror = () => reject(retryRequest.error);
                } else {
                    reject(event.target.error);
                }
            };
        });
    }

    // Obtener todo el contenido de un tipo
    async getAllContent(type) {
        await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([type], 'readonly');
            const store = transaction.objectStore(type);
            
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Actualizar contenido
    async updateContent(type, id, content) {
        await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([type], 'readwrite');
            const store = transaction.objectStore(type);
            
            const updatedContent = {
                ...content,
                id: id,
                updatedAt: new Date().toISOString()
            };
            
            const request = store.put(updatedContent);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Eliminar contenido
    async deleteContent(type, id) {
        await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([type], 'readwrite');
            const store = transaction.objectStore(type);
            
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Obtener estadísticas de almacenamiento
    async getStorageStats() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                quota: estimate.quota,
                usage: estimate.usage,
                available: estimate.quota - estimate.usage,
                usagePercentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
            };
        }
        return null;
    }

    // Limpiar archivos antiguos
    async cleanupOldFiles(daysOld = 30) {
        await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['archivos'], 'readwrite');
            const store = transaction.objectStore('archivos');
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            const request = store.openCursor();
            const deletedCount = { count: 0 };
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const file = cursor.value;
                    const uploadDate = new Date(file.uploadDate);
                    
                    if (uploadDate < cutoffDate) {
                        cursor.delete();
                        deletedCount.count++;
                    }
                    cursor.continue();
                } else {
                    resolve(deletedCount.count);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Crear instancia global
window.storageManager = new StorageManager();
