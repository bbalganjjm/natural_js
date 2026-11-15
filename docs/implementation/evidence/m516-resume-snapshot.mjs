import fs from 'node:fs';
import assert from 'node:assert/strict';
import {dir,json,read,sha,normalized,reference,inventory,git,verifyProtection} from './stage-metadata.mjs';
const prefix='m516',old=json(`${dir}/m516-inputs-fd90b1a11d65.json`);
const current=Object.fromEntries(inventory().map(file=>[file,sha(normalized(read(file)))]));
assert.deepEqual(Object.keys(current),Object.keys(old));
const changed=Object.keys(current).filter(file=>current[file]!==old[file]);
assert.deepEqual(changed,['README.md','tools/knowledge-docs/knowledge-docs.mjs','tools/knowledge-docs/knowledge-docs.test.mjs']);
const applied=json('node_modules/.cache/m516-applied-source.json');
for(const [file,expected]of Object.entries(applied.source_sha256))assert.equal(current[file],expected,file);
verifyProtection(json(`${dir}/m516-setup.json`));
const documents={};
function scan(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
 const file=folder+'/'+entry.name;
 if(file===dir)continue;
 if(entry.isDirectory())scan(file);
 else if(file.endsWith('.md')){
  const text=normalized(read(file)).toString(),end=text.indexOf('\n---\n'),has=text.startsWith('---\n')&&end>=0;
  documents[file]={...reference(file),normalized_sha256:sha(text),body_sha256:sha(has?text.slice(end+5):text),
   metadata_without_fingerprints:has?text.slice(0,end).split('\n').filter(line=>!/^    (git_blob|symbol_sha1):/.test(line)).join('\n'):null};
 }
}}
scan('docs');scan('wiki');
const report={stage:'M5.16',kind:'resume_after_user_authorized_document_structure_change',at:new Date().toISOString(),baseline_commit:git('rev-parse','HEAD').toString().trim(),prior_inputs:reference(`${dir}/m516-inputs-fd90b1a11d65.json`),input_count:Object.keys(current).length,resumed_inputs:current,input_changes:changed,
 user_structure:{instructions:reference('AGENTS.md'),gitignore:reference('.gitignore'),changelog:reference('CHANGELOG.md'),receipt:reference(`${dir}/wiki-separation-20261115.json`),documents},
 scope:'Preservation checkpoint, no runtime acceptance. User docs/v2 and docs/governance moves to wiki are intentional. Initial M5.16 source18, failure traces and protected prior evidence are unchanged; old input map does not cover resumed README/checker bytes.'};
const output=`${dir}/m516-resume-snapshot.json`;
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(`${dir}/m516-resume-snapshot.mjs`,read('node_modules/.cache/m516-resume-snapshot.mjs'),{flag:'wx'});
console.log(JSON.stringify({snapshot:reference(output),inputs:report.input_count,input_changes:changed,documents:Object.keys(documents).length}));
