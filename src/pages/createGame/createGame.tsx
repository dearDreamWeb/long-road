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
  convertColor,
} from '@/utils';
import Modal from '@/components/modal/modal';
import message from '@/components/message/message';

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

export const defaultTypeList = [
  {
    type: BgLayoutItemType.empty,
    label: '清除',
    color: '0x000000',
  },
  {
    type: BgLayoutItemType.obstacle,
    label: '障碍物',
    color: '0xcccccc',
  },
  {
    type: BgLayoutItemType.backTo,
    label: '回到原点',
    color: '0x64bcf2',
  },
  {
    type: BgLayoutItemType.duel,
    label: '决斗',
    color: '0xe2f050',
  },
  {
    type: BgLayoutItemType.end,
    label: '终点',
    color: '0x67c23a',
  },
  {
    type: BgLayoutItemType.main,
    label: '起点',
    color: '0xe4393c',
  },
  {
    type: BgLayoutItemType.protect,
    label: '保护卡',
    color: '0x6bd09e',
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
  const endRect = useRef<{ x: number; y: number }>({
    x: 12,
    y: 0,
  });
  const [createType, setCreateType] = useState(BgLayoutItemType.obstacle);
  const [typeList, setTypeList] = useState(defaultTypeList);
  const [isOpen, setIsOpen] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');

  useEffect(() => {
    let _app = app;
    if (!_app) {
      _app = new PIXI.Application({
        width: WIDTH,
        height: HEIGHT,
        antialias: true,
        transparent: false,
        resolution: 1,
        backgroundColor: 0x000000,
        view: document.getElementById('createCanvas') as HTMLCanvasElement,
      });
      setApp(_app);
    }

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
          drawLayout();
        } else {
          if (createType === BgLayoutItemType.main) {
            bgLayout.current[mainPosition.current.y][mainPosition.current.x] =
              BgLayoutItemType.empty;
            mainPosition.current = { x: relativeX, y: relativeY };
          } else if (createType === BgLayoutItemType.end) {
            bgLayout.current[endRect.current.y][endRect.current.x] =
              BgLayoutItemType.empty;
            endRect.current = { x: relativeX, y: relativeY };
          }
          bgLayout.current[relativeY][relativeX] = createType;
          drawLayout();
        }
      }
    );
  }, [app, createType]);

  useEffect(() => {
    if (!app) {
      return;
    }
    bgLayout.current[mainPosition.current.y][mainPosition.current.x] =
      BgLayoutItemType.main;
    bgLayout.current[endRect.current.y][endRect.current.x] =
      BgLayoutItemType.end;
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
    const item = typeList.find((item) => item.type === type);
    rectangle.beginFill(Number(item?.color));
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

  /**导入数据 */
  const importHandler = () => {
    setIsOpen(false);
    try {
      const value = JSON.parse(textareaValue);
      bgLayout.current = value;
      drawLayout();
    } catch (err) {
      message.info('数据格式错误');
    }
  };

  return (
    <div className="relative flex">
      <div className="mr-4 py-4 shadow-lg shadow-#ccc-500/50">
        <h1 className="mb-4 px-4 text-center">当前要生成的类型</h1>
        {typeList.map((item) => (
          <div
            key={item.type}
            className="flex items-center py-2 px-4 cursor-pointer hover:bg-base-200"
            onClick={() => setCreateType(item.type)}
          >
            <input
              type="radio"
              name="radio-7"
              className="radio radio-info w-5 h-5"
              checked={item.type === createType}
              onChange={() => setCreateType(item.type)}
            />
            <span
              className={`ml-2 ${item.type === createType ? 'text-info' : ''}`}
            >
              {item.label}
            </span>
            <span
              className="block ml-4 w-4 h-4"
              style={{ background: convertColor(item.color) }}
            ></span>
          </div>
        ))}
      </div>
      <canvas id="createCanvas"></canvas>
      <button
        className="btn btn-active absolute bottom-full mb-4 left-1/3"
        onClick={() => setIsOpen(true)}
      >
        导入数据
      </button>
      <button
        className="btn btn-neutral absolute bottom-full mb-4 left-1/2"
        onClick={() => {
          console.log(bgLayout.current);
        }}
      >
        保存数据
      </button>
      <Modal isOpen={isOpen}>
        <div className="p-4">
          <h1 className="text-lg font-bold text-center mb-8">导入数据</h1>
          <textarea
            className="textarea textarea-info w-full resize-none"
            placeholder="输入数据"
            rows={5}
            onChange={(e) => setTextareaValue(e.target.value)}
          ></textarea>
          <div className="flex justify-center mt-4">
            <button
              className="btn btn-info mr-4"
              onClick={() => setIsOpen(false)}
            >
              取消
            </button>
            <button className="btn btn-success" onClick={importHandler}>
              确定
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default observer(createGame);
