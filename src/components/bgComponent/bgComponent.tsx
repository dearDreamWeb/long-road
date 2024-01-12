import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { debounce } from '@/utils';
import { RATE, WIDTH } from '@/const';
import { bgTexture } from '@/utils/filters';
import { ShockwaveFilter } from '@pixi/filter-shockwave';

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
    document.addEventListener('mousemove', moveHandler);
    window.addEventListener('resize', renderBgStage);
    return () => {
      window.removeEventListener('resize', renderBgStage);
      document.removeEventListener('mousemove', moveHandler);
    };
  }, []);

  /**鼠标移动 */
  const moveHandler = debounce((e: MouseEvent) => {
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
    const createGradTexture = PIXI.Texture.from(
      bgTexture(rootSize, width, height)
    );
    const rows = Math.ceil(window.innerHeight / height);
    const columns = Math.ceil(window.innerWidth / width) + 1;
    const container = new PIXI.Container();
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const sprite = new PIXI.Sprite(createGradTexture);
        sprite.position.set(j * width - width * (i % 2 ? 0.5 : 1), i * height);
        sprite.width = width;
        sprite.height = height;
        container.addChild(sprite);
      }
    }
    const shockwaveFilter = new ShockwaveFilter(
      [mousePosition.current.x, mousePosition.current.y],
      {
        amplitude: 5, // 振幅
        wavelength: WIDTH / 2, // 波长
        // brightness: 1, // 亮度
      },
      0
    );

    container.filters = [shockwaveFilter];
    app.stage.addChild(container);
    app.ticker.add(() => {
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
