import { RATE } from '@/const';
import * as PIXI from 'pixi.js';

type ContainerChild = PIXI.Sprite | PIXI.Text | PIXI.Graphics;

interface Params {
  bgColor?: number;
  bgWidth?: number;
  bgHeight?: number;
  buttonMode?: boolean;
  interactive?: boolean;
  textConfig?: PIXI.ITextStyle;
}

class Button extends PIXI.Container<ContainerChild> {
  text: string;
  backgroundLayer: PIXI.Graphics;
  childrenList: Array<ContainerChild>;
  params: Params;
  constructor(
    text = '',
    params = { bgColor: 0xffffff, interactive: true, buttonMode: true }
  ) {
    super();
    this.params = params;
    this.text = text;
    this.interactive =
      typeof this.params.interactive === 'boolean'
        ? this.params.interactive
        : true;
    this.buttonMode =
      typeof this.params.buttonMode === 'boolean'
        ? this.params.buttonMode
        : true;
    this.backgroundLayer = new PIXI.Graphics();
    this.addChild(this.backgroundLayer);
    this.childrenList = [];
    this.init();
  }

  init() {
    if (!this.text) {
      return;
    }
    const text = new PIXI.Text(this.text, {
      fontFamily: 'IPix', // 字体
      fontSize: parseInt(document.body.style.fontSize) * 2 || 24, // 字体大小
      fill: 'black', // 字体颜色
      align: 'center', // 对齐方式
      ...(this.params.textConfig || {}),
    });
    this.add(text);
  }

  renderButton() {
    let widthList: number[] = [];
    let heightList: number[] = [];
    this.childrenList.forEach((item) => {
      widthList.push(item.width);
      heightList.push(item.height);
    });
    const padding = 8;
    let allWidth = widthList.reduce((pre, next) => (next += pre), 0);
    allWidth += widthList.length - 1 * 8;
    const width = this.params.bgWidth || allWidth * 1.5;
    const height = this.params.bgHeight || Math.max(...heightList) * 1.2;
    const lrWidth = (width - allWidth) / 2;

    this.backgroundLayer.beginFill(this.params.bgColor); // 填充颜色
    const cornerRadius = 8 * RATE;
    this.backgroundLayer.lineStyle(2 * RATE, 0x000000); // 边框样式
    this.backgroundLayer.drawRoundedRect(0, 0, width, height, cornerRadius);
    this.backgroundLayer.endFill();
    // this.backgroundLayer.addChild()

    this.childrenList.forEach((item, index) => {
      if (!(item instanceof PIXI.Graphics)) {
        item.anchor.set(0);
      }
      const tbHeight = (height - item.height) / 2;

      item.x =
        lrWidth +
        (index === 0 ? 0 : this.childrenList[index - 1].width) +
        index * padding;
      item.y = tbHeight;
    });
  }

  add(child: ContainerChild) {
    this.addChild(child);
    this.childrenList.push(child);
    this.renderButton();
  }
}

export { Button };
