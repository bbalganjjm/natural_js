import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dir,json,read,sha,normalized,reference} from './stage-metadata.mjs';
const engine=process.argv[2],helper=fileURLToPath(import.meta.url);
if(engine){
 const browsers=await import('@playwright/test'),browser=await browsers[engine].launch();
 try{
  const page=await browser.newPage(),cases=[];
  for(const disabled of [false,true])for(const mode of ['native','canceled','synthetic']){
   await page.setContent('<form><label>Value<input value="1200"></label></form>');
   cases.push(await page.evaluate(({disabled,mode})=>{
    const form=document.querySelector('form'),input=form.querySelector('input');input.disabled=disabled;input.value='2500';
    const events=[];form.addEventListener('reset',event=>{events.push({trusted:event.isTrusted,value:input.value});if(mode==='canceled')event.preventDefault();});
    if(mode==='synthetic')form.dispatchEvent(new Event('reset',{bubbles:true,cancelable:true}));else form.reset();
    return {disabled,mode,events,value:input.value,defaultValue:input.defaultValue};
   },{disabled,mode}));
  }
  for(const item of cases){assert.equal(item.events.length,1);assert.equal(item.events[0].value,'2500');if(item.mode==='canceled')assert.equal(item.value,'2500');if(item.mode==='native')assert.equal(item.value,'1200');}
  process.stdout.write(JSON.stringify({engine,cases}));
 }finally{await browser.close();}
}else{
 const records=read(`${dir}/m516-gates.jsonl`).toString().trim().split('\n').map(JSON.parse),failed=records.findLast(item=>item.label==='focused-firefox');assert.equal(failed.exit_code,1);
 const map=json(failed.before.path),verify=()=>{for(const [file,expected]of Object.entries(map))assert.equal(sha(normalized(read(file))),expected,file);};verify();
 const results=[];
 for(const name of ['chromium','firefox','webkit']){
  const env={...process.env};if(name==='firefox')env.PLAYWRIGHT_BROWSERS_PATH=path.resolve('node_modules/.cache/playwright-m6');else delete env.PLAYWRIGHT_BROWSERS_PATH;
  results.push(JSON.parse(execFileSync(process.execPath,[helper,name],{env,windowsHide:true,encoding:'utf8',maxBuffer:1024*1024})));
 }
 verify();
 const output=`${dir}/m516-native-reset-diagnostic.json`,report={kind:'bare_native_form_reset_control_diagnostic',helper:reference('node_modules/.cache/m516-native-reset-diagnostic.mjs'),failed_attempt:failed.children.at(-1).stdout,unchanged_inputs:failed.before,results,
  scope:'Native form/input only, including disabled inputs. No Natural-JS or Vite imports; engines execute serially. No compiler/unit/browser-suite/canonical credit or source/test/configuration changes. Native trusted/canceled behavior and synthetic event default action are observed separately.'};
 fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});fs.writeFileSync(`${dir}/m516-native-reset-diagnostic.mjs`,read(helper),{flag:'wx'});
 console.log(JSON.stringify({record:reference(output),results}));
}
