import { useRef, useState, useEffect, useCallback } from "react";
import LocalStorage from "../utils/localStorage";

const initToken = "";

const useToken = () => {
  const [token, setTokenState] = useState(initToken);
  const interval = useRef(null);
  const windowRef = useRef(null);

  const processToken = () => {
    const currentToken = LocalStorage.getItem("token");

    if (token !== currentToken) {
      setTokenState(currentToken);
    }
  };

  const saveToken = useCallback((newToken) => {
    LocalStorage.saveItem("token", newToken, 86400 * 1000);
    setTokenState(newToken);
  }, []);

  const deleteToken = useCallback(() => {
    LocalStorage.removeItem("token");
    setTokenState(null);
  }, []);

  useEffect(() => {
    windowRef.current = window.addEventListener("storage", (e) => {
      if (e?.key === "token") {
        processToken();
      }
    });

    processToken();
    interval.current = setInterval(() => {
      processToken();
    }, 2000);

    return () => {
      if (interval?.current) {
        clearInterval(interval.current);
      }
      if (windowRef?.current) {
        windowRef.current.removeEventListener("storage");
      }
    };
  }, []);

  return {
    token,
    saveToken,
    deleteToken,
  };
};

export default useToken;
