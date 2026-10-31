import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const dir='docs/implementation/evidence',cli='node_modules/@playwright/test/cli.js';
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const records=[];
function unique(stem,extension){let name=stem+extension,index=1;while(fs.existsSync(dir+'/'+name))name=stem+'-'+(++index)+extension;return name;}
async function command(label,extra){
 const args=[cli,'test','-c','tests/playwright.config.ts','--project=chromium','--workers=1','--retries=0','--reporter=json',...extra];
 const started=new Date().toISOString(),child=spawn(process.execPath,args,{stdio:['ignore','pipe','pipe']});
 let out='',err='';child.stdout.on('data',data=>out+=data);child.stderr.on('data',data=>err+=data);
 const exit=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});
 const report=unique('m54-chromium-'+label,'.json'),stderr=unique('m54-chromium-'+label,'-stderr.log');
 fs.writeFileSync(dir+'/'+report,out.replaceAll('\r\n','\n'));fs.writeFileSync(dir+'/'+stderr,err.replaceAll('\r\n','\n'));
 records.push({label,args,started,finished:new Date().toISOString(),exit_code:exit,report,report_sha256:sha(dir+'/'+report),stderr,stderr_sha256:sha(dir+'/'+stderr)});
 assert.equal(exit,0,'Failed Chromium '+label);return JSON.parse(out);
}
function tests(report){const found=[];function visit(suite){for(const spec of suite.specs??[])for(const test of spec.tests??[])found.push({id:test.projectName+':'+spec.id,test});for(const nested of suite.suites??[])visit(nested);}for(const suite of report.suites??[])visit(suite);return found;}
const manifestName=unique('m54-chromium-shards','.json'),started=Date.now();
const manifest={schema_version:1,method:'Three sequential built-in Playwright shards; fresh browser process per shard; no skipped, retried or repeated test identities.',runner:'m54-chromium-shards.mjs',runner_sha256:sha(dir+'/m54-chromium-shards.mjs'),records,partitions:[],complete:false};
try{
 const whole=tests(await command('list', ['--list'])).map(item=>item.id).sort();assert(whole.length>0);assert.equal(new Set(whole).size,whole.length);
 manifest.expected_ids=whole;
 const all=[];
 for(let shard=1;shard<=3;shard++){
  const flag='--shard='+shard+'/3';
  const expected=tests(await command('list-'+shard,['--list',flag])).map(item=>item.id).sort();
  assert(expected.length>0);assert.equal(new Set(expected).size,expected.length);assert(expected.every(id=>whole.includes(id)&&!all.includes(id)));
  const report=await command('run-'+shard,[flag]),actual=tests(report);
  assert.deepEqual(actual.map(item=>item.id).sort(),expected,'Shard identities differ from list');
  assert.equal(report.errors.length,0);assert.equal(report.stats.unexpected,0);assert.equal(report.stats.skipped,0);assert.equal(report.stats.flaky,0);
  for(const {test}of actual){assert.equal(test.expectedStatus,'passed');assert.equal(test.results.length,1);assert.equal(test.results[0].status,'passed');assert.equal(test.results[0].retry,0);}
  all.push(...expected);manifest.partitions.push({shard,ids:expected,passed:actual.length});
  console.log(JSON.stringify({shard,passed:actual.length,identities_match:true,retries:0,skips:0}));
 }
 assert.deepEqual(all.sort(),whole,'Shard union differs from complete Chromium suite');manifest.complete=true;manifest.passed=all.length;manifest.elapsed_ms=Date.now()-started;
 console.log(all.length+' passed (3 sequential Chromium shards, '+(manifest.elapsed_ms/1000).toFixed(1)+'s)');
}finally{fs.writeFileSync(dir+'/'+manifestName,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({shard_manifest:manifestName,sha256:sha(dir+'/'+manifestName),complete:manifest.complete}));}
