import { useState } from 'react';
import styles from './App.module.less';
import routes from '../config/routes';
import { renderRoutes } from 'react-router-config';

function App() {
  return <div className={styles.app}>{renderRoutes(routes)}</div>;
}

export default App;
