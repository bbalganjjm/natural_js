개요
===

Natural-ARCHITECTURE 는 Controller object 를 대상으로 AOP(Aspect-Oriented Programming) 를 지원 합니다.

AOP 선언은 [Config(N.config)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s) 의 N.context.attr("architecture").cont.pointcuts 객체와 N.context.attr("architecture").cont.advisors 속성에 정의 할 수 있고 pointcut 으로 대상 Controller object 를 지정 하고 before / after / around / error adviceType 을 지정 하여 공통 로직을 실행 할 수 있습니다.

<p class="alert">Natural-JS 의 AOP 를 사용하면 UI 개발의 반복 되는 로직들을 공통화하거나 템플릿화 할 수 있어서 개발 생산성이 크게 향상 됩니다.</p>
<p class="alert">컨트롤러로 정의된 객체의 메서드를 new 연산자를 통해 객체 인스턴스화 하여 사용하면 오류가 발생 합니다. 이런경우 pointcut 에서 해당 함수를 제외 바랍니다.	</p>