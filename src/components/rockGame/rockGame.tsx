import { useState, useEffect } from 'react';
import Modal from '../modal/modal';
import Typewriter from '../typewriter/typewriter';
import styles from './rockGame.module.less';
import rock1 from '@/assets/images/rock-game-1.png';
import rock2 from '@/assets/images/rock-game-2.png';
import rock3 from '@/assets/images/rock-game-3.png';

interface RockListItem {
  key: string;
  img: string;
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

interface RockGameProps {
  isOpen: boolean;
  onChange(value: boolean): void;
}

const RockGame = (props: RockGameProps) => {
  const { isOpen, onChange } = props;

  const [selectedList, setSelectedList] = useState<RockListItem[]>([]);

  const selectedRock = (data: RockListItem) => {
    if (selectedList.length > 2) {
      return;
    }
    setSelectedList([...selectedList, data]);
  };

  const goBackHandler = () => {
    if (selectedList.length) {
      selectedList.pop();
      setSelectedList(JSON.parse(JSON.stringify(selectedList)));
    }
  };

  return (
    <Modal isOpen={isOpen} className={styles.modalBox} width={600} height={600}>
      <div className={styles.gameBox}>
        <h1 className="title-1">决斗吧，骚年</h1>
        <p>规则：</p>
        <Typewriter text="选择每一轮的石头剪刀布，三局两胜!"></Typewriter>
        <div className={styles.gameMain}>
          <div className={styles.gameOpponentBox}>
            <title className="text-green-500">
              对方出招中
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
        <button className="btn" onClick={goBackHandler}>
          撤回
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            onChange(false);
          }}
        >
          投降
        </button>
      </div>
    </Modal>
  );
};
export default RockGame;
