import { BgLayoutItemType } from '@/typings';
import { randomRange } from '.';

export interface Position {
  x: number;
  y: number;
}

interface ToolCell extends Position {
  value: BgLayoutItemType;
}

interface RoutePlanProps {
  start: Position;
  end: Position;
  centerPosition: Position;
  obstacleAll: BgLayoutItemType[][];
}

/**
 * Dijkstra算法
 * 广度搜索算法
 * @param param0
 * @returns
 */
export const routePlanDijkstra = ({
  start,
  end,
  obstacleAll,
}: Omit<RoutePlanProps, 'centerPosition'>) => {
  const bg = JSON.parse(JSON.stringify(obstacleAll));
  // 定义网格单元类
  class Cell {
    x: number;
    y: number;
    distance: number;
    is_obstacle: boolean;
    visited: boolean;
    is_start: boolean;
    is_end: boolean;
    prev_cell: any;
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.is_obstacle = obstacleAll[y][x] === BgLayoutItemType.obstacle;
      this.is_start = obstacleAll[y][x] === BgLayoutItemType.main;
      this.is_end = obstacleAll[y][x] === BgLayoutItemType.end;
      this.distance = Infinity; // 到起点的距离
      this.visited = false; // 是否已访问
      this.prev_cell = null; // 前一个网格单元
    }

    compareTo(other: Cell) {
      return this.distance - other.distance;
    }
  }

  obstacleAll.forEach((item, i) => {
    item.forEach((subItem, j) => {
      bg[j][i] = new Cell(i, j);
    });
  });
  // 初始化起点
  const start_cell = bg[start.y][start.x];
  start_cell.distance = 0;

  // 创建优先队列
  const pq = [start_cell];

  // Dijkstra算法
  while (pq.length) {
    const curr_cell = pq.shift();
    curr_cell.visited = true;

    // 找到终点，回溯路径
    if (curr_cell.x === end.x && curr_cell.y === end.y) {
      let path = [];
      let cell = curr_cell;
      while (cell) {
        path.push([cell.x, cell.y]);
        cell = cell.prev_cell;
      }
      path.reverse();
      if (path.length) {
        path = path.slice(1, path.length - 1);
      }
      return path;
    }

    // 计算相邻单元的距离
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const x = curr_cell.x + dx;
      const y = curr_cell.y + dy;
      if (
        x < 0 ||
        x >= obstacleAll.length ||
        y < 0 ||
        y >= obstacleAll.length
      ) {
        continue;
      }
      const neighbor_cell = bg[y][x];
      if (neighbor_cell.visited || neighbor_cell.is_obstacle) {
        continue;
      }
      const distance = curr_cell.distance;
      if (distance < neighbor_cell.distance) {
        neighbor_cell.distance = distance;
        neighbor_cell.prev_cell = curr_cell;
        pq.push(neighbor_cell);
        pq.sort((a, b) => a.compareTo(b));
      }
    }
  }
  return [];
};

/**随机终点 */
export const randomEnd = (
  bgArr: BgLayoutItemType[][],
  canUserList: Position[],
  mainP: Position
): Position => {
  const randomPosition = randomRange(0, canUserList.length - 1);
  const result = routePlanDijkstra({
    start: mainP,
    end: canUserList[randomPosition],
    obstacleAll: bgArr,
  });
  if (!result.length) {
    return randomEnd(
      bgArr,
      JSON.parse(JSON.stringify(canUserList.splice(randomPosition, 1))),
      mainP
    );
  }
  return canUserList[randomPosition];
};

/**道具随机生成 */
export const randomTools = (canUserList: Position[], level: number) => {
  const toolsList: ToolCell[] = [];

  for (let i = 0; i < canUserList.length; i++) {
    const { x, y } = canUserList[i];
    const random = Math.random();
    if (random > 0.87 && random < 0.97) {
      toolsList.push({ x, y, value: BgLayoutItemType.duel });
    } else if (random >= 0.97 && random < 0.99) {
      toolsList.push({ x, y, value: BgLayoutItemType.protect });
    } else if (random >= 0.99) {
      toolsList.push({ x, y, value: BgLayoutItemType.backTo });
    }
  }
  return toolsList;
};

export const createdLevel = (
  bgArr: BgLayoutItemType[][],
  level: number
): [BgLayoutItemType[][], Position] => {
  let newList: BgLayoutItemType[][] = JSON.parse(JSON.stringify(bgArr));
  let canUserList: Position[] = [];
  let mainP: Position = { x: 0, y: 0 };
  for (let y = 0; y < newList.length; y++) {
    const itemArr = newList[y];
    for (let x = 0; x < itemArr.length; x++) {
      if (newList[y][x] === BgLayoutItemType.empty) {
        canUserList.push({ x, y });
      }

      if (newList[y][x] === BgLayoutItemType.main) {
        mainP = { x, y };
      }

      if (
        [BgLayoutItemType.obstacle, BgLayoutItemType.main].includes(
          newList[y][x]
        )
      ) {
        continue;
      } else {
        newList[y][x] = BgLayoutItemType.empty;
      }
    }
  }
  const endPosition = randomEnd(
    newList,
    JSON.parse(
      JSON.stringify(canUserList.slice(0, Math.floor(canUserList.length / 2)))
    ),
    mainP
  );
  newList[endPosition.y][endPosition.x] = BgLayoutItemType.end;

  const toolsList = randomTools(
    canUserList.filter(
      (item) => item.y !== endPosition.y && item.x !== endPosition.x
    ),
    level
  );

  toolsList.forEach((item) => {
    newList[item.y][item.x] = item.value;
  });

  return [newList, mainP];
};
