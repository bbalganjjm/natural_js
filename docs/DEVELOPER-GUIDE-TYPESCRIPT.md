# Natural-JS TypeScript Developer Guide

Natural-JS provides type declaration files (.d.ts) to support TypeScript development. This guide explains in detail how to use Natural-JS in a TypeScript environment.

## Table of Contents

- [Natural-JS TypeScript Developer Guide](#natural-js-typescript-developer-guide)
  - [Table of Contents](#table-of-contents)
  - [TypeScript Configuration](#typescript-configuration)
    - [1. tsconfig.json Example](#1-tsconfigjson-example)
    - [2. Type Declaration File Structure](#2-type-declaration-file-structure)
  - [Basic Usage](#basic-usage)
    - [Using the Controller Object](#using-the-controller-object)
    - [Using Communicator](#using-communicator)
    - [Using UI Components](#using-ui-components)
  - [TypeScript Usage by Component](#typescript-usage-by-component)
    - [Controller (N.cont)](#controller-ncont)
    - [Communicator (N.comm)](#communicator-ncomm)
    - [UI Components](#ui-components)
  - [Advanced Usage](#advanced-usage)
    - [Type Extension](#type-extension)
    - [Using Generics](#using-generics)
  - [Known Limitations](#known-limitations)
  - [FAQ](#faq)
    - [Q: How should I define the type for a Controller object?](#q-how-should-i-define-the-type-for-a-controller-object)
    - [Q: How should I handle types related to data binding?](#q-how-should-i-handle-types-related-to-data-binding)
    - [Q: What if I can't find a specific type in the type declaration files?](#q-what-if-i-cant-find-a-specific-type-in-the-type-declaration-files)

## TypeScript Configuration

To use Natural-JS with TypeScript, specify the path to the type declaration files in your `tsconfig.json` file.

### 1. tsconfig.json Example

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["js/natural_js/@types"]
  }
}
```

### 2. Type Declaration File Structure

Natural-JS type declaration files are located at:

- `js/natural_js/@types/index.d.ts`: Main type declaration file
- `js/natural_js/@types/natural.js.d.ts`: Core Natural-JS types
- `js/natural_js/@types/natural.core.d.ts`: Natural-CORE related types
- `js/natural_js/@types/natural.architecture.d.ts`: Natural-ARCHITECTURE related types
- `js/natural_js/@types/natural.data.d.ts`: Natural-DATA related types
- `js/natural_js/@types/natural.ui.d.ts`: Natural-UI related types
- Other component-specific type files

## Basic Usage

This section describes the basic usage of Natural-JS with TypeScript.

### Using the Controller Object

```typescript
// Controller declaration
const cont = N(".page-id").cont({
  init: (view: JQuery, request: NC.Request): void => {
    // Initialization code
  },
  loadData: (): void => {
    // Data loading function
  },
  // Typed variable declarations
  counter: 0 as number,
  userData: {} as NC.JSONObject
});
```

### Using Communicator

```typescript
// Typed communication function
const fetchUserData = (userId: string): JQueryPromise<NC.JSONObject> => {
  return N.comm({
    url: "user/detail",
    data: {
      userId: userId
    }
  }).submit();
};

// Typed response handling
fetchUserData("user123").done((data: NC.JSONObject) => {
  console.log(`User name: ${data.name}`);
});
```

### Using UI Components

```typescript
// Grid component initialization
const grid = N([] as NC.JSONObject[]).grid({
  context: "#userGrid",
  height: 400,
  select: true,
  sortable: true
}) as NC.Grid;

// Get typed grid data
const gridData: NC.JSONObject[] = grid.getData();

// Form component initialization
const form = N({} as NC.JSONObject).form({
  context: "#userForm",
  validate: true
}) as NC.Form;

// Set typed form values
form.val({
  name: "Hong Gil-dong",
  age: 30,
  email: "hong@example.com"
} as NC.JSONObject);
```

## TypeScript Usage by Component

### Controller (N.cont)

A complete example of writing a Controller object in TypeScript:

```typescript
interface UserData {
  id: string;
  name: string;
  age: number;
  email: string;
}

// Controller using a custom interface
const userController = N(".user-page").cont({
  // Component property definitions (Natural-TEMPLATE style)
  "p.grid.userList": {
    height: 400,
    select: true,
    sortable: true
  } as NC.GridOptions,

  "p.form.userDetail": {
    validate: true
  } as NC.FormOptions,

  "c.getUserList": {
    url: "user/list",
    cache: false
  } as NC.CommOptions,

  // Initialization function
  init: (view: JQuery, request: NC.Request): void => {
    // Bind data to grid
    userController.loadUserList();
    // Bind events
    userController.bindEvents();
  },

  // Load user list function
  loadUserList: function (): void {
    const self = this;
    N.comm(this["c.getUserList"]).submit().done((data: UserData[]) => {
      const grid = self["p.grid.userList"] as NC.Grid;
      grid.bind(data);
    });
  },

  // Bind events function
  bindEvents: function (): void {
    const self = this;
    const grid = this["p.grid.userList"] as NC.Grid;
    const form = this["p.form.userDetail"] as NC.Form;

    // Grid row select event
    grid.setOption({
      onSelect: (rowIdx: number, rowEle: JQuery, rowData: UserData): void => {
        form.val(rowData);
      }
    });

    // Save button click event
    N("#saveBtn", this.view).on("click", () => {
      if (form.validate()) {
        const userData: UserData = form.val() as UserData;
        self.saveUserData(userData);
      }
    });
  },

  // Save user data function
  saveUserData: function (userData: UserData): void {
    N.comm({
      url: "user/save",
      data: userData
    }).submit().done(() => {
      N.alert("User information has been saved.").show();
    });
  }
});
```

### Communicator (N.comm)

Example of using Communicator with TypeScript:

```typescript
// Define API response interface
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface UserListResponse {
  users: UserData[];
  totalCount: number;
  page: number;
}

// Typed communication function
const fetchUsers = (page: number = 1, size: number = 20): JQueryPromise<ApiResponse<UserListResponse>> => {
  return N.comm({
    url: "api/users",
    data: {
      page: page,
      size: size
    },
    timeout: 30000,
    cache: false
  }).submit();
};

// Using Promise style
fetchUsers(1, 10)
  .done((response: ApiResponse<UserListResponse>) => {
    const users: UserData[] = response.data.users;
    const totalCount: number = response.data.totalCount;
    // Process data
    users.forEach((user: UserData) => {
      console.log(`${user.name} (${user.email})`);
    });
  })
  .fail((xhr: JQueryXHR, textStatus: string) => {
    console.error(`Error occurred: ${textStatus}`);
  });
```

### UI Components

Example of using UI components with TypeScript:

```typescript
// Grid component
interface ProductData {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

const productGrid = N([] as ProductData[]).grid({
  context: "#productGrid",
  height: 500,
  select: true,
  multiselect: false,
  sortable: true,
  filter: true,
  rowHandler: (rowIdx: number, rowEle: JQuery, rowData: ProductData): void => {
    // Change row style if stock is less than 10
    if (rowData.stock < 10) {
      rowEle.addClass("low-stock");
    }
  },
  onSelect: (rowIdx: number, rowEle: JQuery, rowData: ProductData): void => {
    console.log(`Selected product: ${rowData.name}, Price: ${rowData.price}`);
  }
}) as NC.Grid;

// Select component
interface CategoryData {
  code: string;
  name: string;
}

const categorySelect = N([] as CategoryData[]).select({
  context: "#categorySelect",
  key: "name",
  val: "code"
}) as NC.Select;

// Bind category data
N.comm("api/categories").submit((data: CategoryData[]) => {
  categorySelect.bind(data);
});

// Form component
const productForm = N({} as ProductData).form({
  context: "#productForm",
  validate: true,
  vRules: {
    name: [["required"]],
    price: [["required"], ["number"]],
    stock: [["required"], ["number"]]
  }
}) as NC.Form;
```

## Advanced Usage

### Type Extension

How to extend Natural-JS types:

```typescript
// Extend existing namespace
declare namespace NC {
  // Extend existing JSONObject interface
  interface JSONObject {
    customProperty?: string;
    customMethod?(): void;
  }

  // Extend existing CommOptions interface
  interface CommOptions {
    customOption?: boolean;
  }
}

// Using extended types
const data: NC.JSONObject = {
  id: "123",
  name: "Hong Gil-dong",
  customProperty: "Custom property"
};

// Using extended options
const comm = N.comm({
  url: "api/test",
  customOption: true
});
```

### Using Generics

How to write type-safe code using generics:

```typescript
// Communication function using generic type
const fetchData = <T>(url: string, params: object = {}): JQueryPromise<T> => {
  return N.comm({
    url: url,
    data: params
  }).submit();
};

// Example usage of generics
interface UserDetail {
  id: string;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
  };
  phoneNumbers: string[];
}

// Type-safe API call
fetchData<UserDetail>("user/detail", { userId: "user123" })
  .done((user: UserDetail) => {
    // Type-safe property access
    console.log(`Name: ${user.name}`);
    console.log(`City: ${user.address.city}`);
    console.log(`Contacts: ${user.phoneNumbers.join(", ")}`);
  });
```

## Known Limitations

Known limitations when using Natural-JS with TypeScript:

- **Dynamic Property Access**: When accessing dynamically created properties of the Controller object (e.g., `p.grid.list`), type casting is required.

  ```typescript
  // Type casting required
  const grid = this["p.grid.list"] as NC.Grid;
  ```

- **jQuery Integration**: Natural-JS depends on jQuery, so you must also install jQuery types.

  ```bash
  npm install --save-dev @types/jquery
  ```

- **Type Declaration Coverage**: Some advanced features or specific use cases may not be fully covered by the type declarations.

## FAQ

### Q: How should I define the type for a Controller object?

A: The Controller object is basically of type `NC.Controller`, but for more specific properties and methods, it is recommended to write an interface:

```typescript
interface UserController extends NC.Controller {
  loadUserList(): void;
  saveUser(userData: UserData): void;
  readonly "p.grid.userList": NC.Grid;
  readonly "p.form.userDetail": NC.Form;
}

const cont = N(".user-page").cont({/* ... */}) as UserController;
```

### Q: How should I handle types related to data binding?

A: It is recommended to define the structure of objects used for data binding as interfaces:

```typescript
interface UserFormData {
  id: string;
  name: string;
  email: string;
  age: number;
}

const form = N({} as UserFormData).form({
  context: "#userForm"
}) as NC.Form;

// Type-safe value access
const formData = form.val() as UserFormData;
console.log(formData.name); // Type inference works
```

### Q: What if I can't find a specific type in the type declaration files?

A: If a required type is not declared, you can declare and use it yourself:

```typescript
// Add type to existing namespace
declare namespace NC {
  interface MyCustomComponent {
    init(): void;
    refresh(): void;
    destroy(): void;
  }
}

// Or declare as a new module
declare module "natural-js" {
  export interface MyCustomOptions {
    feature1: boolean;
    feature2: string;
  }
}
```

---

With this guide, you can effectively use Natural-JS in a TypeScript environment. For further questions or suggestions, please submit an issue to the project repository.
