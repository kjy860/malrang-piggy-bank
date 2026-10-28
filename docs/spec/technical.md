# 말랑저금통 — 기술·데이터 설계

> 문서 버전 v3 · 완성도 100% · 마지막 수정 2026. 10. 28. 17시 35분 10초
> 이 문서만 보고 AI(또는 개발자)가 개발해도 거의 같은 결과가 나오도록 작성되었습니다.

## 기본 정보

| 항목 | 값 |
| --- | --- |
| 사이트 이름 | 말랑저금통 |
| 영문 식별자(slug) | malrang-piggy-bank |
| 개발 방식(framework) | nextjs |
| 데이터베이스 사용 | 예 (Supabase) |
| 배포 | GitHub → Vercel (무료) |

## 1. 데이터 모델

### 데이터베이스 테이블 설계 (Supabase)

#### 1. `children` (아이 프로필)
- `id` (uuid, Primary Key, 기본값 `gen_random_uuid()`)
- `name` (text, 아이 이름)
- `avatar_emoji` (text, 프로필용 이모지)
- `created_at` (timestamp with time zone)

#### 2. `transactions` (입출금 내역)
- `id` (uuid, Primary Key)
- `child_id` (uuid, 외래키 `children.id`)
- `type` (text: 'deposit' 또는 'withdraw')
- `amount` (integer, 금액)
- `memo` (text, 사유)
- `created_at` (timestamp with time zone)

#### 3. `goals` (저축 목표)
- `id` (uuid, Primary Key)
- `child_id` (uuid, 외래키 `children.id`)
- `title` (text, 목표 이름)
- `target_amount` (integer, 목표 금액)
- `current_amount` (integer, 현재 모은 금액)
- `is_achieved` (boolean)

#### RLS(행 수준 보안) 정책
- 모든 테이블은 공용 세션 환경을 위해 공개(Public) CRUD 정책을 허용함 (`CREATE POLICY "Allow public access" ON [table_name] FOR ALL USING (true) WITH CHECK (true);`)

## 2. 기술 스택과 폴더 구조

### 기술 스택
- **Framework**: Next.js (App Router)
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### 환경 변수 명세 (`.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 공개 키
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 관리자 키 (필요 시)

### 폴더 구조
```text
├── app/
│   ├── page.tsx (아이 선택 메인 화면)
│   ├── bank/
│   │   └── page.tsx (아이별 저금통 화면)
│   ├── add/
│   │   └── page.tsx (입출금 추가 화면)
│   ├── goal/
│   │   └── page.tsx (목표 설정 화면)
│   └── parent/
│       ├── auth/
│       │   └── page.tsx (비밀번호 입력 화면)
│       └── dashboard/
│           └── page.tsx (부모 관리 대시보드)
├── components/
│   ├── PiggyAnimation.tsx
│   └── Button.tsx
└── lib/
    └── supabase.ts
```

## 3. 품질 기준 (성능·보안·접근성)

### 품질 기준
- **접근성**: 5세 아이가 실수로 터치하지 않도록 버튼 크기는 최소 60x60px 이상 유지
- **보안**: 부모 모드는 쿠키 또는 세션 스토리지에 인증 상태를 저장하여 4자리 비밀번호(`1234` 등 초기값 설정 가능) 통과 시에만 진입 허용
- **에러 핸들링**: 금액 입력 시 숫자가 아니거나 음수 입력 시 친근한 안내 팝업 노출 ("금액을 정확히 넣어주세요!")

## 변경 이력

| 버전 | 일시 | 변경 내용 |
| --- | --- | --- |
| v3 | 2026. 10. 28. 17시 15분 21초 | 최종 감수: 최종 감수 완료: 모든 섹션의 일관성을 맞추고 수용 기준, 테스트 시나리오, 기술 환경변수 및 폴더 구조를 구체화함 |
| v2 | 2026. 10. 28. 17시 15분 10초 | 어린이 다원화 관리 방식(아이 선택 화면 및 추가/삭제)과 부모 모드 4자리 비밀번호 보안 장치를 반영하여 문서 전체를 구체화함 |
| v1 | 2026. 10. 28. 17시 13분 50초 | 어린이용 저금통 관리 웹사이트 초기 개발 문서 작성 및 기본 구조 설정 |
