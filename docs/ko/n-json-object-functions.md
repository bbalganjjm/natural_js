# N.json 객체의 함수

N.json은 json object 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.json.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

## N.json.mergeJsonArray

**반환**: json object array

json object가 담겨 있는 array 두 개를 병합합니다.

arr1 인수를 기준으로 arr2 인수를 병합하고 중복된 요소를 제외합니다.

세 번째 인수로 오브젝트의 프로퍼티명을 지정하면 해당 프로퍼티를 기준으로 중복된 요소를 제외합니다.

arr1 인수로 지정한 객체는 병합되더라도 메모리 참조는 변경되지 않습니다.

### 매개변수

#### arr1

**Type**: json object array

원본 json object array를 입력합니다.

#### arr2

**Type**: json object array

병합할 json object array를 입력합니다.

#### key

**Type**: string

병합할 기준 프로퍼티명(필수 인수 아님)을 입력합니다.

## N.json.format

**반환**: string

json object를 보기 좋게 formatting 해 줍니다.

### 매개변수

#### obj

**Type**: json object array | json object

json object 나 json object가 저장되어 있는 array를 입력합니다.

#### indent

**Type**: number

들여 쓰기 될 공백 수를 입력합니다.
