# Natural-JS TypeScript 개발자 가이드

Natural-JS는 TypeScript 개발을 지원하기 위해 타입 선언 파일(.d.ts)을 제공합니다. 이 가이드에서는 Natural-JS를 TypeScript 환경에서 사용하는 방법을 상세히 설명합니다.

## 목차

1. [TypeScript 설정](#typescript-설정)
2. [타입 선언 파일 구조](#타입-선언-파일-구조)
3. [기본 사용법](#기본-사용법)
4. [컴포넌트별 TypeScript 사용 예제](#컴포넌트별-typescript-사용-예제)
   - [Controller(N.cont)](#controllerncon)
   - [Communicator(N.comm)](#communicatorncomm)
   - [UI 컴포넌트](#ui-컴포넌트)
5. [고급 사용법](#고급-사용법)
   - [타입 확장](#타입-확장)
   - [제네릭 활용](#제네릭-활용)
6. [알려진 제한사항](#알려진-제한사항)
7. [FAQ](#faq)

## TypeScript 설정

Natural-JS를 TypeScript 환경에서 사용하기 위해서는 `tsconfig.json` 파일에 타입 선언 파일 경로를 지정해야 합니다.

### 1. tsconfig.json 설정

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

### 2. 타입 선언 파일 경로 구조

Natural-JS의 타입 선언 파일은 다음 경로에 위치해 있습니다:

- `js/natural_js/@types/index.d.ts`: 메인 타입 선언 파일
- `js/natural_js/@types/natural.js.d.ts`: Natural-JS 핵심 타입 
- `js/natural_js/@types/natural.core.d.ts`: Natural-CORE 관련 타입
- `js/natural_js/@types/natural.architecture.d.ts`: Natural-ARCHITECTURE 관련 타입
- `js/natural_js/@types/natural.data.d.ts`: Natural-DATA 관련 타입
- `js/natural_js/@types/natural.ui.d.ts`: Natural-UI 관련 타입
- 그 외 컴포넌트별 타입 파일들

## 기본 사용법

Natural-JS를 TypeScript와 함께 사용하는 기본적인 방법을 설명합니다.

### Controller 객체 사용

```typescript
// Controller 선언
const cont = N(".page-id").cont({
    init: function(view: JQuery, request: NC.Request): void {
        // 초기화 코드
    },
    loadData: function(): void {
        // 데이터 로드 함수
    },
    // 타입이 지정된 변수 선언
    counter: 0 as number,
    userData: {} as NC.JSONObject
});
```

### Communicator 사용

```typescript
// 타입이 지정된 통신 함수
function fetchUserData(userId: string): JQueryPromise<NC.JSONObject> {
    return N.comm({
        url: "user/detail",
        data: {
            userId: userId
        }
    }).submit();
}

// 타입이 지정된 응답 처리
fetchUserData("user123").done(function(data: NC.JSONObject) {
    console.log(`사용자 이름: ${data.name}`);
});
```

### UI 컴포넌트 사용

```typescript
// Grid 컴포넌트 초기화
const grid = N([] as NC.JSONObject[]).grid({
    context: "#userGrid",
    height: 400,
    select: true,
    sortable: true
}) as NC.Grid;

// 타입이 지정된 Grid 데이터 가져오기
const gridData: NC.JSONObject[] = grid.getData();

// Form 컴포넌트 초기화
const form = N({} as NC.JSONObject).form({
    context: "#userForm",
    validate: true
}) as NC.Form;

// 타입이 지정된 Form 값 설정
form.val({
    name: "홍길동",
    age: 30,
    email: "hong@example.com"
} as NC.JSONObject);
```

## 컴포넌트별 TypeScript 사용 예제

### Controller(N.cont)

Controller 객체를 TypeScript로 작성하는 완전한 예제입니다:

```typescript
interface UserData {
    id: string;
    name: string;
    age: number;
    email: string;
}

// 커스텀 인터페이스를 활용한 Controller 작성
const userController = N(".user-page").cont({
    // 컴포넌트 속성 정의 (Natural-TEMPLATE 스타일)
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
    
    // 초기화 함수
    init: function(view: JQuery, request: NC.Request): void {
        // 그리드에 데이터 바인딩
        this.loadUserList();
        
        // 이벤트 바인딩
        this.bindEvents();
    },
    
    // 사용자 목록 로드 함수
    loadUserList: function(): void {
        const self = this;
        
        N.comm(this["c.getUserList"]).submit().done(function(data: UserData[]) {
            const grid = self["p.grid.userList"] as NC.Grid;
            grid.bind(data);
        });
    },
    
    // 이벤트 바인딩 함수
    bindEvents: function(): void {
        const self = this;
        const grid = this["p.grid.userList"] as NC.Grid;
        const form = this["p.form.userDetail"] as NC.Form;
        
        // 그리드 행 선택 이벤트
        grid.setOption({
            onSelect: function(rowIdx: number, rowEle: JQuery, rowData: UserData): void {
                form.val(rowData);
            }
        });
        
        // 저장 버튼 클릭 이벤트
        N("#saveBtn", this.view).on("click", function() {
            if (form.validate()) {
                const userData: UserData = form.val() as UserData;
                self.saveUserData(userData);
            }
        });
    },
    
    // 사용자 데이터 저장 함수
    saveUserData: function(userData: UserData): void {
        N.comm({
            url: "user/save",
            data: userData
        }).submit().done(function() {
            N.alert("사용자 정보가 저장되었습니다.").show();
        });
    }
});
```

### Communicator(N.comm)

Communicator를 TypeScript로 사용하는 예제입니다:

```typescript
// API 응답 인터페이스 정의
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

// 타입이 지정된 통신 함수
function fetchUsers(page: number = 1, size: number = 20): JQueryPromise<ApiResponse<UserListResponse>> {
    return N.comm({
        url: "api/users",
        data: {
            page: page,
            size: size
        },
        timeout: 30000,
        cache: false
    }).submit();
}

// Promise 스타일 사용
fetchUsers(1, 10)
    .done(function(response: ApiResponse<UserListResponse>) {
        const users: UserData[] = response.data.users;
        const totalCount: number = response.data.totalCount;
        
        // 데이터 처리
        users.forEach(function(user: UserData) {
            console.log(`${user.name} (${user.email})`);
        });
    })
    .fail(function(xhr: JQueryXHR, textStatus: string) {
        console.error(`에러 발생: ${textStatus}`);
    });
```

### UI 컴포넌트

UI 컴포넌트를 TypeScript로 사용하는 예제입니다:

```typescript
// Grid 컴포넌트
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
    rowHandler: function(rowIdx: number, rowEle: JQuery, rowData: ProductData): void {
        // 재고가 10개 미만인 경우 행 스타일 변경
        if (rowData.stock < 10) {
            rowEle.addClass("low-stock");
        }
    },
    onSelect: function(rowIdx: number, rowEle: JQuery, rowData: ProductData): void {
        console.log(`선택된 상품: ${rowData.name}, 가격: ${rowData.price}`);
    }
}) as NC.Grid;

// Select 컴포넌트
interface CategoryData {
    code: string;
    name: string;
}

const categorySelect = N([] as CategoryData[]).select({
    context: "#categorySelect",
    key: "name",
    val: "code"
}) as NC.Select;

// 카테고리 데이터 바인딩
N.comm("api/categories").submit().done(function(data: CategoryData[]) {
    categorySelect.bind(data);
});

// Form 컴포넌트
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

## 고급 사용법

### 타입 확장

Natural-JS 타입을 확장하여 사용하는 방법입니다:

```typescript
// 기존 네임스페이스 확장
declare namespace NC {
    // 기존 JSONObject 인터페이스 확장
    interface JSONObject {
        customProperty?: string;
        customMethod?(): void;
    }
    
    // 기존 CommOptions 인터페이스 확장
    interface CommOptions {
        customOption?: boolean;
    }
}

// 확장된 타입 사용
const data: NC.JSONObject = {
    id: "123",
    name: "홍길동",
    customProperty: "사용자 정의 속성"
};

// 확장된 옵션 사용
const comm = N.comm({
    url: "api/test",
    customOption: true
});
```

### 제네릭 활용

제네릭을 활용한 타입 안전한 코드 작성 방법:

```typescript
// 제네릭 타입을 사용한 통신 함수
function fetchData<T>(url: string, params: object = {}): JQueryPromise<T> {
    return N.comm({
        url: url,
        data: params
    }).submit();
}

// 제네릭 사용 예
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

// 타입 안전한 API 호출
fetchData<UserDetail>("user/detail", { userId: "user123" })
    .done(function(user: UserDetail) {
        // 타입 안전한 속성 접근
        console.log(`이름: ${user.name}`);
        console.log(`도시: ${user.address.city}`);
        console.log(`연락처: ${user.phoneNumbers.join(", ")}`);
    });
```

## 알려진 제한사항

Natural-JS를 TypeScript로 사용할 때 알려진 제한사항입니다:

1. **동적 속성 접근**: Controller 객체의 동적으로 생성되는 속성(예: `p.grid.list`)에 접근할 때 타입 캐스팅이 필요합니다.

   ```typescript
   // 타입 캐스팅 필요
   const grid = this["p.grid.list"] as NC.Grid;
   ```

2. **jQuery 통합**: Natural-JS는 jQuery에 의존하므로, jQuery 타입도 함께 설치해야 합니다.

   ```bash
   npm install --save-dev @types/jquery
   ```

3. **타입 선언 커버리지**: 일부 고급 기능이나 특정 사용 사례에 대한 타입 선언이 완전하지 않을 수 있습니다.

## FAQ

### Q: Controller 객체의 타입을 어떻게 정의해야 할까요?

A: Controller 객체는 기본적으로 `NC.Controller` 타입이지만, 구체적인 속성과 메서드를 정의하려면 인터페이스를 작성하는 것이 좋습니다:

```typescript
interface UserController extends NC.Controller {
    loadUserList(): void;
    saveUser(userData: UserData): void;
    readonly "p.grid.userList": NC.Grid;
    readonly "p.form.userDetail": NC.Form;
}

const cont = N(".user-page").cont({/* ... */}) as UserController;
```

### Q: 데이터 바인딩과 관련된 타입을 어떻게 처리해야 할까요?

A: 데이터 바인딩에 사용되는 객체의 구조를 인터페이스로 정의하는 것이 좋습니다:

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

// 타입 안전한 값 접근
const formData = form.val() as UserFormData;
console.log(formData.name); // 타입 추론 작동
```

### Q: 타입 선언 파일에서 특정 타입을 찾을 수 없는 경우 어떻게 해야 하나요?

A: 필요한 타입이 선언되어 있지 않은 경우, 직접 선언하여 사용할 수 있습니다:

```typescript
// 기존 네임스페이스에 타입 추가
declare namespace NC {
    interface MyCustomComponent {
        init(): void;
        refresh(): void;
        destroy(): void;
    }
}

// 또는 새로운 모듈로 선언
declare module "natural-js" {
    export interface MyCustomOptions {
        feature1: boolean;
        feature2: string;
    }
}
```

---

이 가이드를 통해 Natural-JS를 TypeScript 환경에서 효과적으로 사용하는 방법을 익힐 수 있습니다. 추가적인 질문이나 개선 사항은 프로젝트 저장소에 이슈를 제출해 주세요.
