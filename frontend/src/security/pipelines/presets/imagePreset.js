// src/security/pipelines/presets/imagePreset.js
import  SanitizerPipeline  from '../SanitizerPipeline.js';
import  FileUploadSanitizer  from '../../sanitizers/files/FileUploadSanitizer.js';

export function createImagePipeline() {
  const pipeline = new SanitizerPipeline();
  
  pipeline.add(new FileUploadSanitizer({
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    checkMagicBytes: true
  }));
  
  return pipeline;
}

export default createImagePipeline;