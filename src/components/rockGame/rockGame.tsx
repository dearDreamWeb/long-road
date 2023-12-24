import { useState, useEffect, useMemo } from 'react';
import Modal from '../modal/modal';
import Typewriter from '../typewriter/typewriter';
import styles from './rockGame.module.less';
import globalStore from '@/store/store';
import { GameResultStatus } from '@/typings';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import CloseIcon from '@/components/closeIcon/closeIcon';
import rock1 from '@/assets/images/rock-game-1.png';
import rock2 from '@/assets/images/rock-game-2.png';
import rock3 from '@/assets/images/rock-game-3.png';

interface RockListItem {
  key: string;
  img: string;
}

interface GameOpponentListItem extends RockListItem {
  result: ResultType;
}

const rockList: RockListItem[] = [
  {
    key: '0',
    img: rock1,
  },
  {
    key: '1',
    img: rock2,
  },
  {
    key: '2',
    img: rock3,
  },
];

type ResultType = 0 | 1 | 2;

/**
 * 石头剪刀布结果
 * 0 输
 * 1 赢
 * 2 平
 * @param key
 * @param key1
 * @returns
 */
const ruleHandler = (key: string, key1: string): ResultType => {
  let result: ResultType = 2;
  switch (key) {
    case '0':
      if (key1 === '0') {
        result = 2;
      } else if (key1 === '1') {
        result = 1;
      } else {
        result = 0;
      }
      break;
    case '1':
      if (key1 === '1') {
        result = 2;
      } else if (key1 === '2') {
        result = 1;
      } else {
        result = 0;
      }
      break;
    case '2':
      if (key1 === '2') {
        result = 2;
      } else if (key1 === '0') {
        result = 1;
      } else {
        result = 0;
      }
      break;
  }
  return result;
};

interface RockGameProps {
  isOpen: boolean;
  onChange(value: boolean): void;
}

const resultMap = {
  win: {
    text: '你赢了，算你走运。',
    imgClass: 'text-success',
    imgUrl: 'https://resource.blogwxb.cn/longLoad/game-win.gif',
  },
  loss: {
    text: '你输喽，辣鸡！',
    imgClass: 'text-error',
    imgUrl: 'https://resource.blogwxb.cn/longLoad/game-loss.gif',
  },
  tie: {
    text: '什么，居然平手了？',
    imgClass: 'text-warning',
    imgUrl: 'https://resource.blogwxb.cn/longLoad/game-level.gif',
  },
};

