#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  module: string;
  passed: boolean;
  duration: number;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async run() {
    console.log('═══════════════════════════════════════════════');
    console.log('AIM Backend Test Suite Runner');
    console.log('═══════════════════════════════════════════════\n');

    this.startTime = Date.now();


    const modules = [
      'auth',
      'analytics',
      'body-states',
      'circumstances',
      'emotions',
      'entries',
      'people',
      'relations',
      'skills',
      'tags'
    ];


    for (const module of modules) {
      await this.runModuleTests(module);
    }

    this.printReport();
  }

  private async runModuleTests(module: string): Promise<void> {
    const testFile = `src/modules/${module}/__tests__/${module}.test.ts`;
    
    console.log(`\nTesting module: ${module.toUpperCase()}`);
    console.log('─'.repeat(50));

    if (!fs.existsSync(testFile)) {
      console.log(` Test file not found: ${testFile}`);
      this.results.push({
        module,
        passed: false,
        duration: 0,
        error: 'Test file not found'
      });
      return;
    }

    const moduleStart = Date.now();

    try {
      execSync(`npx jest ${testFile} --verbose`, {
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' }
      });

      const duration = Date.now() - moduleStart;
      this.results.push({
        module,
        passed: true,
        duration
      });

      console.log(` ${module} tests passed (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - moduleStart;
      this.results.push({
        module,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      console.log(`${module} tests failed (${duration}ms)`);
    }
  }

  private printReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const passedCount = this.results.filter(r => r.passed).length;
    const failedCount = this.results.filter(r => !r.passed).length;
    const totalCount = this.results.length;

    console.log('\n\n═══════════════════════════════════════════════');
    console.log('TEST SUMMARY REPORT');
    console.log('═══════════════════════════════════════════════\n');

    console.log('Module Results:');
    console.log('─'.repeat(50));
    
    this.results.forEach(result => {
      const status = result.passed ? ' PASS' : ' FAIL';
      const time = `${result.duration}ms`;
      console.log(`${status.padEnd(10)} ${result.module.padEnd(20)} ${time}`);
      
      if (result.error) {
        console.log(`           Error: ${result.error}`);
      }
    });

    console.log('─'.repeat(50));

    console.log(`\nStatistics:`);
    console.log(`   Total Modules: ${totalCount}`);
    console.log(`   Passed: ${passedCount}`);
    console.log(`   Failed: ${failedCount}`);
    console.log(`   Total Time: ${totalDuration}ms`);
    console.log(`   Success Rate: ${((passedCount / totalCount) * 100).toFixed(1)}%`);

    console.log('\n═══════════════════════════════════════════════');
    if (failedCount === 0) {
      console.log('ALL TESTS PASSED! ');
    } else {
      console.log(`${failedCount} MODULE(S) FAILED`);
    }
    console.log('═══════════════════════════════════════════════\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  }
}

const runner = new TestRunner();
runner.run().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});