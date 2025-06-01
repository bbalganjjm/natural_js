# 예제

Context 객체(N.context)는 애플리케이션 전체에서 접근할 수 있어야 하는 데이터를 위한 중앙 저장소를 제공합니다. 다음 예제는 일반적인 사용 패턴을 보여줍니다.

## 1. Context에 데이터 저장하기

```javascript
<script type="text/javascript">
    N.context.attr("globalInfo", {
        userId : "jeff1942",
        userNm : "Jeff Beck"
    });
</script>
```

## 2. Context에 저장된 데이터 가져오기

```javascript
<script type="text/javascript">
    var globalInfo = N.context.attr("globalInfo");
</script>
```

## 3. 중첩 데이터 작업하기

```javascript
<script type="text/javascript">
    // 중첩 데이터 저장
    N.context.attr("application", {
        name: "My Natural-JS App",
        version: "1.0.0",
        settings: {
            theme: "light",
            language: "ko",
            features: {
                enableAnimation: true,
                cacheResults: true,
                maxItems: 100
            }
        }
    });
    
    // 중첩 데이터 접근
    var appName = N.context.attr("application").name;
    var language = N.context.attr("application").settings.language;
    var animationEnabled = N.context.attr("application").settings.features.enableAnimation;
    
    console.log(appName);         // "My Natural-JS App"
    console.log(language);        // "ko"
    console.log(animationEnabled); // true
</script>
```

## 4. 사용자 환경 설정 저장 및 업데이트

```javascript
<script type="text/javascript">
    // 사용자 환경 설정 초기화
    N.context.attr("userPreferences", {
        theme: "light",
        fontSize: "medium",
        showNotifications: true,
        dashboardLayout: "grid"
    });
    
    // 특정 환경 설정을 업데이트하는 함수
    function updatePreference(key, value) {
        var prefs = N.context.attr("userPreferences");
        prefs[key] = value;
        N.context.attr("userPreferences", prefs);
        
        // 선택적으로 페이지 새로 고침 시에도 유지하기 위해 localStorage에 저장
        localStorage.setItem("userPreferences", JSON.stringify(prefs));
    }
    
    // 환경 설정 업데이트
    updatePreference("theme", "dark");
    
    // 업데이트된 환경 설정 가져오기
    var currentPrefs = N.context.attr("userPreferences");
    console.log(currentPrefs.theme); // "dark"
</script>
```

## 5. 컨트롤러 간 데이터 공유

```javascript
<script type="text/javascript">
    // Controller A에서
    N("#controller-a").cont({
        init: function(view, request) {
            // 공유해야 하는 데이터 저장
            N.context.attr("sharedData", {
                selectedItems: [1, 2, 3],
                timestamp: new Date()
            });
        }
    });
    
    // Controller B에서
    N("#controller-b").cont({
        init: function(view, request) {
            // 공유 데이터 접근
            var sharedData = N.context.attr("sharedData");
            
            if (sharedData) {
                console.log("선택된 항목:", sharedData.selectedItems);
                console.log("타임스탬프:", sharedData.timestamp);
                
                // 공유 데이터 사용
                this.processItems(sharedData.selectedItems);
            }
        },
        
        processItems: function(items) {
            // 항목 처리
            // ...
        }
    });
</script>
```

## 6. 기능 플래그에 Context 사용하기

```javascript
<script type="text/javascript">
    // 기능 플래그 초기화
    N.context.attr("features", {
        enableNewUI: true,
        betaFeatures: false,
        experimentalAPI: false,
        debugMode: window.location.hostname === "localhost"
    });
    
    // 기능을 활성화하기 전에 기능 플래그 확인
    function initializeApp() {
        var features = N.context.attr("features");
        
        // 플래그에 따라 조건부로 기능 초기화
        if (features.enableNewUI) {
            initializeNewUI();
        } else {
            initializeLegacyUI();
        }
        
        if (features.betaFeatures) {
            enableBetaFeatures();
        }
        
        if (features.debugMode) {
            enableDebugTools();
        }
    }
    
    initializeApp();
</script>
```
