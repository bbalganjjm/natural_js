// Run with the example server on port 4173; redirect stdout to an evidence JSON file.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const sourceFiles=['src/ui/grid.ts','src/ui/grid-columns.ts','src/ui/dom-state.ts','src/ui/index.ts'];
const fingerprint=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sources=Object.fromEntries(sourceFiles.map(file=>[file,fingerprint(file)]));
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage();
  await page.route('**/column-measure',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><head><title>Column measurement</title></head><body></body></html>'}));
  await page.goto('http://127.0.0.1:4173/column-measure');
  const modules={grid:`/@fs/${path.resolve('src/ui/grid.ts').replaceAll('\\','/')}`,data:`/@fs/${path.resolve('src/data/index.ts').replaceAll('\\','/')}`};
  const samples=await page.evaluate(async modules=>{
    const {bindGrid}=await import(modules.grid),{createRows}=await import(modules.data);
    const results=[];
    for(const count of [100,1000]) {
      const runs=[];
      for(let run=0;run<7;run++) {
        const keys=Array.from({length:10},(_,i)=>`field${i}`);
        const table=document.createElement('table');
        table.style.cssText='table-layout:fixed;width:1200px';
        table.innerHTML='<thead><tr>'+keys.map(key=>`<th scope="col" data-column="${key}">${key}</th>`).join('')+'</tr></thead><tbody><tr data-row-template>'+keys.map(key=>`<td data-column="${key}" data-field="${key}"></td>`).join('')+'</tr></tbody>';
        document.body.append(table);
        const rows=createRows(Array.from({length:count},(_,i)=>Object.fromEntries(keys.map(key=>[key,`${key}-${i}`]))));
        let notifications=0;const unsubscribe=rows.subscribe(()=>notifications++);
        const times={};
        let start=performance.now();const grid=bindGrid(table,{rows,columns:keys.map(key=>({key,width:120}))});times.initial=performance.now()-start;
        start=performance.now();grid.setColumns([...grid.columns()].reverse());times.reorder=performance.now()-start;
        start=performance.now();grid.setColumns(grid.columns().map(column=>({...column,hidden:column.key==='field5'})));times.hide=performance.now()-start;
        start=performance.now();grid.setColumns(grid.columns().map(column=>column.key==='field0'?{...column,width:160}:column));times.width=performance.now()-start;
        const connectedRows=table.tBodies[0].rows.length;
        const duplicateIds=document.querySelectorAll('[id]').length;
        if(notifications!==0||connectedRows!==count||duplicateIds!==0)throw Error('Column workload invariant failed');
        unsubscribe();grid.dispose();rows.dispose();table.remove();
        if(run>=2)runs.push(times);
      }
      const median=key=>{const values=runs.map(run=>run[key]).sort((a,b)=>a-b);return values[Math.floor(values.length/2)];};
      results.push({rows:count,fields:10,runs,median_ms:Object.fromEntries(['initial','reorder','hide','width'].map(key=>[key,median(key)])),rows_notifications:0,duplicate_ids:0});
    }
    return results;
  },modules);
  if(sourceFiles.some(file=>fingerprint(file)!==sources[file]))throw Error('Source changed during measurement; discard this result.');
  const result={date:new Date().toISOString(),browser:browser.version(),platform:os.platform(),cpu:os.cpus()[0].model,warmup:2,runs:5,sources_sha256:sources,method:'Same host, 10 flat native columns, full 100/1000 rendered rows; operation elapsed time includes incidental native geometry reads, no extra forced paint or layout fence; preferred widths 120px; reverse/hide/resize one field; no Rows changes. Fresh owned table/store per sample. No universal speed claim or final virtualization benchmark.',samples};
  process.stdout.write(JSON.stringify(result)+'\n');
} finally {await browser.close();}
