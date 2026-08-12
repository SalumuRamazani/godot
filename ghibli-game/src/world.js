import * as THREE from "three";
import { getHeight, fbm, POND, GREAT_TREE, COTTAGE } from "./noise.js";
import {
  skyVertex,
  skyFragment,
  waterVertex,
  waterFragment,
  patchWindShader,
} from "./shaders.js";

const WORLD_SIZE = 220;

export function createToonGradient() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  const stops = ["#3d4a38", "#6f8458", "#b7c989", "#f2f0d8"];
  stops.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(i, 0, 1, 1);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function toon(color, gradient, opts = {}) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: gradient,
    ...opts,
  });
}

export function createWorld(scene) {
  const gradient = createToonGradient();
  const windMaterials = [];
  const obstacles = [
    { x: GREAT_TREE.x, z: GREAT_TREE.z, r: GREAT_TREE.radius },
    { x: COTTAGE.x, z: COTTAGE.z, r: COTTAGE.radius },
  ];

  addSky(scene);
  addLights(scene);
  addTerrain(scene);
  addPond(scene);
  addGrass(scene, windMaterials);
  addFlowers(scene, windMaterials);
  addTrees(scene, gradient, obstacles);
  addGreatTree(scene, gradient);
  addCottage(scene, gradient);
  addMountains(scene, gradient);
  addClouds(scene);
  addDetails(scene, gradient);
  const fireflies = addFireflies(scene);
  const birds = addBirds(scene);
  const smoke = addSmoke(scene);
  const clouds = scene.userData.clouds;
  const greatTree = scene.userData.greatTree;

  return {
    obstacles,
    windMaterials,
    fireflies,
    birds,
    smoke,
    clouds,
    greatTree,
    skyUniforms: scene.userData.skyUniforms,
    waterUniforms: scene.userData.waterUniforms,
    sun: scene.userData.sun,
    hemi: scene.userData.hemi,
    fogColor: scene.fog.color,
  };
}

function addLights(scene) {
  const hemi = new THREE.HemisphereLight(0xb7d4ee, 0x6d8a4a, 1.05);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffe1b0, 2.15);
  sun.position.set(48, 58, 22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 180;
  sun.shadow.camera.left = -70;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70;
  sun.shadow.camera.bottom = -70;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x9bb7d4, 0.35);
  fill.position.set(-30, 20, -40);
  scene.add(fill);

  scene.userData.sun = sun;
  scene.userData.hemi = hemi;
}

