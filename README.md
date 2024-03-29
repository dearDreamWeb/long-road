# 游戏链接
[github 地址](https://github.com/dearDreamWeb/long-road)
[游戏链接](https://long-load.vercel.app/#/)  
制作不易，请给`Star`。  
游戏加载界面
![游戏加载界面](https://raw.githubusercontent.com/dearDreamWeb/picture/main/longroad/iShot_2024-02-21_23.36.23.png)
游戏开始界面
![游戏界面](https://raw.githubusercontent.com/dearDreamWeb/picture/main/longroad/iShot_2024-02-05_23.08.07.png)

# 简介

《漫长之路》是一款是个迷宫探险闯关类像素风格的游戏。以探险为核心展开的游戏玩法。  
故事背景：玩家进入了异世界中，需要寻找出路返回之前的世界。玩家可以在迷宫中找到出路进入下一关。

# 游戏机制

1. 当角色视野归`0`时，代表角色`死亡`，`本关闯关结束`
2. 游戏分为`两个周目`，第一个周目总共有`五关`，关卡地图以及道具是`固定`。第二周目是无尽模式，进入第二周目关卡地图和道具是`随机生成`。随着关卡的提升，游戏`难度也会相应增加`。

# 游戏内容

## 角色属性分为

- `视野`：可看到界面的范围
- `保护罩`：游戏失败可以不用受到惩罚
- `印迹`：可以显示走过的路
- `混乱`：角色的方向会相反，比如按上键角色会向下走

## 游戏决斗

有时候角色会随机概率遇到怪，进行决斗，决斗失败会有随机惩罚，决斗胜利会有随机奖励。决斗有`四种`是随机的。如下

- `石头剪刀布`：传统的游戏，你懂的。
  ![石头剪刀布](https://raw.githubusercontent.com/dearDreamWeb/picture/main/longroad/iShot_2024-02-05_23.09.21.png)
- `21点`：玩家当前牌尽量筹齐 21 点，比对方大就算赢。
  ![21点](https://raw.githubusercontent.com/dearDreamWeb/picture/main/longroad/iShot_2024-02-05_23.08.38.png)
- `知识竞赛`：根据题目和问题选择答案，五道题答对三道即为胜利。
  ![知识竞赛](https://raw.githubusercontent.com/dearDreamWeb/picture/main/longroad/iShot_2024-02-05_23.10.02.png)
- `老虎机抽奖`：可以花费金币进行抽奖。
  ![老虎机抽奖](https://raw.githubusercontent.com/dearDreamWeb/picture/main/longroad/iShot_2024-02-21_23.35.23.png)

## 地图道具

- `保护罩`：可以获取一个保护罩。
- `回到原点陷阱`：会让角色回到重生点（如果有保护罩可以抵消）。
- `决斗陷阱`：进行决斗。
- `终点`：即可通关进入下一关，当角色周围一格内有终点，终点会显示出来。

## 商品购买页面

每关开始前出现商品购买页面，可以买道具加强角色的能力。  
商品购买页面，每项购买的道具除了`“印迹”`只能本关生效，其他的道路都可以后续关卡使用。
![商品购买页面](https://raw.githubusercontent.com/dearDreamWeb/picture/main/longroad/iShot_2024-02-25_21.41.17.png)

## 设置

设置界面暂时有两个功能：

- `音频管理`：可以开启游戏音频以及对应音频的音量大小。
- `存档管理`：游戏是每次过关会自动存档的。也可以手动存档，删除存档以及新建游戏。
  ![设置界面](https://raw.githubusercontent.com/dearDreamWeb/picture/main/longroad/iShot_2024-02-21_23.37.47.png)

# 游戏创作思路

本来就喜欢玩游戏，一直想做一款自己的游戏，然后因为能力的原因，做游戏这种子等待了两三年得以发芽了。就开始想系统的做一款小游戏。多少得益于我上家公司做过图形编辑器相关的工作，对可视化有了一些了解，在此之后一直也有一步步的小小的探索。  
实话实说这款游戏是缝合怪。当时创作的时候，遇怪特效以及机制缝合的是上学喜欢玩的`口袋妖怪 红`，`21点`游戏是缝合的`星露谷物语`的 21 点游戏界面风格。

# 技术栈

- Pixi.js
- React
- Vite
- Tailwind css
- IndexDb

# 结尾

如果有问题可以提[issues](https://github.com/dearDreamWeb/long-road/issues)
