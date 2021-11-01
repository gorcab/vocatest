## 1. 프로젝트 목적

- 단어 별 예문 추가 기능이 있는 영단어 암기 애플리케이션을 제작하기 위함
- frontend/backend 각각의 개발 플로우를 경험하기 위함

## 2. 기술 스택

- Frontend
  - React (Using CRA boilerplate)
  - Tailwindcss
  - Redux toolkit
  - Redux-saga
- Backend
  - Nest.js
  - MySQL

## 3. 모듈 설치 및 실행

### 1. 백엔드

- development

1. `/backend` 디렉터리에`.env.development` 파일 생성

```
/* .env.development 예시 */
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=1234
DB_DATABASE=vocatest
REDIS_HOST=localhost
REDIS_PORT=6379
SENDER_EMAIL=vocatest-emailauth@gmail.com // 회원가입, 비밀번호 재설정 이메일 인증을 위한 gmail 이메일 정보
SENDER_EMAIL_PASSWORD=emailauth1234
```

2. 데이터베이스 서버 실행 및 백엔드 서버 실행

```
// 1. docker를 통해 mysql, redis 서버 실행
docker-compose up
// 2. 모듈 종속성 설치
npm install
// 3. nest js 서버 실행
npm run start:dev
```

- test

```
// 1. docker를 통해 test용 mysql, redis 서버 실행
docker-compose -f docker-compose.test.yml up
// 2. unit test
npm run test:watch
// 3. e2e test
npm run test:e2e
```
  - 테스트는 .env.test 파일을 설정 파일로 사용한다.
