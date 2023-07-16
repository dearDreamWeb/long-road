import * as PIXI from 'pixi.js';
import { WIDTH, HEIGHT, GRIDROWS, GRIDWIDTH, GRIDHEIGHT } from '@/const';

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
  const { x, y } = translatePosition({
    width: WIDTH,
    height: HEIGHT,
    itemRows: GRIDROWS,
    rows: mainPosition.y,
    columns: mainPosition.x,
  });
  const scale = GRIDWIDTH / (190 / 4);
  const diffX = ((1 - scale) * (148 / 4)) / 2 / 2;
  animatedSprite.x = x + diffX;
  animatedSprite.y = y;
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
