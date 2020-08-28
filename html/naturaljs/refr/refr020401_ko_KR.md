개요
===

Communicator.request 는 N.comm 이 초기화 될 때마다 생성 되는 요청 정보 객체입니다.

N.comm() 함수의 옵션은 Communicator.request.options 객체에 저장이 되어 서버 요청의 헤더나 파라미터로 전달 됩니다.

페이지 파일을 요청하면 Controller object의 init 함수의 두번째 인자나 Controller object의 멤버 변수(this.request)로 전달 됩니다. 전달된 request 객체로 요청 정보를 확인 하거나 페이지 파라미터를 전달 받을 수 있습니다.