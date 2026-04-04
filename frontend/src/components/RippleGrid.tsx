import { useRef, useEffect } from 'react';

const RippleGrid = ({
  gridColor = '#3b82f6',
  rippleIntensity = 0.04,
  gridSize = 8.0,
  gridThickness = 18.0,
  opacity = 0.6,
  mouseInteraction = true,
}: {
  gridColor?: string;
  rippleIntensity?: number;
  gridSize?: number;
  gridThickness?: number;
  opacity?: number;
  mouseInteraction?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseInfluenceRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
        : [0.23, 0.51, 0.96];
    };

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vert = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const frag = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 gridColor;
      uniform float rippleIntensity;
      uniform float gridSize;
      uniform float gridThickness;
      uniform float opacity;
      uniform vec2 mousePosition;
      uniform float mouseInfluence;
      varying vec2 vUv;
      float pi = 3.141592;
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= iResolution.x / iResolution.y;
        float dist = length(uv);
        float func = sin(pi * (iTime * 0.8 - dist));
        vec2 rippleUv = uv + uv * func * rippleIntensity;
        if (mouseInfluence > 0.0) {
          vec2 mouseUv = (mousePosition * 2.0 - 1.0);
          mouseUv.x *= iResolution.x / iResolution.y;
          float mouseDist = length(uv - mouseUv);
          float influence = mouseInfluence * exp(-mouseDist * mouseDist / 1.2);
          float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
          rippleUv += normalize(uv - mouseUv + vec2(0.001)) * mouseWave * rippleIntensity * 0.4;
        }
        vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
        vec2 b = abs(a);
        float aaWidth = 0.5;
        vec2 smoothB = vec2(smoothstep(0.0, aaWidth, b.x), smoothstep(0.0, aaWidth, b.y));
        vec3 color = vec3(0.0);
        color += exp(-gridThickness * smoothB.x * (0.8 + 0.3 * sin(pi * iTime)));
        color += exp(-gridThickness * smoothB.y);
        float ddd = exp(-2.0 * clamp(pow(dist, 1.5), 0.0, 1.0));
        vec2 vignetteCoords = vUv - 0.5;
        float vignette = 1.0 - pow(length(vignetteCoords) * 2.0, 2.0);
        vignette = clamp(vignette, 0.0, 1.0);
        float finalFade = ddd * vignette;
        float alpha = length(color) * finalFade * opacity;
        gl_FragColor = vec4(color * gridColor * finalFade * opacity, alpha);
      }
    `;

    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vert));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const U = (name: string) => gl.getUniformLocation(program, name);
    const uTime = U('iTime');
    const uRes = U('iResolution');
    const uColor = U('gridColor');
    const uRipple = U('rippleIntensity');
    const uGrid = U('gridSize');
    const uThick = U('gridThickness');
    const uOpacity = U('opacity');
    const uMouse = U('mousePosition');
    const uInfluence = U('mouseInfluence');

    const rgb = hexToRgb(gridColor);
    gl.uniform3f(uColor, rgb[0], rgb[1], rgb[2]);
    gl.uniform1f(uRipple, rippleIntensity);
    gl.uniform1f(uGrid, gridSize);
    gl.uniform1f(uThick, gridThickness);
    gl.uniform1f(uOpacity, opacity);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      const rect = container.getBoundingClientRect();
      targetMouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1.0 - (e.clientY - rect.top) / rect.height,
      };
    };
    const handleEnter = () => { mouseInfluenceRef.current = 1.0; };
    const handleLeave = () => { mouseInfluenceRef.current = 0.0; };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleEnter);
    container.addEventListener('mouseleave', handleLeave);

    let currentInfluence = 0;
    const render = (t: number) => {
      gl.uniform1f(uTime, t * 0.001);
      const lp = 0.08;
      mousePositionRef.current.x += (targetMouseRef.current.x - mousePositionRef.current.x) * lp;
      mousePositionRef.current.y += (targetMouseRef.current.y - mousePositionRef.current.y) * lp;
      currentInfluence += (mouseInfluenceRef.current - currentInfluence) * 0.05;
      gl.uniform1f(uInfluence, currentInfluence);
      gl.uniform2f(uMouse, mousePositionRef.current.x, mousePositionRef.current.y);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleEnter);
      container.removeEventListener('mouseleave', handleLeave);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}/>;
};

export default RippleGrid;
