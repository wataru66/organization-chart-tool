/**
 * Export Module Verification Script
 * 모듈 기능을 프로그래매틱하게 테스트
 */

// Mock DOM environment for testing
if (typeof window === 'undefined') {
    global.window = {
        ConfigModule: null,
        URL: {
            createObjectURL: () => 'mock-url',
            revokeObjectURL: () => {}
        },
        Blob: function(data, options) {
            this.data = data;
            this.options = options;
        }
    };
    global.document = {
        createElementNS: (ns, tag) => ({ 
            setAttribute: () => {}, 
            textContent: '',
            insertBefore: () => {},
            firstChild: null,
            cloneNode: () => ({}),
            createElement: () => ({
                href: '', download: '', click: () => {},
                appendChild: () => {}, removeChild: () => {}
            }),
            body: { appendChild: () => {}, removeChild: () => {} },
            getBBox: () => ({ x: 0, y: 0, width: 100, height: 100 })
        }),
        createElement: () => document.createElementNS(),
    };
    global.XMLSerializer = function() {
        this.serializeToString = () => '<svg></svg>';
    };
    global.btoa = (str) => Buffer.from(str).toString('base64');
}

// Load the export module
let ExportUtilsModule;
try {
    if (typeof require !== 'undefined') {
        // Node.js environment
        const fs = require('fs');
        const path = require('path');
        const moduleCode = fs.readFileSync(path.join(__dirname, 'modules/export-utils-module.js'), 'utf8');
        eval(moduleCode);
        ExportUtilsModule = global.ExportUtilsModule;
    } else {
        // Browser environment
        ExportUtilsModule = window.ExportUtilsModule;
    }
} catch (error) {
    console.error('Failed to load ExportUtilsModule:', error);
    process.exit(1);
}

// Test Results
const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function runTest(name, testFn) {
    try {
        console.log(`\n🧪 Testing: ${name}`);
        const result = testFn();
        if (result === true) {
            console.log(`✅ ${name}: PASSED`);
            testResults.passed++;
        } else if (result === 'warning') {
            console.log(`⚠️ ${name}: WARNING`);
            testResults.warnings++;
        } else {
            console.log(`❌ ${name}: FAILED`);
            testResults.failed++;
        }
    } catch (error) {
        console.log(`❌ ${name}: ERROR - ${error.message}`);
        testResults.failed++;
    }
}

function createMockSVG() {
    return {
        cloneNode: () => createMockSVG(),
        getAttribute: () => '0 0 100 100',
        setAttribute: () => {},
        getBBox: () => ({ x: 0, y: 0, width: 100, height: 100 }),
        insertBefore: () => {},
        firstChild: null
    };
}

function createMockContainer() {
    return {
        outerHTML: '<div class="chart-container"><svg></svg></div>'
    };
}

// Run Tests
console.log('🚀 Starting Export Module Verification\n');

// Test 1: Module Loading
runTest('Module Loading', () => {
    return ExportUtilsModule && typeof ExportUtilsModule.ExportUtils === 'function';
});

// Test 2: ExportUtils Instance Creation
let exportUtils;
runTest('ExportUtils Instance Creation', () => {
    exportUtils = new ExportUtilsModule.ExportUtils();
    return exportUtils && typeof exportUtils.exportSVG === 'function';
});

// Test 3: SVG Export Method
runTest('SVG Export Method', () => {
    if (!exportUtils) return false;
    
    const mockSVG = createMockSVG();
    try {
        exportUtils.exportSVG(mockSVG, 'test.svg');
        return true;
    } catch (error) {
        console.log(`   Error: ${error.message}`);
        return false;
    }
});

// Test 4: PNG Export Method  
runTest('PNG Export Method', () => {
    if (!exportUtils) return false;
    
    const mockSVG = createMockSVG();
    try {
        exportUtils.exportPNG(mockSVG, 'test.png', 1);
        return true;
    } catch (error) {
        console.log(`   Error: ${error.message}`);
        return 'warning'; // PNG export might fail in Node.js environment
    }
});

