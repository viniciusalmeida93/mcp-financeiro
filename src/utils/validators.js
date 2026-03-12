export const validators = {
  required: (value) => {
    if (value === undefined || value === null || value === '') return 'Campo obrigatório'
    return null
  },

  positiveNumber: (value) => {
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) return 'Deve ser um número positivo'
    return null
  },

  dayOfMonth: (value) => {
    const num = parseInt(value)
    if (isNaN(num) || num < 1 || num > 31) return 'Dia deve ser entre 1 e 31'
    return null
  },

  email: (value) => {
    if (!value) return null // optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido'
    return null
  },
}

/**
 * Validate a form object against a schema of validators
 * @param {object} data
 * @param {object} schema - { fieldName: [validatorFn, ...] }
 * @returns {object} errors - { fieldName: errorMessage }
 */
export const validateForm = (data, schema) => {
  const errors = {}
  for (const [field, fns] of Object.entries(schema)) {
    for (const fn of fns) {
      const error = fn(data[field])
      if (error) {
        errors[field] = error
        break
      }
    }
  }
  return errors
}
