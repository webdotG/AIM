import AsyncSanitizerPipeline from '../AsyncSanitizerPipeline.js';
import SQLInjectionSanitizer from '../../sanitizers/search/SQLInjectionSanitizer.js';
import XSSSanitizer from '../../sanitizers/reflected/XSSSanitizer.js';
import CSRFProtector from '../../sanitizers/forms/CSRFProtector.js';
import PathTraversalSanitizer from '../../sanitizers/reflected/PathTraversalSanitizer.js';
import CommandInjectionSanitizer from '../../sanitizers/reflected/CommandInjectionSanitizer.js';
import IDORProtector from '../../sanitizers/other/IDORProtector.js';

function createAdminPreset(config = {}) {
  const pipeline = new AsyncSanitizerPipeline();
  
  pipeline
    .add(new SQLInjectionSanitizer(config))
    .add(new XSSSanitizer(config))
    .add(new CSRFProtector(config))
    .add(new PathTraversalSanitizer(config))
    .add(new CommandInjectionSanitizer(config))
    .add(new IDORProtector(config));
  
  return pipeline;
}

export default createAdminPreset;
