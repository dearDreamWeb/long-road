import Modal from '../modal/modal';
import styles from './blackjackGame.module.less';
import bg from '@/assets/images/blackjackGameBg.png';

interface BlackjackGamProps {
  isOpen: boolean;
  onChange(value: boolean): void;
}

const BlackjackGame = (props: BlackjackGamProps) => {
  const { isOpen, onChange } = props;
  return (
    <Modal isOpen={isOpen} className={styles.modalBox} width={600} height={600}>
      <div className={styles.blackjackGameBox}>
        <div className={styles.testBox}>
          <div className={styles.front}></div>
          <div className={styles.black}></div>
        </div>
      </div>
    </Modal>
  );
};

export default BlackjackGame;
