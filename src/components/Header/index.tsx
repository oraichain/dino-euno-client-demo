
import React from 'react';
import Container from '../Container';
import './index.css';
import useAuthorize from '../../hooks/useAuthorize';
import { useAuthorization } from '../../providers/AuthorizationProvider';
import { Button, Dropdown } from 'antd';
import {BiChevronDown} from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { centerTextEllipsis } from '../../utils';

const Header: React.FC = () => {
  const { connectWallet, logout, loading } = useAuthorize();
  const navigate = useNavigate();
  const { user }: any = useAuthorization();

  const handleConnectWallet = () => {
    connectWallet();
  }

  const items = [
    {
      label: <div><b>{centerTextEllipsis(user?.account, 6)}</b></div>,
      key: '0',
    },
    {
      label: <div onClick={logout}>Logout</div>,
      key: '1',
    },
  ];

  return (
    <header className='dino-header'>
      <Container>
        <div className='header-box'>
          <div className='header-logo' onClick={() => navigate('/')}>
            {/* <img src="https://eueno.io/images/logo.png" alt="logo" /> */}
            <span style={{ color: 'rgb(141, 61, 216)' }}>DINO</span>
            <span>EUENO</span>
          </div>
          <div className='header-login'>
            {user ? (
              <Dropdown
              menu={{items}}
              placement="bottomRight"
            >
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <img style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} src={user?.avatar || 'https://ocwckgy6c1obj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/a/v/avatar-1615695904-2089-1615696022.jpg'} alt="ava" />
                <div style={{ marginLeft: '7px' }}>{user?.name_tag || 'No Name'}</div>
                <BiChevronDown style={{ fontSize: '20px' }} />
              </div>
            </Dropdown>
            ) : (
              <Button className='login-btn' loading={loading} onClick={handleConnectWallet}>Connect Wallet</Button>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}

export default Header;