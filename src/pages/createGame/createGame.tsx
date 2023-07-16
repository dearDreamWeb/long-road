import { useEffect, useState, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { observer, useObserver, Observer } from 'mobx-react';
import { WIDTH, HEIGHT, GRIDROWS, GRIDWIDTH, GRIDHEIGHT } from '@/const';
import { BgLayoutItemType, Status, TextureCacheObj } from '@/typings';
import {
  createLine,
  translatePosition,
  clickPosition,
  animatedSpriteUpdate,
} from '@/utils';

interface RectGraphics extends PIXI.Graphics {
  rectType: BgLayoutItemType;
  paramX: number;
  paramY: number;
}

let defaultBgLayout: number[][] = [[]];
for (let i = 0; i < GRIDROWS; i++) {
  let rows = [];
  for (let j = 0; j < GRIDROWS; j++) {
    rows[j] = BgLayoutItemType.empty;
  }
  defaultBgLayout[i] = rows;
}

const defaultTypeList = [
  {
    type: BgLayoutItemType.empty,
    label: '清除',
  },
  {
    type: BgLayoutItemType.obstacle,
    label: '障碍物',
  },
];

const createGame = () => {
  const [app, setApp] = useState<PIXI.Application>();
  // 背景条纹容器
  const bgContainer = useRef<PIXI.Container>(new PIXI.Container());
  // 方格容器
  const rectContainer = useRef<PIXI.Container>(new PIXI.Container());
  const bgLayout = useRef<number[][]>(defaultBgLayout);
  const mainPosition = useRef<{ x: number; y: number }>({
    x: 12,
    y: 24,
  });
  const [endRect, setEndRect] = useState<{ x: number; y: number }>({
    x: 12,
    y: 0,
  });
  const [createType, setCreateType] = useState(BgLayoutItemType.obstacle);
  const [typeList, setTypeList] = useState([]);

  useEffect(() => {
    let _app = new PIXI.Application({
      width: WIDTH,
      height: HEIGHT,
      antialias: true,
      transparent: false,
      resolution: 1,
      backgroundColor: 0x000000,
      view: document.getElementById('createCanvas') as HTMLCanvasElement,
    });
    setApp(_app);
    _app!.renderer.plugins.interaction.removeAllListeners();
    // 点击事件生成障碍物，再次点击障碍物将障碍物消掉，也可以生成开始点和结束点
    _app!.renderer.plugins.interaction.on(
      'pointerdown',
      (event: PIXI.InteractionEvent) => {
        let position = event.data.getLocalPosition(bgContainer.current!);
        const { x, y, relativeX, relativeY } = clickPosition({
          width: WIDTH,
          height: HEIGHT,
          itemRows: GRIDROWS,
          y: position.y,
          x: position.x,
        });
        if (bgLayout.current[relativeY][relativeX] === createType) {
          bgLayout.current[relativeY][relativeX] = BgLayoutItemType.empty;
          createRect({
            position: { x, y },
            type: BgLayoutItemType.empty,
          });
        } else {
          bgLayout.current[relativeY][relativeX] = createType;
          createRect({
            position: { x, y },
            type: createType,
          });
        }
      }
    );
  }, []);

  useEffect(() => {
    if (!app) {
      return;
    }
    bgLayout.current[mainPosition.current.y][mainPosition.current.x] =
      BgLayoutItemType.main;
    bgLayout.current[endRect.y][endRect.x] = BgLayoutItemType.end;
    drawLayout();
  }, [app]);

  /**
   * 绘制画布
   */
  const drawLayout = () => {
    bgLayout.current.forEach((items, y) => {
      items.forEach((item: BgLayoutItemType, x) => {
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
      });
    });
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
      case BgLayoutItemType.empty:
        rectangle.beginFill(0x000000);
        break;
      case BgLayoutItemType.duel:
        rectangle.beginFill(0x1e6700);
        break;
      default:
        rectangle.beginFill(0xcccccc);
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

  return (
    <div className="relative">
      <div>
        <h1>当前要生成的类型</h1>
        <input
          type="radio"
          name="radio-7"
          className="radio radio-info"
          checked
        />
        <input type="radio" name="radio-7" className="radio radio-info" />
      </div>
      <canvas id="createCanvas"></canvas>
    </div>
  );
};

export default observer(createGame);
