import * as PIXI from 'pixi.js';
import globalStore from '@/store/store';
import roleStore from '@/store/roleStore';
import { dispatchBtnClickEvent, sleep } from '.';
import { GlowFilter } from '@pixi/filter-glow';
import { WIDTH, HEIGHT, RATE } from '@/const';
import message from '@/components/message/message';
import dbStore from '@/store/dbStore';
import { TypeEnum } from '@/db/db';
import { Button } from '@/components/pixiComponents';

/**商品圆角 */
const spriteMask = (sprite: PIXI.Sprite) => {
  // 创建一个遮罩图形
  const mask = new PIXI.Graphics();
  mask.beginFill(0xffffff);
  mask.drawCircle(sprite.x, sprite.y, sprite.width / 2);
  mask.endFill();
  mask.zIndex = 2;

  // 将遮罩应用于精灵
  sprite.mask = mask;
  return mask;
};

/**商品区域背景 */
const drawGraphicsRadius = () => {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0xffffff); // 填充颜色
  // graphics.lineStyle(2, 0xff0000); // 边框样式

  // 绘制圆角矩形
  const width = WIDTH / 5;
  const height = width * 1.5;
  const cornerRadius = 20;
  graphics.drawRoundedRect(0, 0, width, height, cornerRadius);

  // 结束绘制
  graphics.endFill();
  graphics.zIndex = 1;
  const filter = new PIXI.filters.ColorMatrixFilter();
  graphics.filters = [filter, new PIXI.filters.NoiseFilter(0.2)];
  filter.sepia(true);

  return graphics;
};

/**显示关卡 */
const showLevel = async (app: PIXI.Application) => {
  const text = new PIXI.Text(`关卡：${globalStore.level}`, {
    fontFamily: 'IPix', // 字体
    fontSize: parseInt(document.body.style.fontSize) * 3, // 字体大小
    fill: 'white', // 字体颜色
    align: 'center', // 对齐方式
  });

  text.x = app.renderer.width / 2;
  text.y = app.renderer.height / 2;

  text.anchor.set(0.5);
  app.stage.addChild(text);
  await sleep(1500);
  app.stage.removeChild(text);
  return;
};

/**花费金币区域 */
const speedCoins = (coins: number) => {
  const coinsContainer = new PIXI.Container();
  const coinSprite = new PIXI.Sprite(globalStore.toolsTextures[3]);
  const text = new PIXI.Text(coins, {
    fontFamily: 'IPix', // 字体
    fontSize: parseInt(document.body.style.fontSize) * 2, // 字体大小
    fill: 'black', // 字体颜色
    align: 'center', // 对齐方式
  });
  coinsContainer.addChild(coinSprite);
  coinsContainer.addChild(text);

  coinSprite.scale.set(0.2 * RATE);
  coinSprite.y = (coinsContainer.height - coinSprite.height) / 2;

  text.x = coinSprite.width + 6 * RATE;
  text.y = (coinsContainer.height - text.height) / 2;

  return coinsContainer;
};

/**购买按钮 */
const buyButton = () => {
  const container = new Button('购买');
  container.pivot.set(container.width / 2, container.height / 2);
  container.on('mouseover', function () {
    container.scale.set(1.05);
  });

  container.on('mouseout', () => {
    container.scale.set(1);
  });

  return container;
};

