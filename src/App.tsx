import { useEffect, useState } from 'react';
import styles from './App.module.less';
import routes from '../config/routes';
import { renderRoutes } from 'react-router-config';
import DisableDevtool from 'disable-devtool';
import { createPortal } from 'react-dom';
import { RATE } from '@/const';
import store from '@/store/store';

function App() {
  const [isRender, setIsRender] = useState(false);

  const setRootRem = () => {
    const rootSize = RATE * 16;
    document.body.style.fontSize = `${rootSize}px`;
    document.documentElement.style.fontSize = `${rootSize}px`;
  };

  useEffect(() => {
    (async () => {
      await store.loadResource();
      // store.audioResources.bgAudio.play();
    })();
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
  return (
    <>
      {isRender && (
        <div className={styles.app}>
          {renderRoutes(routes)}
          {createPortal(<div id="message-wrapper"></div>, document.body)}
        </div>
      )}
    </>
  );
}

export default App;
