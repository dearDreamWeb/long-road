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
export const bgTexture = (size: number, width: number, height: number) => {
  const rootSize = size || RATE * 16 * 1.5;
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth; // 设置canvas的宽度
  canvas.height = window.innerHeight; // 设置canvas的高度
  const ctx = canvas.getContext('2d')!;
  const drawItem = (x: number, y: number) => {
    const lineWidth = rootSize * 0.4;
    ctx.fillStyle = '#d1fae5';
    ctx.fillRect(x, y, canvas.width, canvas.height);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#acd2be';
    ctx.strokeRect(x, y, canvas.width, canvas.height);
  };

  const rows = Math.ceil(window.innerHeight / height);
  const columns = Math.ceil(window.innerWidth / width) + 1;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      console.log(3232232, j * width - width * (i % 2 ? 0.5 : 1), i * height);
      drawItem(j * width - width * (i % 2 ? 0.5 : 1), i * height);
    }
  }
  return canvas;
};

interface MosaicImgProps {
  imgUrl: string;
  width?: number;
  height?: number;
  compressTimes?: number;
}

export const translateMosaicImg = (props: MosaicImgProps): Promise<string> => {
  return new Promise((resolve) => {
    const { imgUrl, width = 50, height = 50, compressTimes } = props;
    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 60;
    canvas.style.imageRendering = 'pixelated';
    const compressTimesConfig = compressTimes || 3;
    const ctx = canvas.getContext('2d')!;
    const canvasW = (width || 60) * RATE;
    const canvasH = (height || 60) * RATE;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.save();
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();

    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > canvasW || h > canvasH) {
        let radio = Math.max(h / canvasH, w / canvasW);
        radio = Number(radio.toFixed(2));
        img.width = Math.floor(w / radio);
        img.height = Math.floor(h / radio);
      }

      ctx.clearRect(0, 0, canvasW, canvasH);

      canvas.width = Math.floor(canvasW / compressTimesConfig);
      canvas.height = Math.floor(canvasH / compressTimesConfig);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL());
    };
    img.src = imgUrl;
  });
};
