import * as PIXI from 'pixi.js';
import globalStore from '@/store/store';
import roleStore from '@/store/roleStore';
import { sleep } from '.';
import { GlowFilter } from '@pixi/filter-glow';
import { WIDTH, HEIGHT } from '@/const';
import message from '@/components/message/message';
import dbStore from '@/store/dbStore';
import { TypeEnum } from '@/db/db';

/**购买界面 */
export const buyStage = async ({ app }: { app: PIXI.Application }) => {
  return new Promise(async (resolve, reject) => {
    try {
      app.stage.removeChildren();
      // 创建一个 PIXI.Text 对象
      const text = new PIXI.Text(`关卡：${globalStore.level}`, {
        fontFamily: 'IPix', // 字体
        fontSize: parseInt(document.body.style.fontSize) * 3, // 字体大小
        fill: 'white', // 字体颜色
        align: 'center', // 对齐方式
      });

      // 设置文本对象的位置
      text.x = app.renderer.width / 2;
      text.y = app.renderer.height / 2;
      // 设置文本对象的锚点为中心点
      text.anchor.set(0.5);
      app.stage.addChild(text);
      await sleep(1500);
      app.stage.removeChild(text);
      // console.log(this.toolsTextures)
      const spriteView = new PIXI.Sprite(globalStore.toolsTextures[0]);
      const spritePurify = new PIXI.Sprite(globalStore.toolsTextures[1]);
      const confusion = new PIXI.Sprite(globalStore.toolsTextures[2]);
      const list = [
        { sprite: spriteView, price: 50 },
        { sprite: spritePurify, price: 30 },
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
        sprite.width = 60;
        sprite.height = 60;
        sprite.x = index * sprite.width;
        sprite.y = 30;
        if (index !== 0) {
          sprite.x += sprite.width * index;
        }
        sprite.anchor.set(0.5);
        // 设置精灵对象的交互属性
        sprite.interactive = true;
        sprite.buttonMode = true;
        // 添加鼠标悬停事件
        sprite.on('mouseover', function () {
          sprite.filters = [glowFilter];
        });

        sprite.on('mouseout', () => {
          sprite.filters = [];
        });

        // 添加鼠标点击事件
        sprite.on('click', function () {
          if (roleStore.coins < price) {
            message.error('金币不足！');
            return;
          }
          message.success({
            content: '购买成功',
            position: 'top',
            single: true,
          });
          if (index === 0) {
            roleStore.viewDistance++;
            dbStore.addLogger({ type: TypeEnum.Buy, content: '购买视野' });
          } else if (index === 1) {
            roleStore.purifyCount++;
            dbStore.addLogger({ type: TypeEnum.Buy, content: '购买保护罩' });
          } else if (index === 2) {
            roleStore.isReverse = false;
            dbStore.addLogger({ type: TypeEnum.Buy, content: '购买解除反向' });
          }
          roleStore.coins = Math.max(roleStore.coins - price, 0);
          if (index === 2) {
            shopContainer.removeChild(sprite);
            app.renderer.render(app.stage);
          }
        });
        shopContainerW += sprite.width;
        shopContainerH += sprite.height;
        shopContainer.addChild(sprite);
      });
      shopContainer.x = (app.renderer.width - shopContainerW) / 2 - 50;
      shopContainer.y = (app.renderer.height - shopContainerH) / 2;
      app.stage.addChild(shopContainer);

      const buyText = new PIXI.Text(`商店`, {
        fontFamily: 'IPix', // 字体
        fontSize: parseInt(document.body.style.fontSize) * 5, // 字体大小
        fill: 'white', // 字体颜色
        align: 'center', // 对齐方式
      });
      // 设置文本对象的位置
      buyText.x = app.renderer.width / 2;
      buyText.y = parseInt(document.body.style.fontSize) * 10;
      // 设置文本对象的锚点为中心点
      buyText.anchor.set(0.5);
      app.stage.addChild(buyText);

      const skipTextContainer = new PIXI.Container();
      const skipText = new PIXI.Text(`结束购买`, {
        fontFamily: 'IPix', // 字体
        fontSize: parseInt(document.body.style.fontSize) * 3, // 字体大小
        fill: 'white', // 字体颜色
        align: 'center', // 对齐方式
      });
      // 设置文本对象的位置
      skipText.x = app.renderer.width / 2;
      skipText.y =
        app.renderer.height - parseInt(document.body.style.fontSize) * 10;
      // 设置文本对象的锚点为中心点
      skipText.anchor.set(0.5);
      skipTextContainer.addChild(skipText);
      skipTextContainer.interactive = true;
      skipTextContainer.buttonMode = true;
      skipTextContainer.on('mouseover', function () {
        skipTextContainer.filters = [
          new GlowFilter({ distance: 5, innerStrength: 1, color: 0x209cee }),
        ];
      });

      skipTextContainer.on('mouseout', () => {
        skipTextContainer.filters = [];
      });

      skipTextContainer.on('click', () => {
        resolve(null);
      });
      app.stage.addChild(skipTextContainer);
    } catch (e) {
      reject();
      console.error('buyStage--', e);
    }
  });
};
