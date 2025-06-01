# Examples

## 1. Query data from server

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

## 2. Send parameter to server and query result data

```javascript
// The arguments of the N function are sent as parameters.
N({ "param1": 1, "param2": "Mark" }).comm("data.json").submit(function(data) {
    N.log(data);
});
```

## 3. Insert HTML page into specified element

```html
<article id="view-0001"></article>

<script type="text/javascript">
    // Load "page.html" page in "#view-0001" element and execute init method of Controller object on "page.html" page.
    N("#view-0001").comm("page.html").submit(function(cont) {
        // cont: Controller object of the loaded page
        // It executes after the page is inserted.
    });

    const fn = async () => {
        const data = await N("#view-0001").comm("page.html").submit();
        console.log(data); // HTML Text
        const cont = N("#view-0001 .view_context__").instance("cont");
        console.log(cont); // Controller object of the loaded page
    };
    fn();
</script>
```
