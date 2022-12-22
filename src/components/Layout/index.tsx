import React from 'react';
import Header from '../Header';
import './index.css';

const Layout: React.FC<{
  children: any
}> = ({ children }) => {
  return (
    <main className='dino-layout'>
      <Header />
      <div style={{ paddingTop: '70px' }}>
        {children}
      </div>
    </main>
  )
}

export default Layout;