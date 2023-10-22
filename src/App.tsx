import { useEffect, useState, MouseEvent } from 'react';
import styles from './App.module.less';
import routes from '../config/routes';
import { renderRoutes } from 'react-router-config';
import DisableDevtool from 'disable-devtool';
import { createPortal } from 'react-dom';
import { RATE } from '@/const';
import store from '@/store/store';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import titleLogo from '@/assets/images/title-logo2.png';

function App() {
  const [isRender, setIsRender] = useState(false);

  const setRootRem = () => {
    const rootSize = RATE * 16;
    document.body.style.fontSize = `${rootSize}px`;
    document.documentElement.style.fontSize = `${rootSize}px`;
  };

  const buttonClick = (e: MouseEvent) => {
    if (
      (e as any).target?.nodeName === 'BUTTON' ||
      (e as any).target?.parentElement.nodeName === 'BUTTON'
    ) {
      store.audioResources.collectAudio.play();
    }
  };

  useEffect(() => {
    document.addEventListener('click', buttonClick as any);
    store.loadResource();
    setRootRem();
    if (import.meta.env.MODE !== 'development') {
      DisableDevtool({
        url: '/#/warning',
        disableMenu: true,
        ignore: ['/#/warning'],
      });
    }
    setIsRender(true);
  }, []);

  console.log(111, store.loadResources);

  return (
    <>
      {isRender && (
        <div className={styles.app}>
          {renderRoutes(routes)}
          {createPortal(<div id="message-wrapper"></div>, document.body)}
        </div>
      )}
      {store.loadResources && (
        <div
          className={classnames(
            'fixed left-0 top-0 w-screen h-screen  flex flex-col justify-center items-center theme-bg'
          )}
        >
          {/* <img
            className=" absolute left-1/2 top-12 -translate-x-1/2 "
            src={titleLogo}
            alt=""
          /> */}
          <h1
            className={classnames(
              'font-bold text-9xl absolute left-1/2 top-12 -translate-x-1/2',
              styles.titleLogoText
            )}
          >
            漫长之路
          </h1>
          <h1 className="font-bold">{store.loadingText}...</h1>
          <div className="w-1/2">
            <progress
              className="nes-progress is-primary"
              value={store.loadResourcesProgress}
              max="100"
            ></progress>
          </div>
        </div>
      )}
    </>
  );
}

export default observer(App);
