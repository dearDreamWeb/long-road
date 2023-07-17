import { useRef, useState, useEffect, EventHandler } from 'react';
import styles from './index.module.less';
import {
  createLine,
  translatePosition,
  clickPosition,
  animatedSpriteUpdate,
} from '@/utils';
import * as PIXI from 'pixi.js';
import globalStore from '@/store/store';
import roleStore from '@/store/roleStore';
import { observer, useObserver, Observer } from 'mobx-react';
import classNames from 'classnames';
import { BgLayoutItemType, Status, TextureCacheObj } from '@/typings';
import RockGame from '@/components/rockGame/rockGame';
import message from '@/components/message/message';
import { WIDTH, HEIGHT, GRIDROWS, GRIDWIDTH, GRIDHEIGHT } from '@/const';
import heroImg from '@/assets/images/hero.png';
import StatusComponent from './statusComponent/statusComponent';

interface RectGraphics extends PIXI.Graphics {
  rectType: BgLayoutItemType;
  paramX: number;
  paramY: number;
}

const colorMap = {
  [BgLayoutItemType.empty]: 0x000000,
  [BgLayoutItemType.backTo]: 0x64bcf2,
  [BgLayoutItemType.duel]: 0xe2f050,
  [BgLayoutItemType.end]: 0x67c23a,
  [BgLayoutItemType.main]: 0xe4393c,
  [BgLayoutItemType.obstacle]: 0xcccccc,
  [BgLayoutItemType.protect]: 0x6bd09e,
  [BgLayoutItemType.route]: 0xe6a23c,
};

