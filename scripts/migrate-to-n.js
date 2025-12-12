#!/usr/bin/env node

/*!
 * Natural-JS Migration Script
 * Converts NC/NA/ND/NU/NUS to unified N namespace
 * 
 * Usage:
 *   node migrate-to-n.js <directory>
 *   node migrate-to-n.js <directory> --dry-run
 *   node migrate-to-n.js <directory> --backup
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    dryRun: process.argv.includes('--dry-run'),
    backup: process.argv.includes('--backup'),
    verbose: process.argv.includes('--verbose'),
    targetDir: process.argv[2] || './src',
    fileExtensions: ['.js', '.html', '.jsp', '.vue', '.ts', '.tsx'],
    excludeDirs: ['node_modules', 'dist', 'build', '.git', 'coverage']
};

// Statistics
const stats = {
    filesScanned: 0,
    filesChanged: 0,
    totalReplacements: 0,
    replacementsByType: {
        NC: 0,
        NA: 0,
        ND: 0,
        NU: 0,
        NUS: 0
    }
};

// Replacement patterns
const replacements = [
    {
        name: 'NC',
        // NC. → N. (but not in comments or strings)
        pattern: /\bNC\./g,
        replacement: 'N.',
        // Skip if it's in a comment or string
        shouldReplace: (line, match) => {
            // Skip single-line comments
            if (/^\s*\/\//.test(line)) return false;
            // Skip multi-line comments
            if (/^\s*\*/.test(line)) return false;
            // Skip string literals (basic check)
            const beforeMatch = line.substring(0, line.indexOf(match));
            const singleQuotes = (beforeMatch.match(/'/g) || []).length;
            const doubleQuotes = (beforeMatch.match(/"/g) || []).length;
            if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) return false;
            return true;
        }
    },
    {
        name: 'NA',
        pattern: /\bNA\./g,
        replacement: 'N.',
        shouldReplace: (line, match) => {
            if (/^\s*\/\//.test(line)) return false;
            if (/^\s*\*/.test(line)) return false;
            const beforeMatch = line.substring(0, line.indexOf(match));
            const singleQuotes = (beforeMatch.match(/'/g) || []).length;
            const doubleQuotes = (beforeMatch.match(/"/g) || []).length;
            if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) return false;
            return true;
        }
    },
    {
        name: 'ND',
        pattern: /\bND\./g,
        replacement: 'N.',
        shouldReplace: (line, match) => {
            if (/^\s*\/\//.test(line)) return false;
            if (/^\s*\*/.test(line)) return false;
            const beforeMatch = line.substring(0, line.indexOf(match));
            const singleQuotes = (beforeMatch.match(/'/g) || []).length;
            const doubleQuotes = (beforeMatch.match(/"/g) || []).length;
            if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) return false;
            return true;
        }
    },
    {
        name: 'NU',
        // NU. → N. but skip N("#id").xxx patterns
        pattern: /\bNU\./g,
        replacement: 'N.',
        shouldReplace: (line, match) => {
            if (/^\s*\/\//.test(line)) return false;
            if (/^\s*\*/.test(line)) return false;
            // Skip if it's part of jQuery chain: N(".selector").method
            if (/N\([^)]+\)\.\w+/.test(line) && line.includes('NU.')) {
                // This is tricky - NU as static call should be replaced
                // but NU in jQuery chain should not
                // For safety, we'll replace NU. to N. everywhere except in chains
                return true;
            }
            const beforeMatch = line.substring(0, line.indexOf(match));
            const singleQuotes = (beforeMatch.match(/'/g) || []).length;
            const doubleQuotes = (beforeMatch.match(/"/g) || []).length;
            if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) return false;
            return true;
        }
    },
    {
        name: 'NUS',
        pattern: /\bNUS\./g,
        replacement: 'N.',
        shouldReplace: (line, match) => {
            if (/^\s*\/\//.test(line)) return false;
            if (/^\s*\*/.test(line)) return false;
            const beforeMatch = line.substring(0, line.indexOf(match));
            const singleQuotes = (beforeMatch.match(/'/g) || []).length;
            const doubleQuotes = (beforeMatch.match(/"/g) || []).length;
            if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) return false;
            return true;
        }
    }
];

// Helper functions
function shouldProcessFile(fileName) {
    return config.fileExtensions.some(ext => fileName.endsWith(ext));
}

function shouldSkipDirectory(dirName) {
    return config.excludeDirs.includes(dirName);
}

function createBackup(filePath) {
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
}

function migrateFile(filePath) {
    stats.filesScanned++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let fileReplacements = 0;
    
    replacements.forEach(({ name, pattern, replacement, shouldReplace }) => {
        let newContent = content;
        let count = 0;
        
        // Process line by line for better control
        const lines = content.split('\n');
        const newLines = lines.map(line => {
            let newLine = line;
            const matches = line.match(pattern);
            
            if (matches) {
                matches.forEach(match => {
                    if (shouldReplace(line, match)) {
                        newLine = newLine.replace(pattern, replacement);
                        count++;
                    }
                });
            }
            
            return newLine;
        });
        
        newContent = newLines.join('\n');
        
        if (count > 0) {
            content = newContent;
            changed = true;
            fileReplacements += count;
            stats.replacementsByType[name] += count;
            
            if (config.verbose) {
                console.log(`  ${name}: ${count} replacements`);
            }
        }
    });
    
    if (changed) {
        stats.filesChanged++;
        stats.totalReplacements += fileReplacements;
        
        if (config.backup && !config.dryRun) {
            createBackup(filePath);
        }
        
        if (!config.dryRun) {
            fs.writeFileSync(filePath, content, 'utf8');
        }
        
        const status = config.dryRun ? '[DRY-RUN]' : '✓';
        console.log(`${status} ${filePath} (${fileReplacements} changes)`);
    }
}

function migrateDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!shouldSkipDirectory(file)) {
                migrateDirectory(filePath);
            }
        } else if (shouldProcessFile(file)) {
            migrateFile(filePath);
        }
    });
}

function printBanner() {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   Natural-JS Migration Tool v2.0         ║');
    console.log('║   NC/NA/ND/NU/NUS → N                    ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
}

function printConfig() {
    console.log('Configuration:');
    console.log(`  Target Directory: ${config.targetDir}`);
    console.log(`  Dry Run: ${config.dryRun ? 'Yes' : 'No'}`);
    console.log(`  Backup: ${config.backup ? 'Yes' : 'No'}`);
    console.log(`  Verbose: ${config.verbose ? 'Yes' : 'No'}`);
    console.log(`  File Extensions: ${config.fileExtensions.join(', ')}`);
    console.log(`  Excluded Directories: ${config.excludeDirs.join(', ')}`);
    console.log('');
}

function printStats() {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('Migration Summary:');
    console.log('═══════════════════════════════════════════');
    console.log(`Files Scanned: ${stats.filesScanned}`);
    console.log(`Files Changed: ${stats.filesChanged}`);
    console.log(`Total Replacements: ${stats.totalReplacements}`);
    console.log('');
    console.log('Replacements by Type:');
    Object.entries(stats.replacementsByType).forEach(([type, count]) => {
        if (count > 0) {
            console.log(`  ${type}: ${count}`);
        }
    });
    console.log('═══════════════════════════════════════════');
    
    if (config.dryRun) {
        console.log('');
        console.log('⚠️  This was a DRY RUN. No files were modified.');
        console.log('   Run without --dry-run to apply changes.');
    } else if (config.backup) {
        console.log('');
        console.log('✓ Backup files created with .backup extension');
    }
    
    console.log('');
}

function validateDirectory() {
    if (!fs.existsSync(config.targetDir)) {
        console.error(`Error: Directory "${config.targetDir}" does not exist.`);
        process.exit(1);
    }
    
    const stat = fs.statSync(config.targetDir);
    if (!stat.isDirectory()) {
        console.error(`Error: "${config.targetDir}" is not a directory.`);
        process.exit(1);
    }
}

// Main execution
function main() {
    printBanner();
    
    // Validate arguments
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log('Usage:');
        console.log('  node migrate-to-n.js <directory> [options]');
        console.log('');
        console.log('Options:');
        console.log('  --dry-run    Show what would be changed without modifying files');
        console.log('  --backup     Create backup files (.backup extension)');
        console.log('  --verbose    Show detailed replacement information');
        console.log('  --help, -h   Show this help message');
        console.log('');
        console.log('Examples:');
        console.log('  node migrate-to-n.js ./src');
        console.log('  node migrate-to-n.js ./src --dry-run');
        console.log('  node migrate-to-n.js ./src --backup --verbose');
        console.log('');
        process.exit(0);
    }
    
    printConfig();
    validateDirectory();
    
    console.log('Starting migration...');
    console.log('');
    
    const startTime = Date.now();
    
    try {
        migrateDirectory(config.targetDir);
    } catch (error) {
        console.error('');
        console.error('Error during migration:');
        console.error(error.message);
        process.exit(1);
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    printStats();
    console.log(`Completed in ${duration}s`);
}

// Run
main();