/**购买界面 */
export const buyStage = async ({ app }: { app: PIXI.Application }) => {
  return new Promise(async (resolve, reject) => {
    try {
      app.stage.removeChildren();
      await showLevel(app);
      // console.log(this.toolsTextures)
      const spriteView = new PIXI.Sprite(globalStore.toolsTextures[0]);
      const spritePurify = new PIXI.Sprite(globalStore.toolsTextures[1]);
      const confusion = new PIXI.Sprite(globalStore.toolsTextures[2]);
      const roadTexture = new PIXI.Sprite(globalStore.toolsTextures[4]);
      const list = [
        { sprite: spriteView, price: 50 },
        { sprite: spritePurify, price: 30 },
        { sprite: roadTexture, price: 80 },
      ];
      if (roleStore.isReverse) {
        list.push({ sprite: confusion, price: 20 });
      }
      const glowFilter = new GlowFilter({ distance: 5, innerStrength: 1 });
      const shopContainer = new PIXI.Container();
      let shopContainerW = 0;
      let shopContainerH = 0;

      list.forEach((item, index) => {
        const { sprite, price } = item;

        const radiusGround = drawGraphicsRadius();
        const spriteItemContainer = new PIXI.Container();
        const spriteItemContainerW = radiusGround.width;
        const spriteItemContainerH = radiusGround.height;

        sprite.zIndex = 2;
        sprite.width = 50 * RATE;
        sprite.height = 50 * RATE;

        sprite.x = spriteItemContainerW / 2;
        sprite.y = sprite.height;
        if (index !== 0) {
          spriteItemContainer.x +=
            spriteItemContainerW * index + 30 * RATE * index;
        }
        sprite.anchor.set(0.5);

        const mask = spriteMask(sprite);

        // 设置精灵对象的交互属性
        sprite.interactive = true;
        sprite.buttonMode = true;
        // 添加鼠标悬停事件
        // sprite.on('mouseover', function () {
        //   sprite.filters = [glowFilter];
        // });

        // sprite.on('mouseout', () => {
        //   sprite.filters = [];
        // });

        shopContainerW += radiusGround.width;
        shopContainerH = radiusGround.height;
        spriteItemContainer.addChild(radiusGround);
        spriteItemContainer.addChild(sprite);
        spriteItemContainer.addChild(mask);

        // 金币价格
        const coinContainer = speedCoins(price);
        coinContainer.x = sprite.x - coinContainer.width / 2;
        coinContainer.y = sprite.y + sprite.height;
        spriteItemContainer.addChild(coinContainer);

        // 购买按钮
        const buyButtonContainer = buyButton();
        spriteItemContainer.addChild(buyButtonContainer);
        buyButtonContainer.x = radiusGround.width / 2;
        buyButtonContainer.y =
          spriteItemContainer.height - buyButtonContainer.height - 20;
        buyButtonContainer.on('click', function () {
          dispatchBtnClickEvent();
          if (roleStore.coins < price) {
            message.error({
              content: '金币不足！',
            });
            return;
          }
          message.success({
            content: '购买成功',
          });
          if (index === 0) {
            roleStore.viewDistance++;
            dbStore.addLogger({
              type: TypeEnum.Buy,
              content: '购买视野',
              focus: '视野',
            });
          } else if (index === 1) {
            roleStore.purifyCount++;
            dbStore.addLogger({
              type: TypeEnum.Buy,
              content: '购买保护罩',
              focus: '保护罩',
            });
          } else if (index === 2) {
            roleStore.isRoad = true;
            dbStore.addLogger({
              type: TypeEnum.Buy,
              content: '购买印迹成功',
              focus: '会显示走过的路',
            });
            spriteItemContainer.removeChild(buyButtonContainer);
            app.renderer.render(app.stage);
          } else if (index === 3) {
            roleStore.isReverse = false;
            dbStore.addLogger({
              type: TypeEnum.Buy,
              content: '购买解除反向',
              focus: '解除反向',
            });
            spriteItemContainer.removeChild(buyButtonContainer);
            app.renderer.render(app.stage);
          }
          roleStore.coins = Math.max(roleStore.coins - price, 0);
        });

        shopContainer.addChild(spriteItemContainer);
      });
      shopContainerW += (list.length - 1) * 30;
      shopContainer.x = (app.renderer.width - shopContainerW) / 2;
      shopContainer.y = (app.renderer.height - shopContainerH) / 2;
      app.stage.addChild(shopContainer);

      const buyText = new PIXI.Text(`商店`, {
        fontFamily: 'IPix', // 字体
        fontSize: parseInt(document.body.style.fontSize) * 5, // 字体大小
        fill: 'white', // 字体颜色
        align: 'center', // 对齐方式
      });
      buyText.x = app.renderer.width / 2;
      buyText.y = parseInt(document.body.style.fontSize) * 10;
      buyText.anchor.set(0.5);
      app.stage.addChild(buyText);

      const skipTextContainer = new PIXI.Container();
      const skipText = new PIXI.Text(`结束购买`, {
        fontFamily: 'IPix', // 字体
        fontSize: parseInt(document.body.style.fontSize) * 3, // 字体大小
        fill: 'white', // 字体颜色
        align: 'center', // 对齐方式
      });
      skipText.x = app.renderer.width / 2;
      skipText.y =
        app.renderer.height - parseInt(document.body.style.fontSize) * 10;
      skipText.anchor.set(0.5);
      skipTextContainer.addChild(skipText);
      skipTextContainer.interactive = true;
      skipTextContainer.buttonMode = true;
      skipTextContainer.on('mouseover', function () {
        skipTextContainer.filters = [
          new GlowFilter({ distance: 2, innerStrength: 1, color: 0xffffff }),
        ];
      });

      skipTextContainer.on('mouseout', () => {
        skipTextContainer.filters = [];
      });

      skipTextContainer.on('click', () => {
        dispatchBtnClickEvent();
        resolve(null);
      });
      app.stage.addChild(skipTextContainer);
    } catch (e) {
      reject();
      console.error('buyStage--', e);
    }
  });
};
