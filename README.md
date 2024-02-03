# 지갑 톡톡 (가계부 웹) :blue_book:
![지갑 톡톡 홈 화면](./img/지갑%20톡톡.png)

<br>

## 기능
- 달력
- 각각의 날짜에 대한 금액 표시 및 관리 (카드지출과 현금지출 분리)
- 총 금액 표시
<br>

## Development Environment
- 프론트엔드
<img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white">
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
- 백엔드
<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">
<img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white">
<img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
<br>

## 어려웠던 점(그걸 통해 배운점)

### 서버파일과 클라이언트파일의 연결
- 원래는 lib폴더안에 template.js를 만들어 함수로 클라이언트파일을 만들었는데 그렇게 하다보니 서버측에서 클라이언트로 동적 데이터를 넘길때 불편한 경우가 많았다.
JavaScript 템플릿 리터럴에서는 템플릿 문자열 내부에 줄바꿈을 포함해도 구문 측면에서 문제가 발생하지 않지만 HTML에서 들여쓰기가 있을때 공백을 렌더링해 발생하는 오류라던지
함수의 return 값으로 `` 백틱안의 html파일을 주었는데 그안에서도 백틱을 이용해야 편리한 부분들이 많았다 하지만 백틱안에서 백틱을 사용하지 못하는 한계가 있었고 해당 어려움을
뷰엔진을 사용하여 서버파일과 클라이언트파일의 연결을 좀더 매끄럽게 할 수 있었다.


### 데이터베이스 구조 설계의 중요성
- 만들면서 가장 어려웠던 것 중 하나가 달력의 각 날짜에 지출한 금액을 다 다르게 표시되게 하는 것이였다.
ejs파일에서는 데이터베이스를 사용할수 없어서 main파일에서 데이터베이스 구조를 잘 설계해놔야 각각의 날짜와 맞는 금액을
표시되게 할수 있었다. 처음에는 아무것도 없는 테이블에다가 create를 할때 생겨나게 하는 방식을 사용했었다.
하지만 이런 방식을 사용하면 create를 하기전에 웹에 표시될때 정의되지 않아 오류가 나는 부분이 많았다.
 따라서 나는 웹을 실행하면 현재 월에 해당하는 테이블을 만들고 기본적으로 그안에 id, date와 금액을 초기화 해놨었다 (date는 각 날짜 금액은 다 0으로)
이렇게 해놓고 create를 할 경우 해당되는 날짜의 값이 수정되는 UPDATE쿼리문으로 수정하였다. 
해당 방법을 통해 정리를 하니 ejs파일에서 데이터베이스의 값을 main에서 가져와 사용할때 id값이 결국 day값과 동일하게 만들어 
연결을 쉽게 하였다.





클라이언트쪽에서 현재 달과 년도에 관한 정보를 서버로 넘겨야함 
해결완료

클라이언트에서 서버로 데이터를 전송하면 서버는 데이터베이스에서 업데이트 된 데이터를 가져와서 클라이언트에 재전송해야됨 // 소켓통신을 통해 데이터 재전송은 해결
fetch가 클라이언트에서 서버로 데이터를 요청하는거라면 웹소켓은 서버와 클라이언트의 통신(전화같은 느낌)
이걸로 달력을 다시 생성해야함   // 클라이언트쪽 웹소켓의 콜백함수에 달력을 그리는 함수를 다시 호출하여 해결완료


데이터베이스에 테이블이 없는 상태로 처음 접속했을때 달력이 제대로 표시되지 않는 현상
// 처음 서버를 열때 현재 달과 +1 -1달 테이블을 만들어놔 초기 웹 달력을 표시하고 다음달이나 이전달을 누를때마다 또 앞뒤로 +1 -1 테이블을 만들어 해결

현재달이 아닌쪽에서 create를 했을때 리다이렉트를 create를 한 달로 리다이렉트하기
ex: 현재달 : 2024년 1월 , create한 달 : 2024년 2월 => create를 했을때 1월로 돌아가지 않고 2월로 리다이렉트
세션을 추가햇지만 아직 해결 안됨   2월로 돌아가는것까지는 성공 다만 데이터가 1월것이 뜨므로 서버쪽 수정 필요


### 만들어본 후기
- nodejs를 간단하게 배우고 뭐라도 만들고 싶은 생각에 만들게 되었다. 처음으로 만들어본 개인 프로젝트이기도 하고 개발하기전 기본적인 설계에 대한 이론적인 개념을 모른 상태에서 하나의 어플리케이션을 만들어본다는것과 기능이 동작하고 오류가 안나는것에만 집중해 코드가 정리가 안되어있고 난잡하다. 모르는 부분은 검색을 해보거나 chatgpt를 통해 찾아보면서 만들었다. 다음에 프로젝트를 하게되면 데이터베이스 구조부터 mvc패턴 등 다양한 설계에 대한 이론을 공부하고 제대로 정리된 코드를 만들어 볼 것이다.
