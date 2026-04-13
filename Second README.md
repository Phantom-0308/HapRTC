# About HapRTC
This project is based on code from [https://github.com/itpotatoes/HapRTC].<br>
Used with permission from the original author.<br>
This repository is not licensed for redistribution without permission.<br>

___

이 프로젝트는 **WebRTC** 기반의 실시간 통신 시스템입니다.<br>
기존 코드는 Windows 및 특정 도메인의 SSL 설정에 맞춰져 있습니다.<br>
해당 코드는 맥북 로컬 환경에서 실행하기 위해 수정되었습니다.

## 1. Node.js 설치 및 확인
자바스크립트 실행을 위한 환경 조성
```bash
#Node.js 설치 (Homebrew 이용)
brew install node

#설치 확인
node -v
```

## 2. Client 관점
프로젝트 구동에 필요한 라이브러리 설치
```bash
#프로젝트 폴더로 이동
cd ~/폴더명/HapRTC-master

#메인 패키지 설치 (최초 1회)
npm install
```

## 3. Server 관점
사용자 간 신호를 중계하는 통신 서버를 가동
```bash
#서버 폴더로 이동
cd 폴더명 server

#서버용 패키지 설치 (최초 1회)
npm install

#서버 가동
node server.js
```

## 4. 접속 및 사용 방법
서버가 구동 중인 상태에서 브라우저를 통해 접속
```bash
#브라우저 주소창에 아래 주소를 입력합니다.
주소: http://localhost:3030
```
