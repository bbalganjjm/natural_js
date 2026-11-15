import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {dir,json,read,sha,normalized,reference} from './stage-metadata.mjs';
const records=read(`${dir}/m516-gates.jsonl`).toString().trim().split('\n').map(JSON.parse);
const failed=records.find(item=>item.label==='focused-chromium');
assert.equal(failed.exit_code,1);
const map=json(failed.before.path),verify=()=>{for(const [file,expected]of Object.entries(map))assert.equal(sha(normalized(read(file))),expected,file);};
verify();
const server=await createServer({configFile:'examples/vite/vite.config.ts',server:{host:'127.0.0.1',port:4173,strictPort:true}});
await server.listen();
let browser;
const results=[];
try {
 browser=await chromium.launch();
 for(const layout of ['side','stack'])for(const settleEmail of [false,true]){
  const page=await browser.newPage();
  try {
   await page.goto(`http://127.0.0.1:4173/m4/${layout}.html`);
   const screen=page.locator('[data-page="employees"]'),detail=screen.locator('[data-role="detail"]');
   await screen.locator('tbody tr').filter({hasText:'Ada'}).locator('[data-select-row]').click();
   const email=detail.locator('[data-field="email"]'),name=detail.locator('[data-field="name"]');
   await email.fill('invalid');
   if(settleEmail)await email.blur();
   await screen.evaluate(root=>{
    const log=[];window.__enteredDiagnostic=log;
    const snapshot=event=>({type:event.type,phase:event.eventPhase,target:event.target instanceof Element?event.target.getAttribute('data-field')??event.target.getAttribute('data-action'):null,name:root.querySelector('[data-role="detail"] [data-field="name"]').value,email:root.querySelector('[data-role="detail"] [data-field="email"]').value});
    for(const type of ['change','focusout','click']){
     root.addEventListener(type,event=>log.push(snapshot(event)),true);
     root.addEventListener(type,event=>log.push(snapshot(event)));
    }
   });
   await name.evaluate(input=>{input.value='Uncommitted candidate';});
   const before=await name.inputValue();
   await screen.locator('[data-action="add-entered"]').click();
   const after=await name.inputValue(),events=await page.evaluate(()=>window.__enteredDiagnostic);
   const click=events.find(event=>event.type==='click'&&event.target==='add-entered'&&event.phase===1);
   assert.equal(before,'Uncommitted candidate');assert(click);
   assert.equal(click.name,settleEmail?'Uncommitted candidate':'Ada');
   assert.equal(after,click.name);assert.equal(await email.inputValue(),'invalid');
   assert.equal(await screen.locator('tbody tr').count(),3);
   results.push({layout,settle_email_before_direct_assignment:settleEmail,before,events,after,click_capture_name:click.name});
  }finally{await page.close();}
 }
}finally{await browser?.close();await server.close();}
verify();
const helper='node_modules/.cache/m516-entered-event-diagnostic.mjs';
const output=`${dir}/m516-entered-event-diagnostic.json`;
const report={kind:'actual_m516_app_native_event_order_diagnostic',helper:reference(helper),failed_attempt:failed.children.at(-1).stdout,unchanged_inputs:failed.before,results,prior_diagnostic:{helper:reference(`${dir}/m516-entered-event-diagnostic-initial.mjs`),exit_code:1,error:"TypeError: Cannot read properties of undefined (reading 'path')",phase:'After all four browser observations and source verification, constructing report failed because the failed aggregate stores stdout on children, not directly. No suite credit or source change.'},conclusion:'With the original focused email, native change dispatch precedes the add-entered click and rewrites the direct sibling before prepare is invoked. Settling that native change before direct assignment preserves the sibling through the same prepare rejection/report/focus path.',scope:'Diagnostic only; no compiler, unit, browser-suite or canonical credit. No source/test/configuration changes. Original failing cases, assertions, reports and traces remain.'};
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(`${dir}/m516-entered-event-diagnostic.mjs`,read(helper),{flag:'wx'});
console.log(JSON.stringify({record:reference(output),results:results.map(({layout,settle_email_before_direct_assignment,before,after})=>({layout,settle_email_before_direct_assignment,before,after}))}));
