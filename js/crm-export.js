/**
 * 📊 CRM Export System
 * Sistema de exportación de propiedades a CSV/Excel
 * Versión 1.3.0
 */

class CRMExport {
    constructor() {
        this.init();
    }

    init() {
        console.log('📊 Sistema de exportación inicializado');
    }

    /**
     * Exportar propiedades a CSV
     * @param {Array} properties - Array de propiedades a exportar
     * @param {String} filename - Nombre del archivo (opcional)
     */
    exportToCSV(properties, filename = null) {
        if (!properties || properties.length === 0) {
            if (window.Toast) {
                window.Toast.warning('Sin datos', 'No hay propiedades para exportar');
            } else {
                alert('No hay propiedades para exportar');
            }
            return;
        }

        try {
            // Preparar datos para CSV
            const csvData = this.prepareCSVData(properties);
            
            // Crear archivo CSV
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            
            // Generar nombre de archivo
            const date = new Date().toISOString().split('T')[0];
            const finalFilename = filename || `domusIA_propiedades_${date}.csv`;
            
            // Descargar archivo
            this.downloadFile(blob, finalFilename);
            
            // Feedback al usuario
            if (window.Toast) {
                window.Toast.success(
                    '¡Exportación exitosa!', 
                    `${properties.length} propiedades exportadas`
                );
            }
            
            console.log(`✅ Exportadas ${properties.length} propiedades a ${finalFilename}`);
        } catch (error) {
            console.error('Error exportando a CSV:', error);
            if (window.Toast) {
                window.Toast.error('Error al exportar', error.message);
            } else {
                alert('Error al exportar: ' + error.message);
            }
        }
    }

    /**
     * Preparar datos en formato CSV
     * @param {Array} properties - Array de propiedades
     * @returns {String} - Datos en formato CSV
     */
    prepareCSVData(properties) {
        // Definir columnas
        const columns = [
            { key: 'address', label: 'Dirección' },
            { key: 'city', label: 'Ciudad' },
            { key: 'property_type', label: 'Tipo' },
            { key: 'status', label: 'Estado' },
            { key: 'price', label: 'Precio (€)' },
            { key: 'surface_m2', label: 'Superficie (m²)' },
            { key: 'rooms', label: 'Habitaciones' },
            { key: 'bathrooms', label: 'Baños' },
            { key: 'description', label: 'Descripción' },
            { key: 'created_at', label: 'Fecha Creación' }
        ];

        // Header del CSV
        const header = columns.map(col => this.escapeCSV(col.label)).join(',');

        // Filas del CSV
        const rows = properties.map(property => {
            return columns.map(col => {
                let value = property[col.key];
                
                // Formatear valores especiales
                if (col.key === 'created_at' && value) {
                    value = this.formatDate(value);
                } else if (col.key === 'price' && value) {
                    value = this.formatNumber(value);
                } else if (col.key === 'property_type') {
                    value = this.capitalizePropertyType(value);
                } else if (col.key === 'status') {
                    value = this.capitalizeStatus(value);
                }
                
                // Manejar valores nulos/undefined
                if (value === null || value === undefined) {
                    value = '';
                }
                
                return this.escapeCSV(String(value));
            }).join(',');
        });

        // Combinar header y filas
        return [header, ...rows].join('\n');
    }

    /**
     * Escapar valores para CSV (manejar comillas y comas)
     * @param {String} value - Valor a escapar
     * @returns {String} - Valor escapado
     */
    escapeCSV(value) {
        if (value === null || value === undefined) {
            return '""';
        }
        
        const str = String(value);
        
        // Si contiene comas, comillas o saltos de línea, envolver en comillas
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            // Escapar comillas dobles
            const escaped = str.replace(/"/g, '""');
            return `"${escaped}"`;
        }
        
        return `"${str}"`;
    }

    /**
     * Formatear fecha a formato legible
     * @param {String} dateString - Fecha en formato ISO
     * @returns {String} - Fecha formateada
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    /**
     * Formatear número con separadores de miles
     * @param {Number} number - Número a formatear
     * @returns {String} - Número formateado
     */
    formatNumber(number) {
        try {
            return new Intl.NumberFormat('es-ES').format(number);
        } catch (error) {
            return number;
        }
    }

