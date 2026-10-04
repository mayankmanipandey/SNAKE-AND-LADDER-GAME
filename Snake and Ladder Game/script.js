const $ = (selector) => document.querySelector(selector);

const diceFaces = ['\u2680', '\u2681', '\u2682', '\u2683', '\u2684', '\u2685'];
const playerColors = ['coral', 'violet', 'gold', 'teal'];

const maps = {
  classic: {
    name: 'Classic Garden',
    snakes: { 98: 40, 95: 75, 92: 72, 62: 19, 54: 34, 17: 7 },
    ladders: { 2: 23, 8: 31, 21: 42, 28: 56, 36: 44, 51: 67, 71: 91, 80: 99 }
  },
  sunset: {
    name: 'Sunset Valley',
    snakes: { 97: 65, 93: 73, 88: 48, 64: 36, 46: 25, 19: 5 },
    ladders: { 3: 22, 9: 38, 27: 54, 34: 61, 44: 79, 57: 76, 68: 86 }
  },
  ocean: {
    name: 'Ocean Reef',
    snakes: { 99: 78, 91: 63, 83: 52, 61: 43, 49: 11, 26: 6 },
    ladders: { 4: 29, 12: 46, 18: 39, 33: 58, 41: 62, 56: 77, 74: 95 }
  },
  forest: {
    name: 'Mystic Forest',
    snakes: { 96: 70, 89: 53, 78: 42, 67: 45, 38: 20, 16: 3 },
    ladders: { 7: 26, 13: 31, 24: 50, 35: 57, 48: 69, 59: 83, 72: 90 }
  },
  candy: {
    name: 'Candy Kingdom',
    snakes: { 94: 55, 87: 66, 79: 49, 52: 31, 43: 18, 22: 2 },
    ladders: { 5: 37, 11: 28, 20: 45, 32: 60, 47: 71, 63: 81, 76: 97 }
  },
  space: {
    name: 'Cosmic Climb',
    snakes: { 98: 61, 90: 48, 84: 64, 73: 51, 58: 24, 29: 10 },
    ladders: { 6: 35, 14: 43, 23: 41, 30: 67, 53: 74, 69: 88, 82: 96 }
  },
  volcano: {
    name: 'Volcano Run',
    snakes: { 99: 44, 86: 57, 77: 36, 65: 22, 50: 30, 18: 8 },
    ladders: { 3: 19, 10: 32, 25: 47, 39: 55, 42: 68, 60: 80, 70: 91 }
  }
};

let board = $('#board');
let playerCount = 2;
let positions = [];
let currentPlayer = 0;
let currentMap = maps.classic;
let rolling = false;
let paused = false;
let soundEnabled = true;
let volume = 0.7;
let audioContext;
let gameVersion = 0;

function chooseMap() {
  const choice = $('#mapChoice').value;
  if (choice !== 'random') return maps[choice] || maps.classic;

  const keys = Object.keys(maps);
  return maps[keys[Math.floor(Math.random() * keys.length)]];
}

function createBoard() {
  board.innerHTML = '';

  for (let row = 9; row >= 0; row -= 1) {
    const numbers = Array.from({ length: 10 }, (_, index) => row * 10 + index + 1);
    if (row % 2 === 1) numbers.reverse();

    numbers.forEach((number) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.number = number;
      cell.textContent = number;

      if (currentMap.snakes[number] || currentMap.ladders[number]) {
        cell.classList.add('special');
      }

      board.appendChild(cell);
    });
  }

  Object.entries(currentMap.ladders).forEach(([from, to]) => addDecoration('ladder', from, to));
  Object.entries(currentMap.snakes).forEach(([from, to]) => addDecoration('snake', from, to));
  renderPlayers();
}

function getCell(number) {
  return board.querySelector(`[data-number="${number}"]`);
}

function addDecoration(type, from, to) {
  const start = getCell(from);
  const end = getCell(to);
  if (!start || !end) return;

  const decoration = document.createElement('div');
  decoration.className = type;
  const startX = start.offsetLeft + start.offsetWidth / 2;
  const startY = start.offsetTop + start.offsetHeight / 2;
  const endX = end.offsetLeft + end.offsetWidth / 2;
  const endY = end.offsetTop + end.offsetHeight / 2;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const length = Math.hypot(deltaX, deltaY);
  const angle = Math.atan2(-deltaX, deltaY) * 180 / Math.PI;

  decoration.style.left = `${(startX + endX) / 2}px`;
  decoration.style.top = `${(startY + endY) / 2}px`;
  decoration.style.height = `${length}px`;
  decoration.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

  board.appendChild(decoration);
}

function renderPlayers() {
  const list = $('#playerList');
  list.innerHTML = '';
  board.querySelectorAll('.token').forEach((token) => token.remove());

  for (let index = 0; index < playerCount; index += 1) {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.id = `playerRow${index}`;
    row.innerHTML = `<span class="avatar ${playerColors[index]}">P${index + 1}</span>
      <div><strong>Player ${index + 1}</strong><small id="p${index}Pos">Start</small></div>
      <b id="p${index}Score">0</b>`;
    list.appendChild(row);

    const token = document.createElement('div');
    token.className = `token p${index + 1}`;
    token.id = `p${index + 1}`;
    token.textContent = `P${index + 1}`;
    board.appendChild(token);
  }
}

function moveToken(index, position) {
  const cell = getCell(position || 1);
  const token = $(`#p${index + 1}`);
  if (!cell || !token) return;

  token.style.left = `${cell.offsetLeft + cell.offsetWidth / 2}px`;
  token.style.top = `${cell.offsetTop + cell.offsetHeight / 2}px`;
  token.style.opacity = position ? '1' : '0.65';
}

