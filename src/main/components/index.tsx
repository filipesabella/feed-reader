import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';

import 'regenerator-runtime/runtime';
import 'reset-css';
import 'typeface-barlow';

ReactDOM.render(
  <React.StrictMode><App /></React.StrictMode>,
  document.getElementById('root')
);
