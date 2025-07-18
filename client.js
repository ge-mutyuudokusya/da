const socket = io();
let yourName = '';

function join() {
  yourName = document.getElementById('name').value;
  socket.emit('join', yourName);
  document.getElementById('login').style.display = 'none';
}

socket.on('start', (opponentName) => {
  document.getElementById('game').style.display = 'block';
  document.getElementById('opponent').innerText = `${opponentName} と対戦中！`;
});

function sendHand(hand) {
  socket.emit('hand', hand);
  document.getElementById('result').innerText = '相手の手を待っています...';
}

socket.on('result', (data) => {
  let text = `あなた：${display(data.you)}　相手：${display(data.opponent)}\n結果：${resultText(data.result)}`;
  document.getElementById('result').innerText = text;
});

socket.on('reset', () => {
  alert('相手が切断しました');
  location.reload();
});

function display(hand) {
  return { rock: 'グー', paper: 'パー', scissors: 'チョキ' }[hand];
}

function resultText(result) {
  return { win: '勝ち！', lose: '負け…', draw: 'あいこ' }[result];
}