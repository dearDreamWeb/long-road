import { useRef, useState, useEffect, EventHandler } from 'react';
import styles from './index.module.less';
import { createLine, translatePosition, clickPosition } from '@/utils';
import * as PIXI from 'pixi.js';
import globalStore from '@/store/store';
import { observer } from 'mobx-react';

// 决斗，输了路径去除回到原点，赢了获取开墙道具；保护道具；回到原点陷阱
export enum BgLayoutItemType {
  empty = 0, // 可以走
  obstacle = 1, // 障碍物
  main = 2, //主角
  end = 3, // 终点
  route = 4, // 走过的路径
  duel = 5, // 决斗
  protect = 6, // 保护卡
  backTo = 7, // 回到原点
}

interface RectGraphics extends PIXI.Graphics {
  rectType: BgLayoutItemType;
  paramX: number;
  paramY: number;
}

const WIDTH = 700;
const HEIGHT = 700;
const GRIDROWS = 25;
const GRIDWIDTH = WIDTH / GRIDROWS;
const GRIDHEIGHT = HEIGHT / GRIDROWS;

const Index = () => {
  const [app, setApp] = useState<PIXI.Application>();
  // 背景条纹容器
  const bgContainer = useRef<PIXI.Container>(new PIXI.Container());
  // 方格容器
  const rectContainer = useRef<PIXI.Container>(new PIXI.Container());
  // 方格容器
  const routeContainer = useRef<PIXI.Container>(new PIXI.Container());
  const mainPosition = useRef<{ x: number; y: number }>({
    x: 12,
    y: 24,
  });
  const [endRect, setEndRect] = useState<{ x: number; y: number }>({
    x: 12,
    y: 0,
  });

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
    globalStore.bgLayout[mainPosition.current.y][mainPosition.current.x] =
      BgLayoutItemType.main;
    globalStore.bgLayout[endRect.y][endRect.x] = BgLayoutItemType.end;
    initLine();
    drawStartEnd();
    drawObstacleArr();
  }, [app]);

  /**
   * 绘制起点和终点
   */
  const drawStartEnd = () => {
    createRect({
      position: translatePosition({
        width: WIDTH,
        height: HEIGHT,
        itemRows: GRIDROWS,
        rows: mainPosition.current.y,
        columns: mainPosition.current.x,
      }),
      type: BgLayoutItemType.main,
    });
    createRect({
      position: translatePosition({
        width: WIDTH,
        height: HEIGHT,
        itemRows: GRIDROWS,
        rows: endRect.y,
        columns: endRect.x,
      }),
      type: BgLayoutItemType.end,
    });
  };

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
    switch (type) {
      case BgLayoutItemType.route:
        rectangle.beginFill(0xe6a23c);
        break;
      case BgLayoutItemType.main:
        rectangle.beginFill(0xe4393c);
        break;
      case BgLayoutItemType.end:
        rectangle.beginFill(0x67c23a);
        break;
      case BgLayoutItemType.obstacle:
        rectangle.beginFill(0xcccccc);
        break;
      default:
        rectangle.beginFill(0x000000);
        break;
    }
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
   * 绘制障碍物
   */
  const drawObstacleArr = () => {
    globalStore.obstacleArr.forEach((item) => {
      createRect({
        position: translatePosition({
          width: WIDTH,
          height: HEIGHT,
          itemRows: GRIDROWS,
          rows: item[1],
          columns: item[0],
        }),
        type: BgLayoutItemType.obstacle,
      });
    });
  };

  /**
   * 移动主角
   * @param e
   * @returns
   */
  const characterMove = (e: KeyboardEvent) => {
    let nextStep = { ...mainPosition.current };
    let arr: number[][] = [];
    switch (e.key) {
      case 'ArrowUp':
        nextStep.y--;
        break;
      case 'ArrowDown':
        nextStep.y++;
        break;
      case 'ArrowLeft':
        nextStep.x--;
        break;
      case 'ArrowRight':
        nextStep.x++;
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
    globalStore.bgLayout[mainPosition.current.y][mainPosition.current.x] =
      BgLayoutItemType.route;
    globalStore.bgLayout[nextStep.y][nextStep.x] = BgLayoutItemType.main;
    createRect({
      position: translatePosition({
        width: WIDTH,
        height: HEIGHT,
        itemRows: GRIDROWS,
        rows: nextStep.y,
        columns: nextStep.x,
      }),
      type: BgLayoutItemType.main,
    });
    createRect({
      position: translatePosition({
        width: WIDTH,
        height: HEIGHT,
        itemRows: GRIDROWS,
        rows: mainPosition.current.y,
        columns: mainPosition.current.x,
      }),
      type: BgLayoutItemType.route,
    });
    mainPosition.current = { ...nextStep };
  };

  return (
    <div>
      <div className={styles.main}>
        {globalStore.count}
        <canvas id="mainCanvas"></canvas>
      </div>
    </div>
  );
};

export default observer(Index);
