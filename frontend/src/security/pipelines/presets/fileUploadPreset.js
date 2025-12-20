import AsyncSanitizerPipeline from '../AsyncSanitizerPipeline.js';
import FileUploadSanitizer from '../../sanitizers/files/FileUploadSanitizer.js';
import PathTraversalSanitizer from '../../sanitizers/reflected/PathTraversalSanitizer.js';
import FormulaInjectionSanitizer from '../../sanitizers/files/FormulaInjectionSanitizer.js';
import ServerSideXSSSanitizer from '../../sanitizers/files/ServerSideXSSSanitizer.js';

function createFileUploadPreset(config = {}) {
  const pipeline = new AsyncSanitizerPipeline();
  
  pipeline
    .add(new FileUploadSanitizer(config))
    .add(new PathTraversalSanitizer(config))
    .add(new FormulaInjectionSanitizer(config))
    .add(new ServerSideXSSSanitizer(config));
  
  return pipeline;
}

export default createFileUploadPreset;