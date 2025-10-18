/**
 * 📝 Form Validation Utilities
 * Sistema de validación de formularios para DomusIA CRM
 */

class FormValidator {
    constructor() {
        this.errors = [];
    }

    /**
     * Validar dirección
     */
    validateAddress(address) {
        const errors = [];
        
        if (!address || address.trim().length === 0) {
            errors.push('La dirección es obligatoria');
        } else if (address.trim().length < 5) {
            errors.push('La dirección debe tener al menos 5 caracteres');
        } else if (address.trim().length > 200) {
            errors.push('La dirección no puede exceder 200 caracteres');
        }
        
        return errors;
    }

    /**
     * Validar ciudad
     */
    validateCity(city) {
        const errors = [];
        
        if (!city || city.trim().length === 0) {
            errors.push('La ciudad es obligatoria');
        } else if (city.trim().length < 2) {
            errors.push('La ciudad debe tener al menos 2 caracteres');
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(city)) {
            errors.push('La ciudad solo puede contener letras y espacios');
        }
        
        return errors;
    }

    /**
     * Validar precio
     */
    validatePrice(price) {
        const errors = [];
        
        if (price === null || price === undefined || price === '') {
            // Precio opcional
            return errors;
        }
        
        const numPrice = parseFloat(price);
        
        if (isNaN(numPrice)) {
            errors.push('El precio debe ser un número válido');
        } else if (numPrice < 0) {
            errors.push('El precio no puede ser negativo');
        } else if (numPrice > 100000000) {
            errors.push('El precio no puede exceder 100 millones');
        }
        
        return errors;
    }

    /**
     * Validar superficie
     */
    validateSurface(surface) {
        const errors = [];
        
        if (surface === null || surface === undefined || surface === '') {
            // Superficie opcional
            return errors;
        }
        
        const numSurface = parseFloat(surface);
        
        if (isNaN(numSurface)) {
            errors.push('La superficie debe ser un número válido');
        } else if (numSurface < 1) {
            errors.push('La superficie debe ser al menos 1 m²');
        } else if (numSurface > 100000) {
            errors.push('La superficie no puede exceder 100,000 m²');
        }
        
        return errors;
    }

    /**
     * Validar número de habitaciones
     */
    validateRooms(rooms) {
        const errors = [];
        
        if (rooms === null || rooms === undefined || rooms === '') {
            // Habitaciones opcional
            return errors;
        }
        
        const numRooms = parseInt(rooms);
        
        if (isNaN(numRooms)) {
            errors.push('El número de habitaciones debe ser válido');
        } else if (numRooms < 0) {
            errors.push('El número de habitaciones no puede ser negativo');
        } else if (numRooms > 50) {
            errors.push('El número de habitaciones no puede exceder 50');
        }
        
        return errors;
    }

    /**
     * Validar número de baños
     */
    validateBathrooms(bathrooms) {
        const errors = [];
        
        if (bathrooms === null || bathrooms === undefined || bathrooms === '') {
            // Baños opcional
            return errors;
        }
        
        const numBathrooms = parseInt(bathrooms);
        
        if (isNaN(numBathrooms)) {
            errors.push('El número de baños debe ser válido');
        } else if (numBathrooms < 0) {
            errors.push('El número de baños no puede ser negativo');
        } else if (numBathrooms > 20) {
            errors.push('El número de baños no puede exceder 20');
        }
        
        return errors;
    }

    /**
     * Validar descripción
     */
    validateDescription(description) {
        const errors = [];
        
        if (description && description.length > 2000) {
            errors.push('La descripción no puede exceder 2000 caracteres');
        }
        
        return errors;
    }

