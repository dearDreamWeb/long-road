/**屏幕分辨率比 */
export const RATE = screen.width / 1920;
/**游戏界面的行列数 */
export const GRIDROWS = 25;
/**游戏界面的宽度 */
export const WIDTH = Math.floor((RATE * 800) / GRIDROWS) * GRIDROWS;
/**游戏界面的高度 */
export const HEIGHT = Math.floor((RATE * 800) / GRIDROWS) * GRIDROWS;
/**每个格子的宽度 */
export const GRIDWIDTH = WIDTH / GRIDROWS;
/**每个格子的高度 */
export const GRIDHEIGHT = HEIGHT / GRIDROWS;
/**最小视野范围 */
export const MINVIEWDISTANCE = 1;
/**最大视野范围 */
export const MAXEWDISTANCE = 10;
/**特殊地块在迷雾中的显示透明度 */
export const HIDDEN_TILE_ALPHA = 0.45;
/**决斗结束后自动关闭弹窗（毫秒） */
export const DUEL_AUTO_CLOSE_MS = 2500;
/**知识竞赛结束后自动关闭（毫秒） */
export const KNOWLEDGE_AUTO_CLOSE_MS = 4000;
