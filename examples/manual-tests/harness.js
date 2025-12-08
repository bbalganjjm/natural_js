const GUIDE_LABELS = {
  'DEVELOPER-GUIDE-ARCHITECTURE': 'Architecture',
  'DEVELOPER-GUIDE-CONFIG': 'Config',
  'DEVELOPER-GUIDE-CORE': 'Core',
  'DEVELOPER-GUIDE-DATA': 'Data',
  'DEVELOPER-GUIDE-EXAMPLES': 'Examples',
  'DEVELOPER-GUIDE-GETTINGSTARTED': 'Getting Started',
  'DEVELOPER-GUIDE-TEMPLATE-EXAMPLES': 'Template Examples',
  'DEVELOPER-GUIDE-TEMPLATE': 'Template',
  'DEVELOPER-GUIDE-TYPESCRIPT': 'TypeScript',
  'DEVELOPER-GUIDE-UI-Alert': 'UI Alert',
  'DEVELOPER-GUIDE-UI-Button': 'UI Button',
  'DEVELOPER-GUIDE-UI-Datepicker': 'UI Datepicker',
  'DEVELOPER-GUIDE-UI-Form': 'UI Form',
  'DEVELOPER-GUIDE-UI-Grid': 'UI Grid',
  'DEVELOPER-GUIDE-UI-List': 'UI List',
  'DEVELOPER-GUIDE-UI-Pagination': 'UI Pagination',
  'DEVELOPER-GUIDE-UI-Popup': 'UI Popup',
  'DEVELOPER-GUIDE-UI-Select': 'UI Select',
  'DEVELOPER-GUIDE-UI-Tab': 'UI Tab',
  'DEVELOPER-GUIDE-UI-Tree': 'UI Tree',
  'DEVELOPER-GUIDE-UI': 'UI Overview',
  'DEVELOPER-GUIDE-UI.Shell-Documents': 'UI Shell - Documents',
  'DEVELOPER-GUIDE-UI.Shell-Notify': 'UI Shell - Notify',
};

let cachedModules;

async function loadModules() {
  if (cachedModules) return cachedModules;
  const core = await import('@natural-js/core');
  const data = await import('@natural-js/data');
  const ui = await import('@natural-js/ui');
  const architecture = await import('@natural-js/architecture');
  const uiShell = await import('../../packages/ui-shell/dist/index.js');
  cachedModules = { core, data, ui, architecture, uiShell };
  return cachedModules;
}

function createLayout(guideId) {
  const container = document.getElementById('app');
  container.innerHTML = '';

  const h1 = document.createElement('h1');
  h1.textContent = `Natural-JS Manual Test — ${GUIDE_LABELS[guideId] || guideId}`;
  container.appendChild(h1);

  const actionBar = document.createElement('div');
  actionBar.className = 'action-bar';
  const runAll = document.createElement('button');
  runAll.id = 'run-all';
  runAll.textContent = '전체 테스트 실행';
  actionBar.appendChild(runAll);
  container.appendChild(actionBar);

  const summary = document.createElement('div');
  summary.id = 'summary';
  summary.innerHTML = `
    <div class="chip">전체: <span id="total-count">0</span></div>
    <div class="chip pass">통과: <span id="pass-count">0</span></div>
    <div class="chip fail">실패: <span id="fail-count">0</span></div>
  `;
  container.appendChild(summary);

  const sandbox = document.createElement('div');
  sandbox.id = 'sandbox';
  container.appendChild(sandbox);

  const testsWrap = document.createElement('div');
  testsWrap.id = 'tests';
  container.appendChild(testsWrap);

  return { runAll, sandbox, testsWrap };
}

function renderTestItem(testsWrap, test) {
  const item = document.createElement('div');
  item.className = 'test-item';
  const title = document.createElement('div');
  title.className = 'test-title';
  title.textContent = test.title;
  item.appendChild(title);

  const desc = document.createElement('div');
  desc.className = 'test-desc';
  desc.textContent = test.desc || '';
  item.appendChild(desc);

  const btn = document.createElement('button');
  btn.textContent = '실행';
  btn.className = 'secondary';

  const status = document.createElement('span');
  status.className = 'status pending';
  status.textContent = '대기';

  item.appendChild(btn);
  item.appendChild(status);

  testsWrap.appendChild(item);

  return { btn, status, item };
}

function updateSummary(result, delta) {
  const totalEl = document.getElementById('total-count');
  const passEl = document.getElementById('pass-count');
  const failEl = document.getElementById('fail-count');
  result.total += delta.total;
  result.pass += delta.pass;
  result.fail += delta.fail;
  totalEl.textContent = String(result.total);
  passEl.textContent = String(result.pass);
  failEl.textContent = String(result.fail);
}

async function runSingleTest(test, modules, sandbox, statusEl) {
  sandbox.innerHTML = '';
  statusEl.className = 'status running';
  statusEl.textContent = '실행 중...';
  try {
    const log = [];
    const logger = (msg) => log.push(msg);
    const ctx = { modules, sandbox, log: logger, document };
    const maybePromise = test.run(ctx);
    if (maybePromise && typeof maybePromise.then === 'function') {
      await maybePromise;
    }
    statusEl.className = 'status pass';
    statusEl.textContent = '통과';
    return { pass: 1, fail: 0, total: 1, log };
  } catch (e) {
    console.error(e);
    statusEl.className = 'status fail';
    statusEl.textContent = '실패';
    statusEl.title = e.message;
    return { pass: 0, fail: 1, total: 1 };
  }
}

export async function runGuide(guideId, tests) {
  const { runAll, sandbox, testsWrap } = createLayout(guideId);
  const modules = await loadModules();
  const summary = { total: 0, pass: 0, fail: 0 };

  const runners = tests.map((test) => {
    const ui = renderTestItem(testsWrap, test);
    const handler = async () => {
      const delta = await runSingleTest(test, modules, sandbox, ui.status);
      updateSummary(summary, delta);
    };
    ui.btn.addEventListener('click', handler);
    return handler;
  });

  runAll.addEventListener('click', async () => {
    summary.total = 0;
    summary.pass = 0;
    summary.fail = 0;
    updateSummary(summary, { total: 0, pass: 0, fail: 0 });
    for (const runner of runners) {
      await runner();
    }
  });
}

export function resolveGuideId() {
  const url = new URL(window.location.href);
  return window.__guideId || url.searchParams.get('guide');
}

