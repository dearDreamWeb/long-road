import * as PIXI from 'pixi.js';
import { WIDTH, HEIGHT, GRIDROWS, GRIDWIDTH, GRIDHEIGHT, RATE } from '@/const';
import JSEncrypt from 'jsencrypt';

interface CreateLine {
  moveToX: number;
  moveToY: number;
  lineToX: number;
  lineToY: number;
  lineColor?: number;
  lineWidth?: number;
}

interface TranslatePositionProps {
  width: number;
  height: number;
  itemRows: number;
  rows: number;
  columns: number;
}

interface ClickPositionProps extends Position {
  width: number;
  height: number;
  itemRows: number;
}

interface Position {
  x: number;
  y: number;
}

interface AnimatedSpriteUpdateParams {
  app: PIXI.Application;
  mainPosition: Position;
  list: PIXI.Texture<PIXI.Resource>[];
  sprite: PIXI.AnimatedSprite;
}

export const createLine = ({
  moveToX,
  moveToY,
  lineToX,
  lineToY,
  lineColor = 0xfffffff,
  lineWidth = 1,
}: CreateLine) => {
  let line = new PIXI.Graphics();
  line.lineStyle(lineWidth, lineColor, 1);
  line.moveTo(moveToX, moveToY);
  line.lineTo(lineToX, lineToY);
  return line;
};

/**
 * 路径坐标转换
 * @param param0
 * @returns
 */
export const translatePosition = ({
  width,
  height,
  itemRows,
  rows,
  columns,
}: TranslatePositionProps) => {
  const itemWidth = width / itemRows;
  const itemHeight = height / itemRows;
  return { x: itemWidth * columns, y: itemHeight * rows };
};

/**
 * 点击事件转换坐标
 */
export const clickPosition = ({
  width,
  height,
  itemRows,
  x,
  y,
}: ClickPositionProps) => {
  const itemWidth = width / itemRows;
  const columns = Math.floor(x / itemWidth);
  const rows = Math.floor(y / itemWidth);
  return {
    ...translatePosition({ width, height, itemRows, rows, columns }),
    relativeX: columns,
    relativeY: rows,
  };
};

/**
 * 随机ID
 * @returns
 */
export function randomHash(hashLength = 24): string {
  if (!hashLength || typeof Number(hashLength) != 'number') {
    return '';
  }
  let ar = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];
  let hs = [];
  let hl = Number(hashLength);
  let al = ar.length;
  for (let i = 0; i < hl; i++) {
    hs.push(ar[Math.floor(Math.random() * al)]);
  }

  return hs.join('');
}

/**更新主角动画 */
export function animatedSpriteUpdate({
  app,
  mainPosition,
  list,
  sprite,
}: AnimatedSpriteUpdateParams) {
  let animatedSprite = sprite.textures ? sprite : new PIXI.AnimatedSprite(list);
  animatedSprite.zIndex = 2;
  const { x, y } = translatePosition({
    width: WIDTH,
    height: HEIGHT,
    itemRows: GRIDROWS,
    rows: mainPosition.y,
    columns: mainPosition.x,
  });
  const scale = GRIDHEIGHT / (190 / 4);
  animatedSprite.anchor.set(0.5);
  animatedSprite.x = x + GRIDWIDTH / 2;
  animatedSprite.y = y + GRIDHEIGHT / 2;
  animatedSprite.scale.set(scale);
  animatedSprite.animationSpeed = 0.1; // 动画播放的速度，默认为1,每秒播放60张图片
  animatedSprite.loop = true; // 动画是否循环
  // animatedSprite.onComplete = () => {
  //   console.log('播放完成');
  // }; // 动画完成的回调函数
  animatedSprite.gotoAndPlay(0); // 从第几帧开始播放
  animatedSprite.zIndex = 99999;
  // console.log(app.stage.children);

  return animatedSprite;
}

/**将0x开头的颜色值转换成#颜色值 */
export function convertColor(hexColor: string) {
  // 去掉0x前缀并转换成十进制数
  const decimalColor = parseInt(hexColor, 16);
  // 将十进制数转换成十六进制字符串
  const hexString = decimalColor.toString(16);
  // 补齐字符串长度到6位
  const paddedHexString = hexString.padStart(6, '0');
  // 添加#前缀
  const finalColor = '#' + paddedHexString;
  return finalColor;
}

/**暂停时间 */
export function sleep(duration = 3000) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

/**防抖 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function debounce<T extends Function>(func: T, delay: number): T {
  let timer: NodeJS.Timeout | null;

  return function (this: unknown, ...args: unknown[]) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } as unknown as T;
}

/**随机数区间 */
export function randomRange(min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**触发自定义click事件 */
export function dispatchBtnClickEvent() {
  const btnClickEvent = new Event('btnClick');
  document.dispatchEvent(btnClickEvent);
}

/**加减金币 */
export function rangeCoins(min = 40, max = 200) {
  const random = Math.random();
  let coinsRate = 1;
  if (random < 0.65) {
    coinsRate = 0;
  } else if (random < 0.8) {
    coinsRate = 0.3;
  } else if (random < 0.9) {
    coinsRate = 0.5;
  } else if (random < 0.95) {
    coinsRate = 0.8;
  } else {
    return max;
  }
  return Math.floor((max - min) * coinsRate + min);
}

/**随机洗牌 */
export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const encrypt = (text: string) => {
  const PUB_KEY = import.meta.env.VITE_PUBLIC_KEY || '';
  let encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUB_KEY);
  let maxChunkLength = 20,
    inOffset = 0;
  let arr = [];
  while (inOffset < text.length) {
    const str = encrypt.encrypt(
      text.substring(inOffset, inOffset + maxChunkLength)
    );
    arr.push(str);
    inOffset += maxChunkLength;
  }
  return JSON.stringify(arr);
};
