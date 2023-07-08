import { useEffect, useState } from 'react';
import styles from './App.module.less';
import routes from '../config/routes';
import { renderRoutes } from 'react-router-config';
import DisableDevtool from 'disable-devtool';
import { createPortal } from 'react-dom';

function App() {
  const [isRender, setIsRender] = useState(false);
  useEffect(() => {
    if (import.meta.env.MODE !== 'development') {
      DisableDevtool({
        url: '/warning',
        disableMenu: true,
        ignore: ['/warning'],
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