const Index = () => {
  const [app, setApp] = useState<PIXI.Application>();
  // 背景条纹容器
  const bgContainer = useRef<PIXI.Container>(new PIXI.Container());
  // 方格容器
  const rectContainer = useRef<PIXI.Container>(new PIXI.Container());
  // 路径容器
  const routeContainer = useRef<PIXI.Container>(new PIXI.Container());
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    let _app = new PIXI.Application({
      width: WIDTH,
      height: HEIGHT,
      antialias: true,
      transparent: false,
      resolution: 1,
      backgroundColor: 0x000000,
      view: document.getElementById('mainCanvas') as HTMLCanvasElement,
    });
    setApp(_app);
    loaderResources();
    document.addEventListener('keydown', characterMove);
    // _app!.renderer.plugins.interaction.removeAllListeners();
    // // 点击事件生成障碍物，再次点击障碍物将障碍物消掉，也可以生成开始点和结束点
    // _app!.renderer.plugins.interaction.on(
    //   'pointerdown',
    //   (event: PIXI.InteractionEvent) => {
    //     let position = event.data.getLocalPosition(bgContainer.current!);
    //     const { x, y, relativeX, relativeY } = clickPosition({
    //       width: WIDTH,
    //       height: HEIGHT,
    //       itemRows: GRIDROWS,
    //       y: position.y,
    //       x: position.x,
    //     });
    //     globalStore.bgLayout[relativeY][relativeX] = BgLayoutItemType.obstacle;
    //     createRect({
    //       position: { x, y },
    //       type: BgLayoutItemType.obstacle,
    //     });
    //   }
    // );
  }, []);

  useEffect(() => {
    if (!app) {
      return;
    }
    initLine();
    drawLayout();
  }, [app, globalStore.bgLayout, roleStore.viewDistance]);

  // 人物移动动画
  useEffect(() => {
    if (!roleStore.heroTextures.down || !roleStore.heroTextures.down.length) {
      return;
    }
    if (roleStore.animatedSprite.textures) {
      roleStore.animatedSprite.textures =
        roleStore.heroTextures[roleStore.direction || 'down'];
    }
    const sprite = animatedSpriteUpdate({
      app: app!,
      sprite: roleStore.animatedSprite,
      list: roleStore.heroTextures[roleStore.direction || 'down'],
      mainPosition: roleStore.mainPosition,
    });
    if (roleStore.animatedSprite.textures) {
      app?.stage.removeChild(roleStore.animatedSprite);
    }
    roleStore.animatedSprite = sprite;
    app?.stage.addChild(roleStore.animatedSprite);
  }, [
    globalStore.bgLayout,
    roleStore.heroTextures,
    roleStore.direction,
    roleStore.viewDistance,
  ]);

  /**
   * 初始化网格
   */
  const initLine = () => {
    app?.stage.removeChild(bgContainer.current);
    bgContainer.current = new PIXI.Container();
    const container = new PIXI.Container();

    for (let i = 0; i < GRIDROWS + 1; i++) {
      const lineX = createLine({
        moveToX: 0,
        moveToY: i * GRIDHEIGHT,
        lineToX: WIDTH,
        lineToY: i * GRIDHEIGHT,
      });
      const lineY = createLine({
        moveToX: i * GRIDWIDTH,
        moveToY: 0,
        lineToX: i * GRIDWIDTH,
        lineToY: HEIGHT,
      });
      container.addChild(lineX);
      container.addChild(lineY);
    }
    bgContainer.current = container;
    app!.stage.addChild(container);
  };

  /**
   * 创建格子
   * @param param0
   */
  const createRect = ({
    position,
    type = BgLayoutItemType.obstacle,
  }: {
    position: { x: number; y: number };
    type?: BgLayoutItemType;
  }) => {
    const { x, y } = position;
    let rectangle = new PIXI.Graphics() as RectGraphics;
    rectangle.lineStyle(1, 0x000000, 1);
    rectangle.beginFill(colorMap[type]);
    rectangle.drawRect(
      x - (x % GRIDWIDTH),
      y - (y % GRIDHEIGHT),
      GRIDWIDTH,
      GRIDHEIGHT
    );
    rectangle.endFill();
    rectangle.paramX = x;
    rectangle.paramY = y;
    rectangle.rectType = type;
    rectContainer.current?.addChild(rectangle);
    app?.stage.addChild(rectContainer.current!);
  };

  /**
   * 绘制画布
   */
  const drawLayout = () => {
    const { x: mainX, y: mainY } = roleStore.mainPosition;
    globalStore.bgLayout.forEach((items, y) => {
      items.forEach((item: BgLayoutItemType, x) => {
        if (
          Math.abs(mainX - x) < roleStore.viewDistance &&
          Math.abs(mainY - y) < roleStore.viewDistance
        ) {
          createRect({
            position: translatePosition({
              width: WIDTH,
              height: HEIGHT,
              itemRows: GRIDROWS,
              rows: y,
              columns: x,
            }),
            type: item,
          });
        } else {
          createRect({
            position: translatePosition({
              width: WIDTH,
              height: HEIGHT,
              itemRows: GRIDROWS,
              rows: y,
              columns: x,
            }),
            type: BgLayoutItemType.empty,
          });
        }
      });
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setFlash(0);
    }, 1000);
  }, [flash]);

  /**
   * 移动主角
   * @param e
   * @returns
   */
  const characterMove = (e: KeyboardEvent) => {
    if (globalStore.status === Status.stop) {
      return;
    }
    let nextStep = { ...roleStore.mainPosition };
    const step = roleStore.isReverse ? -1 : 1;
    switch (e.key) {
      case 'ArrowUp':
        roleStore.direction = roleStore.isReverse ? 'down' : 'up';
        nextStep.y -= step;
        break;
      case 'ArrowDown':
        roleStore.direction = roleStore.isReverse ? 'up' : 'down';
        nextStep.y += step;
        break;
      case 'ArrowLeft':
        roleStore.direction = roleStore.isReverse ? 'right' : 'left';
        nextStep.x -= step;
        break;
      case 'ArrowRight':
        roleStore.direction = roleStore.isReverse ? 'left' : 'right';
        nextStep.x += step;
        break;
      // case 's':
      //   globalStore.bgLayout.forEach((rows, rowIndex) => {
      //     rows.forEach((item, columnIndex) => {
      //       if (item === BgLayoutItemType.obstacle) {
      //         arr.push([columnIndex, rowIndex]);
      //       }
      //     });
      //   });
      //   console.log(arr);
      //   break;
    }
    if (!globalStore.isCanWalk(nextStep.x, nextStep.y)) {
      return;
    }
    const rectType = globalStore.bgLayout[nextStep.y][nextStep.x];
    globalStore.bgLayout[roleStore.mainPosition.y][roleStore.mainPosition.x] =
      BgLayoutItemType.route;
    globalStore.bgLayout[nextStep.y][nextStep.x] = BgLayoutItemType.main;
    globalStore.bgLayout = JSON.parse(JSON.stringify(globalStore.bgLayout));

    roleStore.mainPosition = { ...nextStep };
    globalStore.bgLayout[roleStore.mainPosition.y][roleStore.mainPosition.x] =
      BgLayoutItemType.main;
    globalStore.bgLayout[roleStore.endRect.y][roleStore.endRect.x] =
      BgLayoutItemType.end;

    if (rectType === BgLayoutItemType.duel) {
      globalStore.status = Status.stop;
      setFlash(Math.random());
      setTimeout(() => {
        globalStore.showGameModal = true;
      }, 500);
    } else if (rectType === BgLayoutItemType.end) {
      globalStore.winGame();
    }
    // createRect({
    //   position: translatePosition({
    //     width: WIDTH,
    //     height: HEIGHT,
    //     itemRows: GRIDROWS,
    //     rows: nextStep.y,
    //     columns: nextStep.x,
    //   }),
    //   type: BgLayoutItemType.main,
    // });
    // createRect({
    //   position: translatePosition({
    //     width: WIDTH,
    //     height: HEIGHT,
    //     itemRows: GRIDROWS,
    //     rows: roleStore.mainPosition.y,
    //     columns: roleStore.mainPosition.x,
    //   }),
    //   type: BgLayoutItemType.route,
    // });
  };

  /**
   * 加载图片资源
   */
  const loaderResources = () => {
    const loaders = new PIXI.Loader();
    loaders.add('heroImg', heroImg);
    loaders.load();
    let list: PIXI.Texture<PIXI.Resource>[][] = [];
    loaders.onComplete.add(() => {
      // 148x190
      const itemW = 148 / 4;
      const itemH = 190 / 4;
      for (let i = 0; i < 4; i++) {
        let arr: PIXI.Texture<PIXI.Resource>[] = [];
        for (let j = 0; j < 4; j++) {
          const spriteTexture = new PIXI.Texture(
            loaders.resources.heroImg.texture!.baseTexture,
            new PIXI.Rectangle(itemW * j, itemH * i, itemW, itemH)
          );
          arr.push(spriteTexture);
        }
        list.push(arr);
      }
      roleStore.heroTextures = {
        left: list[1],
        right: list[2],
        up: list[3],
        down: list[0],
      };
    });
  };

  return (
    <div className={styles.indexMain}>
      <button
        className={classNames('btn btn-primary', styles.testBtn)}
        onClick={() =>
          console.log(JSON.parse(JSON.stringify(globalStore.bgLayout)))
        }
      >
        Button
      </button>
      <div className={styles.main}>
        <StatusComponent />
        <div className={styles.canvasMain}>
          <canvas id="mainCanvas"></canvas>
          <div
            className={`${styles.flashBox} ${flash ? styles.flash : ''}`}
          ></div>
        </div>
      </div>
      <RockGame
        isOpen={globalStore.showGameModal}
        onChange={(value) => (globalStore.showGameModal = value)}
      />
    </div>
  );
};

export default observer(Index);
