/**屏幕分辨率比 */
export const RATE = screen.width / 1920;
/**游戏界面的行列数 */
export const GRIDROWS = 25;
/**游戏界面的宽度 */
export const WIDTH = Math.floor((RATE * 700) / GRIDROWS) * GRIDROWS;
/**游戏界面的高度 */
export const HEIGHT = Math.floor((RATE * 700) / GRIDROWS) * GRIDROWS;
/**每个格子的宽度 */
export const GRIDWIDTH = WIDTH / GRIDROWS;
/**每个格子的高度 */
export const GRIDHEIGHT = HEIGHT / GRIDROWS;
/**最小视野范围 */
export const MINVIEWDISTANCE = 1;
/**最大视野范围 */
export const MAXEWDISTANCE = 10;
