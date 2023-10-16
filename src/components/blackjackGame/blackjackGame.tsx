import { useEffect } from 'react';
import blackjackGameStore from './blackjackGameStore';
import { observer, useObserver } from 'mobx-react';
import Modal from '../modal/modal';
import styles from './blackjackGame.module.less';
import classNames from 'classnames';

interface BlackjackGamProps {
  isOpen: boolean;
  onChange(value: boolean): void;
}

const BlackjackGame = (props: BlackjackGamProps) => {
  const { isOpen, onChange } = props;
  const playerInfo = useObserver(() => blackjackGameStore.playerInfo);
  const isOver = useObserver(() => blackjackGameStore.isOver);

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

  return (
    <Modal isOpen={isOpen} className={styles.modalBox} width={600} height={600}>
      <div className={styles.blackjackGameBox}>
        <div>{JSON.stringify(playerInfo.cardList)}</div>
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
                className={classNames([styles.front, styles[`front-${item}`]])}
              ></div>
              <div className={styles.black}></div>
            </div>
          ))}
          <div className={classNames([styles.cardBox])}>
            <div className={styles.black}></div>
          </div>
        </div>

        <button onClick={playerAdd}>添加</button>
      </div>
    </Modal>
  );
};

export default observer(BlackjackGame);
