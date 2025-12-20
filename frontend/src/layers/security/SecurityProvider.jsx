import React, { useMemo } from 'react';
import SecurityContext from './SecurityContext';
import { createEntryContentPipeline } from '@/security/pipelines/presets/entryContentPreset';
import { createImagePipeline } from '@/security/pipelines/presets/imagePreset';
// import { SchemaValidator } from '../../security/validators/schemas/index';

// Исправляем импорты схем - используем правильные пути
import authSchema from '@/security/validators/schemas/authSchema';
import entrySchema from '@/security/validators/schemas/entrySchema';

function SecurityProvider({ children, enableSecurity = true }) {
  const sanitizeText = async (text) => {
    if (!enableSecurity || !text) return text;
    
    try {
      const pipeline = createEntryContentPipeline();
      return await pipeline.execute(text);
    } catch (error) {
      console.error('Security sanitization error:', error);
      return text; // В случае ошибки возвращаем оригинал
    }
  };
  
  const sanitizeImage = async (file) => {
    if (!enableSecurity || !file) return file;
    
    try {
      const pipeline = createImagePipeline();
      return await pipeline.execute(file);
    } catch (error) {
      console.error('Image sanitization error:', error);
      throw new Error('Invalid image file');
    }
  };
  
  const validateInput = async (input, schemaName) => {
    if (!enableSecurity) return { valid: true, errors: [] };
    
    let schema;
    switch (schemaName) {
      case 'auth':
        schema = authSchema;
        break;
      case 'entry':
        schema = entrySchema;
        break;
      default:
        throw new Error(`Unknown schema: ${schemaName}`);
    }
    
    const validator = new SchemaValidator(schema);
    return await validator.validate(input);
  };
  
  const logSecurityEvent = (event) => {
    console.log('[SECURITY]', event);
    // TODO: Отправлять на сервер
  };
  
  const value = useMemo(() => ({
    sanitizeText,
    sanitizeImage,
    validateInput,
    logSecurityEvent,
    isSecurityEnabled: enableSecurity
  }), [enableSecurity]);

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export default SecurityProvider;