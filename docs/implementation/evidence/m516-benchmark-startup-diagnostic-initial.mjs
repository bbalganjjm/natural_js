import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import {dir,json,read,sha,normalized,reference} from './stage-metadata.mjs';
const record=json(`${dir}/m516-binding-performance-2-result.json`);assert.equal(record.exit_code,1);
const map=json(record.before.path),verify=()=>{for(const [file,expected]of Object.entries(map))assert.equal(sha(normalized(read(file))),expected,file);};verify();
const configFile=fileURLToPath(new URL('../../examples/vite/vite.config.ts',new URL('../../',import.meta.url)));
const server=await createServer({configFile,logLevel:'silent',server:{host:'127.0.0.1',port:0,strictPort:false}});
let browser;const result={started:new Date().toISOString(),errors:[],failed_requests:[],responses:[],console_errors:[]};
try{
 await server.listen();const baseURL=server.resolvedUrls?.local[0];assert(baseURL);
 browser=await chromium.launch({headless:true,args:['--enable-precise-memory-info']});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 page.on('pageerror',error=>result.errors.push({message:error.message,stack:error.stack}));
 page.on('requestfailed',request=>result.failed_requests.push({url:request.url(),error:request.failure()?.errorText}));
 page.on('response',response=>result.responses.push({url:response.url(),status:response.status()}));
 page.on('console',message=>{if(message.type()==='error')result.console_errors.push(message.text());});
 try{const response=await page.goto(new URL('benchmark.html',baseURL).href);result.navigation_status=response?.status();await page.waitForFunction(()=>typeof window.runM4Benchmark==='function');result.status='ready';}
 catch(cause){result.status='error';result.error=String(cause);}
 result.observed_global=await page.evaluate(()=>typeof window.runM4Benchmark);
}finally{await browser?.close();await server.close();}
verify();result.finished=new Date().toISOString();
const helper='node_modules/.cache/m516-benchmark-startup-diagnostic.mjs',output=`${dir}/m516-benchmark-startup-diagnostic.json`;
const report={kind:'benchmark_startup_transport_diagnostic',helper:reference(helper),failed_attempt:reference(`${dir}/m516-binding-performance-2-result.json`),unchanged_inputs:record.before,result,scope:'Replays only the original Vite/page/launch/ready setup, with error and request observers. No benchmark function, warmup, metric or budget executes. This later observation cannot establish the original uninstrumented timeout cause; no source/test/configuration/fixture change or compiler/unit/suite/canonical credit.'};
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});fs.writeFileSync(`${dir}/m516-benchmark-startup-diagnostic.mjs`,read(helper),{flag:'wx'});
console.log(JSON.stringify({record:reference(output),result}));