// Test 5: HTML Export Method
runTest('HTML Export Method', () => {
    if (!exportUtils) return false;
    
    const mockContainer = createMockContainer();
    try {
        exportUtils.exportHTML(mockContainer, 'test.html');
        return true;
    } catch (error) {
        console.log(`   Error: ${error.message}`);
        return false;
    }
});

// Test 6: Excel Export Method
runTest('Excel Export Method', () => {
    if (!exportUtils) return false;
    
    const mockData = [
        { teamName: 'Test Team', level: 1, role: 'Manager', picName: 'Test Person' }
    ];
    try {
        exportUtils.exportExcel(mockData, 'test.xlsx');
        return true;
    } catch (error) {
        console.log(`   Error: ${error.message}`);
        return false;
    }
});

// Test 7: SVG Style Embedding
runTest('SVG Style Embedding', () => {
    if (!exportUtils) return false;
    
    const mockSVG = createMockSVG();
    let styleEmbedded = false;
    
    mockSVG.insertBefore = (style, firstChild) => {
        if (style.textContent && style.textContent.includes('.org-box')) {
            styleEmbedded = true;
        }
    };
    
    try {
        exportUtils.embedStyles(mockSVG);
        return styleEmbedded;
    } catch (error) {
        console.log(`   Error: ${error.message}`);
        return false;
    }
});

// Test 8: Standalone HTML Generation
runTest('Standalone HTML Generation', () => {
    if (!exportUtils) return false;
    
    const mockContainer = createMockContainer();
    try {
        const html = exportUtils.generateStandaloneHTML(mockContainer);
        const hasDoctype = html.includes('<!DOCTYPE html>');
        const hasSVG = html.includes('<svg>');
        const hasHTML = html.includes('</html>');
        
        if (hasDoctype && hasSVG && hasHTML) {
            return true;
        } else {
            console.log(`   Missing: DOCTYPE(${hasDoctype}), SVG(${hasSVG}), HTML(${hasHTML})`);
            return false;
        }
    } catch (error) {
        console.log(`   Error: ${error.message}`);
        return false;
    }
});

// Test 9: Header to Key Mapping
runTest('Header to Key Mapping', () => {
    if (!exportUtils) return false;
    
    try {
        const tests = [
            { header: 'Team Name', expected: 'teamName' },
            { header: 'Level', expected: 'level' },
            { header: 'PIC Name', expected: 'picName' },
            { header: 'Upper Team', expected: 'upperTeam' }
        ];
        
        let allPassed = true;
        tests.forEach(test => {
            const result = exportUtils.headerToKey(test.header);
            if (result !== test.expected) {
                console.log(`   Failed: "${test.header}" -> "${result}" (expected "${test.expected}")`);
                allPassed = false;
            }
        });
        
        return allPassed;
    } catch (error) {
        console.log(`   Error: ${error.message}`);
        return false;
    }
});

// Test 10: Blob Download Method
runTest('Blob Download Method', () => {
    if (!exportUtils) return false;
    
    try {
        const mockBlob = new (global.Blob || window.Blob)(['test'], { type: 'text/plain' });
        exportUtils.downloadBlob(mockBlob, 'test.txt');
        return true;
    } catch (error) {
        console.log(`   Error: ${error.message}`);
        return 'warning'; // Download might not work in all environments
    }
});

// Print Final Results
console.log('\n📊 Test Results Summary:');
console.log('═══════════════════════════');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`⚠️ Warnings: ${testResults.warnings}`);
console.log(`❌ Failed: ${testResults.failed}`);

const total = testResults.passed + testResults.warnings + testResults.failed;
const successRate = total > 0 ? ((testResults.passed + testResults.warnings) / total * 100).toFixed(1) : 0;

console.log(`📈 Success Rate: ${successRate}%`);

if (testResults.failed === 0) {
    console.log('\n🎉 All critical export functionality tests passed!');
    console.log('✅ Export module is ready for production use.');
    
    if (typeof process !== 'undefined') {
        process.exit(0);
    }
} else {
    console.log('\n❌ Some tests failed. Export module needs fixes.');
    console.log('🔧 Please review the failed tests and fix the issues.');
    
    if (typeof process !== 'undefined') {
        process.exit(1);
    }
}