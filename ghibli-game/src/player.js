import * as THREE from "three";
import { getHeight, getNormal } from "./noise.js";

export function createPlayer(scene, gradient) {
  const group = new THREE.Group();
  const mats = {
    skin: new THREE.MeshToonMaterial({ color: 0xf3d2b3, gradientMap: gradient }),
    hair: new THREE.MeshToonMaterial({ color: 0x3b2a22, gradientMap: gradient }),
    shirt: new THREE.MeshToonMaterial({ color: 0xf4efe2, gradientMap: gradient }),
    scarf: new THREE.MeshToonMaterial({ color: 0xc44536, gradientMap: gradient }),
    pants: new THREE.MeshToonMaterial({ color: 0x3d4c6a, gradientMap: gradient }),
    shoe: new THREE.MeshToonMaterial({ color: 0x4a3428, gradientMap: gradient }),
  };

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.42, 4, 8), mats.shirt);
  torso.position.y = 0.95;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), mats.skin);
  head.position.y = 1.58;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), mats.hair);
  hair.position.set(0, 1.68, -0.02);
  hair.scale.set(1.05, 0.72, 1.08);
  group.add(hair);

  const bang = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), mats.hair);
  bang.position.set(0, 1.72, 0.22);
  bang.scale.set(1.4, 0.45, 0.6);
  group.add(bang);

  const cheekL = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 6, 6),
    new THREE.MeshToonMaterial({
      color: 0xf4a59a,
      gradientMap: gradient,
      transparent: true,
      opacity: 0.7,
    }),
  );
  cheekL.position.set(-0.18, 1.5, 0.22);
  const cheekR = cheekL.clone();
  cheekR.position.x = 0.18;
  group.add(cheekL, cheekR);

  const eyeWhite = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfffdf8 }),
  );
  const eyeL = eyeWhite.clone();
  eyeL.position.set(-0.11, 1.58, 0.26);
  eyeL.scale.set(1, 1.15, 0.6);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.11;
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x2a221c });
  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), pupilMat);
  pupilL.position.set(-0.11, 1.58, 0.3);
  const pupilR = pupilL.clone();
  pupilR.position.x = 0.11;
  group.add(eyeL, eyeR, pupilL, pupilR);

  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 6, 10), mats.scarf);
  scarf.position.y = 1.28;
  scarf.rotation.x = Math.PI / 2;
  group.add(scarf);
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.45, 3, 6), mats.scarf);
  tail.position.set(0.18, 1.05, 0.12);
  tail.rotation.z = -0.5;
  group.add(tail);

  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.38, 3, 6), mats.shirt);
  armL.position.set(-0.38, 1.05, 0);
  const armR = armL.clone();
  armR.position.x = 0.38;
  group.add(armL, armR);

  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.38, 3, 6), mats.pants);
  legL.position.set(-0.14, 0.42, 0);
  const legR = legL.clone();
  legR.position.x = 0.14;
  group.add(legL, legR);

  const shoeL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mats.shoe);
  shoeL.position.set(-0.14, 0.12, 0.04);
  shoeL.scale.set(1, 0.6, 1.3);
  const shoeR = shoeL.clone();
  shoeR.position.x = 0.14;
  group.add(shoeL, shoeR);

  group.userData = { armL, armR, legL, legR, torso, head };
  group.position.set(0, getHeight(0, 12) + 0.05, 12);
  scene.add(group);

  return {
    mesh: group,
    velocityY: 0,
    grounded: true,
    yaw: 0,
    speed: 0,
  };
}

export function updatePlayer(player, input, obstacles, dt) {
  const run = input.shift ? 11.5 : 6.4;
  const forward = new THREE.Vector3(-Math.sin(input.yaw), 0, -Math.cos(input.yaw));
  const right = new THREE.Vector3(Math.cos(input.yaw), 0, -Math.sin(input.yaw));
  const move = new THREE.Vector3();
  if (input.forward) move.add(forward);
  if (input.back) move.sub(forward);
  if (input.right) move.add(right);
  if (input.left) move.sub(right);

  const moving = move.lengthSq() > 0;
  if (moving) {
    move.normalize();
    player.mesh.position.x += move.x * run * dt;
    player.mesh.position.z += move.z * run * dt;
    const targetYaw = Math.atan2(move.x, move.z);
    let delta = targetYaw - player.yaw;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    player.yaw += delta * Math.min(1, dt * 10);
    player.mesh.rotation.y = player.yaw;
  }

  const limit = 92;
  const dist = Math.hypot(player.mesh.position.x, player.mesh.position.z);
  if (dist > limit) {
    player.mesh.position.x *= limit / dist;
    player.mesh.position.z *= limit / dist;
  }

  obstacles.forEach((o) => {
    const dx = player.mesh.position.x - o.x;
    const dz = player.mesh.position.z - o.z;
    const d = Math.hypot(dx, dz);
    if (d < o.r && d > 0.0001) {
      const push = (o.r - d) / d;
      player.mesh.position.x += dx * push;
      player.mesh.position.z += dz * push;
    }
  });

  const ground = getHeight(player.mesh.position.x, player.mesh.position.z);
  if (input.jump && player.grounded) {
    player.velocityY = 7.2;
    player.grounded = false;
    input.jump = false;
  }
  player.velocityY -= 22 * dt;
  player.mesh.position.y += player.velocityY * dt;
  if (player.mesh.position.y <= ground) {
    player.mesh.position.y = ground;
    player.velocityY = 0;
    player.grounded = true;
  }

  const { armL, armR, legL, legR, torso } = player.mesh.userData;
  const swing = moving ? Math.sin(performance.now() * 0.012 * (input.shift ? 1.4 : 1)) : 0;
  const amp = moving ? 0.7 : 0.08;
  legL.rotation.x = swing * amp;
  legR.rotation.x = -swing * amp;
  armL.rotation.x = -swing * amp * 0.7;
  armR.rotation.x = swing * amp * 0.7;
  torso.position.y = 0.95 + (moving ? Math.abs(swing) * 0.05 : Math.sin(performance.now() * 0.002) * 0.02);

  const n = getNormal(player.mesh.position.x, player.mesh.position.z);
  player.speed = moving ? run : 0;
  return n;
}

export function updateCamera(camera, player, input, dt) {
  const dist = 8.4;
  const height = 2.6;
  const target = new THREE.Vector3(
    player.mesh.position.x + Math.sin(input.yaw) * dist * Math.cos(input.pitch),
    player.mesh.position.y + height + Math.sin(input.pitch) * dist,
    player.mesh.position.z + Math.cos(input.yaw) * dist * Math.cos(input.pitch),
  );
  const minY = getHeight(target.x, target.z) + 1.2;
  target.y = Math.max(target.y, minY);
  camera.position.lerp(target, 1 - Math.pow(0.0008, dt));
  const look = player.mesh.position.clone();
  look.y += 1.35;
  camera.lookAt(look);
}