function addSky(scene) {
  const uniforms = {
    uTop: { value: new THREE.Color(0x7eb6d9) },
    uMid: { value: new THREE.Color(0xb7d6e8) },
    uHorizon: { value: new THREE.Color(0xf3d3b0) },
    uSunColor: { value: new THREE.Color(0xfff1c8) },
    uSunDir: { value: new THREE.Vector3(0.45, 0.62, 0.28).normalize() },
    uDusk: { value: 0 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(420, 32, 24),
    new THREE.ShaderMaterial({
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  scene.add(sky);
  scene.userData.skyUniforms = uniforms;
  scene.fog = new THREE.FogExp2(0xd7c7a8, 0.0074);
}

function addTerrain(scene) {
  const segments = 140;
  const geometry = new THREE.PlaneGeometry(
    WORLD_SIZE,
    WORLD_SIZE,
    segments,
    segments,
  );
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position;
  const colors = [];
  const color = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = getHeight(x, z);
    pos.setY(i, y);
    const slope =
      Math.abs(getHeight(x + 0.8, z) - getHeight(x - 0.8, z)) +
      Math.abs(getHeight(x, z + 0.8) - getHeight(x, z - 0.8));
    const moist = fbm(x * 0.04, z * 0.04, 3);
    if (y < 0.35) {
      color.set(0x6a8f4e);
    } else if (slope > 1.6) {
      color.set(0x8a7a55);
    } else if (moist > 0.15) {
      color.set(0x6f9a46);
    } else {
      color.set(0x8fb356);
    }
    color.offsetHSL(0, 0, moist * 0.06);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({ vertexColors: true }),
  );
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function addPond(scene) {
  const waterUniforms = {
    uTime: { value: 0 },
    uShallow: { value: new THREE.Color(0x8fd0c4) },
    uDeep: { value: new THREE.Color(0x3e7f86) },
    uDusk: { value: 0 },
  };
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(POND.radius * 0.92, 48),
    new THREE.ShaderMaterial({
      vertexShader: waterVertex,
      fragmentShader: waterFragment,
      uniforms: waterUniforms,
      transparent: true,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(POND.x, 0.28, POND.z);
  scene.add(water);
  scene.userData.waterUniforms = waterUniforms;

  const padGeo = new THREE.CircleGeometry(0.55, 10);
  const padMat = new THREE.MeshLambertMaterial({ color: 0x4f8a3a });
  for (let i = 0; i < 8; i += 1) {
    const pad = new THREE.Mesh(padGeo, padMat);
    const a = (i / 8) * Math.PI * 2;
    const r = 2.2 + (i % 3) * 1.1;
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(
      POND.x + Math.cos(a) * r,
      0.32,
      POND.z + Math.sin(a) * r,
    );
    scene.add(pad);
  }
}

function addGrass(scene, windMaterials) {
  const blade = new THREE.PlaneGeometry(0.07, 0.62, 1, 3);
  blade.translate(0, 0.31, 0);
  const material = new THREE.MeshLambertMaterial({
    color: 0x6ea043,
    side: THREE.DoubleSide,
  });
  material.onBeforeCompile = (shader) => {
    patchWindShader(shader, 0.22);
    material.userData.shader = shader;
  };
  windMaterials.push(material);

  const count = 7000;
  const mesh = new THREE.InstancedMesh(blade, material, count);
  mesh.frustumCulled = false;
  const dummy = new THREE.Object3D();
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 6) {
    attempts += 1;
    const x = (Math.random() - 0.5) * 150;
    const z = (Math.random() - 0.5) * 150;
    const y = getHeight(x, z);
    if (y < 0.4) continue;
    if (Math.hypot(x - POND.x, z - POND.z) < POND.radius + 1.5) continue;
    dummy.position.set(x, y, z);
    dummy.rotation.y = Math.random() * Math.PI;
    const s = 0.7 + Math.random() * 0.8;
    dummy.scale.set(s, s * (0.8 + Math.random() * 0.7), s);
    dummy.updateMatrix();
    mesh.setMatrixAt(placed, dummy.matrix);
    const tint = 0.55 + Math.random() * 0.45;
    mesh.setColorAt(placed, new THREE.Color(0.35 * tint, 0.55 + tint * 0.2, 0.22));
    placed += 1;
  }
  mesh.count = placed;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);
}

function addFlowers(scene, windMaterials) {
  const head = new THREE.SphereGeometry(0.09, 6, 6);
  const material = new THREE.MeshToonMaterial({ color: 0xf2d36b });
  material.onBeforeCompile = (shader) => {
    patchWindShader(shader, 0.12);
    material.userData.shader = shader;
  };
  windMaterials.push(material);
  const count = 420;
  const mesh = new THREE.InstancedMesh(head, material, count);
  const dummy = new THREE.Object3D();
  const palette = [0xf2d36b, 0xf4a7b9, 0xf6efe2, 0xd98bb3];
  let i = 0;
  while (i < count) {
    const x = (Math.random() - 0.5) * 130;
    const z = (Math.random() - 0.5) * 130;
    const y = getHeight(x, z);
    if (y < 0.5) continue;
    dummy.position.set(x, y + 0.28, z);
    dummy.scale.setScalar(0.7 + Math.random() * 0.8);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, new THREE.Color(palette[i % palette.length]));
    i += 1;
  }
  mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);
}

function makeCanopy(gradient, color) {
  return toon(color, gradient);
}

function addTrees(scene, gradient, obstacles) {
  const trunkMat = toon(0x6a4a32, gradient);
  const canopyMats = [
    makeCanopy(gradient, 0x3f6b38),
    makeCanopy(gradient, 0x4f7d42),
    makeCanopy(gradient, 0x2f5a33),
  ];
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.34, 2.4, 6);
  const ballGeo = new THREE.SphereGeometry(1, 8, 6);

  for (let i = 0; i < 58; i += 1) {
    const x = (Math.random() - 0.5) * 150;
    const z = (Math.random() - 0.5) * 150;
    if (Math.hypot(x, z - 10) < 14) continue;
    if (Math.hypot(x - POND.x, z - POND.z) < 14) continue;
    if (Math.hypot(x - GREAT_TREE.x, z - GREAT_TREE.z) < 16) continue;
    if (Math.hypot(x - COTTAGE.x, z - COTTAGE.z) < 10) continue;
    const y = getHeight(x, z);
    if (y < 0.6) continue;
    const group = new THREE.Group();
    group.position.set(x, y, z);
    const scale = 0.85 + Math.random() * 1.3;
    group.scale.setScalar(scale);

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.2;
    trunk.castShadow = true;
    group.add(trunk);

    const balls = 3 + Math.floor(Math.random() * 3);
    for (let b = 0; b < balls; b += 1) {
      const canopy = new THREE.Mesh(
        ballGeo,
        canopyMats[b % canopyMats.length],
      );
      canopy.position.set(
        (Math.random() - 0.5) * 1.4,
        2.4 + Math.random() * 0.8,
        (Math.random() - 0.5) * 1.4,
      );
      canopy.scale.setScalar(1.1 + Math.random() * 0.7);
      canopy.castShadow = true;
      group.add(canopy);
    }
    scene.add(group);
    obstacles.push({ x, z, r: 1.1 * scale });
  }
}

function addGreatTree(scene, gradient) {
  const group = new THREE.Group();
  group.position.set(
    GREAT_TREE.x,
    getHeight(GREAT_TREE.x, GREAT_TREE.z),
    GREAT_TREE.z,
  );

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 3.3, 11, 10),
    toon(0x5c4330, gradient),
  );
  trunk.position.y = 5.4;
  trunk.castShadow = true;
  group.add(trunk);

  const rootGeo = new THREE.SphereGeometry(1.8, 8, 6);
  const rootMat = toon(0x4e3a28, gradient);
  for (let i = 0; i < 6; i += 1) {
    const root = new THREE.Mesh(rootGeo, rootMat);
    const a = (i / 6) * Math.PI * 2;
    root.position.set(Math.cos(a) * 2.6, 0.4, Math.sin(a) * 2.6);
    root.scale.set(1.3, 0.45, 0.8);
    group.add(root);
  }

  const greens = [0x2d5a32, 0x3d7040, 0x4a7d45, 0x24502c];
  for (let i = 0; i < 16; i += 1) {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 10, 8),
      toon(greens[i % greens.length], gradient),
    );
    const a = (i / 16) * Math.PI * 2;
    const r = 3.5 + (i % 4) * 1.4;
    ball.position.set(
      Math.cos(a) * r,
      11.5 + (i % 5) * 1.3,
      Math.sin(a) * r,
    );
    ball.scale.setScalar(0.85 + (i % 3) * 0.18);
    ball.castShadow = true;
    group.add(ball);
  }

  const glow = new THREE.PointLight(0xffe08a, 0, 28);
  glow.position.set(0, 6, 0);
  group.add(glow);
  group.userData.glow = glow;
  scene.add(group);
  scene.userData.greatTree = group;
}

