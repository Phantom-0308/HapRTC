import { BhapticsPlayer, PositionType, PathPoint } from 'tact-js';
import { io } from 'socket.io-client';

const receivedCoordsContainer = document.getElementById('receivedCoordsContainer')!;
const socket = io('https://lyj.leafserver.kr:3030');

const player = new BhapticsPlayer();
player.initialize('yourAppId', 'yourAppName');

// bHaptics 연결 상태 확인
player.addListener((msg: { status: string; message: any }) => {
    if (msg.status === 'Connected') {
        console.log('bHaptics connected');
    } else if (msg.status === 'Disconnected') {
        console.log('bHaptics disconnected');
    } else if (msg.status === 'Connecting') {
        console.log('bHaptics connecting');
    }
});

function playHapticDot(position: PositionType, index: number, intensity: number) {
    const key = 'dot';
    const points = [{
        index: index - 1,
        intensity: intensity
    }];
    const durationMillis = 1000;
    const errorCode = player.submitDot(key, position, points, durationMillis);
    if (errorCode !== 0) {
        console.error('Error in haptic playback:', errorCode);
    }
}

function playHapticPath(position: PositionType, points: number[], intensity: number) {
    const key = 'path';
    const pathPoints: PathPoint[] = points.map(point => {
        const x = ((point - 1) % 4) / 3;
        const y = Math.floor((point - 1) / 4) / 4;
        return { x, y, intensity: intensity };
    });
    const durationMillis = 1000;
    const errorCode = player.submitPath(key, position, pathPoints, durationMillis);
    if (errorCode !== 0) {
        console.error('Error in haptic playback:', errorCode);
    }
}

// 함수들을 window 객체에 바인딩
(window as any).playHapticDot = playHapticDot;
(window as any).playHapticPath = playHapticPath;

(window as any).player = player;

socket.on('coords_to_b', (coords: { title: string; mode: string; number: string; intensity: number; users: string[]; }) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `[${timestamp}] : ${coords.title}, ${coords.mode}, ${coords.number}, intensity: ${coords.intensity}, users: ${coords.users.join(',')}`;
    receivedCoordsContainer.insertBefore(logEntry, receivedCoordsContainer.firstChild);

    const position = coords.title === 'Back' ? PositionType.VestBack : PositionType.VestFront;
    const index = parseInt(coords.number);
    playHapticDot(position, index, coords.intensity);
});

socket.on('path_to_b', (data: { title: string; crossedCircles: number[]; intensity: number; users: string[]; }) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `[${timestamp}] : ${data.title}, Path, ${data.crossedCircles.join(',')}, intensity: ${data.intensity}, users: ${data.users.join(',')}`;
    receivedCoordsContainer.insertBefore(logEntry, receivedCoordsContainer.firstChild);

    const position = data.title === 'Back' ? PositionType.VestBack : PositionType.VestFront;
    playHapticPath(position, data.crossedCircles, data.intensity);
});
