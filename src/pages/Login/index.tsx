import React from 'react';
import { Navigate } from 'react-router';
import { useQueryLocation } from '../../hooks/useQueryLocation';
import { useAuthorization } from '../../providers/AuthorizationProvider';
import './index.css';

const Login: React.FC = () => {
  const { isLoggedIn }: any = useAuthorization();
  const { queries }: any = useQueryLocation();

 if (isLoggedIn) {
  return <Navigate to={queries?.returnPath || '/'} replace />;
 }

  return (
    <div className='dino-login'>
      <img src="https://eueno.io/images/connect-wallet/image%202.png" alt="bg-logo" />
      <div className='dino-login-banner'>
        <div className='dino-login-banner-text'>
          Please <span>Connect</span>
        </div>
        <div className='dino-login-banner-text'>
          your <span>Wallet</span>
        </div>
      </div>
    </div>
  )
}

export default Login;