function addCottage(scene, gradient) {
  const group = new THREE.Group();
  const y = getHeight(COTTAGE.x, COTTAGE.z);
  group.position.set(COTTAGE.x, y, COTTAGE.z);

  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 3.4, 4.6),
    toon(0xf0e2c4, gradient),
  );
  walls.position.y = 1.7;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(5.1, 2.6, 4),
    toon(0xb85c3a, gradient),
  );
  roof.position.y = 4.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.8, 0.7),
    toon(0x8a6a55, gradient),
  );
  chimney.position.set(1.6, 5.2, -0.8);
  group.add(chimney);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.8, 0.12),
    toon(0x6b3f24, gradient),
  );
  door.position.set(0, 0.9, 2.32);
  group.add(door);

  const windowMat = new THREE.MeshBasicMaterial({ color: 0xffe09a });
  [
    [-1.7, 1.8, 2.32],
    [1.7, 1.8, 2.32],
  ].forEach(([wx, wy, wz]) => {
    const window = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.08), windowMat);
    window.position.set(wx, wy, wz);
    group.add(window);
  });

  const cat = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 8),
    toon(0x22201e, gradient),
  );
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    toon(0x22201e, gradient),
  );
  head.position.set(0.22, 0.16, 0);
  const earL = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.16, 4),
    toon(0x22201e, gradient),
  );
  earL.position.set(0.16, 0.34, 0.08);
  const earR = earL.clone();
  earR.position.set(0.16, 0.34, -0.08);
  cat.add(body, head, earL, earR);
  cat.position.set(-1.4, 4.05, 0.6);
  group.add(cat);

  scene.add(group);
}