    /**
     * Capitalizar tipo de propiedad
     * @param {String} type - Tipo de propiedad
     * @returns {String} - Tipo capitalizado
     */
    capitalizePropertyType(type) {
        if (!type) return '';
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    /**
     * Capitalizar estado
     * @param {String} status - Estado de la propiedad
     * @returns {String} - Estado capitalizado
     */
    capitalizeStatus(status) {
        if (!status) return '';
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    /**
     * Descargar archivo
     * @param {Blob} blob - Contenido del archivo
     * @param {String} filename - Nombre del archivo
     */
    downloadFile(blob, filename) {
        // Crear URL temporal
        const url = window.URL.createObjectURL(blob);
        
        // Crear elemento <a> temporal
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Añadir al DOM, hacer click y eliminar
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    /**
     * Exportar propiedades a Excel (formato XLSX simulado con CSV UTF-8 BOM)
     * @param {Array} properties - Array de propiedades a exportar
     * @param {String} filename - Nombre del archivo (opcional)
     */
    exportToExcel(properties, filename = null) {
        if (!properties || properties.length === 0) {
            if (window.Toast) {
                window.Toast.warning('Sin datos', 'No hay propiedades para exportar');
            }
            return;
        }

        try {
            // Preparar datos para CSV
            const csvData = this.prepareCSVData(properties);
            
            // Añadir BOM para UTF-8 (necesario para Excel)
            const BOM = '\uFEFF';
            const csvWithBOM = BOM + csvData;
            
            // Crear archivo CSV con BOM (Excel lo abrirá correctamente)
            const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
            
            // Generar nombre de archivo
            const date = new Date().toISOString().split('T')[0];
            const finalFilename = filename || `domusIA_propiedades_${date}.csv`;
            
            // Descargar archivo
            this.downloadFile(blob, finalFilename);
            
            // Feedback al usuario
            if (window.Toast) {
                window.Toast.success(
                    '¡Exportación a Excel exitosa!', 
                    `${properties.length} propiedades exportadas`
                );
            }
            
            console.log(`✅ Exportadas ${properties.length} propiedades a Excel (${finalFilename})`);
        } catch (error) {
            console.error('Error exportando a Excel:', error);
            if (window.Toast) {
                window.Toast.error('Error al exportar', error.message);
            }
        }
    }

    /**
     * Exportar resumen estadístico
     * @param {Array} properties - Array de propiedades
     * @param {Object} stats - Estadísticas del dashboard
     */
    exportSummary(properties, stats) {
        if (!properties || properties.length === 0) {
            if (window.Toast) {
                window.Toast.warning('Sin datos', 'No hay propiedades para exportar');
            }
            return;
        }

        try {
            // Preparar resumen
            const date = new Date().toISOString().split('T')[0];
            let summary = `RESUMEN DE PROPIEDADES DOMUS-IA\n`;
            summary += `Fecha: ${new Date().toLocaleString('es-ES')}\n\n`;
            
            summary += `ESTADÍSTICAS GENERALES\n`;
            summary += `Total de Propiedades: ${stats.total || properties.length}\n`;
            summary += `Disponibles: ${stats.available || 0}\n`;
            summary += `Ciudades Únicas: ${stats.cities || 0}\n`;
            summary += `Valor Total: ${stats.totalValue || 0}€\n\n`;
            
            // Distribución por tipo
            summary += `DISTRIBUCIÓN POR TIPO\n`;
            const typeCount = this.countByField(properties, 'property_type');
            Object.entries(typeCount).forEach(([type, count]) => {
                summary += `${this.capitalizePropertyType(type)}: ${count}\n`;
            });
            summary += `\n`;
            
            // Distribución por estado
            summary += `DISTRIBUCIÓN POR ESTADO\n`;
            const statusCount = this.countByField(properties, 'status');
            Object.entries(statusCount).forEach(([status, count]) => {
                summary += `${this.capitalizeStatus(status)}: ${count}\n`;
            });
            summary += `\n`;
            
            // Distribución por ciudad
            summary += `DISTRIBUCIÓN POR CIUDAD\n`;
            const cityCount = this.countByField(properties, 'city');
            Object.entries(cityCount).forEach(([city, count]) => {
                summary += `${city}: ${count}\n`;
            });
            
            // Crear archivo
            const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' });
            const filename = `domusIA_resumen_${date}.txt`;
            
            this.downloadFile(blob, filename);
            
            if (window.Toast) {
                window.Toast.success('¡Resumen exportado!', 'Archivo de resumen descargado');
            }
            
            console.log('✅ Resumen exportado correctamente');
        } catch (error) {
            console.error('Error exportando resumen:', error);
            if (window.Toast) {
                window.Toast.error('Error al exportar', error.message);
            }
        }
    }

    /**
     * Contar propiedades por campo
     * @param {Array} properties - Array de propiedades
     * @param {String} field - Campo por el cual contar
     * @returns {Object} - Objeto con conteos
     */
    countByField(properties, field) {
        return properties.reduce((acc, property) => {
            const value = property[field] || 'Sin especificar';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }
}

// Inicializar globalmente
window.CRMExport = new CRMExport();

// Función global para exportar (llamada desde botones)
window.exportPropertiesToCSV = function(properties) {
    window.CRMExport.exportToCSV(properties);
};

window.exportPropertiesToExcel = function(properties) {
    window.CRMExport.exportToExcel(properties);
};

window.exportPropertySummary = function(properties, stats) {
    window.CRMExport.exportSummary(properties, stats);
};
