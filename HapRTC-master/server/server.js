const express = require('express');
const http = require('http'); // https 대신 http 사용
const path = require('path');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../')));

//SSL/HTTPS 관련 코드 제거
const server = http.createServer(app); // options 없이 바로 app 전달
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let rooms = {};

io.on('connection', (socket) => {
  console.log('새 클라이언트 연결:', socket.id);

  socket.on('join_room', ({ roomId, nickname }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { name: `${nickname}'s Room`, users: [] };
    }
    
    rooms[roomId].users.push({ id: socket.id, nickname });
    socket.join(roomId);
    socket.nickname = nickname;
    console.log(`클라이언트 ${nickname}(${socket.id})가 방 ${roomId}에 참가했습니다`);

    socket.to(roomId).emit('user_connected', { id: socket.id, nickname });

    const otherUsers = rooms[roomId].users.filter(user => user.id !== socket.id);
    io.to(socket.id).emit('update_user_list', otherUsers);

    socket.on('disconnect', () => {
      console.log(`클라이언트 ${nickname}(${socket.id}) 연결 해제`);
      if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== socket.id);
        if (rooms[roomId].users.length === 0) {
          delete rooms[roomId];
        } else {
          io.in(roomId).emit('user_disconnected', nickname);
          io.in(roomId).emit('update_user_list', rooms[roomId].users);
        }
      }
    });

    // WebRTC 시그널링 (Offer, Answer, ICE)
    socket.on('offer', (data) => {
      if (data.targetUserId && data.targetUserId !== socket.id) {
        socket.to(data.targetUserId).emit('offer', { 
          userId: socket.id, nickname, sdp: data.sdp 
        });
      }
    });

    socket.on('answer', (data) => {
      if (data.targetUserId && data.targetUserId !== socket.id) {
        socket.to(data.targetUserId).emit('answer', { 
          userId: socket.id, nickname, sdp: data.sdp 
        });
      }
    });

    socket.on('ice-candidate', (data) => {
      if (data.targetUserId && data.targetUserId !== socket.id) {
        socket.to(data.targetUserId).emit('ice-candidate', { 
          userId: socket.id, nickname, candidate: data.candidate 
        });
      }
    });
  
    socket.on('timeSyncPing', ({ clientSendTime }) => {
      const serverTime = Date.now();
      socket.emit('timeSyncPong', { serverTime, clientSendTime });
    });

    socket.on('coords_from_a', (data) => {
      data.users.forEach((user) => {
        const targetSocket = rooms[data.roomId]?.users.find(u => u.nickname === user);
        if (targetSocket) {
          socket.to(targetSocket.id).emit('coords_to_b', data);
        }
      });
    });

    socket.on('path_from_a', (data) => {
      data.users.forEach((user) => {
        const targetSocket = rooms[data.roomId]?.users.find(u => u.nickname === user);
        if (targetSocket) {
          socket.to(targetSocket.id).emit('path_to_b', data);
        }
      });
    });

    socket.on('log', (msg) => {
      console.log(`Log from ${nickname}(${socket.id}): ${msg}`);
    });
  });
});

app.get('/generate_room', (req, res) => {
  try {
    const nickname = req.query.nickname || 'Unknown';
    const roomId = uuidv4();
    rooms[roomId] = { name: `${nickname}'s Room`, users: [] };
    res.json({ roomId, roomName: rooms[roomId].name });
  } catch (error) {
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

app.get('/rooms', (req, res) => {
  try {
    const availableRooms = Object.keys(rooms).map(roomId => ({
      roomId,
      roomName: rooms[roomId].name,
      users: rooms[roomId].users
    }));
    res.json({ rooms: availableRooms });
  } catch (error) {
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

const PORT = process.env.PORT || 3030;
server.listen(PORT, () => {
  console.log(`HTTP 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});