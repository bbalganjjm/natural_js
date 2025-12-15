/**
 * Natural-JS v1.x → v2.0 Migration Script
 * NC/NA/ND/NU/NUS → N namespace migration
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetPath = args.find(arg => arg.startsWith('--path='))?.replace('--path=', '') || '.';
const backup = args.includes('--backup');

console.log('=== Natural-JS Migration Tool ===');
console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'ACTUAL'}`);
console.log(`Path: ${targetPath}`);
console.log(`Backup: ${backup ? 'YES' : 'NO'}\n`);

// Migration patterns
const migrations = [
    { from: /\bNC\./g, to: 'N.', desc: 'NC.* → N.*' },
    { from: /\bNA\./g, to: 'N.', desc: 'NA.* → N.*' },
    { from: /\bND\./g, to: 'N.', desc: 'ND.* → N.*' },
    { from: /\bNU\./g, to: 'N.', desc: 'NU.* → N.*' },
    { from: /\bNUS\./g, to: 'N.', desc: 'NUS.* → N.*' },
    { from: /\bNCD\./g, to: 'N.', desc: 'NCD.* → N.*' },
    { from: /\bNT\./g, to: 'N.', desc: 'NT.* → N.*' },
];

let totalFiles = 0;
let totalChanges = 0;

function migrateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    let fileChanges = 0;
    
    for (const migration of migrations) {
        const matches = newContent.match(migration.from);
        if (matches) {
            newContent = newContent.replace(migration.from, migration.to);
            fileChanges += matches.length;
            console.log(`  ${migration.desc}: ${matches.length} changes`);
        }
    }
    
    if (fileChanges > 0) {
        totalFiles++;
        totalChanges += fileChanges;
        
        if (!dryRun) {
            if (backup) {
                fs.writeFileSync(filePath + '.backup', content);
                console.log(`  ✓ Backup created: ${filePath}.backup`);
            }
            fs.writeFileSync(filePath, newContent);
            console.log(`  ✓ File updated: ${filePath}\n`);
        } else {
            console.log(`  [DRY-RUN] Would update: ${filePath}\n`);
        }
    }
    
    return fileChanges;
}

function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
                walkDirectory(filePath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.html')) {
            const changes = migrateFile(filePath);
            if (changes === 0) {
                // console.log(`  No changes: ${filePath}`);
            }
        }
    }
}

// Start migration
walkDirectory(targetPath);

console.log('\n=== Migration Summary ===');
console.log(`Files modified: ${totalFiles}`);
console.log(`Total changes: ${totalChanges}`);
console.log(`Mode: ${dryRun ? 'DRY-RUN (no files changed)' : 'ACTUAL (files updated)'}`);

if (totalChanges > 0 && dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
}