function addMountains(scene, gradient) {
  const mat = toon(0x7d8fa3, gradient);
  mat.transparent = true;
  mat.opacity = 0.92;
  for (let i = 0; i < 18; i += 1) {
    const a = (i / 18) * Math.PI * 2 + 0.2;
    const r = 118 + (i % 4) * 8;
    const peak = new THREE.Mesh(
      new THREE.ConeGeometry(14 + (i % 5) * 4, 22 + (i % 6) * 6, 5),
      mat,
    );
    peak.position.set(Math.cos(a) * r, 8, Math.sin(a) * r);
    scene.add(peak);
  }
}

function addClouds(scene) {
  const mat = new THREE.MeshLambertMaterial({
    color: 0xfff6ea,
    transparent: true,
    opacity: 0.92,
  });
  const geo = new THREE.SphereGeometry(4.5, 8, 6);
  const clouds = [];
  for (let i = 0; i < 10; i += 1) {
    const cloud = new THREE.Group();
    const n = 3 + (i % 3);
    for (let p = 0; p < n; p += 1) {
      const puff = new THREE.Mesh(geo, mat);
      puff.position.set((p - 1) * 3.4, Math.sin(p) * 0.8, (p % 2) * 1.6);
      puff.scale.setScalar(0.7 + (p % 3) * 0.25);
      cloud.add(puff);
    }
    cloud.position.set(
      (Math.random() - 0.5) * 160,
      28 + Math.random() * 16,
      (Math.random() - 0.5) * 160,
    );
    cloud.userData.speed = 0.8 + Math.random() * 0.7;
    scene.add(cloud);
    clouds.push(cloud);
  }
  scene.userData.clouds = clouds;
}

function addDetails(scene, gradient) {
  const stoneMat = toon(0x8d8678, gradient);
  for (let i = 0; i < 18; i += 1) {
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.4, 0),
      stoneMat,
    );
    const a = Math.random() * Math.PI * 2;
    const r = 6 + Math.random() * 40;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r + 6;
    stone.position.set(x, getHeight(x, z) + 0.15, z);
    stone.rotation.set(Math.random(), Math.random(), Math.random());
    stone.castShadow = true;
    scene.add(stone);
  }

  const lantern = new THREE.Group();
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 1.8, 6),
    toon(0x5a4634, gradient),
  );
  post.position.y = 0.9;
  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xffd27a }),
  );
  lamp.position.y = 1.9;
  lantern.add(post, lamp);
  lantern.position.set(-10, getHeight(-10, 8), 8);
  scene.add(lantern);
}

function addFireflies(scene) {
  const geo = new THREE.SphereGeometry(0.05, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0xfff1a8 });
  const flies = [];
  for (let i = 0; i < 40; i += 1) {
    const fly = new THREE.Mesh(geo, mat);
    fly.position.set(
      (Math.random() - 0.5) * 80,
      2 + Math.random() * 6,
      (Math.random() - 0.5) * 80,
    );
    fly.userData = {
      origin: fly.position.clone(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.8,
    };
    fly.visible = false;
    scene.add(fly);
    flies.push(fly);
  }
  return flies;
}

