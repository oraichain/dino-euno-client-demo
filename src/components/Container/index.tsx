import React from 'react';
import './index.css';

const Container: React.FC<{ children: any }> = ({ children }) => {
  return (
    <div className='dino-container'>
      {children}
    </div>
  );
}

export default Container;