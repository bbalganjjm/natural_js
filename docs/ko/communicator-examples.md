# 예제

## 1. 서버에서 데이터 조회

```javascript
// callback
N.comm("data.json").submit(function(data) {
    N.log(data);
});

// async / await
const fn = async () => {
    const data = await N.comm("data.json").submit();
    console.log(data);
};
fn();
```

## 2. 서버에 파라미터 전송 및 결과 데이터 조회

```javascript
// N 함수의 인수가 파라미터로 전송됩니다.
N({ "param1": 1, "param2": "Mark" }).comm("data.json").submit(function(data) {
    N.log(data);
});
```

## 3. 지정한 요소에 HTML 페이지 삽입하기

```html
<article id="view-0001"></article>

<script type="text/javascript">
    // "#view-0001" 요소에 "page.html" 페이지를 로드하고 "page.html" 페이지의 Controller object의 init 메서드를 실행해 줍니다.
    N("#view-0001").comm("page.html").submit(function(cont) {
        // cont : 불러온 페이지의 Controller object
        // 페이지 삽입이 완료된 후 실행됩니다.
    });

    const fn = async () => {
        const data = await N("#view-0001").comm("page.html").submit();
        console.log(data); // HTML Text
        const cont = N("#view-0001 .view_context__").instance("cont");
        console.log(cont); // 불러온 페이지의 Controller object
    };
    fn();
</script>
```
