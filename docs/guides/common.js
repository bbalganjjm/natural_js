// Common helpers for Natural-JS 2.0 guide demos

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const logBox = () => $('#console');

export function log(...args) {
  const box = logBox();
  if (!box) return;
  const time = new Date().toISOString().split('T')[1].slice(0, 12);
  const line = document.createElement('div');
  line.textContent = `[${time}] ${args.map(String).join(' ')}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

export function clearLog() {
  const box = logBox();
  if (box) box.innerHTML = '';
}

export const mockData = {
  people: [
    { id: 'u01', name: 'Alice', age: 28, email: 'alice@example.com', eyeColor: 'blue', registered: '2023-01-10', isActive: true },
    { id: 'u02', name: 'Bob', age: 34, email: 'bob@example.com', eyeColor: 'green', registered: '2022-11-05', isActive: false },
    { id: 'u03', name: 'Cara', age: 25, email: 'cara@example.com', eyeColor: 'brown', registered: '2023-03-18', isActive: true },
    { id: 'u04', name: 'Dan', age: 30, email: 'dan@example.com', eyeColor: 'blue', registered: '2021-08-22', isActive: true }
  ],
  tree: [
    { id: 'root', parent: null, label: 'Root' },
    { id: 'a', parent: 'root', label: 'Section A' },
    { id: 'b', parent: 'root', label: 'Section B' },
    { id: 'a1', parent: 'a', label: 'Item A-1' },
    { id: 'b1', parent: 'b', label: 'Item B-1' }
  ]
};

export const rules = {
  formatter: {
    email: [['trimToEmpty'], ['lower']],
    registered: [['date', 8, 'date']]
  },
  validator: {
    name: [['required']],
    email: [['required'], ['email']],
    age: [['required'], ['integer']]
  }
};

export function renderList(el, items, mapper) {
  el.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = mapper(item);
    el.appendChild(li);
  });
}

