import * as THREE from "three";
import { getHeight, GREAT_TREE, POND, COTTAGE } from "./noise.js";
import { playCollect, playWin } from "./audio.js";

const TOTAL = 12;

function makeSpirit() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 10, 8),
    new THREE.MeshToonMaterial({ color: 0xf7f0d8 }),
  );
  body.scale.set(1, 1.15, 1);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffe7a0,
      transparent: true,
      opacity: 0.28,
    }),
  );
  const eyeL = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0x2b241c }),
  );
  eyeL.position.set(-0.08, 0.06, 0.22);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.08;
  const blush = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xf3b3a4, transparent: true, opacity: 0.55 }),
  );
  blush.position.set(-0.14, -0.02, 0.2);
  const blushR = blush.clone();
  blushR.position.x = 0.14;
  group.add(body, glow, eyeL, eyeR, blush, blushR);
  return group;
}

export function createSpirits(scene) {
  const spots = [
    [0, 4],
    [8, 18],
    [-12, 20],
    [COTTAGE.x + 6, COTTAGE.z + 3],
    [COTTAGE.x - 5, COTTAGE.z - 4],
    [POND.x + 8, POND.z + 2],
    [POND.x - 3, POND.z + 9],
    [GREAT_TREE.x + 10, GREAT_TREE.z + 6],
    [GREAT_TREE.x - 8, GREAT_TREE.z + 4],
    [32, 8],
    [-28, -6],
    [16, -24],
  ];

  const spirits = spots.map(([x, z], i) => {
    const mesh = makeSpirit();
    const y = getHeight(x, z) + 0.7;
    mesh.position.set(x, y, z);
    mesh.userData = {
      origin: new THREE.Vector3(x, y, z),
      phase: i * 0.7,
      collected: false,
    };
    scene.add(mesh);
    return mesh;
  });

  return {
    meshes: spirits,
    collected: 0,
    total: TOTAL,
    won: false,
  };
}

export function updateSpirits(state, playerPos, dt, onCollect, onWin) {
  state.meshes.forEach((spirit) => {
    if (spirit.userData.collected) {
      spirit.position.y += dt * 1.8;
      spirit.scale.multiplyScalar(1 - dt * 2.4);
      if (spirit.scale.x < 0.05) spirit.visible = false;
      return;
    }
    const { origin, phase } = spirit.userData;
    spirit.position.x = origin.x + Math.sin(performance.now() * 0.0012 + phase) * 0.35;
    spirit.position.y = origin.y + Math.sin(performance.now() * 0.002 + phase) * 0.28;
    spirit.position.z = origin.z + Math.cos(performance.now() * 0.0011 + phase) * 0.35;
    spirit.rotation.y += dt * 0.8;

    const d = spirit.position.distanceTo(playerPos);
    if (d < 1.45) {
      spirit.userData.collected = true;
      state.collected += 1;
      playCollect();
      onCollect(state.collected, state.total);
      if (state.collected >= state.total && !state.won) {
        state.won = true;
        playWin();
        onWin();
      }
    } else if (d < 4) {
      spirit.lookAt(playerPos);
    }
  });
}
