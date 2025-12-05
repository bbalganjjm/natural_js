/**
 * @natural-js/ui
 *
 * Natural-JS UI package.
 * Provides UI components and utilities.
 */

// UI utilities
export * from './utils';
export { utils, draggable, scroll, iteration } from './utils';

// Alert component
export * from './components/alert';
export { Alert, createAlert } from './components/alert';

// Button component
export * from './components/button';
export { Button, createButton } from './components/button';

// Datepicker component
export * from './components/datepicker';
export { Datepicker, createDatepicker } from './components/datepicker';

// Popup component
export * from './components/popup';
export { Popup, createPopup } from './components/popup';

// Tab component
export * from './components/tab';
export { Tab, createTab } from './components/tab';

// Form component
export * from './components/form';
export { Form, createForm } from './components/form';

// Select component
export * from './components/select';
export { Select, createSelect } from './components/select';

// List component
export * from './components/list';
export { List, createList } from './components/list';

// Grid component
export * from './components/grid';
export { Grid, createGrid } from './components/grid';

// Pagination component
export * from './components/pagination';
export { Pagination, createPagination } from './components/pagination';

// Tree component
export * from './components/tree';
export { Tree, createTree } from './components/tree';

// Version
export const UI_VERSION = '2.0.0-alpha.0';
