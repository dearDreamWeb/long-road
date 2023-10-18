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
