import { useEffect, useState } from 'react';
import blackjackGameStore from './blackjackGameStore';
import { observer, useObserver } from 'mobx-react';
import Modal from '../modal/modal';
import styles from './blackjackGame.module.less';
import classNames from 'classnames';
import Typewriter from '../typewriter/typewriter';

interface BlackjackGamProps {
  isOpen: boolean;
  onChange(value: boolean): void;
}

const BlackjackGame = (props: BlackjackGamProps) => {
  const { isOpen, onChange } = props;
  const playerInfo = useObserver(() => blackjackGameStore.playerInfo);
  const computerInfo = useObserver(() => blackjackGameStore.computerInfo);
  const isOver = useObserver(() => blackjackGameStore.isOver);
  const isWin = useObserver(() => blackjackGameStore.isWin);
  const [playerTurn, setPlayerTurn] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    blackjackGameStore.resetData();
  }, [isOpen]);

  const playerAdd = () => {
    if (isOver) {
      console.log('game over');
      return;
    }
    blackjackGameStore.addCard(true, blackjackGameStore.getRandomNum());
  };

  const playerStop = async () => {
    setPlayerTurn(false);
    await blackjackGameStore.autoCard();
  };

  return (
    <Modal isOpen={isOpen} className={styles.modalBox} width={700} height={700}>
      <div className={styles.blackjackGameBox}>
        <h1 className="title-1">决斗吧，骚年</h1>
        <p>规则：</p>
        <Typewriter text="游戏的目标是在不超过总分21的情况下获得高于庄家的得分。每张牌的分值在1-10之间。"></Typewriter>
        <div className="mt-2  pl-2 py-1 h-128 flex flex-col bg-lime-700 shadow-md shadow-indigo-500/50">
          <h2 className="font-bold text-3xl mb-2 text-info">
            庄家：{computerInfo.count}
          </h2>
          <div className={styles.computerBox}>
            {computerInfo.cardList.map((item, index) => (
              <div
                className={classNames({
                  [styles.cardBox]: true,
                  [styles.rotate]: true,
                })}
                key={index}
              >
                <div
                  className={classNames([
                    styles.front,
                    styles[`front-${item}`],
                  ])}
                ></div>
                <div className={styles.black}></div>
              </div>
            ))}
            <div className={classNames([styles.cardBox])}>
              <div className={styles.black}></div>
            </div>
          </div>
          <div className="relative flex m-auto">
            {isOver ? (
              <h1 className="flex justify-center flex-auto items-center text-3xl">
                {isWin ? '你赢了' : '你输了'}
              </h1>
            ) : (
              <h1 className="flex justify-center flex-auto items-center text-3xl">
                {playerTurn ? '玩家回合' : '庄家回合'}...
              </h1>
            )}
          </div>
          <div className={styles.playerBox}>
            {playerInfo.cardList.map((item, index) => (
              <div
                className={classNames({
                  [styles.cardBox]: true,
                  [styles.rotate]: true,
                })}
                key={index}
              >
                <div
                  className={classNames([
                    styles.front,
                    styles[`front-${item}`],
                  ])}
                ></div>
                <div className={styles.black}></div>
              </div>
            ))}
            <div className={classNames([styles.cardBox])}>
              <div className={styles.black}></div>
            </div>
          </div>
          <div className="flex">
            <h2 className="font-bold text-3xl mt-2 text-success">
              你：{playerInfo.count}
            </h2>
            <div className="ml-32 mr-2 flex">
              <button className="btn mr-4" onClick={playerAdd}>
                要
              </button>
              <button className="btn btn-accent" onClick={playerStop}>
                不要
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default observer(BlackjackGame);
