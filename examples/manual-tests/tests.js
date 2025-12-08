import { runGuide, resolveGuideId } from './harness.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const testsByGuide = {
  'DEVELOPER-GUIDE-CORE': [
    {
      title: 'NaturalElement dataset 파싱',
      desc: 'dataset으로 opts/rules 파싱 확인',
      run: ({ modules, sandbox }) => {
        const { NaturalElement } = modules.core;
        const div = document.createElement('div');
        div.dataset.opts = '{"color":"primary"}';
        sandbox.appendChild(div);
        const ne = new NaturalElement(div);
        if (!ne.data('opts').color) {
          throw new Error('opts color 누락');
        }
      },
    },
  ],
  'DEVELOPER-GUIDE-CONFIG': [
    {
      title: 'defineConfig/getConfig',
      desc: 'ui.alert 설정 병합 확인',
      run: ({ modules }) => {
        const { defineConfig, getConfig } = modules.core;
        defineConfig({ ui: { alert: { draggable: true } } });
        const cfg = getConfig();
        if (!cfg.ui?.alert?.draggable) throw new Error('draggable 미반영');
      },
    },
  ],
  'DEVELOPER-GUIDE-ARCHITECTURE': [
    {
      title: 'createHttpClient 기본 요청',
      desc: 'GET 호출 인스턴스 생성',
      run: ({ modules }) => {
        const { createHttpClient } = modules.architecture;
        const client = createHttpClient({ baseURL: 'https://example.com' });
        if (!client) throw new Error('클라이언트 생성 실패');
      },
    },
  ],
  'DEVELOPER-GUIDE-DATA': [
    {
      title: 'Formatter commas',
      desc: '숫자 콤마 포맷',
      run: ({ modules }) => {
        const { Formatter } = modules.data;
        const res = Formatter.commas('1234567');
        if (res !== '1,234,567') throw new Error(res);
      },
    },
    {
      title: 'Validator email',
      desc: '이메일 규칙',
      run: ({ modules }) => {
        const { Validator } = modules.data;
        if (!Validator.email('a@b.com')) throw new Error('email 실패');
        if (Validator.email('abc')) throw new Error('부적합 통과');
      },
    },
  ],
  'DEVELOPER-GUIDE-UI': [
    {
      title: 'UI 패키지 로드 확인',
      desc: 'Alert/Button 클래스 존재',
      run: ({ modules }) => {
        const { Alert, Button } = modules.ui;
        if (!Alert || !Button) throw new Error('ui export 누락');
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Button': [
    {
      title: 'Button data-opts 적용',
      desc: 'size/color/type/disable',
      run: ({ modules, sandbox }) => {
        const { Button } = modules.ui;
        const btn = document.createElement('button');
        btn.textContent = 'button';
        btn.dataset.opts = '{"size":"small","color":"primary","type":"filled","disable":true}';
        sandbox.appendChild(btn);
        const inst = new Button({ context: btn });
        if (!btn.className.includes('btn_primary')) throw new Error('color 적용 안됨');
        if (!btn.disabled) throw new Error('disable 적용 안됨');
        inst.destroy();
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Alert': [
    {
      title: 'Alert 모달 표시/닫기',
      desc: 'confirm 버튼 클릭 시 onOk 호출',
      run: async ({ modules }) => {
        const { Alert } = modules.ui;
        let okCalled = false;
        const alert = new Alert({
          context: window,
          msg: '테스트',
          confirm: true,
          onOk: () => {
            okCalled = true;
          },
        });
        alert.show();
        const ok = document.querySelector('.btn_common__.primary__');
        if (!ok) throw new Error('OK 버튼 없음');
        ok.click();
        await sleep(10);
        if (!okCalled) throw new Error('onOk 미호출');
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Select': [
    {
      title: 'Select 바인딩',
      desc: '옵션 데이터 바인딩 후 값 설정',
      run: ({ modules, sandbox }) => {
        const { Select } = modules.ui;
        const select = document.createElement('select');
        sandbox.appendChild(select);
        const inst = new Select({
          context: select,
          data: [
            { key: 'a', val: 'Alpha' },
            { key: 'b', val: 'Beta' },
          ],
        });
        inst.bind();
        inst.val('b');
        if (select.value !== 'b') throw new Error('값 설정 실패');
        inst.destroy();
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Datepicker': [
    {
      title: 'Datepicker 표시/선택',
      desc: 'monthonly 옵션',
      run: ({ modules, sandbox }) => {
        const { Datepicker } = modules.ui;
        const input = document.createElement('input');
        sandbox.appendChild(input);
        const inst = new Datepicker(input, { monthonly: true });
        inst.show();
        inst.hide();
        inst.destroy();
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Form': [
    {
      title: 'Form bind/validate',
      desc: 'data-validate required',
      run: ({ modules, sandbox }) => {
        const { Form } = modules.ui;
        const formEl = document.createElement('form');
        formEl.innerHTML = `<input id="name" data-validate='[["required"]]'>`;
        sandbox.appendChild(formEl);
        const inst = new Form({
          context: formEl,
          data: [{ name: '' }],
          row: 0,
        }).bind();
        const ok = inst.validate();
        if (ok) throw new Error('required 통과됨');
        inst.unbind();
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Grid': [
    {
      title: 'Grid bind/sort',
      desc: 'data-sort 헤더 클릭',
      run: ({ modules, sandbox }) => {
        const { Grid } = modules.ui;
        const table = document.createElement('table');
        table.innerHTML = `
          <thead><tr><th data-sort="age">Age</th></tr></thead>
          <tbody><tr><td id="age"></td></tr></tbody>`;
        sandbox.appendChild(table);
        const inst = new Grid({
          context: table,
          data: [{ age: 2 }, { age: 1 }],
          sortable: true,
        }).bind();
        const th = table.querySelector('th');
        th.click();
        inst.destroy();
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-List': [
    {
      title: 'List bind/select',
      desc: '단일 선택',
      run: ({ modules, sandbox }) => {
        const { List } = modules.ui;
        const ul = document.createElement('ul');
        ul.innerHTML = `<li><span id="name"></span></li>`;
        sandbox.appendChild(ul);
        const inst = new List({
          context: ul,
          data: [{ name: 'A' }],
          select: true,
        }).bind();
        inst.select(0);
        inst.destroy();
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Pagination': [
    {
      title: 'Pagination onChange',
      desc: '페이지 변경 이벤트',
      run: ({ modules, sandbox }) => {
        const { Pagination } = modules.ui;
        const div = document.createElement('div');
        div.innerHTML = `<ul><li><a href="#">first</a></li><li><a href="#">prev</a></li></ul><ul><li><a href="#"><span>1</span></a></li></ul><ul><li><a href="#">next</a></li><li><a href="#">last</a></li></ul>`;
        sandbox.appendChild(div);
        let called = false;
        const inst = new Pagination({
          context: div,
          totalCount: 30,
          onChange: () => {
            called = true;
          },
        }).bind();
        const next = div.querySelector('ul:last-child a');
        next.click();
        if (!called) throw new Error('onChange 미호출');
        inst.destroy();
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Tab': [
    {
      title: 'Tab data-opts active',
      desc: '선언형 활성 탭',
      run: ({ modules, sandbox }) => {
        const { Tab } = modules.ui;
        const ul = document.createElement('ul');
        ul.innerHTML = `
          <li data-opts='{"active": true}'>Tab1</li>
          <li>Tab2</li>
        `;
        sandbox.appendChild(ul);
        const inst = new Tab({ context: ul });
        if (inst.getIndex() !== 0) throw new Error('활성 탭 실패');
        inst.destroy();
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Popup': [
    {
      title: 'Popup open/close',
      desc: 'onClose 데이터 전달',
      run: async ({ modules }) => {
        const { Popup } = modules.ui;
        let received = null;
        const popup = new Popup({
          context: document.createElement('div'),
          title: 'popup',
          onClose: (data) => {
            received = data;
          },
        });
        popup.open();
        popup.close({ ok: true });
        await sleep(10);
        if (!received || !received.ok) throw new Error('onClose 데이터 누락');
      },
    },
  ],
  'DEVELOPER-GUIDE-UI-Tree': [
    {
      title: 'Tree bind',
      desc: '간단한 데이터 바인딩',
      run: ({ modules, sandbox }) => {
        const { Tree } = modules.ui;
        const ul = document.createElement('ul');
        sandbox.appendChild(ul);
        const inst = new Tree({
          context: ul,
          data: [{ id: '1', text: 'Root', children: [{ id: '1-1', text: 'Child' }] }],
        }).bind();
        if (!ul.querySelector('li')) throw new Error('노드 없음');
        inst.destroy();
      },
    },
  ],
  'DEVELOPER-GUIDE-UI.Shell-Documents': [
    {
      title: 'Docs 인스턴스 생성',
      desc: '기본 옵션으로 bind',
      run: ({ modules, sandbox }) => {
        const { Docs } = modules.uiShell;
        const div = document.createElement('div');
        sandbox.appendChild(div);
        const inst = new Docs({ context: div });
        if (!inst) throw new Error('Docs 생성 실패');
      },
    },
  ],
  'DEVELOPER-GUIDE-UI.Shell-Notify': [
    {
      title: 'Notify 생성',
      desc: '기본 알림 push',
      run: ({ modules }) => {
        const { Notify } = modules.uiShell;
        const inst = new Notify({ context: window });
        inst.add({ message: '테스트', type: 'info' });
      },
    },
  ],
};

const guideId = resolveGuideId();
runGuide(guideId, testsByGuide[guideId] || [
  {
    title: '준비된 테스트가 없습니다',
    desc: 'guideId에 매핑된 테스트를 추가하세요.',
    run: () => {},
  },
]);

