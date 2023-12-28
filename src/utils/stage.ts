import * as PIXI from 'pixi.js';
import globalStore from '@/store/store';
import roleStore from '@/store/roleStore';
import { sleep } from '.';
import { GlowFilter } from '@pixi/filter-glow';
import { WIDTH, HEIGHT } from '@/const';

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
      const list = [spriteView, spritePurify];
      const glowFilter = new GlowFilter({ distance: 5, innerStrength: 1 });
      const shopContainer = new PIXI.Container();
      let shopContainerW = 0;
      let shopContainerH = 0;

      list.forEach((sprite, index) => {
        sprite.width = 60;
        sprite.height = 60;
        sprite.x = (index + 1) * 60;
        sprite.y = 30;
        if (index === 1) {
          sprite.x += 50;
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
          if (roleStore.coins < 20) {
            return;
          }
          if (index === 0) {
            roleStore.viewDistance++;
          } else if (index === 1) {
            roleStore.purifyCount++;
          }
          roleStore.coins = Math.max(roleStore.coins - 20, 0);
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
