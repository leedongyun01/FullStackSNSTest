# Full-Stack SNS Project

이 프로젝트는 React와 Express를 기반으로 한 풀스택 SNS 애플리케이션입니다. 사용자는 회원가입 및 로그인을 통해 게시물을 업로드하고, 다른 사용자의 게시물에 댓글을 달거나 좋아요를 누를 수 있습니다.

---

## 🚀 핵심 기능

- **사용자 인증 (Auth)**
  - 회원가입 및 로그인 기능
  - React Context API를 이용한 로그인 상태 관리 (새로고침 시 유지)
- **게시물 관리 (Posts)**
  - 사진과 함께 게시물 업로드 (Multer 라이브러리 활용)
  - 전체 게시물 목록 조회 및 상세 페이지 확인
  - 본인 게시물 삭제 기능
- **상호작용 (Interaction)**
  - 게시물 좋아요 (Toggle) 기능
  - 댓글 작성, 수정 및 삭제 (CRUD) 기능
- **마이페이지 (My Page)**
  - 로그인한 사용자의 정보 확인

## 🛠 사용 기술

### Frontend
- **React 19**: 최신 버전의 React를 사용한 UI 컴포넌트 기반 개발
- **React Router 7**: 클라이언트 사이드 라우팅 및 동적 경로 처리
- **Context API**: 전역 사용자 인증 상태 관리
- **Vanilla CSS**: CSS 변수 및 모듈화된 스타일링 (`styles/` 폴더 분리)

### Backend
- **Node.js & Express**: RESTful API 서버 구축
- **MySQL (mysql2)**: 관계형 데이터베이스 관리 및 연결 풀(Pool) 사용
- **Multer**: 서버 로컬 스토리지 기반 파일 업로드 처리
- **UUID**: 사용자, 게시물, 댓글의 고유 ID 생성
- **dotenv**: 환경 변수 관리

## 💾 데이터베이스 구조

- **users**: 사용자 정보 (userId, email, name, password)
- **posts**: 게시물 정보 (postId, userId, title, caption, imageUrl, createdAt)
- **likes**: 게시물 좋아요 정보 (postId, userId - Composite PK)
- **comments**: 댓글 정보 (commentId, postId, userId, content, createdAt)

## 💡 기술적 도전 및 성과

- **이미지 업로드 시스템 구축**: `Multer`를 사용하여 서버 내 로컬 폴더에 이미지를 저장하고, `Express static` 미들웨어를 통해 클라이언트에 정적 파일을 제공하는 프로세스를 직접 구현했습니다.
- **데이터베이스 정규화 및 연동**: MySQL을 사용하여 테이블 간의 관계(FK, Cascade Delete 등)를 정의하고, `mysql2/promise` 라이브러리를 통해 비동기식 쿼리 처리를 안정화했습니다.
- **컴포넌트 기반 아키텍처**: 기능별로 React 컴포넌트를 세분화(Login, Signup, List, Post, Comment 등)하여 가독성과 유지보수성을 높였습니다.
- **서버 초기화 로직**: `initDb` 함수를 통해 서버 시작 시 필요한 테이블이 자동으로 생성되도록 설계하여 배포 및 초기 세팅의 편의성을 개선했습니다.

## 📈 개선 예정 사항

- **보안 강화**: 현재 평문으로 저장되는 비밀번호를 `bcrypt`를 이용해 암호화하고, JWT(JSON Web Token) 기반의 인증 방식을 도입할 예정입니다.
- **이미지 최적화**: 업로드 시 이미지 리사이징 기능을 추가하여 서버 저장 공간 및 대역폭을 효율적으로 관리할 예정입니다.
- **UI/UX 고도화**: 반응형 디자인 보완 및 다양한 애니메이션 효과 추가를 통해 사용자 경험을 개선할 계획입니다.
- **배포**: AWS나 Vercel/Render 등을 활용한 실제 서비스 배포를 준비 중입니다.

## ⚙️ 시작하기

### 환경 변수 설정
`backend` 폴더에 `.env` 파일을 생성하고 다음 정보를 입력해야 합니다.
```env
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database_name
PORT=5000
```

### 설치 및 실행

1. **Backend**
   ```bash
   cd backend
   npm install
   node server.js
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```
