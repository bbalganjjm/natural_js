import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {dir, read, json, sha, git, normalized, reference, verifyRef, unique, writeJson, verifyProtection, unchangedEvidence} from './stage-metadata.mjs';
const [prefix,phase]=process.argv.slice(2);
assert(/^[a-z][a-z0-9-]+$/.test(prefix??''));assert(['stamp','check','finish','guard'].includes(phase));
verifyRef({path:dir+'/m516-resume-snapshot.json',sha256:'28da478ff347ca3e4afc1a277389ed32c5209f973886a4b58909127a30494092'});
const wrapperPath=`${dir}/${prefix}-verification.json`,wrapper=json(wrapperPath);
const approvalPath=`node_modules/.cache/${prefix}-final-document-approval.json`,approval=json(approvalPath);
assert.equal(approval.milestone,wrapper.milestone);
assert.equal(approval.status,'approved_independent_final_semantics_mechanical_completion_required');
assert.equal(approval.mechanical_completion_authorization.owner,'root');
assert.deepEqual(wrapper.documents.expected_scope,approval.expected_document_checker_scope);
const originalPath=`node_modules/.cache/${prefix}-reviewed-verification-wrapper.json`;
if(!fs.existsSync(originalPath)){
 assert.equal(sha(read(wrapperPath)),approval.reviewed_verification_wrapper.sha256);
 fs.writeFileSync(originalPath,read(wrapperPath),{flag:'wx'});
}
assert.equal(sha(read(originalPath)),approval.reviewed_verification_wrapper.sha256);
const protectedFields=value=>{const copy=structuredClone(value);delete copy.status;delete copy.documents;return copy;};
assert.deepEqual(protectedFields(wrapper),protectedFields(json(originalPath)));
assert.deepEqual(wrapper.runtime,approval.raw_runtime_receipt);
assert.deepEqual(wrapper.source_review,approval.immutable_source_review_snapshot);
assert.deepEqual(wrapper.independent_raw_review,approval.independent_raw_review);
const files=wrapper.documents.semantic_files;
assert.deepEqual([...files].sort(),Object.keys(approval.reviewed_files).sort());
const text=file=>normalized(read(file)).toString();
const body=value=>{assert(value.startsWith('---\n'));const end=value.indexOf('\n---\n');assert(end>=0);return value.slice(end+5);};
function reviewedBodies(){for(const file of files)assert.equal(sha(body(text(file))),approval.reviewed_files[file].normalized_body_sha256,file);}
function runtime(){
 for(const ref of [wrapper.runtime,wrapper.source_review,wrapper.independent_raw_review])assert.equal(sha(read(ref.path)),ref.sha256,ref.path);
 const raw=json(wrapper.runtime.path);verifyRef(raw.inputs);
 for(const [file,expected]of Object.entries(json(raw.inputs.path)))assert.equal(sha(normalized(read(file))),expected,file);
 verifyRef(raw.checks.artifact.tarball);verifyProtection(json(raw.setup.path));unchangedEvidence(wrapper.baseline_commit,prefix);
 assert.equal(wrapper.artifact.sha256,raw.checks.artifact.tarball.sha256);
 assert.equal(wrapper.counts.inputs,raw.inputs.entries);assert.equal(wrapper.counts.unit_cases,raw.checks.unit.passed);
 for(const suite of Object.values(raw.checks.full_suites))assert.equal(wrapper.counts.full_cases_each,suite.passed);
 assert.equal(git('branch','--show-current').toString().trim(),'2.0.0-alpha.0');
 return raw;
}
function run(args){const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:16*1024*1024});return {code:r.status,output:r.stdout+r.stderr};}
reviewedBodies();runtime();
if(phase==='stamp'){
 const r=run(['tools/knowledge-docs/knowledge-docs.mjs','stamp',...files,'--by','codex/gpt-6','--verified-by','codex/gpt-6']);
 process.stdout.write(r.output);assert.equal(r.code,0);reviewedBodies();
}
if(phase==='check'){
 const settling=unique(`${dir}/${prefix}-docs-fingerprints`,'.log');fs.writeFileSync(settling,'',{flag:'wx'});
 for(let pass=0;pass<64;pass++){
  const r=run(['tools/knowledge-docs/knowledge-docs.mjs','stamp','wiki','docs/implementation']);
  fs.appendFileSync(settling,r.output);assert.equal(r.code,0);
  if(r.output.includes('stamped 0 file(s)'))break;
  assert(pass<63,'Fingerprint graph did not settle');
 }
 const checks={},npm=path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
 for(const [name,extra]of [['changed',['--','--changed']],['full',[]]]){
  const r=run([npm,'run','docs:check',...extra]),file=unique(`${dir}/${prefix}-docs-${name}`,'.log');
  fs.writeFileSync(file,r.output,{flag:'wx'});process.stdout.write(r.output);assert.equal(r.code,0);
  const match=/(\d+) concepts, (\d+) reserved files \| (\d+) errors, (\d+) warnings/.exec(r.output);assert(match);
  const [concepts,reserved_files,errors,warnings]=match.slice(1).map(Number);
  assert.deepEqual({concepts,reserved_files},wrapper.documents.expected_scope);assert.equal(errors,0);assert.equal(warnings,0);
  checks[name]={...reference(file),concepts,reserved_files,errors,warnings};
 }
 const historical=[],metadata=value=>value.slice(0,value.indexOf('\n---\n')).split('\n').filter(line=>!/^    (git_blob|symbol_sha1):/.test(line)).join('\n');
 const changed=Object.keys(json(dir+'/m516-resume-snapshot.json').user_structure.documents);
 for(const file of changed){
  if(!file.endsWith('.md')||files.includes(file)||file.endsWith('/index.md')||file==='docs/log.md'||file==='wiki/log.md')continue;
  const snapshot=json(dir+'/m516-resume-snapshot.json').user_structure.documents[file]; assert(snapshot,'Unreviewed new historical concept: '+file); const current=text(file);
  assert.equal(sha(body(current)),snapshot.body_sha256,'Historical body: '+file);assert.equal(metadata(current),snapshot.metadata_without_fingerprints,'Historical dates/metadata: '+file);historical.push(file);
 }
 reviewedBodies();runtime();
 const historyPath=unique(`${dir}/${prefix}-document-history`,'.json');
 writeJson(historyPath,{baseline_commit:wrapper.baseline_commit,semantic_concepts:files.length,historical_fingerprint_only:historical.length,
  preserved_historical_bodies_and_generated_verified_dates:true,historical});
 const resultPath=unique(`${dir}/${prefix}-document-checks`,'.json');
 const result={checks,history:reference(historyPath),fingerprint_log:reference(settling),reviewed_bodies_unchanged:true};
 writeJson(resultPath,result);
 fs.writeFileSync(`node_modules/.cache/${prefix}-last-document-check.json`,JSON.stringify(reference(resultPath),null,2)+'\n');
 console.log(JSON.stringify({checked:reference(resultPath),historical:historical.length,reviewed_bodies:files.length}));
}
if(phase==='finish'){
 const resultRef=json(`node_modules/.cache/${prefix}-last-document-check.json`);verifyRef(resultRef);const result=json(resultRef.path);
 for(const check of Object.values(result.checks)){verifyRef(check);assert.equal(check.errors,0);assert.equal(check.warnings,0);}
 verifyRef(result.history);assert.equal(json(result.history.path).preserved_historical_bodies_and_generated_verified_dates,true);
 const pending=wrapper.pending_decisions??[];
 wrapper.status=pending.length?'selected_outcomes_verified_pending_scope_decisions':'selected_outcomes_verified_remaining_owners_open';
 wrapper.documents={...wrapper.documents,status:'passed_independent_semantics_and_actual_changed_full_checks',
  independent_review:{reviewer:'m511_design',...reference(approvalPath),reviewed_files:approval.reviewed_files},mechanical:result};
 fs.writeFileSync(wrapperPath,JSON.stringify(wrapper,null,2)+'\n');
 const queuePath=`${dir}/m5-completion-run.json`,queue=json(queuePath),item=queue.queue.find(item=>item.id===wrapper.milestone);assert(item);
 item.status=pending.length?'selected_verified_pending_conditional_decisions':'verified_separate_commit_pending';
 item.receipt=path.basename(wrapperPath);queue.current_checks.documents='passed_independent_and_actual_zero_errors_warnings';
 fs.writeFileSync(queuePath,JSON.stringify(queue,null,2)+'\n');
 console.log(JSON.stringify({status:wrapper.status,raw_runtime_unchanged:wrapper.runtime.sha256}));
}
if(phase==='guard'){
 assert(['selected_outcomes_verified_remaining_owners_open','selected_outcomes_verified_pending_scope_decisions'].includes(wrapper.status));
 const latestRef=json(`node_modules/.cache/${prefix}-last-document-check.json`);verifyRef(latestRef);const latest=json(latestRef.path);
 for(const [name,check]of Object.entries(wrapper.documents.mechanical.checks)){
  verifyRef(check);assert.equal(latest.checks[name].sha256,check.sha256);assert.equal(check.errors,0);assert.equal(check.warnings,0);
 }
 assert.equal(latest.history.sha256,wrapper.documents.mechanical.history.sha256);
 console.log(JSON.stringify({status:wrapper.status,reviewed_bodies:files.length,raw_runtime_unchanged:wrapper.runtime.sha256,checks:'zero errors and warnings'}));
}
