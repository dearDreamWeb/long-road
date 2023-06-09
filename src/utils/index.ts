import { Graphics, Application } from 'pixi.js';

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

export const createLine = ({
  moveToX,
  moveToY,
  lineToX,
  lineToY,
  lineColor = 0xfffffff,
  lineWidth = 1,
}: CreateLine) => {
  let line = new Graphics();
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