    /**
     * Validar formulario completo de propiedad
     */
    validatePropertyForm(formData) {
        const allErrors = {};
        
        // Validar cada campo
        const addressErrors = this.validateAddress(formData.address);
        if (addressErrors.length > 0) allErrors.address = addressErrors;
        
        const cityErrors = this.validateCity(formData.city);
        if (cityErrors.length > 0) allErrors.city = cityErrors;
        
        const priceErrors = this.validatePrice(formData.price);
        if (priceErrors.length > 0) allErrors.price = priceErrors;
        
        const surfaceErrors = this.validateSurface(formData.surface_m2);
        if (surfaceErrors.length > 0) allErrors.surface_m2 = surfaceErrors;
        
        const roomsErrors = this.validateRooms(formData.rooms);
        if (roomsErrors.length > 0) allErrors.rooms = roomsErrors;
        
        const bathroomsErrors = this.validateBathrooms(formData.bathrooms);
        if (bathroomsErrors.length > 0) allErrors.bathrooms = bathroomsErrors;
        
        const descriptionErrors = this.validateDescription(formData.description);
        if (descriptionErrors.length > 0) allErrors.description = descriptionErrors;
        
        return {
            isValid: Object.keys(allErrors).length === 0,
            errors: allErrors
        };
    }

    /**
     * Mostrar errores en el formulario
     */
    displayErrors(formId, errors) {
        // Limpiar errores previos
        this.clearErrors(formId);
        
        // Añadir nuevos errores
        Object.keys(errors).forEach(fieldName => {
            const field = document.querySelector(`#${formId} [name="${fieldName}"], #${formId} #edit${this.capitalize(fieldName)}`);
            
            if (field) {
                // Añadir clase de error
                field.classList.add('input-error');
                
                // Crear mensaje de error
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error-message';
                errorDiv.style.cssText = 'color: #ef4444; font-size: 12px; margin-top: 4px;';
                errorDiv.textContent = errors[fieldName][0]; // Mostrar primer error
                
                // Insertar después del campo
                field.parentNode.insertBefore(errorDiv, field.nextSibling);
                
                // Focus en primer campo con error
                if (Object.keys(errors)[0] === fieldName) {
                    field.focus();
                }
            }
        });
    }

    /**
     * Limpiar errores del formulario
     */
    clearErrors(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        // Remover clases de error
        form.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
        
        // Remover mensajes de error
        form.querySelectorAll('.field-error-message').forEach(el => {
            el.remove();
        });
    }

    /**
     * Capitalizar primera letra
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Validación en tiempo real
     */
    setupRealTimeValidation(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                // Limpiar error mientras el usuario escribe
                if (field.classList.contains('input-error')) {
                    field.classList.remove('input-error');
                    const errorMsg = field.parentNode.querySelector('.field-error-message');
                    if (errorMsg) errorMsg.remove();
                }
            });
        });
    }

    /**
     * Validar campo individual
     */
    validateField(field) {
        const fieldName = field.name || field.id.replace('edit', '').toLowerCase();
        const value = field.value;
        
        let errors = [];
        
        switch (fieldName) {
            case 'address':
            case 'editAddress':
                errors = this.validateAddress(value);
                break;
            case 'city':
            case 'editCity':
                errors = this.validateCity(value);
                break;
            case 'price':
            case 'editPrice':
                errors = this.validatePrice(value);
                break;
            case 'surface_m2':
            case 'surface':
            case 'editSurface':
                errors = this.validateSurface(value);
                break;
            case 'rooms':
            case 'editRooms':
                errors = this.validateRooms(value);
                break;
            case 'bathrooms':
            case 'editBathrooms':
                errors = this.validateBathrooms(value);
                break;
            case 'description':
            case 'editDescription':
                errors = this.validateDescription(value);
                break;
        }
        
        if (errors.length > 0) {
            field.classList.add('input-error');
            
            // Remover mensaje previo si existe
            const prevError = field.parentNode.querySelector('.field-error-message');
            if (prevError) prevError.remove();
            
            // Añadir nuevo mensaje
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error-message';
            errorDiv.style.cssText = 'color: #ef4444; font-size: 12px; margin-top: 4px;';
            errorDiv.textContent = errors[0];
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
    }
}

// Instancia global
const FormValidation = new FormValidator();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.FormValidation = FormValidation;
}

// CSS para campos con error
const style = document.createElement('style');
style.textContent = `
    .input-error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .input-error:focus {
        border-color: #dc2626 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
    }
`;
document.head.appendChild(style);
