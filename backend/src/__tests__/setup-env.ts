// Minimal env setup — runs BEFORE any test imports via setupFiles
import dotenv from 'dotenv';

process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });