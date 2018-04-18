// src/index.js

//导入 react 核心库.
import React from 'react';
//导入 react DOM 库.
import ReactDOM from 'react-dom';

import HelloWorld from 'components/HelloWorld'

//在 #root 显示 hello world.
ReactDOM.render(
    <HelloWorld/>,
    document.querySelector('#app')
);