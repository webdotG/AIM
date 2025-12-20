import BaseSanitizer from '../base/BaseSanitizer.js';

export default class ServerSideXSSSanitizer extends BaseSanitizer {
  async sanitize(input) {
    if (typeof input !== 'string') return input;
    
    // Защита от Server-Side XSS
    let result = input
      .replace(/<\?php/gi, '&lt;?php')
      .replace(/<\?=/gi, '&lt;?=')
      .replace(/<\?/gi, '&lt;?')
      .replace(/\?>/, '?&gt;')
      .replace(/<%|%>/g, (match) => {
        return match === '<%' ? '&lt;%' : '%&gt;';
      });
    
    return result;
  }
}
