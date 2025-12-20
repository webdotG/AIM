import SanitizerPipeline from '../SanitizerPipeline.js';
// import HTMLSanitizer from '../../sanitizers/frontend/';
import XSSSanitizer from '../../sanitizers/frontend/XSSSanitizer.js';
import TrimSanitizer from '../../sanitizers/shared/TrimSanitizer.js';
import LengthSanitizer from '../../sanitizers/shared/LengthSanitizer.js';
// import URLSanitizer from '../../sanitizers/frontend/URLSanitizer.js';

export function createEntryContentPipeline() {
  const pipeline = new SanitizerPipeline('entry-content');
  
  pipeline
    .addStage(new TrimSanitizer(), 'trim')
    .addStage(new LengthSanitizer({ max: 10000 }), 'length-check')
    .addStage(new HTMLSanitizer({ allowedTags: ['b', 'i', 'u', 'p', 'br'] }), 'html-cleanup')
    .addStage(new XSSSanitizer(), 'xss-protection')
    // .addStage(new URLSanitizer(), 'url-check');
  
  return pipeline;
}

export default createEntryContentPipeline;
