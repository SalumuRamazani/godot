import * as THREE from "three";
import { initAudio, setWind } from "./audio.js";
import { createWorld, updateWorld, createToonGradient } from "./world.js";
import { createPlayer, updatePlayer, updateCamera } from "./player.js";
import { createSpirits, updateSpirits } from "./spirits.js";

const canvas = document.querySelector("#game");
const titleScreen = document.querySelector("#title-screen");
const winScreen = document.querySelector("#win-screen");
const hud = document.querySelector("#hud");
const countEl = document.querySelector("#spirit-count");
const hintEl = document.querySelector("#hint");
const startBtn = document.querySelector("#start-btn");
const againBtn = document.querySelector("#again-btn");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  52,
  window.innerWidth / window.innerHeight,
  0.1,
  600,
);

const gradient = createToonGradient();
const world = createWorld(scene);
const player = createPlayer(scene, gradient);
let spirits = createSpirits(scene);

const input = {
  forward: false,
  back: false,
  left: false,
  right: false,
  shift: false,
  jump: false,
  yaw: 0.2,
  pitch: 0.18,
};

let playing = false;
let hintTimer = 6;

const keyMap = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

window.addEventListener("keydown", (event) => {
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") input.shift = true;
  if (event.code === "Space") {
    event.preventDefault();
    input.jump = true;
  }
  const mapped = keyMap[event.code];
  if (mapped) input[mapped] = true;
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") input.shift = false;
  if (event.code === "Space") input.jump = false;
  const mapped = keyMap[event.code];
  if (mapped) input[mapped] = false;
});

canvas.addEventListener("click", () => {
  if (playing) canvas.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement !== canvas) return;
  input.yaw -= event.movementX * 0.0022;
  input.pitch = THREE.MathUtils.clamp(
    input.pitch - event.movementY * 0.002,
    -0.55,
    0.48,
  );
});

startBtn.addEventListener("click", async () => {
  await initAudio();
  titleScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  playing = true;
  canvas.requestPointerLock();
});

againBtn.addEventListener("click", () => {
  window.location.reload();
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
camera.position.set(0, 8, 22);

function onCollect(collected, total) {
  countEl.textContent = String(collected);
  hintEl.textContent =
    collected === total
      ? "The great tree is holding their light"
      : "A spirit settled into your scarf";
  hintTimer = 3.5;
}

function onWin() {
  setTimeout(() => {
    document.exitPointerLock();
    winScreen.classList.remove("hidden");
  }, 1400);
}

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;
  const dusk = spirits.collected / spirits.total;

  if (playing) {
    updatePlayer(player, input, world.obstacles, dt);
    updateCamera(camera, player, input, dt);
    updateSpirits(spirits, player.mesh.position, dt, onCollect, onWin);
    setWind(player.speed / 12);
    if (hintTimer > 0) {
      hintTimer -= dt;
      if (hintTimer <= 0) hintEl.textContent = "";
    }
  } else {
    camera.position.set(
      Math.sin(time * 0.08) * 18,
      9 + Math.sin(time * 0.2) * 0.6,
      22 + Math.cos(time * 0.08) * 8,
    );
    camera.lookAt(-4, 4, -8);
  }

  updateWorld(world, time, dt, dusk);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick();
