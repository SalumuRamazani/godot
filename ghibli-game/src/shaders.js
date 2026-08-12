export const skyVertex = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform float uDusk;
  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = dir.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(-0.12, 0.28, h));
    col = mix(col, uTop, smoothstep(0.18, 0.82, h));

    vec3 sunDir = normalize(uSunDir);
    float sun = pow(max(dot(dir, sunDir), 0.0), 48.0);
    float glow = pow(max(dot(dir, sunDir), 0.0), 5.0);
    col += uSunColor * sun * (1.15 + uDusk * 0.4);
    col += uSunColor * glow * (0.22 + uDusk * 0.18);

    float haze = smoothstep(0.35, -0.05, h);
    col = mix(col, uHorizon, haze * 0.35);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const waterVertex = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(p.x * 1.6 + uTime * 0.7) * 0.04;
    p.z += cos(p.y * 1.3 + uTime * 0.55) * 0.03;
    vec4 worldPosition = modelMatrix * vec4(p, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const waterFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform float uDusk;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    float rip = sin(vUv.x * 28.0 + uTime * 1.1) * 0.5 + cos(vUv.y * 22.0 - uTime * 0.8) * 0.5;
    float ring = length(vUv - 0.5);
    vec3 col = mix(uDeep, uShallow, smoothstep(0.48, 0.18, ring) + rip * 0.08);
    col = mix(col, vec3(0.95, 0.82, 0.55), uDusk * 0.18);
    float foam = smoothstep(0.42, 0.5, ring);
    col = mix(col, vec3(0.86, 0.93, 0.88), foam * 0.55);
    gl_FragColor = vec4(col, 0.82);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function patchWindShader(shader, sway = 0.18) {
  shader.uniforms.uTime = { value: 0 };
  shader.vertexShader = `
    uniform float uTime;
    ${shader.vertexShader}
  `.replace(
    "#include <begin_vertex>",
    `
    #include <begin_vertex>
    float wind = sin(uTime * 1.15 + instanceMatrix[3][0] * 0.35 + instanceMatrix[3][2] * 0.28);
    transformed.x += wind * ${sway.toFixed(3)} * max(transformed.y, 0.0);
    `,
  );
}
