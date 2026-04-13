# WebRTC-based Haptic Transmission System

WebRTC Mesh 네트워크를 통해 실시간으로 bHaptics 햅틱 피드백을 전송하는 시스템입니다.  
3D 아바타 위에서 터치한 위치의 햅틱 신호를 원격 사용자의 bHaptics 조끼/장갑에 전달합니다.

## 주요 기능

- **실시간 햅틱 전송** — 3D 아바타 클릭 → 원격 사용자 bHaptics 디바이스에 즉시 반영
- **WebRTC Mesh** — P2P DataChannel을 통한 저지연 햅틱 데이터 전송
- **영상/음성 통화** — WebRTC 기반 다자간 화상 통화 지원
- **다중 디바이스** — VestFront, VestBack, GloveL, GloveR 지원
- **3D 아바타 UI** — Three.js GLTF 모델 위 그리드 기반 햅틱 포인트 선택
- **선택적 전송** — 특정 사용자를 지정하여 햅틱 전송 가능

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | HTML, TypeScript, Three.js, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO |
| Haptics | [bHaptics tact-js SDK](https://github.com/bhaptics/tact-js) |
| Realtime | WebRTC (Mesh topology), DataChannel |
| Build | Webpack, ts-loader |

## 아키텍처

```
┌─────────────────────┐         ┌─────────────────────┐
│     Client A        │         │     Client B        │
│                     │         │                     │
│  3D Avatar (Three.js)│        │  bHaptics Player    │
│  ├─ Grid Touch      │         │  ├─ VestFront/Back  │
│  └─ Haptic Data ────┼── P2P ──┼──└─ GloveL/R        │
│                     │DataChannel│                    │
│  Video/Audio ───────┼── P2P ──┼── Video/Audio       │
└────────┬────────────┘         └────────┬────────────┘
         │ Socket.IO                     │ Socket.IO
         │ (Signaling only)              │
    ┌────┴───────────────────────────────┴────┐
    │           Signal Server                 │
    │  Express + Socket.IO                    │
    │  ├─ Room management                     │
    │  ├─ WebRTC signaling (offer/answer/ICE) │
    │  └─ Static file serving                 │
    └─────────────────────────────────────────┘
```

## 프로젝트 구조

```
bhap_ui/
├── index.html            # 로비 페이지 (방 생성/참여)
├── client_a.html         # 메인 클라이언트 (영상통화 + 햅틱 UI)
├── src/
│   └── index.ts          # bHaptics SDK 초기화 및 햅틱 재생 함수
├── server/
│   └── server.js         # Express + Socket.IO 시그널링 서버
├── scene.gltf            # 3D 아바타 모델
├── scene.bin             # 3D 아바타 바이너리 데이터
├── webpack.config.js     # Webpack 빌드 설정
├── tsconfig.json         # TypeScript 설정
└── package.json          # 클라이언트 의존성
```

## 시작하기

### 사전 요구사항

- Node.js 16+
- [bHaptics Player](https://www.bhaptics.com/support/downloads) 실행 중

### 설치

```bash
# 클라이언트 의존성 설치 및 빌드
npm install
npm run build

# 서버 의존성 설치
cd server
npm install
```

### 실행

```bash
# 서버 시작 (기본 포트: 3000)
cd server
node server.js
```

브라우저에서 `http://localhost:3000` 접속

### 사용 방법

1. 닉네임 입력 후 **Create Room** 클릭
2. 다른 사용자가 Room List에서 **Join Room** 클릭
3. 3D 아바타 위를 클릭/드래그하여 햅틱 전송
4. **Left/Right** 버튼으로 아바타 회전 (Front → Left → Back → Right)
5. **Send Haptic To** 체크박스로 전송 대상 선택

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `3000` | 서버 리스닝 포트 |

## 라이선스

MIT
