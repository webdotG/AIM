#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
class TestRunner {
    constructor() {
        this.results = [];
        this.startTime = 0;
    }
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
    async runModuleTests(module) {
        const testFile = `src/modules/${module}/__tests__/${module}.test.ts`;
        if (!fs.existsSync(testFile)) {
            this.results.push({
                module,
                passed: false,
                duration: 0,
                failures: ['Test file not found'],
                failureDetails: `File not found: ${testFile}`
            });
            return;
        }
        const moduleStart = Date.now();
        try {
            // Запускаем тесты и захватываем вывод
            const output = (0, child_process_1.execSync)(`npx jest ${testFile} --json`, {
                encoding: 'utf-8',
                env: { ...process.env }
            });
            const testResults = JSON.parse(output);
            const duration = Date.now() - moduleStart;
            // Анализируем результаты
            const failures = [];
            if (testResults.testResults && testResults.testResults.length > 0) {
                const suiteResult = testResults.testResults[0];
                if (suiteResult.assertionResults) {
                    suiteResult.assertionResults.forEach((test) => {
                        if (test.status === 'failed') {
                            failures.push(test.fullName);
                        }
                    });
                }
            }
            this.results.push({
                module,
                passed: testResults.success,
                duration,
                failures,
                failureDetails: testResults.success ? undefined : this.extractFailureDetails(testResults)
            });
        }
        catch (error) {
            const duration = Date.now() - moduleStart;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.results.push({
                module,
                passed: false,
                duration,
                failures: ['Test execution failed'],
                failureDetails: errorMessage
            });
        }
    }
    extractFailureDetails(testResults) {
        if (!testResults.testResults || testResults.testResults.length === 0) {
            return 'No test results available';
        }
        const details = [];
        testResults.testResults.forEach((suite) => {
            if (suite.assertionResults) {
                suite.assertionResults.forEach((test) => {
                    if (test.status === 'failed') {
                        test.failureMessages?.forEach((msg) => {
                            // Убираем лишнюю информацию, оставляем только суть
                            const cleanMsg = msg
                                .split('\n')
                                .filter(line => !line.includes('at ') && !line.includes('node_modules'))
                                .join(' ')
                                .substring(0, 200); // Ограничиваем длину
                            details.push(`${test.fullName}: ${cleanMsg}`);
                        });
                    }
                });
            }
        });
        return details.length > 0 ? details.join('; ') : 'Unknown failure';
    }
    printReport() {
        const totalDuration = Date.now() - this.startTime;
        const passedCount = this.results.filter(r => r.passed).length;
        const failedCount = this.results.filter(r => !r.passed).length;
        const totalCount = this.results.length;
        console.log('\n═══════════════════════════════════════════════');
        console.log('TEST SUMMARY REPORT');
        console.log('═══════════════════════════════════════════════\n');
        console.log('Module Results:');
        console.log('─'.repeat(50));
        this.results.forEach(result => {
            const status = result.passed ? '✓ PASS' : '✗ FAIL';
            const time = `${result.duration}ms`;
            console.log(`${status.padEnd(10)} ${result.module.padEnd(20)} ${time}`);
            if (!result.passed) {
                console.log(`           Failures: ${result.failures.length} test(s)`);
                if (result.failureDetails) {
                    console.log(`           Reason: ${result.failureDetails}`);
                }
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
            console.log('ALL TESTS PASSED!');
        }
        else {
            console.log(`${failedCount} MODULE(S) FAILED`);
            console.log('═══════════════════════════════════════════════');
            // Детали по проваленным тестам
            console.log('\nFAILURE DETAILS:');
            console.log('─'.repeat(50));
            this.results
                .filter(r => !r.passed)
                .forEach(result => {
                console.log(`\n${result.module.toUpperCase()}:`);
                console.log(`  Duration: ${result.duration}ms`);
                console.log(`  Failed tests: ${result.failures.length}`);
                if (result.failures.length > 0) {
                    result.failures.forEach(failure => {
                        console.log(`    - ${failure}`);
                    });
                }
                if (result.failureDetails) {
                    console.log(`  Error: ${result.failureDetails}`);
                }
            });
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
//# sourceMappingURL=run-all-tests.js.map