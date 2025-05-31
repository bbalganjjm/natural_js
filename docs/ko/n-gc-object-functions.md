# N.gc 객체의 함수

N.gc는 Natural-JS의 가비지 컬렉션 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.gc.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

## N.gc.minimum

**반환**: boolean

Natural-JS의 컴포넌트와 라이브러리에서 사용되는 요소와 이벤트에 대한 최소한의 자원을 회수합니다.

> N.comm으로 Config(natural.config.js)의 N.context.attr("architecture").page.context 영역에 페이지를 불러올 경우 N.gc[N.context.attr("core").gcMode]()가 자동으로 실행됩니다.

## N.gc.full

**반환**: boolean

Natural-JS의 컴포넌트와 라이브러리에서 사용되는 요소와 이벤트에 대한 모든 자원을 회수합니다.

> SPA(Single Page Application)로 사이트를 제작할 때 브라우저의 메모리가 페이지를 열 때마다 증가한다면 어딘가에서 메모리 누수가 발생하는 것입니다. N.comm에서 자동으로 포착할 수 없는 부분을 파악하여 N.gc.full()을 실행해 주면 해당 현상이 개선될 수 있습니다.

## N.gc.ds

**반환**: undefined

N.ds의 observable 들에서 가비지 인스턴스를 제거합니다.

> N.comm으로 Config(natural.config.js)의 N.context.attr("architecture").page.context 영역이 아닌 곳에 페이지를 불러올 경우 N.gc.ds()가 자동으로 실행됩니다.
