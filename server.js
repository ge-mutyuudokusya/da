const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];

io.on('connection', (socket) => {
  console.log('ユーザー接続:', socket.id);

  socket.on('join', (name) => {
    players.push({ id: socket.id, name, hand: null });
    if (players.length === 2) {
      io.to(players[0].id).emit('start', players[1].name);
      io.to(players[1].id).emit('start', players[0].name);
    }
  });

  socket.on('hand', (hand) => {
    const player = players.find(p => p.id === socket.id);
    if (player) player.hand = hand;

    if (players.every(p => p.hand)) {
      const [p1, p2] = players;
      const result = judge(p1.hand, p2.hand);
      io.to(p1.id).emit('result', { you: p1.hand, opponent: p2.hand, result: result[0] });
      io.to(p2.id).emit('result', { you: p2.hand, opponent: p1.hand, result: result[1] });

      // リセット
      players = players.map(p => ({ ...p, hand: null }));
    }
  });

  socket.on('disconnect', () => {
    console.log('切断:', socket.id);
    players = players.filter(p => p.id !== socket.id);
    io.emit('reset');
  });
});

function judge(h1, h2) {
  if (h1 === h2) return ['draw', 'draw'];
  if (
    (h1 === 'rock' && h2 === 'scissors') ||
    (h1 === 'scissors' && h2 === 'paper') ||
    (h1 === 'paper' && h2 === 'rock')
  ) {
    return ['win', 'lose'];
  } else {
    return ['lose', 'win'];
  }
}

server.listen(3000, () => {
  console.log('サーバー起動: http://localhost:3000');
});