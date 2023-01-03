import React, { createContext, useContext, useEffect, useState } from 'react';import useAuthorize from '../hooks/useAuthorize';
import useToken from '../hooks/useToken';

export const AuthorizationContext = createContext({});

export const AuthorizationProvider: React.FC<{
  children?: React.ReactElement | React.ReactNode;
}> = ({ children }) => {
  const { isLoggedIn } = useAuthorize();
  const { token } = useToken();
  const [user, setUser] = useState<any>(null);

  const getUser = async () => {
    const response = await fetch(`https://developers.eueno.io/api/v1/users/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const { data } = await response.json();
    setUser(data);
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      getUser();
    } else if (user) {
      setUser(null);
    }
  }, [isLoggedIn, token]);

  return (
    <AuthorizationContext.Provider
      value={{
        user,
        isLoggedIn: isLoggedIn && user,
        fetchUser: getUser,
      }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
};

export const useAuthorization = () => useContext(AuthorizationContext) ?? {};
