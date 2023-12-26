import { useEffect, useState, MouseEvent, Suspense, useRef } from 'react';
import styles from './App.module.less';
import routes from '../config/routes';
import { renderRoutes } from 'react-router-config';
import DisableDevtool from 'disable-devtool';
import { createPortal } from 'react-dom';
import { RATE } from '@/const';
import store from '@/store/store';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { HashRouter } from 'react-router-dom';
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
      store.settings.switchAudio &&
      ((e as any).target?.nodeName === 'BUTTON' ||
        (e as any).target?.parentElement.nodeName === 'BUTTON')
    ) {
      store.audioResources.buttonClickAudio.play();
    }
  };

  useEffect(() => {
    document.addEventListener('click', buttonClick as any);
    setRootRem();
    if (import.meta.env.MODE !== 'development') {
      DisableDevtool({
        url: '/#/warning',
        disableMenu: true,
        ignore: ['/#/warning'],
      });
    }
    (async () => {
      const res = await store.loadResource();
      if (!res) {
        return;
      }
      setIsRender(true);
    })();
  }, []);

  return (
    <Suspense>
      <div className="relative">
        {isRender && (
          <>
            <div className={styles.app}>
              <HashRouter>{renderRoutes(routes)}</HashRouter>
              {createPortal(<div id="message-wrapper"></div>, document.body)}
            </div>
          </>
        )}

        {store.loadResources && (
          <div
            className={classnames(
              'fixed left-0 top-0 w-screen h-screen  flex flex-col justify-center items-center theme-bg'
            )}
          >
            <h1
              className={classnames(
                'font-bold text-9xl absolute left-1/2 top-12 -translate-x-1/2',
                styles.titleLogoText
              )}
            >
              漫长之路
            </h1>
            <h1 className="font-bold text-2xl mb-4">{store.loadingText}...</h1>
            <div className="w-1/2">
              <progress
                className="nes-progress is-primary"
                value={store.loadResourcesProgress}
                max="100"
              ></progress>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}

export default observer(App);
