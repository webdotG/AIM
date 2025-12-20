import BaseSanitizer from '../base/BaseSanitizer.js';

export default class FileUploadSanitizer extends BaseSanitizer {
  constructor(options = {}) {
    super(options);
    this.allowedTypes = options.allowedTypes || [];
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB по умолчанию
    this.checkMagicBytes = options.checkMagicBytes || false;
  }
  
  async sanitize(file) {
    if (!(file instanceof File)) {
      throw new Error('Input must be a File object');
    }
    
    // Проверка типа файла
    if (this.allowedTypes.length > 0 && !this.allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed: ${this.allowedTypes.join(', ')}`);
    }
    
    // Проверка размера
    if (file.size > this.maxSize) {
      throw new Error(`File too large. Maximum size: ${this.formatSize(this.maxSize)}`);
    }
    
    // Проверка magic bytes (базовая)
    if (this.checkMagicBytes) {
      await this.validateMagicBytes(file);
    }
    
    // Проверка имени файла
    const safeName = file.name.replace(/[^\w.\-]/g, '_');
    
    return new File([file], safeName, { type: file.type });
  }
  
  async validateMagicBytes(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const arr = new Uint8Array(e.target.result).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        
        // Проверка magic bytes для изображений
        const magicNumbers = {
          '89504e47': 'image/png',     // PNG
          'ffd8ffe0': 'image/jpeg',    // JPEG
          'ffd8ffe1': 'image/jpeg',    // JPEG
          '47494638': 'image/gif',     // GIF
          '52494646': 'image/webp'     // WebP (RIFF)
        };
        
        const detectedType = magicNumbers[header.toLowerCase()];
        if (detectedType && detectedType !== file.type) {
          reject(new Error(`File type mismatch. Declared: ${file.type}, Detected: ${detectedType}`));
        } else {
          resolve();
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }
  
  formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }
}
