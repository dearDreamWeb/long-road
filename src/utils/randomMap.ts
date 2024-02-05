import seedrandom from 'seedrandom';

/**
 * 随机深度优先搜索算法（Randomized Depth-First Search Algorithm）：
 * 从起点开始，将起点标记为已访问。
 * 随机选择一个相邻的未访问的节点，并将其与当前节点之间的墙打通，然后将该节点标记为已访问。
 * 重复上述步骤，直到所有的节点都被访问过。
 * 如果在访问过程中遇到已访问的节点，则回溯到上一个未访问的节点，并继续随机选择相邻的未访问节点。
 * 最终得到的迷宫就是一个随机生成的迷宫。
 * @param rows
 * @param columns
 * @returns
 */
export function generateMaze(rows: number, columns: number) {
  const random = seedrandom(Math.random().toString());
  // 创建一个二维数组表示迷宫
  const maze = (new Array(rows) as any)
    .fill(null)
    .map(() => (new Array(columns) as any).fill(1));

  function generate(x: number, y: number) {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]; // 上下左右四个方向
    directions.sort(() => random() - 0.5); // 随机打乱方向数组

    maze[x][y] = 0; // 将当前节点标记为已访问

    for (let direction of directions) {
      const [dx, dy] = direction;
      const newX = x + 2 * dx;
      const newY = y + 2 * dy;

      if (
        newX >= 0 &&
        newX < rows &&
        newY >= 0 &&
        newY < columns &&
        maze[newX][newY] === 1
      ) {
        maze[newX][newY] = 0; // 将当前节点与下一个节点之间的墙打通
        maze[x + dx][y + dy] = 0; // 将中间节点标记为已访问
        generate(newX, newY); // 递归生成下一个节点
      }
    }
  }

  generate(24, 12); // 从随机起点开始生成迷宫
  maze[24][12] = 2;
  return maze;
}