function addBirds(scene) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x2b2724, side: THREE.DoubleSide });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-0.5, 0, 0, 0, 0.08, 0, 0.5, 0, 0], 3),
  );
  const birds = [];
  for (let i = 0; i < 6; i += 1) {
    const bird = new THREE.Mesh(geo, mat);
    bird.userData = {
      radius: 18 + i * 6,
      height: 16 + i * 1.4,
      speed: 0.12 + i * 0.02,
      offset: i * 0.9,
    };
    scene.add(bird);
    birds.push(bird);
  }
  return birds;
}

function addSmoke(scene) {
  const puffs = [];
  for (let i = 0; i < 6; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 6, 6),
      new THREE.MeshLambertMaterial({
        color: 0xf4efe6,
        transparent: true,
        opacity: 0.28,
      }),
    );
    puff.position.set(COTTAGE.x + 1.6, getHeight(COTTAGE.x, COTTAGE.z) + 6.2, COTTAGE.z - 0.8);
    puff.userData.t = i / 6;
    scene.add(puff);
    puffs.push(puff);
  }
  return puffs;
}

export function updateWorld(world, time, dt, dusk) {
  world.windMaterials.forEach((mat) => {
    if (mat.userData.shader) {
      mat.userData.shader.uniforms.uTime.value = time;
    }
  });
  if (world.waterUniforms) {
    world.waterUniforms.uTime.value = time;
    world.waterUniforms.uDusk.value = dusk;
  }
  if (world.skyUniforms) {
    world.skyUniforms.uDusk.value = dusk;
    world.skyUniforms.uTop.value.set(0x7eb6d9).lerp(new THREE.Color(0x35598a), dusk);
    world.skyUniforms.uMid.value.set(0xb7d6e8).lerp(new THREE.Color(0xd49a6a), dusk);
    world.skyUniforms.uHorizon.value.set(0xf3d3b0).lerp(new THREE.Color(0xe08a4a), dusk);
    world.skyUniforms.uSunDir.value.set(0.45, 0.62 - dusk * 0.35, 0.28).normalize();
  }
  if (world.sun) {
    world.sun.intensity = 2.15 - dusk * 0.9;
    world.sun.color.set(0xffe1b0).lerp(new THREE.Color(0xff9a5c), dusk);
    world.sun.position.set(48, 58 - dusk * 28, 22);
  }
  if (world.hemi) {
    world.hemi.intensity = 1.05 - dusk * 0.35;
  }
  if (world.fogColor) {
    world.fogColor.set(0xd7c7a8).lerp(new THREE.Color(0xc48a62), dusk);
  }

  world.fireflies.forEach((fly, i) => {
    fly.visible = dusk > 0.18;
    const { origin, phase, speed } = fly.userData;
    fly.position.x = origin.x + Math.sin(time * speed + phase) * 1.4;
    fly.position.y = origin.y + Math.sin(time * speed * 1.7 + phase) * 0.7;
    fly.position.z = origin.z + Math.cos(time * speed * 0.9 + phase) * 1.4;
    fly.scale.setScalar(0.6 + Math.abs(Math.sin(time * 6 + i)) * 0.8);
  });

  world.birds.forEach((bird) => {
    const { radius, height, speed, offset } = bird.userData;
    const a = time * speed + offset;
    bird.position.set(Math.cos(a) * radius, height, Math.sin(a) * radius);
    bird.rotation.y = -a + Math.PI / 2;
    bird.rotation.z = Math.sin(time * 8 + offset) * 0.35;
  });

  world.smoke.forEach((puff) => {
    puff.userData.t += dt * 0.12;
    if (puff.userData.t > 1) puff.userData.t -= 1;
    const t = puff.userData.t;
    puff.position.y = getHeight(COTTAGE.x, COTTAGE.z) + 6.2 + t * 3.4;
    puff.position.x = COTTAGE.x + 1.6 + Math.sin(time * 0.4 + t) * 0.35;
    puff.scale.setScalar(0.5 + t * 1.6);
    puff.material.opacity = (1 - t) * 0.28;
  });

  world.clouds?.forEach((cloud) => {
    cloud.position.x += cloud.userData.speed * dt;
    if (cloud.position.x > 90) cloud.position.x = -90;
  });

  if (world.greatTree?.userData.glow) {
    world.greatTree.userData.glow.intensity = dusk * 4.5;
  }
}
