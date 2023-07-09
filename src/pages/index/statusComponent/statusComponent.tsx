import { useMemo } from 'react';
import styles from './statusComponent.module.less';
import roleStore from '@/store/roleStore';
import viewImg from '@/assets/images/view.png';
import classNames from 'classnames';

const StatusComponent = () => {
  const statusList = useMemo(() => {
    return [
      {
        key: '0',
        title: '视野范围',
        desc: '角色可见的范围',
        img: viewImg,
        count: roleStore.viewDistance,
      },
    ];
  }, [roleStore.viewDistance]);
  return (
    <div className={styles.statusBox}>
      <h1>状态栏</h1>
      {statusList.map((item) => (
        <div key={item.key} className="card w-32 bg-base-100 shadow-xl">
          <div className="card-body">
            <div className={styles.itemBox}>
              <div className={styles.titleBox}>
                <title>{item.title}</title>
                {!!item.count && (
                  <div
                    className={classNames([
                      'badge',
                      'badge-secondary',
                      styles.badgeBox,
                    ])}
                  >
                    {item.count}
                  </div>
                )}
              </div>
              <div className={styles.avatarBox}>
                <div className="tooltip" data-tip={item.desc}>
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src={item.img} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusComponent;
