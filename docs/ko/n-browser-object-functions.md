# N.browser 객체의 함수

N.browser은 browser 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.browser.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

## N.browser.cookie

**반환**: undefined

브라우저 쿠키를 생성합니다.

### 매개변수

#### name

**Type**: string

쿠키명을 입력합니다.

#### value

**Type**: string

쿠키값을 입력합니다.

#### expiredays

**Type**: number

쿠키의 만료일을 입력합니다.

#### domain

**Type**: string

쿠키가 생성될 도메인을 입력합니다.

## N.browser.removeCookie

**반환**: undefined

생성된 쿠키를 제거합니다.

### 매개변수

#### name

**Type**: string

쿠키명을 입력합니다.

#### domain

**Type**: string

제거할 쿠키의 도메인을 입력합니다.

## N.browser.msieVersion

**반환**: number

접속한 MSIE(Microsoft Internet Explorer)의 버전을 가져옵니다. MSIE가 아닐 경우 0을 반환합니다.

## N.browser.is

**반환**: boolean

접속한 브라우저나 모바일 OS가 입력한 name 인수 값과 일치하면 true를 반환합니다.

### 매개변수

#### name

**Type**: string

브라우저명이나 모바일 OS명을 입력합니다.

- "opera" : Opera Browser.
- "firefox" : Mozilla Firefox Browser.
- "safari" : Apple Safari Browser.
- "chrome" : Google Chrome Browser.
- "ie" : Microsoft Internet Explorer Browser.
- "android" : Google Android OS
- "ios" : Apple iOS

## N.browser.contextPath

**반환**: string

브라우저 URL에서 컨텍스트 경로를 반환합니다.

## N.browser.scrollbarWidth

**반환**: number

브라우저 스크롤바의 넓이를 반환합니다.
