import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Content } from './Content';

import '../styles/app.less';

export const App = () => {
  return <>
    <Sidebar />
    <Content />
  </>;
};
