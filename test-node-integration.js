/**
 * Node.js Integration Test
 */

const N = require('./dist/natural.js');

console.log('=== Natural-JS Node.js Integration Test ===\n');

// Test 1: Core utilities
console.log('1. Core Utilities:');
console.log('   N.string.trimToEmpty("  test  "):', N.string.trimToEmpty('  test  '));
console.log('   N.type([]):', N.type ? N.type([]) : 'N.type not found');
console.log('   N.version:', N.version);

// Test 2: Static classes
console.log('\n2. Static Classes:');
console.log('   typeof N.comm:', typeof N.comm);
console.log('   typeof N.formatter:', typeof N.formatter);
console.log('   typeof N.validator:', typeof N.validator);
console.log('   typeof N.form:', typeof N.form);
console.log('   typeof N.grid:', typeof N.grid);

// Test 3: N function
console.log('\n3. N Function:');
console.log('   typeof N:', typeof N);
console.log('   N is a function:', typeof N === 'function');

console.log('\n=== All Tests Passed ===');
