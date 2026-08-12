function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hash(ix, iz) {
  let n = Math.imul(ix, 374761393) + Math.imul(iz, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

export function noise2D(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = fade(x - ix);
  const fz = fade(z - iz);
  const a = hash(ix, iz);
  const b = hash(ix + 1, iz);
  const c = hash(ix, iz + 1);
  const d = hash(ix + 1, iz + 1);
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fz) * 2 - 1;
}

export function fbm(x, z, octaves = 4) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += noise2D(x * frequency, z * frequency) * amplitude;
    sum += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }
  return value / sum;
}

export const POND = { x: 22, z: -8, radius: 11 };
export const GREAT_TREE = { x: -6, z: -30, radius: 4.2 };
export const COTTAGE = { x: -18, z: 12, radius: 4.6 };

export function getHeight(x, z) {
  const d = Math.hypot(x, z);
  let h = fbm(x * 0.016, z * 0.016, 5) * 7.2;
  h += fbm(x * 0.05 + 18, z * 0.05, 3) * 2.1;
  h += Math.pow(Math.max(0, d - 28) / 78, 1.65) * 16;
  const spawn = 1 - Math.exp(-(x * x + (z - 10) * (z - 10)) / 520);
  h *= 0.38 + 0.62 * spawn;

  const pond = Math.hypot(x - POND.x, z - POND.z);
  if (pond < POND.radius) {
    const bowl = 1 - pond / POND.radius;
    h = Math.min(h, 0.22 - bowl * 1.85);
  }

  const mound = Math.hypot(x - GREAT_TREE.x, z - GREAT_TREE.z);
  if (mound < 16) {
    h += (1 - mound / 16) * 1.8;
  }

  return h;
}

export function getNormal(x, z, eps = 0.45) {
  const hL = getHeight(x - eps, z);
  const hR = getHeight(x + eps, z);
  const hD = getHeight(x, z - eps);
  const hU = getHeight(x, z + eps);
  const nx = hL - hR;
  const nz = hD - hU;
  const len = Math.hypot(nx, 2 * eps, nz) || 1;
  return { x: nx / len, y: (2 * eps) / len, z: nz / len };
}
