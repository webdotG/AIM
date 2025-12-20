import BaseSanitizer from '../base/BaseSanitizer.js';

export default class HTMLSanitizer extends BaseSanitizer {
  constructor(options = {}) {
    super({
      allowedTags: [
        'p', 'b', 'i', 'u', 'em', 'strong', 'br',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote'
      ],
      allowedAttributes: {
        '*': ['class', 'style'],
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height']
      },
      ...options
    });
  }

  async process(html) {
    if (typeof html !== 'string') return html;
    
    let sanitized = this.removeDangerousTags(html);
    sanitized = this.removeDangerousAttributes(sanitized);
    sanitized = this.escapeHTML(sanitized);
    
    return sanitized;
  }

  removeDangerousTags(html) {
    const tagRegex = /<\/?(\w+)[^>]*>/g;
    return html.replace(tagRegex, (match, tagName) => {
      const lowerTag = tagName.toLowerCase();
      if (this.options.allowedTags.includes(lowerTag)) {
        return match;
      }
      return '';
    });
  }

  removeDangerousAttributes(html) {
    const attrRegex = /(\w+)=["'][^"']*["']/g;
    return html.replace(attrRegex, (match, attrName) => {
      const lowerAttr = attrName.toLowerCase();
      
      if (this.isAttributeAllowed(lowerAttr)) {
        return match;
      }
      
      if (lowerAttr.startsWith('on') || 
          lowerAttr.startsWith('data-') || 
          ['href', 'src'].includes(lowerAttr)) {
        const urlValue = match.match(/["']([^"']*)["']/);
        if (urlValue && this.isDangerousURL(urlValue[1])) {
          return '';
        }
      }
      
      return match;
    });
  }

  isAttributeAllowed(attrName) {
    const allowedAttrs = this.options.allowedAttributes;
    
    if (allowedAttrs['*'] && allowedAttrs['*'].includes(attrName)) {
      return true;
    }
    
    return false;
  }

  isDangerousURL(url) {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('javascript:') ||
           lowerUrl.includes('data:') ||
           lowerUrl.includes('vbscript:');
  }

  escapeHTML(text) {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return text.replace(/[&<>"'\/]/g, char => escapeMap[char] || char);
  }
}
