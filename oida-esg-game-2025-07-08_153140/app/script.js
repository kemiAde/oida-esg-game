// --- Background Canvas Setup ---
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;

const colors = [
  '#E53935',
  '#FB8C00',
  '#FDD835',
  '#1E88E5',
  '#90A4AE',
  '#43A047',
];
const safetyImageURLs = [
  'https://cdn.glitch.global/c48d7256-1d1f-413f-88c1-30356b4eb7d2/thumbnails%2Fshield.png?1751967871450',
  'https://cdn.glitch.global/c48d7256-1d1f-413f-88c1-30356b4eb7d2/thumbnails%2Fwarning-sign.png?1751967883269',
  'https://cdn.glitch.global/c48d7256-1d1f-413f-88c1-30356b4eb7d2/thumbnails%2Fdefence.png?1751967888570',
  'https://cdn.glitch.global/c48d7256-1d1f-413f-88c1-30356b4eb7d2/thumbnails%2Fhelmet.png?1751967891726',
  'https://cdn.glitch.global/c48d7256-1d1f-413f-88c1-30356b4eb7d2/thumbnails%2Fradiation.png?1751967892400',
];

const balls = [],
  signs = [];

// Create moving balls
for (let i = 0; i < 15; i++) {
  balls.push({
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    radius: 25 + Math.random() * 5,
    color: colors[i % colors.length],
    dx: (Math.random() - 0.5) * 1.5,
    dy: (Math.random() - 0.5) * 1.5,
  });
}

// Create safety signs
for (let url of safetyImageURLs) {
  const img = new Image();
  img.src = url;
  signs.push({
    img: img,
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    dx: (Math.random() - 0.5) * 1.2,
    dy: (Math.random() - 0.5) * 1.2,
    width: 40,
    height: 40,
  });
}

function animateBG() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  balls.forEach((ball) => {
    bgCtx.beginPath();
    bgCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    bgCtx.strokeStyle = ball.color;
    bgCtx.lineWidth = 2;
    bgCtx.stroke();

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > bgCanvas.width || ball.x - ball.radius < 0)
      ball.dx = -ball.dx;
    if (ball.y + ball.radius > bgCanvas.height || ball.y - ball.radius < 0)
      ball.dy = -ball.dy;
  });

  signs.forEach((sign) => {
    bgCtx.drawImage(sign.img, sign.x, sign.y, sign.width, sign.height);
    sign.x += sign.dx;
    sign.y += sign.dy;

    if (sign.x + sign.width > bgCanvas.width || sign.x < 0) sign.dx = -sign.dx;
    if (sign.y + sign.height > bgCanvas.height || sign.y < 0)
      sign.dy = -sign.dy;
  });

  requestAnimationFrame(animateBG);
}
animateBG();

// --- Game Canvas Logic ---
let color = 'red';
let clicks = [];
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load image
const image = new Image();
image.crossOrigin = 'Anonymous';
image.src =
  'https://cdn.glitch.global/c48d7256-1d1f-413f-88c1-30356b4eb7d2/thumbnails%2FChatGPT%20Image%20Jul%208%2C%202025%2C%2002_56_39%20PM.png?1751983094264';

image.onload = () => {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
};

// Set color
window.setColor = function (c) {
  color = c;
};

// Handle clicks
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.stroke();

  clicks.push({ x, y, color });
});

// Undo
window.undoLastClick = function () {
  clicks.pop();
  redrawCanvas();
};

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  clicks.forEach(({ x, y, color }) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.stroke();
  });
}

// --- Countdown Timer ---
let seconds = 60;
const timerDisplay = document.getElementById('timer');

const countdown = setInterval(() => {
  seconds--;
  timerDisplay.textContent = `Time left: ${seconds}s`;
  if (seconds <= 0) {
    clearInterval(countdown);
    showModal();
  }
}, 1000);

function showModal() {
  document.getElementById('nameModal').style.display = 'flex';
}

// --- Firebase Setup ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBUrTnilGtSUSEwp5v_KAPYvaPnkn2XskA',
  authDomain: 'oida-esg-game.firebaseapp.com',
  projectId: 'oida-esg-game',
  storageBucket: 'oida-esg-game.appspot.com',
  messagingSenderId: '843372409521',
  appId: '1:843372409521:web:18d0bf688b166591f6a890',
  measurementId: 'G-7XCCEVSL0R',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Submit to Firestore ---
window.confirmSubmission = async function () {
  const name = document.getElementById('playerName').value.trim();
  const email = document.getElementById('playerEmail').value.trim();

  if (!name || !email) {
    alert('Please enter at least your name and email.');
    return;
  }

  try {
    // Save to Firebase
    await addDoc(collection(db, 'submissions'), {
      name,
      email,
      phone,
      affiliation,
      organization,
      clicks,
      timestamp: new Date().toISOString(),
    });

    // Hide modal and show thank you screen
    document.getElementById('nameModal').style.display = 'none';
    document.getElementById('thankYouScreen').classList.remove('hidden');

    // Play sound + fireworks
    document.getElementById('yaySound').play();
    startFireworks();
  } catch (error) {
    alert('Error saving submission. Please try again.');
    console.error('Firestore error:', error);
  }
};
