# 말랑저금통 🐷

어린이들이 디지털 화면을 통해 저축하는 재미를 느끼고 스스로 용돈을 관리하는 습관을 기를 수 있는 웹 기반 어린이 저금통 서비스입니다.

---

## 🚀 비전문가용 실행 방법

컴퓨터에 Node.js(버전 20 이상)가 설치되어 있다면 아래 순서대로 따라 해 주세요.

### 1. 프로그램 준비하기
이 프로젝트 폴더를 컴퓨터에 다운로드(또는 압축 해제)한 뒤, 터미널(명령 프롬프트)을 열고 해당 폴더로 이동합니다.

### 2. 필요한 도구 설치하기
아래 명령어를 입력하고 엔터를 누릅니다.
```bash
npm install
```

### 3. 환경 변수 설정하기
폴더 안에 `.env.example` 파일을 복사하여 `.env.local` 파일로 이름을 바꿉니다. 그리고 사용 중인 Supabase 프로젝트 정보를 입력합니다.
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```
*(주의: Supabase 데이터베이스 설정에서 `supabase/migrations/001_initial_schema.sql` 스크립트를 먼저 실행해 테이블을 생성해 주세요.)*

### 4. 프로그램 실행하기 (개발 모드)
아래 명령어를 입력하면 웹사이트가 실행됩니다.
```bash
npm run dev
```
웹브라우저를 열고 `http://localhost:3000` 주소로 접속하면 말랑저금통을 이용할 수 있습니다!

### 5. 테스트 실행하기
자동화된 테스트를 실행하려면 아래 명령어를 입력합니다.
```bash
npm test
```
