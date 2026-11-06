import base from '../0078/journey.config';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';
export default defineConfig({ ...base, testDir: '.', testMatch: 'journey.spec.ts', reporter: [['list'], ['json', { outputFile: 'docs/evidence/0081/regression/results.json' }]], outputDir: fileURLToPath(new URL('./regression/results', import.meta.url)), use: { ...base.use, baseURL: 'http://127.0.0.1:5483' } });
