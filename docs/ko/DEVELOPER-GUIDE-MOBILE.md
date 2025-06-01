# Natural-JS 모바일 환경 개발자 가이드

Natural-JS는 모바일 브라우저(ES5 이상)와 터치 디바이스를 지원하며, 모바일 하이브리드 앱과의 연동도 지원합니다. 이 가이드에서는 Natural-JS를 모바일 환경에서 효과적으로 사용하는 방법을 상세히 설명합니다.

## 목차

1. [모바일 환경 지원 개요](#모바일-환경-지원-개요)
2. [모바일 환경 설정](#모바일-환경-설정)
3. [모바일 UI 최적화](#모바일-ui-최적화)
4. [터치 이벤트 처리](#터치-이벤트-처리)
5. [반응형 디자인 구현](#반응형-디자인-구현)
6. [모바일 성능 최적화](#모바일-성능-최적화)
7. [하이브리드 앱 연동](#하이브리드-앱-연동)
8. [모바일 웹앱 구현 예제](#모바일-웹앱-구현-예제)
9. [모바일 환경 문제 해결](#모바일-환경-문제-해결)

## 모바일 환경 지원 개요

Natural-JS는 다음과 같은 모바일 환경 지원 기능을 제공합니다:

- **모바일 브라우저 지원**: ES5 이상을 지원하는 모든 모바일 브라우저에서 작동
- **터치 이벤트 지원**: 클릭, 더블 클릭, 롱 터치, 스와이프 등의 터치 이벤트 처리
- **반응형 UI**: 다양한 화면 크기에 대응하는 반응형 UI 컴포넌트
- **모바일 최적화**: 모바일 환경에 맞게 최적화된 성능과 사용자 경험
- **하이브리드 앱 연동**: Cordova, Capacitor 등의 하이브리드 앱 프레임워크와 연동 지원

## 모바일 환경 설정

### 기본 설정

모바일 환경에서 Natural-JS를 사용하기 위해 필요한 기본 설정입니다:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    
    <!-- Natural-JS 라이브러리 로드 -->
    <link rel="stylesheet" type="text/css" href="css/natural-components.css" />
    <link rel="stylesheet" type="text/css" href="css/natural-components.mobile.css" />
    <script type="text/javascript" src="js/lib/jquery-3.6.0.min.js"></script>
    <script type="text/javascript" src="js/natural_js/natural.js.min.js"></script>
    <script type="text/javascript" src="js/natural_js/natural.config.js"></script>
</head>
<body>
    <!-- 앱 콘텐츠 -->
</body>
</html>
```

### Config 설정

Natural-JS의 `natural.config.js` 파일에서 모바일 환경에 대한 설정을 추가합니다:

```javascript
N.context.attr("core", {
    /**
     * 모바일 환경 설정
     */
    mobile : {
        // 모바일 환경 감지 여부
        detectMobile : true,
        // 태블릿을 모바일 환경으로 간주할지 여부
        tabletAsMobile : true,
        // 모바일 환경에서 기본 폰트 크기
        fontSize : 14,
        // 모바일 환경에서 버튼 크기 확대 계수
        buttonSizeRatio : 1.2
    }
});
```

## 모바일 UI 최적화

### 컴포넌트별 모바일 최적화 설정

#### Grid 컴포넌트

```javascript
N(data).grid({
    context: "#mobileGrid",
    // 모바일 환경에서 화면 크기에 맞게 높이 조정
    height: N.browser.isMobile() ? window.innerHeight * 0.6 : 400,
    // 모바일 환경에서 고정 열 비활성화
    fixedcol: N.browser.isMobile() ? 0 : 2,
    // 터치 스크롤 최적화
    windowScrollLock: true,
    // 모바일 환경에서 빠른 초기 로딩을 위한 설정
    createRowDelay: N.browser.isMobile() ? 0 : 1,
    scrollPaging: {
        // 모바일에서는 페이징 사이즈 줄이기
        size: N.browser.isMobile() ? 50 : 100
    }
});
```

#### Form 컴포넌트

```javascript
N(data).form({
    context: "#mobileForm",
    // 모바일 환경에서 입력 필드 크기 최적화
    toCSS: N.browser.isMobile() ? {
        "input, select, textarea": {
            "height": "40px",
            "font-size": "16px",
            "padding": "8px"
        }
    } : {}
});
```

#### Select 컴포넌트

```javascript
N(data).select({
    context: "#mobileSelect",
    // 모바일 환경에서 기본 OS 선택 UI 사용
    useNativeUI: N.browser.isMobile()
});
```

### 모바일 전용 CSS 클래스

모바일 환경에 맞는 스타일링을 위한 CSS 클래스를 활용합니다:

```css
/* 모바일 환경 감지 클래스 추가 */
.mobile-device .button {
    min-height: 44px;
    padding: 10px 15px;
}

.mobile-device .form-field {
    margin-bottom: 15px;
}

.mobile-device .grid-cell {
    padding: 10px 8px;
}

/* 터치 영역 확대 */
.mobile-device .clickable {
    min-width: 44px;
    min-height: 44px;
}
```

## 터치 이벤트 처리

### 기본 터치 이벤트

Natural-JS는 모바일 환경에서 다음과 같은 터치 이벤트를 지원합니다:

```javascript
// 탭(터치 클릭) 이벤트
N("#mobileButton").on("tap", function(e) {
    console.log("버튼이 탭되었습니다.");
});

// 롱 터치 이벤트
N("#mobileItem").on("longtap", function(e) {
    console.log("아이템이 길게 터치되었습니다.");
    // 컨텍스트 메뉴 표시 등의 작업
});

// 스와이프 이벤트
N("#mobileCard").on("swipe", function(e, direction) {
    console.log("카드가 " + direction + " 방향으로 스와이프되었습니다.");
    
    if (direction === "left") {
        // 왼쪽 스와이프 처리
    } else if (direction === "right") {
        // 오른쪽 스와이프 처리
    }
});
```

### 터치 이벤트 최적화

터치 이벤트 처리 시 성능과 사용자 경험을 향상시키기 위한 최적화 방법:

```javascript
// 컨트롤러에서 터치 이벤트 처리
const mobileCont = N(".mobile-page").cont({
    init: function(view, request) {
        this.initTouchEvents();
    },
    
    initTouchEvents: function() {
        const self = this;
        
        // 터치 이벤트 지연 처리 (디바운싱)
        let touchTimer;
        
        // 터치 시작 위치
        let startX, startY;
        
        // 터치 시작 이벤트
        this.view.on("touchstart", function(e) {
            const touch = e.originalEvent.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        // 터치 종료 이벤트
        this.view.on("touchend", function(e) {
            clearTimeout(touchTimer);
            
            // 300ms 지연을 방지하여 반응성 향상
            e.preventDefault();
            
            // 터치 이벤트 처리
            touchTimer = setTimeout(function() {
                self.handleTouchEvent(e, startX, startY);
            }, 10);
        });
    },
    
    handleTouchEvent: function(e, startX, startY) {
        // 터치 이벤트 처리 로직
        const endTouch = e.originalEvent.changedTouches[0];
        const endX = endTouch.clientX;
        const endY = endTouch.clientY;
        
        // 이동 거리 계산
        const distX = endX - startX;
        const distY = endY - startY;
        
        // 스와이프 감지
        if (Math.abs(distX) > 50) {
            const direction = distX > 0 ? "right" : "left";
            this.handleSwipe(direction);
        }
    },
    
    handleSwipe: function(direction) {
        if (direction === "left") {
            // 왼쪽 스와이프 처리 (예: 다음 항목으로 이동)
            this.showNextItem();
        } else if (direction === "right") {
            // 오른쪽 스와이프 처리 (예: 이전 항목으로 이동)
            this.showPrevItem();
        }
    },
    
    showNextItem: function() {
        // 다음 항목 표시 로직
    },
    
    showPrevItem: function() {
        // 이전 항목 표시 로직
    }
});
```

## 반응형 디자인 구현

### 화면 크기 감지 및 대응

```javascript
// 화면 크기에 따른 레이아웃 조정
function adjustLayout() {
    const windowWidth = window.innerWidth;
    
    if (windowWidth < 576) {
        // 스마트폰 레이아웃
        N(".container").css({
            "padding": "10px",
            "flex-direction": "column"
        });
        
        // 그리드 높이 조정
        if (cont["p.grid.list"]) {
            cont["p.grid.list"].setOption({
                height: window.innerHeight * 0.5
            });
        }
    } else if (windowWidth < 992) {
        // 태블릿 레이아웃
        N(".container").css({
            "padding": "15px",
            "flex-direction": "row"
        });
        
        // 그리드 높이 조정
        if (cont["p.grid.list"]) {
            cont["p.grid.list"].setOption({
                height: window.innerHeight * 0.6
            });
        }
    } else {
        // 데스크톱 레이아웃
        N(".container").css({
            "padding": "20px",
            "flex-direction": "row"
        });
        
        // 그리드 높이 조정
        if (cont["p.grid.list"]) {
            cont["p.grid.list"].setOption({
                height: 500
            });
        }
    }
}

// 화면 크기 변경 시 레이아웃 조정
N(window).on("resize", adjustLayout);

// 초기 레이아웃 설정
adjustLayout();
```

### 모바일 우선 디자인 접근법

```javascript
const cont = N(".responsive-page").cont({
    init: function(view, request) {
        // 모바일 우선 디자인으로 기본 UI 구성
        this.setupMobileLayout();
        
        // 화면 크기가 큰 경우 추가 UI 요소 표시
        if (window.innerWidth >= 768) {
            this.enhanceForLargerScreens();
        }
        
        // 반응형 이벤트 바인딩
        this.bindResponsiveEvents();
    },
    
    setupMobileLayout: function() {
        // 모바일에 최적화된 기본 레이아웃 설정
        // - 단일 컬럼 레이아웃
        // - 큰 터치 타겟
        // - 간소화된 UI
    },
    
    enhanceForLargerScreens: function() {
        // 큰 화면에서 추가할 UI 요소
        // - 사이드바 표시
        // - 추가 컨트롤 표시
        // - 멀티 컬럼 레이아웃
    },
    
    bindResponsiveEvents: function() {
        const self = this;
        
        // 화면 크기 변경 감지
        N(window).on("resize", function() {
            const width = window.innerWidth;
            
            if (width < 768 && self.currentLayout !== "mobile") {
                self.currentLayout = "mobile";
                self.switchToMobileLayout();
            } else if (width >= 768 && self.currentLayout !== "desktop") {
                self.currentLayout = "desktop";
                self.switchToDesktopLayout();
            }
        });
    },
    
    switchToMobileLayout: function() {
        // 모바일 레이아웃으로 전환
    },
    
    switchToDesktopLayout: function() {
        // 데스크톱 레이아웃으로 전환
    }
});
```

## 모바일 성능 최적화

### 데이터 로딩 최적화

```javascript
// 지연 로딩 구현
const mobileController = N(".mobile-app").cont({
    init: function(view, request) {
        // 초기 화면에 필요한 최소 데이터만 로드
        this.loadInitialData();
        
        // 스크롤 이벤트에 따른 추가 데이터 로딩
        this.bindScrollEvents();
    },
    
    loadInitialData: function() {
        // 첫 화면에 보이는 데이터만 로드
        N.comm({
            url: "api/data",
            data: {
                page: 1,
                size: 20
            }
        }).submit().done(function(data) {
            // 초기 데이터 표시
        });
    },
    
    bindScrollEvents: function() {
        const self = this;
        let loading = false;
        let currentPage = 1;
        
        // 스크롤 이벤트를 디바운싱하여 성능 최적화
        let scrollTimer;
        
        N(window).on("scroll", function() {
            clearTimeout(scrollTimer);
            
            scrollTimer = setTimeout(function() {
                // 스크롤이 하단에 도달했는지 확인
                if (self.isScrolledToBottom() && !loading) {
                    loading = true;
                    currentPage++;
                    
                    // 추가 데이터 로드
                    self.loadMoreData(currentPage, function() {
                        loading = false;
                    });
                }
            }, 100);
        });
    },
    
    isScrolledToBottom: function() {
        return (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200;
    },
    
    loadMoreData: function(page, callback) {
        N.comm({
            url: "api/data",
            data: {
                page: page,
                size: 20
            }
        }).submit().done(function(data) {
            // 추가 데이터 표시
            callback();
        });
    }
});
```

### 이미지 최적화

```javascript
// 이미지 지연 로딩 구현
function setupLazyLoading() {
    // 이미지 지연 로딩 설정
    const lazyImages = Array.from(document.querySelectorAll('img[data-src]'));
    
    // Intersection Observer 사용
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        // IntersectionObserver를 지원하지 않는 브라우저를 위한 대체 방법
        function lazyLoad() {
            const scrollTop = window.pageYOffset;
            
            lazyImages.forEach(function(img, index) {
                if (img.offsetTop < (window.innerHeight + scrollTop)) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    lazyImages.splice(index, 1);
                }
            });
            
            if (lazyImages.length === 0) {
                window.removeEventListener('scroll', throttledLazyLoad);
                window.removeEventListener('resize', throttledLazyLoad);
            }
        }
        
        // 스로틀링으로 성능 최적화
        function throttle(func, wait) {
            let timeout;
            
            return function() {
                const context = this;
                const args = arguments;
                
                if (!timeout) {
                    timeout = setTimeout(function() {
                        timeout = null;
                        func.apply(context, args);
                    }, wait);
                }
            };
        }
        
        const throttledLazyLoad = throttle(lazyLoad, 200);
        
        window.addEventListener('scroll', throttledLazyLoad);
        window.addEventListener('resize', throttledLazyLoad);
        
        // 초기 로딩
        lazyLoad();
    }
}

// 페이지 로드 시 지연 로딩 설정
N(document).ready(function() {
    setupLazyLoading();
});
```

### 애니메이션 최적화

```javascript
// 성능 최적화된 애니메이션
function optimizedAnimation() {
    // CSS 트랜지션을 사용하여 하드웨어 가속 활용
    const animatedElements = document.querySelectorAll('.animated');
    
    animatedElements.forEach(function(element) {
        // transform과 opacity를 사용하여 성능 최적화
        element.style.transform = 'translateZ(0)'; // 하드웨어 가속 활성화
        element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        // 애니메이션 시작을 위한 클래스 추가
        setTimeout(function() {
            element.classList.add('animated-in');
        }, 10);
    });
}

// requestAnimationFrame 사용
function smoothScroll(targetY, duration) {
    const startY = window.scrollY;
    const difference = targetY - startY;
    const startTime = performance.now();
    
    function step(currentTime) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < duration) {
            // 부드러운 이징 함수 사용
            const progress = 1 - Math.cos((elapsedTime / duration) * Math.PI / 2);
            window.scrollTo(0, startY + difference * progress);
            requestAnimationFrame(step);
        } else {
            window.scrollTo(0, targetY);
        }
    }
    
    requestAnimationFrame(step);
}
```

## 하이브리드 앱 연동

### Cordova 연동

```javascript
// Cordova 플러그인 사용 예제
const hybridController = N(".hybrid-app").cont({
    init: function(view, request) {
        // Cordova 준비 상태 확인
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    
    onDeviceReady: function() {
        // Cordova API 사용 가능
        console.log('Running on: ' + device.platform + ' ' + device.version);
        
        // 디바이스 정보 표시
        N("#deviceInfo", this.view).text(
            '모델: ' + device.model + 
            ', 플랫폼: ' + device.platform + 
            ', 버전: ' + device.version
        );
        
        // 네이티브 기능 버튼 이벤트 바인딩
        this.bindNativeFeatures();
    },
    
    bindNativeFeatures: function() {
        const self = this;
        
        // 카메라 버튼
        N("#cameraBtn", this.view).on("tap", function() {
            self.takePicture();
        });
        
        // 위치 정보 버튼
        N("#locationBtn", this.view).on("tap", function() {
            self.getLocation();
        });
        
        // 디바이스 알림 버튼
        N("#notifyBtn", this.view).on("tap", function() {
            self.showNotification();
        });
        
        // 파일 다운로드 버튼
        N("#downloadBtn", this.view).on("tap", function() {
            self.downloadFile();
        });
    },
    
    takePicture: function() {
        navigator.camera.getPicture(
            function(imageData) {
                // 사진 촬영 성공
                const image = document.getElementById('myImage');
                image.src = "data:image/jpeg;base64," + imageData;
            },
            function(error) {
                // 사진 촬영 실패
                N.alert("카메라 오류: " + error).show();
            },
            {
                quality: 75,
                destinationType: Camera.DestinationType.DATA_URL,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                correctOrientation: true
            }
        );
    },
    
    getLocation: function() {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                // 위치 가져오기 성공
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                N("#locationInfo").text("위도: " + lat + ", 경도: " + lng);
                
                // 서버에 위치 정보 전송
                N.comm({
                    url: "api/location",
                    data: {
                        latitude: lat,
                        longitude: lng
                    }
                }).submit();
            },
            function(error) {
                // 위치 가져오기 실패
                N.alert("위치 정보 오류: " + error.message).show();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    },
    
    showNotification: function() {
        // 로컬 알림 표시
        cordova.plugins.notification.local.schedule({
            title: '알림 제목',
            text: '알림 내용입니다.',
            foreground: true
        });
    },
    
    downloadFile: function() {
        // 파일 다운로드
        const fileTransfer = new FileTransfer();
        const uri = encodeURI("https://example.com/file.pdf");
        const fileURL = cordova.file.externalDataDirectory + "file.pdf";
        
        fileTransfer.download(
            uri,
            fileURL,
            function(entry) {
                N.alert("다운로드 완료: " + entry.toURL()).show();
                
                // 파일 열기
                cordova.plugins.fileOpener2.open(
                    entry.toURL(),
                    'application/pdf',
                    {
                        error: function(e) {
                            N.alert("파일을 열 수 없습니다: " + e.message).show();
                        },
                        success: function() {
                            console.log('파일이 성공적으로 열렸습니다');
                        }
                    }
                );
            },
            function(error) {
                N.alert("다운로드 오류: " + error.code).show();
            },
            false,
            {
                headers: {
                    "Authorization": "Bearer " + authToken
                }
            }
        );
    }
});
```

### 하이브리드 앱 환경 감지

```javascript
// 하이브리드 앱 환경 감지 및 대응
const app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener('resume', this.onResume.bind(this), false);
        document.addEventListener('pause', this.onPause.bind(this), false);
        
        // 웹 환경에서도 실행할 수 있도록 함
        if (!window.cordova) {
            // 웹 환경 초기화
            this.initForWeb();
        }
    },
    
    onDeviceReady: function() {
        // 하이브리드 앱 환경 감지
        this.isHybridApp = true;
        
        // 앱 초기화
        this.initApp();
        
        // 상태바 설정
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        
        // 백버튼 이벤트 처리
        document.addEventListener("backbutton", this.onBackKeyDown.bind(this), false);
    },
    
    initForWeb: function() {
        // 웹 환경 감지
        this.isHybridApp = false;
        
        // 웹 환경에 맞게 초기화
        this.initApp();
    },
    
    initApp: function() {
        // Natural-JS 초기화
        this.setupNaturalJS();
        
        // 앱 메인 화면 로드
        this.loadMainScreen();
    },
    
    setupNaturalJS: function() {
        // 하이브리드 앱 환경 정보 설정
        N.context.attr("core").app = {
            isHybrid: this.isHybridApp,
            platform: this.isHybridApp ? device.platform.toLowerCase() : "web",
            version: this.isHybridApp ? device.version : "unknown"
        };
        
        // 환경에 따른 설정 조정
        if (this.isHybridApp) {
            // 하이브리드 앱 환경 설정
            N.context.attr("comm").contentType = "application/json; charset=utf-8";
            
            // 앱 토큰 가져오기
            this.getAppToken();
        } else {
            // 웹 환경 설정
            N.context.attr("comm").contentType = "application/x-www-form-urlencoded; charset=utf-8";
        }
    },
    
    getAppToken: function() {
        // 네이티브 저장소에서 토큰 가져오기
        window.plugins.nativeStorage.getItem("authToken", 
            function(token) {
                // 토큰 저장
                N.context.attr("app").token = token;
                
                // 통신 필터에 토큰 적용
                N.comm.filters.add({
                    request: function(request) {
                        request.options.headers = request.options.headers || {};
                        request.options.headers["Authorization"] = "Bearer " + token;
                        return request;
                    }
                });
            }, 
            function(error) {
                console.log("토큰이 없습니다. 로그인 필요");
                // 로그인 화면으로 이동
                app.navigateToLogin();
            }
        );
    },
    
    loadMainScreen: function() {
        // 메인 화면 로드
        N("#app").html('<div class="main-screen"></div>');
        
        // 컨트롤러 초기화
        N(".main-screen").cont({
            init: function(view, request) {
                // 메인 화면 초기화
                this.loadContent();
            },
            
            loadContent: function() {
                // 환경에 따라 다른 콘텐츠 로드
                if (app.isHybridApp) {
                    // 앱용 UI 표시
                    this.loadAppUI();
                } else {
                    // 웹용 UI 표시
                    this.loadWebUI();
                }
            },
            
            loadAppUI: function() {
                // 앱용 UI 로드
            },
            
            loadWebUI: function() {
                // 웹용 UI 로드
            }
        });
    },
    
    onBackKeyDown: function() {
        // 뒤로 가기 버튼 처리
        if (this.canGoBack()) {
            this.navigateBack();
        } else {
            // 앱 종료 확인
            N.confirm("앱을 종료하시겠습니까?").show()
                .done(function() {
                    navigator.app.exitApp();
                });
        }
    },
    
    canGoBack: function() {
        // 뒤로 갈 수 있는 상태인지 확인
        return false; // 구현 필요
    },
    
    navigateBack: function() {
        // 이전 화면으로 이동
    },
    
    navigateToLogin: function() {
        // 로그인 화면으로 이동
    },
    
    onResume: function() {
        // 앱이 포그라운드로 돌아올 때
        console.log("App resumed");
        
        // 데이터 새로 고침 등의 작업
        this.refreshData();
    },
    
    onPause: function() {
        // 앱이 백그라운드로 갈 때
        console.log("App paused");
        
        // 데이터 저장 등의 작업
        this.saveAppState();
    },
    
    refreshData: function() {
        // 데이터 새로 고침
    },
    
    saveAppState: function() {
        // 앱 상태 저장
    }
};

// 앱 초기화
app.initialize();
```

## 모바일 웹앱 구현 예제

### 모바일 목록-상세 화면 패턴

```javascript
// 모바일 목록-상세 패턴 구현
const mobileListDetailCont = N(".mobile-list-detail").cont({
    // 컴포넌트 선언
    "p.grid.list": {
        height: window.innerHeight * 0.5,
        select: true,
        windowScrollLock: true,
        scrollPaging: {
            size: 30
        }
    },
    
    "p.form.detail": {
        validate: true
    },
    
    "c.getList": {
        url: "api/items",
        cache: false
    },
    
    "c.getDetail": {
        url: "api/item/detail",
        cache: false
    },
    
    "c.saveDetail": {
        url: "api/item/save",
        contentType: "application/json"
    },
    
    // 상태 변수
    isDetailMode: false,
    
    // 초기화
    init: function(view, request) {
        this.loadList();
        this.bindEvents();
    },
    
    // 목록 로드
    loadList: function() {
        const self = this;
        const grid = this["p.grid.list"];
        
        N.comm(this["c.getList"]).submit().done(function(data) {
            grid.bind(data);
            
            // 첫 번째 항목 선택 (있는 경우)
            if (data.length > 0) {
                grid.select(0);
            }
        });
    },
    
    // 상세 정보 로드
    loadDetail: function(itemId) {
        const self = this;
        const form = this["p.form.detail"];
        
        N.comm(this["c.getDetail"], { id: itemId }).submit().done(function(data) {
            form.val(data);
            
            // 상세 모드로 전환
            if (N.browser.isMobile() && !self.isDetailMode) {
                self.showDetailView();
            }
        });
    },
    
    // 이벤트 바인딩
    bindEvents: function() {
        const self = this;
        const grid = this["p.grid.list"];
        const form = this["p.form.detail"];
        
        // 그리드 선택 이벤트
        grid.setOption({
            onSelect: function(rowIdx, rowEle, rowData) {
                self.loadDetail(rowData.id);
            }
        });
        
        // 저장 버튼
        N("#saveBtn", this.view).on("tap", function() {
            if (form.validate()) {
                self.saveDetail();
            }
        });
        
        // 뒤로 가기 버튼 (모바일 상세 화면에서만 표시)
        N("#backBtn", this.view).on("tap", function() {
            self.showListView();
        });
        
        // 창 크기 변경 이벤트
        N(window).on("resize", function() {
            self.adjustLayout();
        });
        
        // 초기 레이아웃 설정
        this.adjustLayout();
    },
    
    // 상세 정보 저장
    saveDetail: function() {
        const self = this;
        const form = this["p.form.detail"];
        const formData = form.val();
        
        N.comm(this["c.saveDetail"], formData).submit().done(function(data) {
            N.alert("저장되었습니다.").show();
            
            // 목록 새로고침
            self.loadList();
            
            // 모바일에서는 목록 화면으로 돌아가기
            if (N.browser.isMobile() && self.isDetailMode) {
                self.showListView();
            }
        });
    },
    
    // 레이아웃 조정
    adjustLayout: function() {
        const windowWidth = window.innerWidth;
        
        if (windowWidth < 768) {
            // 모바일 레이아웃
            N(".list-container", this.view).css("width", "100%");
            N(".detail-container", this.view).css("width", "100%");
            
            // 초기에는 목록만 표시
            if (!this.isDetailMode) {
                N(".detail-container", this.view).hide();
            } else {
                N(".list-container", this.view).hide();
            }
            
            // 뒤로 가기 버튼 표시
            N("#backBtn", this.view).show();
        } else {
            // 데스크톱 레이아웃 (분할 화면)
            N(".list-container", this.view).css("width", "40%").show();
            N(".detail-container", this.view).css("width", "60%").show();
            
            // 뒤로 가기 버튼 숨김
            N("#backBtn", this.view).hide();
            
            // 항상 양쪽 다 표시
            this.isDetailMode = false;
        }
        
        // 그리드 높이 조정
        const grid = this["p.grid.list"];
        grid.setOption({
            height: window.innerHeight * (windowWidth < 768 ? 0.7 : 0.5)
        });
    },
    
    // 상세 화면 표시 (모바일)
    showDetailView: function() {
        N(".list-container", this.view).hide();
        N(".detail-container", this.view).show();
        this.isDetailMode = true;
    },
    
    // 목록 화면 표시 (모바일)
    showListView: function() {
        N(".detail-container", this.view).hide();
        N(".list-container", this.view).show();
        this.isDetailMode = false;
    }
});
```

### 모바일 탭 네비게이션

```javascript
// 모바일 탭 네비게이션 구현
const mobileTabController = N(".mobile-tabs").cont({
    // 컴포넌트 선언
    "p.tab.main": {
        context: "#mainTab",
        // 탭 컨텐츠 로드 설정
        contentLoad: function(context, cld) {
            switch (context.find("> div").attr("id")) {
                case "home":
                    cld.load("html/mobile/home.html");
                    break;
                case "search":
                    cld.load("html/mobile/search.html");
                    break;
                case "favorites":
                    cld.load("html/mobile/favorites.html");
                    break;
                case "profile":
                    cld.load("html/mobile/profile.html");
                    break;
            }
        },
        autoHeight: true
    },
    
    // 초기화
    init: function(view, request) {
        this.setupTabBar();
        this.bindTabEvents();
        
        // 초기 탭 선택
        this.selectTab("home");
    },
    
    // 탭 바 설정
    setupTabBar: function() {
        // 모바일에 최적화된 탭 바 스타일링
        N(".tab-bar", this.view).css({
            "position": "fixed",
            "bottom": "0",
            "left": "0",
            "width": "100%",
            "height": "56px",
            "background-color": "#fff",
            "box-shadow": "0 -2px 5px rgba(0,0,0,0.1)",
            "display": "flex",
            "justify-content": "space-around",
            "align-items": "center",
            "z-index": "1000"
        });
        
        // 탭 콘텐츠 영역 조정
        N(".tab-content", this.view).css({
            "padding-bottom": "70px"
        });
    },
    
    // 탭 이벤트 바인딩
    bindTabEvents: function() {
        const self = this;
        
        // 각 탭 버튼에 이벤트 바인딩
        N(".tab-button", this.view).each(function() {
            const tabId = N(this).data("tab");
            
            N(this).on("tap", function() {
                self.selectTab(tabId);
            });
        });
    },
    
    // 탭 선택
    selectTab: function(tabId) {
        const tab = this["p.tab.main"];
        
        // 탭 활성화
        tab.activeTab(tabId);
        
        // 탭 버튼 UI 업데이트
        N(".tab-button", this.view).removeClass("active");
        N(".tab-button[data-tab='" + tabId + "']", this.view).addClass("active");
    }
});
```

## 모바일 환경 문제 해결

### 일반적인 문제와 해결책

#### 1. 터치 이벤트 지연 (300ms 지연)

**문제**: 모바일 브라우저에서 탭 이벤트에 약 300ms의 지연이 발생합니다.

**해결책**:
```javascript
// fastclick 라이브러리 사용
document.addEventListener('DOMContentLoaded', function() {
    FastClick.attach(document.body);
}, false);

// 또는 CSS를 사용한 해결책
html {
    touch-action: manipulation;
}
```

#### 2. 가상 키보드 문제

**문제**: 가상 키보드가 표시될 때 화면 레이아웃이 깨집니다.

**해결책**:
```javascript
// 입력 필드에 포커스가 갈 때 레이아웃 조정
N("input, textarea", view).on("focus", function() {
    // 스크롤 위치 조정
    setTimeout(function() {
        window.scrollTo(0, N(activeElement).offset().top - 100);
    }, 300);
});

// 입력 필드에서 포커스가 벗어날 때 레이아웃 복원
N("input, textarea", view).on("blur", function() {
    // 필요한 경우 레이아웃 복원
});
```

#### 3. 과도한 메모리 사용

**문제**: 대용량 데이터나 많은 DOM 요소로 인한 메모리 문제가 발생합니다.

**해결책**:
```javascript
// 뷰가 언로드될 때 메모리 정리
const memoryOptimizedCont = N(".memory-intensive-page").cont({
    init: function(view, request) {
        this.loadData();
    },
    
    loadData: function() {
        // 데이터 로드 및 DOM 생성
    },
    
    // 뷰가 언로드될 때 정리
    destroy: function() {
        // 참조 해제
        this.largeData = null;
        
        // 이벤트 핸들러 제거
        this.view.find("*").off();
        
        // 타이머 정리
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        // 컴포넌트 정리
        if (this["p.grid.list"]) {
            this["p.grid.list"].destroy();
        }
    }
});
```

#### 4. 오프라인 지원

**문제**: 네트워크 연결이 불안정한 환경에서 앱이 제대로 작동하지 않습니다.

**해결책**:
```javascript
// 오프라인 상태 감지 및 처리
N(window).on("online", function() {
    N.notify.add("온라인 상태로 전환되었습니다.").show();
    
    // 저장된 오프라인 데이터 서버에 동기화
    syncOfflineData();
});

N(window).on("offline", function() {
    N.notify.add("오프라인 상태로 전환되었습니다. 제한된 기능으로 작동합니다.").show();
    
    // 오프라인 모드로 전환
    enableOfflineMode();
});

// 오프라인 데이터 저장
function saveOfflineData(key, data) {
    localStorage.setItem("offline_" + key, JSON.stringify(data));
}

// 오프라인 데이터 로드
function loadOfflineData(key) {
    const data = localStorage.getItem("offline_" + key);
    return data ? JSON.parse(data) : null;
}

// 오프라인 데이터 동기화
function syncOfflineData() {
    // 저장된 오프라인 트랜잭션 가져오기
    const transactions = loadOfflineData("transactions") || [];
    
    // 각 트랜잭션 처리
    transactions.forEach(function(transaction, index) {
        N.comm(transaction.comm, transaction.data).submit()
            .done(function() {
                // 성공적으로 동기화된 트랜잭션 제거
                transactions.splice(index, 1);
                saveOfflineData("transactions", transactions);
            });
    });
}
```

---

이 가이드를 통해 Natural-JS를 모바일 환경에서 효과적으로 활용하는 방법을 익힐 수 있습니다. 모바일 환경의 특성을 고려한 UI 최적화, 성능 최적화, 터치 이벤트 처리 등의 기법을 적용하면 사용자에게 더 나은 모바일 웹 경험을 제공할 수 있습니다.
