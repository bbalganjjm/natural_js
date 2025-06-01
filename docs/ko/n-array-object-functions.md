# N.array 객체의 함수

N.array은 배열 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.array.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

## N.array.deduplicate

**반환**: array

array에서 중복된 요소를 제거합니다.

array에 object가 담겨 있을 경우 두 번째 인수로 오브젝트의 프로퍼티명을 입력하면 입력한 프로퍼티를 기준으로 중복된 오브젝트를 제거합니다.

### 매개변수

#### arr

**Type**: array

중복을 제거할 array를 입력합니다.

#### key

**Type**: string

array에 object가 저장되어 있을 경우 중복된 요소를 제거할 기준 프로퍼티명을 입력합니다.
