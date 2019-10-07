개요
===

Communication Filter 는 N.comm 을 통해 서버와 통신하는 모든 요청과 응답 또는 에러 발생 단계에서 공통 로직을 실행 할 수 있는 기능 입니다.

필터의 선언은 [Config(N.config)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s) 의 N.context.attr("architecture").comm.filters 객체의 속성에 정의 할 수 있고 필터의 단계는 다음과 같습니다.
* **beforeInit** : N.comm 이 초기화되기 전에 실행 됩니다.
* **afterInit** : N.comm 이 초기화 된 후에 실행 됩니다.
* **beforeSend** : 서버에 요청을 보내기 전에 실행 됩니다.
* **success** : 서버에서 성공 응답이 전달 됐을 때 실행 됩니다.
* **error** : 서버에서 에러 응답이 전달 됐을 때 실행 됩니다.
* **complete** : 서버의 응답이 완료 되면 실행됩니다.

<p class="alert">N.comm 대신 jQuery.ajax 를 사용하면 Communication Filter 를 사용 할 수 없습니다.</p>