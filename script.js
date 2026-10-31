
"use strict";

// ==========================================
// 1. CIELO ESTRELLADO ANIMADO
// ==========================================

const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

let stars = [];
let width = 0;
let height = 0;
let animationFrame;

function createSky() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(220, Math.floor(width * height / 5500));

  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.65 + 0.2,
    speed: Math.random() * 0.012 + 0.003,
    phase: Math.random() * Math.PI * 2
  }));
}

function drawSky(time = 0) {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    const glow = (Math.sin(time * star.speed + star.phase) + 1) / 2;
    const alpha = star.alpha * (0.45 + glow * 0.55);

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(205, 237, 255, ${alpha})`;
    ctx.fill();

    if (star.radius > 1.25 && glow > 0.8) {
      ctx.strokeStyle = `rgba(180, 229, 255, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(star.x - 4, star.y);
      ctx.lineTo(star.x + 4, star.y);
      ctx.moveTo(star.x, star.y - 4);
      ctx.lineTo(star.x, star.y + 4);
      ctx.stroke();
    }
  }

  animationFrame = requestAnimationFrame(drawSky);
}

createSky();
drawSky();
window.addEventListener("resize", createSky);

// Reduce animation when the tab is not visible.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
  } else {
    cancelAnimationFrame(animationFrame);
    drawSky();
  }
});

// ==========================================
// 2. MÚSICA DE FONDO
// ==========================================

const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");

musicBtn.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicBtn.textContent = "♫ Pausar música";
      musicBtn.setAttribute("aria-pressed", "true");
    } catch (error) {
      showToast("Añade tu canción en la carpeta audio.");
    }
  } else {
    music.pause();
    musicBtn.textContent = "♫ Activar música";
    musicBtn.setAttribute("aria-pressed", "false");
  }
});

music.addEventListener("ended", () => {
  musicBtn.textContent = "♫ Activar música";
  musicBtn.setAttribute("aria-pressed", "false");
});

music.addEventListener("error", () => {
  musicBtn.textContent = "♫ Música no disponible";
});

// ==========================================
// 3. CARTA DE CUMPLEAÑOS
// ==========================================

const letterDialog = document.getElementById("letterDialog");

document.getElementById("openLetter").addEventListener("click", () => {
  letterDialog.showModal();
});

document.getElementById("closeLetter").addEventListener("click", () => {
  letterDialog.close();
});

// Close the letter when clicking outside its content.
letterDialog.addEventListener("click", (event) => {
  if (event.target === letterDialog) {
    letterDialog.close();
  }
});

// ==========================================
// 4. MENSAJES FLOTANTES
// ==========================================

const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// ==========================================
// 5. MINIJUEGO: ENCUENTRA CINCO ESTRELLAS
// ==========================================

const gameSky = document.getElementById("gameSky");
const scoreText = document.getElementById("score");
const gameMessage = document.getElementById("gameMessage");
const gameHint = document.getElementById("gameHint");
const restartGame = document.getElementById("restartGame");
const revealSecret = document.getElementById("revealSecret");
const secretMessage = document.getElementById("secretMessage");

const totalStars = 5;
let foundStars = 0;
let collectedPositions = new Set();

function startGame() {
  foundStars = 0;
  collectedPositions = new Set();

  scoreText.textContent = "0";
  gameMessage.textContent =
    "Tu aventura comienza aquí, pequeña estrella.";
  gameHint.hidden = false;
  revealSecret.disabled = true;
  secretMessage.hidden = true;

  gameSky.querySelectorAll(".game-star").forEach(star => star.remove());

  // Five stars are placed in separate horizontal regions.
  for (let i = 0; i < totalStars; i++) {
    const star = document.createElement("button");

    star.type = "button";
    star.className = "game-star";
    star.textContent = "✦";
    star.setAttribute("aria-label", `Encontrar estrella ${i + 1}`);

    const left = 5 + Math.random() * 83;
    const top = 8 + Math.random() * 70;

    star.style.left = `${left}%`;
    star.style.top = `${top}%`;
    star.style.animationDelay = `${Math.random()}s`;

    star.addEventListener("click", () => collectStar(i, star));

    gameSky.appendChild(star);
  }
}

function collectStar(index, star) {
  if (collectedPositions.has(index)) return;

  collectedPositions.add(index);
  foundStars++;

  scoreText.textContent = foundStars;
  star.textContent = "♡";
  star.disabled = true;
  star.style.opacity = "0.4";
  star.style.cursor = "default";

  if (foundStars < totalStars) {
    gameMessage.textContent =
      `¡Muy bien! Encontraste ${foundStars} de ${totalStars}. Sigue buscando.`;
    showToast("¡Una estrella más para tu cielo! ✨");
  } else {
    gameHint.hidden = true;
    gameMessage.textContent =
      "¡Lo lograste! Encontraste todas tus estrellas. 🩵";
    revealSecret.disabled = false;
    showToast("¡Tu sorpresa final está lista!");
    launchHearts();
  }
}

restartGame.addEventListener("click", startGame);

// ==========================================
// 6. REVELAR EL MENSAJE SECRETO
// ==========================================

revealSecret.addEventListener("click", () => {
  if (foundStars !== totalStars) {
    showToast("Primero necesitas encontrar las cinco estrellas.");
    return;
  }

  secretMessage.hidden = false;
  revealSecret.textContent = "💙 Mensaje descubierto";
  revealSecret.disabled = true;

  secretMessage.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  launchHearts();
});

// ==========================================
// 7. CORAZONES FLOTANTES DE CELEBRACIÓN
// ==========================================

function launchHearts() {
  const symbols = ["♡", "♥", "✦", "✧", "💙"];

  for (let i = 0; i < 22; i++) {
    const particle = document.createElement("span");

    particle.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    Object.assign(particle.style, {
      position: "fixed",
      left: `${Math.random() * 100}vw`,
      bottom: "-35px",
      zIndex: "50",
      pointerEvents: "none",
      color: "#a6e8ff",
      fontSize: `${16 + Math.random() * 22}px`,
      textShadow: "0 0 14px #63c9ff",
      transition: `transform ${2 + Math.random() * 2}s linear, opacity 3s ease`
    });

    document.body.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.transform =
        `translateY(-${window.innerHeight + 100}px) rotate(${Math.random() * 100 - 50}deg)`;
      particle.style.opacity = "0";
    });

    setTimeout(() => particle.remove(), 4300);
  }
}

// Start with a fresh game.
startGame();
