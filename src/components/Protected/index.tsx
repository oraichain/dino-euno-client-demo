
import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import useAuthorize from '../../hooks/useAuthorize';
import { useAuthorization } from '../../providers/AuthorizationProvider';

const Protected:React.FC<{
  children: any
}> = ({ children }) => {
  const { isLoggedIn }: any = useAuthorization();
  const { search, pathname } = useLocation();

 if (!isLoggedIn) {
  return <Navigate to={`/login?returnPath=${encodeURIComponent(pathname + search)}`} replace />;
 }

 return children;
};

export default Protected;