import SanitizerPipeline from '../SanitizerPipeline.js';
import TrimSanitizer from '../../sanitizers/shared/TrimSanitizer.js';
import SQLInjectionSanitizer from '../../sanitizers/search/SQLInjectionSanitizer.js';
import NoSQLInjectionSanitizer from '../../sanitizers/search/NoSQLInjectionSanitizer.js';
import XPATHInjectionSanitizer from '../../sanitizers/search/XPATHInjectionSanitizer.js';
import ReDoSSanitizer from '../../sanitizers/search/ReDoSSanitizer.js';

function createSearchPreset(config = {}) {
  const pipeline = new SanitizerPipeline();
  
  pipeline
    .add(new TrimSanitizer(config))
    .add(new SQLInjectionSanitizer(config))
    .add(new NoSQLInjectionSanitizer(config))
    .add(new XPATHInjectionSanitizer(config))
    .add(new ReDoSSanitizer(config));
  
  return pipeline;
}

export default createSearchPreset;