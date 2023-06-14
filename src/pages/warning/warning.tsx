import styles from './warning.module.less';

const Warning = () => {
  return (
    <div className={styles.warningBox}>
      <h1>禁止开启开发者工具</h1>
      <p>声明：请勿打开开发者工具对项目进行探究，创作不易。</p>
    </div>
  );
};

export default Warning;