const RockGame = (props: RockGameProps) => {
  const { isOpen, onChange } = props;

  const [selectedList, setSelectedList] = useState<RockListItem[]>([]);
  const [gameOpponentList, setGameOpponentList] = useState<
    GameOpponentListItem[]
  >([]);
  const [result, setResult] = useState(0);
  const [thinking, setThinking] = useState(true);

  const selectedRock = (data: RockListItem) => {
    if (globalStore.isEnd || selectedList.length > 2) {
      return;
    }
    setSelectedList([...selectedList, data]);
  };

  useEffect(() => {
    if (isOpen) {
      globalStore.isEnd = false;
      return;
    }
    init();
  }, [isOpen]);

  const init = () => {
    setSelectedList([]);
    setGameOpponentList([]);
    setResult(0);
    setThinking(true);
  };

  const resultOptions = useMemo(() => {
    return result < 0
      ? resultMap.loss
      : result > 0
      ? resultMap.win
      : resultMap.tie;
  }, [result]);

  const goBackHandler = () => {
    if (selectedList.length) {
      selectedList.pop();
      setSelectedList(JSON.parse(JSON.stringify(selectedList)));
    }
  };

  const confirmHandler = () => {
    const list = [];
    const obj = {
      '0': rock1,
      '1': rock2,
      '2': rock3,
    };
    let grade = 0;
    for (let i = 0; i < 3; i++) {
      const key = Math.floor(Math.random() * 3).toString();
      const result = ruleHandler(selectedList[i].key, key);
      if (result === 0) {
        grade--;
      } else if (result === 1) {
        grade++;
      }
      list.push({
        key,
        img: obj[key as '0' | '1' | '2'],
        result,
      });
    }
    setResult(grade);
    setGameOpponentList(list);
    setThinking(false);
    setTimeout(() => {
      globalStore.gameSettlement(
        grade > 0
          ? GameResultStatus.win
          : grade < 0
          ? GameResultStatus.loss
          : GameResultStatus.tie
      );
    }, 3000);
  };
  console.log(1111, globalStore.isEnd);
  return (
    <Modal
      isOpen={isOpen}
      className={styles.modalBox}
      width={700}
      height={700}
      mainAnimation
    >
      <div className={styles.gameBox}>
        <h1 className="title-1">决斗吧，骚年--《石头剪刀布》</h1>
        <p>规则：</p>
        <Typewriter text="选择每一轮的石头剪刀布，三局两胜!"></Typewriter>
        {thinking ? (
          <>
            <div className={styles.gameMain}>
              <div className={styles.gameOpponentBox}>
                <title className="text-green-500">
                  隔壁老王出招中
                  <span className="loading loading-dots loading-md"></span>
                </title>
              </div>
              <div className={styles.imgListBox}>
                {rockList.map((item) => (
                  <div
                    key={item.key}
                    className={styles.imgListItem}
                    style={{
                      backgroundImage: `url(${item.img})`,
                    }}
                    onClick={() => selectedRock(item)}
                  ></div>
                ))}
              </div>
              <div className={styles.resultBox}>
                {['一', '二', '三'].map((item, index) => (
                  <div key={index} className={styles.resultItemBox}>
                    <title>{`第${item}局`}选择</title>
                    <div
                      className={styles.resultItemImg}
                      style={{
                        backgroundImage: `url('${
                          selectedList[index] ? selectedList[index].img : ''
                        }')`,
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            {globalStore.isEnd ? (
              <div className="flex flex-col justify-center items-center">
                <div className="mt-20 text-xl">
                  游戏结果:
                  <span
                    className={classnames(
                      'inline-block ml-4',
                      resultOptions.imgClass
                    )}
                  >
                    {resultOptions.text}
                  </span>
                </div>
                <button
                  className="nes-btn px-8 text-xl mt-4"
                  onClick={() => onChange(false)}
                >
                  关闭
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className={styles.operationBox}>
                <button
                  className="btn btn-outline btn-info"
                  onClick={goBackHandler}
                >
                  撤回
                </button>
                <button
                  className="btn btn-outline btn-success"
                  onClick={confirmHandler}
                >
                  确定
                </button>
                <button
                  className="btn btn-outline btn-error"
                  onClick={() => {
                    setResult(-1);
                    globalStore.gameSettlement(GameResultStatus.loss);
                  }}
                >
                  投降
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.resultMain}>
            <div className={`${styles.roleName} text-info`}>隔壁老王</div>
            <div className={styles.resultBox}>
              {gameOpponentList.map((item, index) => (
                <div key={index} className={styles.resultItemBox}>
                  <div
                    className={styles.resultItemImg}
                    style={{
                      backgroundImage: `url('${item.img}')`,
                    }}
                  ></div>
                  <div
                    className={`${styles[`result${item.result}`]} ${
                      item.result === 0
                        ? 'text-error'
                        : item.result === 1
                        ? 'text-success'
                        : 'text-warning'
                    }`}
                  >
                    {item.result === 0 ? '输' : item.result === 1 ? '赢' : '平'}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.resultBox}>
              {selectedList.map((item, index) => (
                <div key={index} className={styles.resultItemBox}>
                  <div
                    className={styles.resultItemImg}
                    style={{
                      backgroundImage: `url('${item.img}')`,
                    }}
                  ></div>
                </div>
              ))}
            </div>
            <div className={`${styles.heroName} text-secondary`}>你</div>
            <div className="flex flex-col justify-center items-center">
              <div className="text-xl">
                游戏结果:
                <span
                  className={classnames(
                    'inline-block ml-4',
                    resultOptions.imgClass
                  )}
                >
                  {resultOptions.text}
                </span>
              </div>
              <button
                className="btn px-8 text-xl mt-4"
                onClick={() => onChange(false)}
              >
                关闭
                <CloseIcon />
              </button>
            </div>
            <div className={styles.resultImgBox}>
              <img
                className={styles.resultImg}
                src={resultOptions.imgUrl}
                alt="result"
              />
              <p className={`${resultOptions.imgClass}`}>
                {resultOptions.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default observer(RockGame);