function updateView() {
  $('#turnName').textContent = `Player ${currentPlayer + 1}`;
  $('#turnDot').style.background = `var(--${playerColors[currentPlayer]})`;

  document.querySelectorAll('.player-row').forEach((row, index) => {
    row.classList.toggle('active', index === currentPlayer);
  });

  positions.forEach((position, index) => {
    const score = $(`#p${index}Score`);
    const location = $(`#p${index}Pos`);
    if (score) score.textContent = position;
    if (location) location.textContent = position ? `Tile ${position}` : 'Start';
    moveToken(index, position);
  });
}

function playTone(kind) {
  if (!soundEnabled || volume <= 0) return;

  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  audioContext ||= new Audio();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = kind === 'dice' ? 'square' : 'sine';
  oscillator.frequency.value = kind === 'dice' ? 430 : 270;
  gain.gain.setValueAtTime(0.08 * volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.13);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.13);
}

function waitWhilePaused(version) {
  return new Promise((resolve) => {
    const check = () => {
      if (version !== gameVersion) return resolve(false);
      if (!paused) return resolve(true);
      window.setTimeout(check, 100);
    };
    check();
  });
}

async function rollDice() {
  if (rolling || paused) return;

  rolling = true;
  const version = gameVersion;
  $('#rollBtn').disabled = true;
  playTone('dice');

  const result = Math.floor(Math.random() * 6) + 1;
  $('#dice').textContent = diceFaces[result - 1];
  $('#dice').classList.add('rolling');
  $('#message').textContent = `Player ${currentPlayer + 1} rolled a ${result}!`;

  await new Promise((resolve) => window.setTimeout(resolve, 450));
  if (!(await waitWhilePaused(version))) return;
  $('#dice').classList.remove('rolling');

  const nextPosition = positions[currentPlayer] + result;
  if (nextPosition > 100) {
    $('#message').textContent = 'You need an exact roll to reach 100!';
  } else {
    positions[currentPlayer] = nextPosition;
    playTone('move');
    updateView();

    const slideTo = currentMap.ladders[nextPosition] || currentMap.snakes[nextPosition];
    if (slideTo) {
      $('#message').textContent = currentMap.ladders[nextPosition]
        ? 'A ladder boost! Climbing up!'
        : 'Oops - a snake slide!';
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      if (!(await waitWhilePaused(version))) return;
      positions[currentPlayer] = slideTo;
      playTone('move');
      updateView();
    }
  }

  if (positions[currentPlayer] === 100) {
    $('#winnerName').textContent = `Player ${currentPlayer + 1} wins!`;
    $('#winnerText').textContent = `Champion of ${currentMap.name}.`;
    $('#winnerModal').classList.remove('hidden');
    rolling = false;
    return;
  }

  currentPlayer = (currentPlayer + 1) % playerCount;
  $('#message').textContent = `Player ${currentPlayer + 1}, your move!`;
  updateView();
  rolling = false;
  $('#rollBtn').disabled = false;
}

function resetGame() {
  gameVersion += 1;
  positions = Array(playerCount).fill(0);
  currentPlayer = 0;
  rolling = false;
  paused = false;
  $('#pauseScreen').classList.add('hidden');
  $('#winnerModal').classList.add('hidden');
  $('#dice').classList.remove('rolling');
  $('#dice').textContent = diceFaces[4];
  $('#message').textContent = 'Roll the dice to start your adventure!';
  $('#rollBtn').disabled = false;
  updateView();
}

function openSetup() {
  $('#home').classList.add('hidden');
  $('#game').classList.add('hidden');
  $('#setup').classList.remove('hidden');
}

function startGame() {
  playerCount = Number($('#playerCount').value);
  currentMap = chooseMap();
  soundEnabled = $('#soundChoice').checked;
  volume = Number($('#volumeChoice').value) / 100;
  document.body.dataset.theme = $('#themeChoice').value;
  $('#mapName').textContent = currentMap.name.toUpperCase();
  $('#footerMap').textContent = currentMap.name;
  $('#setup').classList.add('hidden');
  $('#game').classList.remove('hidden');
  createBoard();
  resetGame();
}

$('#homePlay').onclick = openSetup;
$('#homeSettings').onclick = openSetup;
$('#backHome').onclick = () => {
  $('#setup').classList.add('hidden');
  $('#home').classList.remove('hidden');
};
$('#startGame').onclick = startGame;
$('#rollBtn').onclick = rollDice;
$('#restart').onclick = resetGame;
$('#newGame').onclick = openSetup;
$('#playAgain').onclick = resetGame;

$('#soundBtn').onclick = () => {
  soundEnabled = !soundEnabled;
  $('#soundBtn').textContent = soundEnabled ? '\\u{1F50A}' : '\\u{1F507}';
  $('#soundBtn').textContent = soundEnabled ? '🔊' : '🔇';
};

$('#pauseBtn').onclick = () => {
  if (!$('#winnerModal').classList.contains('hidden')) return;
  paused = !paused;
  $('#pauseScreen').classList.toggle('hidden', !paused);
  $('#rollBtn').disabled = paused || rolling;
};

$('#resumeBtn').onclick = () => $('#pauseBtn').click();
$('#volumeChoice').oninput = (event) => {
  $('#volumeValue').textContent = `${event.target.value}%`;
};

// Normalize the icon after the legacy handler so it remains encoding-safe.
$('#soundBtn').addEventListener('click', () => {
  window.setTimeout(() => {
    $('#soundBtn').textContent = soundEnabled ? '\\u{1F50A}' : '\\u{1F507}';
  }, 0);
});
