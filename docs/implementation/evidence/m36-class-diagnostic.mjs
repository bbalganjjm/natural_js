import fs from 'node:fs';import assert from 'node:assert/strict';import path from 'node:path';
import {createServer} from 'vite';import {chromium} from '@playwright/test';
import {reference,inputs,verifyRef} from './stage-metadata.mjs';
const before=inputs('m36'),expressionRef=reference('docs/implementation/evidence/m36-serialized-class-expression.js');
const expression=fs.readFileSync(expressionRef.path,'utf8');assert(expression.includes('_classPrivateFieldInitSpec'));
let server,browser;let outcome;
try{
 server=await createServer({configFile:path.resolve('examples/vite/vite.config.ts'),server:{host:'127.0.0.1',port:4173,strictPort:true}});await server.listen();
 browser=await chromium.launch();const page=await browser.newPage();await page.goto('http://127.0.0.1:4173/');
 const pageModule='/@fs/'+path.resolve('src/page/index.ts').replaceAll('\\','/');
 outcome=await page.evaluate(`(async()=>{const helper=typeof globalThis._classPrivateFieldInitSpec;try{await (${expression})(${JSON.stringify(pageModule)});return {ok:true,helper};}catch(error){return {ok:false,helper,name:error.name,code:error.code,api:error.api,message:error.message,cause:{name:error.cause?.name,message:error.cause?.message}};}})()`);
 assert.deepEqual(outcome,{ok:false,helper:'undefined',name:'FrameworkError',code:'PAGE_INIT',api:'mountPage',message:'Page operation failed',cause:{name:'ReferenceError',message:'_classPrivateFieldInitSpec is not defined'}});
}finally{await Promise.allSettled([browser?.close(),server?.close()]);}
const after=inputs('m36');assert.equal(before.sha256,after.sha256);verifyRef(expressionRef);
const result={kind:'serialized_class_failure_diagnostic',helper:reference('node_modules/.cache/m36-class-diagnostic.mjs'),before,after,expression:expressionRef,
 original_fixture:reference('docs/implementation/evidence/m36-initial-page-advice.spec.ts'),outcome,
 scope:'Executes the exact failing trace expression against unchanged framework source in Chromium. No canonical/unit/browser-suite credit; no production change.'};
const target='docs/implementation/evidence/m36-serialized-class-diagnostic.json';fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({result:reference(target),outcome}));
