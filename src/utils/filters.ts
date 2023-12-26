import { RATE } from '@/const';
import * as PIXI from 'pixi.js';

/**马赛克风格 */
export const mosaicFilter = () => {
  const fragStr = `
    precision mediump float;

    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float brightnessRange;
    uniform float edgeOpacity;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
    }
    
    void main(void) {
      vec4 color = texture2D(uSampler, vTextureCoord);
      
      // 随机调整亮度
      float randomValue = random(vTextureCoord);
      float brightness = randomValue * brightnessRange - brightnessRange / 2.0;
      color.rgb += vec3(brightness);
      
      // 计算片元与边缘的距离
      float distanceToEdge = min(min(vTextureCoord.x, 1.0 - vTextureCoord.x), min(vTextureCoord.y, 1.0 - vTextureCoord.y));
      
      // 随机调整边缘部分的透明度
      float edgeOpacityValue = random(vTextureCoord) * edgeOpacity;
      
      // 根据距离调整透明度
      float opacity = mix(1.0, edgeOpacityValue, distanceToEdge);
      
      color.a *= opacity;
      
      gl_FragColor = color;
    }
    
    
  `;
  return new PIXI.Filter(undefined, fragStr, {
    brightnessRange: 0.8,
    edgeOpacity: 0.3,
  });
};

/**背景方块材质 */
export const bgTexture = (size?: number) => {
  const rootSize = size || RATE * 16 * 1.5;
  const canvas = document.createElement('canvas');
  canvas.width = rootSize; // 设置canvas的宽度
  canvas.height = rootSize; // 设置canvas的高度
  const ctx = canvas.getContext('2d')!;
  // 线性渐变从左上角到右下角
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(255,255,255,1)'); // 起始颜色为白色
  gradient.addColorStop(0.5, 'transparent'); // 结束颜色为透明

  ctx.lineWidth = rootSize * 0.2;
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // ctx.fillStyle = '#d1fae5';
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
};
