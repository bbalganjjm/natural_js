# Natural-JS 2.0

[![npm version](https://badge.fury.io/js/@natural-js%2Fnatural.svg)](https://badge.fury.io/js/@natural-js%2Fnatural)
[![License: LGPL v2.1](https://img.shields.io/badge/License-LGPL%20v2.1-blue.svg)](https://www.gnu.org/licenses/lgpl-2.1)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

Natural-JS is a **TypeScript-first UI framework** designed for building enterprise web application user interfaces intuitively, easily, and quickly.

> 🚀 **Version 2.0** - Complete TypeScript rewrite with jQuery removal and SSR support!

## ✨ Highlights

- **100% TypeScript** - Strict mode, full type safety
- **Zero jQuery** - Native DOM API and fetch-based HTTP client
- **SSR Ready** - Server-side rendering support out of the box
- **Modular** - Use only what you need with tree-shaking support
- **Legacy Compatible** - Migration-friendly API wrapper

## 📦 Installation

```bash
# Using npm
npm install @natural-js/natural

# Using pnpm (recommended)
pnpm add @natural-js/natural

# Using yarn
yarn add @natural-js/natural
```

### Individual Packages

```bash
pnpm add @natural-js/core         # Core utilities
pnpm add @natural-js/architecture # CVC architecture
pnpm add @natural-js/data         # Data processing
pnpm add @natural-js/ui           # UI components
pnpm add @natural-js/ui-shell     # Shell components
```

## 🚀 Quick Start

```typescript
import { N } from '@natural-js/natural';

// Controller pattern
N('.myPage').cont({
  init(view, request) {
    // Initialize components
    this.grid = N([]).grid({
      context: N('.grid', view),
      height: 300
    });

    // Fetch and bind data
    N.comm('/api/users').submit((data) => {
      this.grid.bind(data);
    });
  }
});
```

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="@natural-js/natural/css/natural.ui.css">
</head>
<body>
  <article class="myPage">
    <table class="grid">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input id="name" type="text"></td>
          <td><input id="email" type="text"></td>
        </tr>
      </tbody>
    </table>
  </article>

  <script type="module">
    import { N } from '@natural-js/natural';
    // Your code here
  </script>
</body>
</html>
```

## 📚 Documentation

- [Getting Started Guide](docs/DEVELOPER-GUIDE-GETTINGSTARTED.md)
- [API Reference](docs/API-REFERENCE.md)
- [Migration Guide](docs/MIGRATION-GUIDE.md) (from 1.x)
- [TypeScript Guide](docs/DEVELOPER-GUIDE-TYPESCRIPT.md)

## 🏗️ Architecture

Natural-JS implements the **CVC (Communicator-View-Controller)** architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                             │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────┐  ┌──────────────────┐ │
│  │  Communicator │  │   View    │  │    Controller    │ │
│  │   (N.comm)    │  │  (HTML)   │  │    (N.cont)      │ │
│  └───────┬───────┘  └─────┬─────┘  └────────┬─────────┘ │
│          │                │                  │          │
│          └────────────────┼──────────────────┘          │
│                           │                              │
├───────────────────────────┼──────────────────────────────┤
│                       Server (Model)                     │
└───────────────────────────────────────────────────────────┘
```

## 📦 Package Structure

| Package | Description |
|---------|-------------|
| `@natural-js/shared` | Environment detection, DOM abstraction |
| `@natural-js/core` | Core utilities (string, date, array, json, etc.) |
| `@natural-js/architecture` | CVC architecture (Communicator, Controller, Context) |
| `@natural-js/data` | Formatter, Validator, DataSync |
| `@natural-js/ui` | UI Components (Grid, Form, List, Alert, etc.) |
| `@natural-js/ui-shell` | Shell components (Notify, Documents) |
| `@natural-js/template` | Template AOP processing |
| `@natural-js/code` | Code inspection tools |
| `@natural-js/natural` | Unified package with legacy API |

## 🎯 Features

### Core Utilities

```typescript
import { StringUtils, DateUtils, ArrayUtils } from '@natural-js/core';

// String utilities
StringUtils.isEmpty('');           // true
StringUtils.lpad('5', 2, '0');     // '05'

// Date utilities
DateUtils.formatDate(new Date(), 'Y-m-d'); // '2024-12-05'
DateUtils.diff('20240101', '20241205', 'day'); // 339

// Array utilities
ArrayUtils.deduplicate([1, 1, 2, 3]); // [1, 2, 3]
ArrayUtils.groupBy(data, 'category');
```

### HTTP Communication

```typescript
import { N } from '@natural-js/natural';

// Simple request
const data = await N.comm('/api/users').submit();

// With options
N.comm({
  url: '/api/users',
  type: 'POST',
  data: { name: 'John' },
  timeout: 5000
}).submit((response) => {
  console.log(response);
}).error((err) => {
  console.error(err);
});
```

### Data Formatting & Validation

```typescript
import { Formatter, Validator } from '@natural-js/data';

// Format data
const formatter = new Formatter([['commas'], ['date', 8]]);
formatter.format([{ amount: 1000000, date: '20241205' }]);
// [{ amount: '1,000,000', date: '2024-12-05' }]

// Validate data
const validator = new Validator([['required'], ['email']]);
validator.validate([{ email: 'test@email.com' }]);
// { valid: true, errors: [] }
```

### UI Components

```typescript
import { Grid, Form, Alert, Datepicker } from '@natural-js/ui';

// Grid
const grid = N([]).grid({
  context: '#userGrid',
  height: 300,
  resizable: true,
  sortable: true
});
grid.bind(userData);

// Alert
N(window).alert({
  msg: 'Save completed!',
  confirm: true,
  onOk: () => { /* ... */ }
}).show();

// Datepicker
N('#dateInput').datepicker({
  format: 'yyyy-MM-dd'
});
```

## 🌐 SSR Support

Natural-JS 2.0 supports server-side rendering:

```typescript
import { isServer, isBrowser, StringUtils } from '@natural-js/core';

// Environment detection
if (isServer()) {
  // Server-side code
  const processed = StringUtils.trimToEmpty(data);
}

if (isBrowser()) {
  // Client-side code
  document.querySelector('#app');
}
```

See the [SSR Example](examples/ssr/server.ts) for a complete implementation.

## 🔄 Migration from 1.x

Natural-JS 2.0 provides backward compatibility through the legacy API wrapper:

```typescript
// Most 1.x code works without changes
import { N } from '@natural-js/natural';

N('.page').cont({
  init: function(view, request) {
    // Your existing code
  }
});
```

See the [Migration Guide](docs/MIGRATION-GUIDE.md) for detailed instructions.

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/bbalganjjm/natural_js.git
cd natural_js

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint

# Format code
pnpm format
```

## 📁 Project Structure

```
natural-js/
├── packages/
│   ├── shared/        # @natural-js/shared
│   ├── core/          # @natural-js/core
│   ├── architecture/  # @natural-js/architecture
│   ├── data/          # @natural-js/data
│   ├── ui/            # @natural-js/ui
│   ├── ui-shell/      # @natural-js/ui-shell
│   ├── template/      # @natural-js/template
│   ├── code/          # @natural-js/code
│   └── natural/       # @natural-js/natural (unified)
├── css/               # Stylesheets
├── docs/              # Documentation
├── examples/          # Example projects
└── __tests__/         # Integration tests
```

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (ES2020+)

## 📝 License

This software is licensed under the [LGPL v2.1](LICENSE) © Goldman Kim <bbalganjjm@gmail.com>

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## 📧 Contact

- Author: Goldman Kim
- Email: bbalganjjm@gmail.com
- GitHub: [https://github.com/bbalganjjm/natural_js](https://github.com/bbalganjjm/natural_js)
- Documentation: [https://bbalganjjm.github.io/natural_js](https://bbalganjjm.github.io/natural_js)

---

<p align="center">
  Made with ❤️ by the Natural-JS team
</p>
