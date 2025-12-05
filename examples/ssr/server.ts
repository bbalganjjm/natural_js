/**
 * Natural-JS 2.0 SSR Example
 * 
 * Node.js 환경에서 Natural-JS를 사용하는 예제입니다.
 * 서버 사이드에서 데이터를 처리하고 클라이언트에서 하이드레이션합니다.
 * 
 * 실행 방법:
 * 1. pnpm build (프로젝트 빌드)
 * 2. npx tsx examples/ssr/server.ts
 * 3. http://localhost:3000 접속
 */

import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Natural-JS Core utilities (SSR 호환)
import {
  isServer,
  isBrowser,
  StringUtils,
  DateUtils,
  ArrayUtils,
  JsonUtils,
  TypeUtils
} from '../../packages/core/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample data
const USERS = [
  { id: 1, name: '홍길동', email: 'hong@example.com', createdAt: '20240101' },
  { id: 2, name: '김영희', email: 'kim@example.com', createdAt: '20240115' },
  { id: 3, name: '이철수', email: 'lee@example.com', createdAt: '20240201' },
  { id: 4, name: '박지민', email: 'park@example.com', createdAt: '20240301' },
  { id: 5, name: '최수진', email: 'choi@example.com', createdAt: '20240315' }
];

// Server-side data processing using Natural-JS utilities
function processUsers(users: typeof USERS, searchName?: string) {
  let result = [...users];
  
  // Filter by name (using StringUtils)
  if (searchName && !StringUtils.isEmpty(searchName)) {
    result = result.filter(user => 
      StringUtils.contains(user.name.toLowerCase(), searchName.toLowerCase())
    );
  }
  
  // Format dates (using DateUtils)
  result = result.map(user => ({
    ...user,
    formattedDate: formatDate(user.createdAt)
  }));
  
  // Remove duplicates if any (using ArrayUtils)
  result = ArrayUtils.deduplicate(result, 'id');
  
  return result;
}

function formatDate(dateStr: string): string {
  const date = DateUtils.strToDate(dateStr);
  if (date) {
    return DateUtils.formatDate(date, 'Y년 m월 d일');
  }
  return dateStr;
}

// Generate HTML page
function generateHTML(users: ReturnType<typeof processUsers>, searchName: string = '') {
  const usersJson = JsonUtils.stringify(users);
  
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Natural-JS 2.0 SSR Example</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin-top: 0;
      color: #333;
    }
    .info {
      background: #e3f2fd;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .search-form {
      margin-bottom: 20px;
      display: flex;
      gap: 8px;
    }
    .search-form input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .search-form button {
      padding: 10px 20px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .search-form button:hover {
      background: #1565c0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    tr:hover td {
      background: #f9f9f9;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: #e8f5e9;
      color: #2e7d32;
    }
    .hydrated {
      animation: pulse 0.5s ease;
    }
    @keyframes pulse {
      0% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    #status {
      padding: 8px 12px;
      background: #fff3e0;
      border-radius: 4px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    #status.hydrated {
      background: #e8f5e9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Natural-JS 2.0 SSR Example</h1>
    
    <div class="info">
      <strong>서버 사이드 렌더링:</strong> 이 페이지는 Node.js 서버에서 Natural-JS 유틸리티를 사용하여 데이터를 처리한 후 렌더링되었습니다.
      <br><br>
      <strong>환경 감지:</strong> isServer() = <code>${isServer()}</code>, isBrowser() = <code>${isBrowser()}</code>
    </div>
    
    <div id="status">
      🔄 클라이언트 JavaScript 로딩 중... (하이드레이션 대기)
    </div>
    
    <form class="search-form" method="get" action="/">
      <input type="text" name="name" placeholder="이름 검색" value="${searchName}">
      <button type="submit">검색</button>
    </form>
    
    <table id="userTable">
      <thead>
        <tr>
          <th>ID</th>
          <th>이름</th>
          <th>이메일</th>
          <th>등록일</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
        <tr data-id="${user.id}">
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td><span class="badge">${user.formattedDate}</span></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <p style="color: #666; font-size: 13px; margin-top: 20px;">
      총 ${users.length}명의 사용자
    </p>
  </div>
  
  <!-- 서버에서 처리된 데이터를 클라이언트에 전달 -->
  <script>
    window.__SSR_DATA__ = ${usersJson};
  </script>
  
  <!-- 클라이언트 하이드레이션 -->
  <script type="module">
    // 클라이언트에서 Natural-JS 로드
    // import { N, isServer, isBrowser } from '@natural-js/natural';
    
    // 하이드레이션 완료 표시
    document.addEventListener('DOMContentLoaded', () => {
      const statusEl = document.getElementById('status');
      
      // 환경 감지 (클라이언트)
      const isClientBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
      
      statusEl.textContent = '✅ 클라이언트 하이드레이션 완료! (isBrowser = ' + isClientBrowser + ')';
      statusEl.classList.add('hydrated');
      
      // 테이블 행 클릭 이벤트 추가 (클라이언트 전용)
      const table = document.getElementById('userTable');
      table.classList.add('hydrated');
      
      table.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (row && row.dataset.id) {
          alert('사용자 ID ' + row.dataset.id + ' 선택됨');
        }
      });
      
      // SSR 데이터 확인
      console.log('SSR Data:', window.__SSR_DATA__);
    });
  </script>
</body>
</html>`;
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  
  // Parse search query
  const searchName = url.searchParams.get('name') || '';
  
  // Process data on server using Natural-JS utilities
  console.log(`[${new Date().toISOString()}] Processing request with searchName: "${searchName}"`);
  console.log(`  - isServer(): ${isServer()}`);
  console.log(`  - isBrowser(): ${isBrowser()}`);
  
  const processedUsers = processUsers(USERS, searchName);
  
  console.log(`  - Processed ${processedUsers.length} users`);
  
  // Generate HTML
  const html = generateHTML(processedUsers, searchName);
  
  // Send response
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 Natural-JS 2.0 SSR Example Server                       ║
║                                                              ║
║   Server running at http://localhost:${PORT}                   ║
║                                                              ║
║   Natural-JS utilities available on server:                  ║
║   - StringUtils (contains, isEmpty, etc.)                    ║
║   - DateUtils (formatDate, strToDate, etc.)                  ║
║   - ArrayUtils (deduplicate, etc.)                           ║
║   - JsonUtils (stringify, parse, etc.)                       ║
║   - TypeUtils (isString, isArray, etc.)                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
});

