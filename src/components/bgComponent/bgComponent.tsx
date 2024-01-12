import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { debounce } from '@/utils';
import { RATE, WIDTH } from '@/const';
import { bgTexture } from '@/utils/filters';
import { ShockwaveFilter } from '@pixi/filter-shockwave';
import textureImg from '@/assets/images/hVKo63B.jpg';

function BgComponent() {
  const bgAppRef = useRef<PIXI.Application>();
  const mousePosition = useRef<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    let _app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      transparent: true,
      resolution: 1,
      backgroundColor: 0xd1fae5,
      view: document.getElementById('bgCanvas') as HTMLCanvasElement,
    });
    renderBgStage(null, null, _app);
    bgAppRef.current = _app;
    document.addEventListener('click', clickHandler);
    window.addEventListener('resize', renderBgStage);
    return () => {
      window.removeEventListener('resize', renderBgStage);
      document.removeEventListener('click', clickHandler);
    };
  }, []);

  /**鼠标点击 */
  const clickHandler = debounce((e: MouseEvent) => {
    mousePosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
    renderBgStage();
  }, 100);

  /**渲染背景 */
  const renderBgStage = (that?: any, e?: any, _app?: PIXI.Application) => {
    const app = _app || bgAppRef.current!;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.removeChildren();
    const rootSize = RATE * 16 * 1.5;
    const width = rootSize * 7;
    const height = rootSize * 3;
    const container = new PIXI.Container();
    const sprite = PIXI.Sprite.from(bgTexture(rootSize, width, height));
    container.addChild(sprite);

    const shockwaveFilter = new ShockwaveFilter(
      [mousePosition.current.x, mousePosition.current.y],
      {
        amplitude: 5, // 振幅
        wavelength: WIDTH / 2, // 波长
        // brightness: 1, // 亮度
      },
      0
    );

    // container.filters = [shockwaveFilter];

    const displacementSprite = PIXI.Sprite.from(textureImg);
    const displacementFilter = new PIXI.filters.DisplacementFilter(
      displacementSprite
    );

    displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    displacementSprite.scale.set(0.5);
    container.addChild(displacementSprite);
    container.filters = [shockwaveFilter, displacementFilter];

    app.stage.addChild(container);
    app.ticker.add(() => {
      displacementSprite.x++;
      if (displacementSprite.x > 500) {
        displacementSprite.x = 0;
      }
      shockwaveFilter.time += 0.01;
      if (window.innerWidth / 10 < shockwaveFilter.time / 0.02) {
        shockwaveFilter.time = 0;
      }
    });
  };

  return (
    <div className="fixed left-0 top-0 w-screen h-screen">
      <canvas id="bgCanvas"></canvas>
    </div>
  );
}

export default BgComponent;
