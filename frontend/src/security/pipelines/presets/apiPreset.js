import AsyncSanitizerPipeline from '../AsyncSanitizerPipeline.js';
import RateLimitEnforcer from '../../sanitizers/bypasses/RateLimitEnforcer.js';
import JWTValidator from '../../sanitizers/structured/JWTValidator.js';
import CSRFProtector from '../../sanitizers/forms/CSRFProtector.js';
import SQLInjectionSanitizer from '../../sanitizers/search/SQLInjectionSanitizer.js';
import NoSQLInjectionSanitizer from '../../sanitizers/search/NoSQLInjectionSanitizer.js';
import HopByHopHeadersSanitizer from '../../sanitizers/proxies/HopByHopHeadersSanitizer.js';

function createApiPreset(config = {}) {
  const pipeline = new AsyncSanitizerPipeline();
  
  pipeline
    .add(new HopByHopHeadersSanitizer({ strict: true }))
    .add(new RateLimitEnforcer(config))
    .add(new JWTValidator(config))
    .add(new CSRFProtector(config))
    .add(new SQLInjectionSanitizer(config))
    .add(new NoSQLInjectionSanitizer(config));
  
  return pipeline;
}

export default createApiPreset;