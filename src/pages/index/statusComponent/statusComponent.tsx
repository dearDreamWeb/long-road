import { useMemo } from 'react';
import { observer, useObserver, Observer } from 'mobx-react';
import styles from './statusComponent.module.less';
import roleStore from '@/store/roleStore';
import viewImg from '@/assets/images/view.png';
import confusionImg from '@/assets/images/confusion.png';
import purifyImg from '@/assets/images/purify.png';
import roadImg from '@/assets/images/road.png';
import classNames from 'classnames';
import MosaicImg from '@/components/mosaicImg/mosaicImg';

/**状态栏 */
const StatusComponent = () => {
  const statusList = useMemo(() => {
    return [
      {
        key: '0',
        title: '视野范围',
        desc: '角色可见的范围',
        img: viewImg,
        show: true,
        count: roleStore.viewDistance,
      },
      {
        key: '1',
        title: '混乱状态',
        desc: '移动方向相反',
        img: confusionImg,
        show: roleStore.isReverse,
        count: roleStore.isReverse ? 1 : 0,
      },
      {
        key: '2',
        title: '保护罩',
        desc: '可抵消一次失败处罚',
        img: purifyImg,
        show: roleStore.purifyCount,
        count: roleStore.purifyCount,
      },
      {
        key: '3',
        title: '印迹',
        desc: '会显示走过的路',
        img: roadImg,
        show: roleStore.isRoad,
        count: roleStore.isRoad ? 1 : 0,
      },
    ];
  }, [
    roleStore.viewDistance,
    roleStore.purifyCount,
    roleStore.isReverse,
    roleStore.isRoad,
  ]);
  return (
    <div className={classNames('nes-diy-border', styles.statusBox)}>
      <h1>状态栏</h1>
      {statusList.map(
        (item) =>
          !!item.show && (
            <div
              key={item.key}
              className={classNames([
                'card w-32 bg-base-100 shadow-xl mb-4',
                item.key === '0' && item.count === 1 ? 'card-error' : '',
              ])}
            >
              <div className="tooltip" data-tip={item.desc}>
                <div className="card-body">
                  <div className={styles.itemBox}>
                    <div className={styles.titleBox}>
                      <title>{item.title}</title>
                      {!!item.count && (
                        <div className={classNames([styles.badgeBox])}>
                          <i>+</i>
                          {item.count}
                        </div>
                      )}
                    </div>
                    <div className={styles.avatarBox}>
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img src={item.img} />
                          {/* <MosaicImg
                            imgUrl={item.img}
                            width={50}
                            height={50}
                            compressTimes={5}
                          /> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default observer(StatusComponent);
