import SanitizerPipeline from '../SanitizerPipeline.js';
import CSRFProtector from '../../sanitizers/forms/CSRFProtector.js';
import XSSSanitizer from '../../sanitizers/reflected/XSSSanitizer.js';
import HTMLSanitizer from '../../sanitizers/shared/HTMLSanitizer.js';
import EncodingSanitizer from '../../sanitizers/shared/EncodingSanitizer.js';

function createFormPreset(config = {}) {
  const pipeline = new SanitizerPipeline();
  
  pipeline
    .add(new CSRFProtector(config))
    .add(new XSSSanitizer(config))
    .add(new HTMLSanitizer(config))
    .add(new EncodingSanitizer(config));
  
  return pipeline;
}

export default createFormPreset;