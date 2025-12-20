export default class SchemaValidator {
  constructor(schemas = {}) {
    this.schemas = schemas;
  }

  registerSchema(name, schema) {
    this.schemas[name] = schema;
    return this;
  }

  async validate(schemaName, data, options = {}) {
    const schema = this.schemas[schemaName];
    
    if (!schema) {
      throw new Error(`Schema "${schemaName}" not found`);
    }

    const errors = [];
    
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = data[fieldName];
      const fieldErrors = await this.validateField(fieldName, value, fieldSchema, data);
      
      if (fieldErrors.length > 0) {
        errors.push({
          field: fieldName,
          errors: fieldErrors
        });
      }
    }

    if (errors.length > 0) {
      if (options.throwOnError) {
        throw new ValidationError('Validation failed', errors);
      }
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  async validateField(fieldName, value, schema, fullData) {
    const errors = [];

    if (schema.required && (value === undefined || value === null || value === '')) {
      errors.push('Field is required');
      return errors;
    }

    if (!schema.required && (value === undefined || value === null || value === '')) {
      return errors;
    }

    if (schema.type && !this.checkType(value, schema.type)) {
      errors.push(`Expected ${schema.type}, got ${typeof value}`);
    }

    if (schema.type === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`Minimum length is ${schema.minLength}`);
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`Maximum length is ${schema.maxLength}`);
      }
      if (schema.pattern && !schema.pattern.test(value)) {
        errors.push('Pattern mismatch');
      }
    }

    if (schema.type === 'number') {
      if (schema.min !== undefined && value < schema.min) {
        errors.push(`Minimum value is ${schema.min}`);
      }
      if (schema.max !== undefined && value > schema.max) {
        errors.push(`Maximum value is ${schema.max}`);
      }
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`Must be one of: ${schema.enum.join(', ')}`);
    }

    if (schema.validate) {
      const customErrors = await schema.validate(value, fullData);
      if (customErrors) {
        if (Array.isArray(customErrors)) {
          errors.push(...customErrors);
        } else {
          errors.push(customErrors);
        }
      }
    }

    return errors;
  }

  checkType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return value instanceof Date || !isNaN(new Date(value).getTime());
      default:
        return true;
    }
  }
}

class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
