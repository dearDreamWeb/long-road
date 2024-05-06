import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'nes.css.14x/css/nes.min.css';
// import './tailwindCss/output.css';
import './index.css';
import './index.less';
import { HashRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Router>
    <App />
  </Router>
);
