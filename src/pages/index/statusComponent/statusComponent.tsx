import { useMemo } from 'react';
import styles from './statusComponent.module.less';
import globalStore from '@/store/store';
import viewImg from '@/assets/images/view.png';

const StatusComponent = () => {
  const statusList = useMemo(() => {
    return [
      {
        key: '0',
        title: '视野范围',
        desc: '角色可见的范围',
        img: viewImg,
        count: globalStore.viewDistance,
      },
    ];
  }, [globalStore.viewDistance]);
  return (
    <div className={styles.statusBox}>
      {statusList.map((item) => (
        <div key={item.key}>
          <div>
            <title>{item.title}</title>
            <div className="badge">{item.count}</div>
          </div>
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={item.img} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusComponent;
