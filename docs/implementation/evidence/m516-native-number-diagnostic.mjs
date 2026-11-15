import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {json,read,sha,normalized,reference,verifyRef} from './stage-metadata.mjs';
const engine=process.argv[2],helper=fileURLToPath(import.meta.url);
if(engine){
 const browsers=await import('@playwright/test'),browser=await browsers[engine].launch();
 try{
  const page=await browser.newPage();await page.setContent('<label>Optional number <input type="number" aria-label="Optional number"></label>');
  const input=page.getByRole('spinbutton'),cases=[];
  for(const typed of ['e','-','.']){
   await input.fill('');await input.pressSequentially(typed);
   cases.push(await input.evaluate((element,typed)=>{
    const native={value:element.value,badInput:element.validity.badInput,willValidate:element.willValidate,valid:element.checkValidity()};
    const probe=element.cloneNode(true);probe.value=String(Number(element.value));
    return {typed,native,parsed:Number(element.value),probe:{value:probe.value,badInput:probe.validity.badInput,valid:probe.checkValidity()}};
   },typed));
  }
  process.stdout.write(JSON.stringify({engine,cases}));
 }finally{await browser.close();}
}else{
 const parentPath='docs/implementation/evidence/m515-runtime-receipt.json',parent=json(parentPath);verifyRef(parent.inputs);
 const map=json(parent.inputs.path),verify=()=>{for(const [file,expected]of Object.entries(map))assert.equal(sha(normalized(read(file))),expected,file);};verify();
 const results=[];
 for(const name of ['chromium','firefox','webkit']){
  const env={...process.env};if(name==='firefox')env.PLAYWRIGHT_BROWSERS_PATH=path.resolve('node_modules/.cache/playwright-m6');else delete env.PLAYWRIGHT_BROWSERS_PATH;
  results.push(JSON.parse(execFileSync(process.execPath,[helper,name],{env,windowsHide:true,encoding:'utf8',maxBuffer:1024*1024})));
 }
 verify();
 const record={kind:'native_number_editing_diagnostic',helper:reference('node_modules/.cache/m516-native-number-diagnostic.mjs'),unchanged_parent:reference(parentPath),source_inputs:parent.inputs,results,
  observed_detached_probe_loss:results.some(result=>result.cases.some(item=>item.native.badInput&&!item.native.valid&&item.probe.valid)),
  scope:'Only native optional number controls, keyboard input and detached native probes execute. No Natural-JS module is imported; no compiler/unit/framework browser-suite/canonical credit and no source/test/configuration changes.'};
 const output='docs/implementation/evidence/m516-native-number-diagnostic.json';fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n',{flag:'wx'});fs.writeFileSync('docs/implementation/evidence/m516-native-number-diagnostic.mjs',read(helper),{flag:'wx'});
 console.log(JSON.stringify({record:reference(output),results,observed_detached_probe_loss:record.observed_detached_probe_loss}));
}
