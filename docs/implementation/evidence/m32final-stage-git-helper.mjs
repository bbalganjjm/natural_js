import fs from 'node:fs';
import assert from 'node:assert/strict';
import {dir,json,read,sha,normalized,git,verifyRef,verifyProtection,unchangedEvidence,reference,tree} from './stage-metadata.mjs';
function protectedEvidencePaths(setup) {
 const files=setup.protected_files.filter(ref=>ref.path.startsWith(dir+'/')).map(ref=>ref.path);
 assert(files.every(file=>!file.includes('\\')&&!file.split('/').some(part=>part==='.'||part==='..')));
 return new Set(files);
}
function stagePathAllowed(file,owned,ancestors) {
 return owned.has(file)||/^docs\/(?:v2|implementation|governance)\/[^/]+\.md$/.test(file)||
  ['docs/index.md','docs/log.md',dir+'/m5-completion-run.json'].includes(file)||file.startsWith(dir+'/'+prefix+'-')||ancestors.has(file);
}
function addBatches(files) {
 const batches=[];let batch=[],size=128;
 for(const file of files){const cost=file.length*2+3;assert(cost+128<=16000,'Git path exceeds safe command budget');
  if(batch.length===64||size+cost>16000){batches.push(batch);batch=[];size=128;}
  batch.push(file);size+=cost;
 }
 if(batch.length)batches.push(batch);return batches;
}
const [prefix,phase]=process.argv.slice(2);assert(/^[a-z][a-z0-9-]+$/.test(prefix??''));assert(['stage','index','commit'].includes(phase));
const wrapperPath=`${dir}/${prefix}-verification.json`,wrapper=json(wrapperPath),raw=json(wrapper.runtime.path);
assert(['selected_outcomes_verified_remaining_owners_open','selected_outcomes_verified_pending_scope_decisions'].includes(wrapper.status));
assert.equal(sha(read(wrapper.runtime.path)),wrapper.runtime.sha256);
assert.equal(git('branch','--show-current').toString().trim(),'2.0.0-alpha.0');
verifyRef(raw.setup);const setup=json(raw.setup.path);verifyProtection(setup);const ancestors=protectedEvidencePaths(setup);
verifyRef(wrapper.source_review);
const source=json(wrapper.source_review.path),owned=new Set(Object.keys(source.independent_source_review.source_sha256));
for(const [file,expected]of Object.entries(source.independent_source_review.source_sha256))
 assert.equal(sha(normalized(read(file))),expected,'Reviewed working source: '+file);
if(phase==='stage'){
 const files=[...new Set([...git('diff','HEAD','--name-only','-z').toString().split('\0'),...git('ls-files','--others','--exclude-standard','-z').toString().split('\0')].filter(Boolean))].sort();
 for(const file of files)assert(stagePathAllowed(file,owned,ancestors),'Unexpected change: '+file);
 assert.equal(files.filter(file=>owned.has(file)).length,owned.size);
 const batches=addBatches(files);for(const batch of batches)git('add','--',...batch);
 console.log(JSON.stringify({staged:files.length,source_files:owned.size,git_add_batches:batches.length}));
}else{
 const ref=phase==='commit'?'HEAD:':':',map=json(raw.inputs.path);
 verifyRef(raw.inputs);unchangedEvidence(wrapper.baseline_commit,prefix);
 for(const [file,expected]of Object.entries(source.independent_source_review.source_sha256))
  assert.equal(sha(normalized(git('show',ref+file))),expected,'Reviewed Git source: '+file);
 for(const [file,expected]of Object.entries(map)){
  assert.equal(sha(normalized(read(file))),expected,'Working input: '+file);
  assert.equal(sha(normalized(git('show',ref+file))),expected,'Git input: '+file);
  if(file.endsWith('.tar'))assert.deepEqual(read(file),git('show',wrapper.baseline_commit+':'+file),file);
 }
 const current=fs.readdirSync(dir).filter(name=>name.startsWith(prefix+'-')).flatMap(name=>{
  const file=dir+'/'+name;return fs.statSync(file).isDirectory()?tree(file).map(ref=>ref.path):[file];
 });
 const evidence=[...new Set([...current,...ancestors])].sort();
 for(const file of evidence)assert.deepEqual(read(file),git('show',ref+file),'Git evidence bytes: '+file);
 for(const file of wrapper.documents.semantic_files){
  const text=normalized(read(file)).toString(),body=text.slice(text.indexOf('\n---\n')+5);
  assert.equal(sha(body),wrapper.documents.independent_review.reviewed_files[file].normalized_body_sha256,file);
  assert.deepEqual(normalized(read(file)),normalized(git('show',ref+file)),file);
 }
 for(const check of Object.values(wrapper.documents.mechanical.checks))verifyRef(check);
 assert.equal(git('diff',wrapper.baseline_commit,'--','v1').length,0);
 assert.equal(git('ls-files','--','js/natural_js/@types/package-lock.json').length,0);
 console.log(JSON.stringify({ref,inputs:Object.keys(map).length,evidence_files:evidence.length,raw_runtime_unchanged:wrapper.runtime.sha256,artifact:reference(raw.checks.artifact.tarball.path).sha256}));
}
