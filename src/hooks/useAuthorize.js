import { useState } from "react";
import {
  convertPublicToAddress,
  getPublicKey,
  signV4,
} from "../utils/contract";
import useToken from "./useToken";

const TIME_NOW = parseInt(Date.now() / 1000);
const DOMAIN = [
  { name: "url", type: "string" },
  { name: "time", type: "uint256" },
];
const DATA = [
  { name: "action", type: "string" },
  { name: "account", type: "address" },
];

const useAuthorize = () => {
  const [loading, setLoading] = useState(false);
  const { saveToken, deleteToken, token } = useToken();
  const isLoggedIn = !!token;

  const connectWallet = async () => {
    setLoading(true);
    const resPublicKey = await getPublicKey();
    const address = await convertPublicToAddress(resPublicKey);

    const msgParams = JSON.stringify({
      domain: {
        url: "eueno.io",
        time: TIME_NOW,
      },
      message: {
        action: "Eueno login",
        account: address,
      },
      primaryType: "Data",
      types: {
        EIP712Domain: DOMAIN,
        Data: DATA,
      },
    });

    const { signature } = await signV4(msgParams);

    const response = await fetch(
      "https://developers.eueno.io/api/v1/users/login",
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          address: address,
          signature: signature,
          timestamp: TIME_NOW,
        }),
      }
    );
    const { data } = await response.json();
    setLoading(false);
    if (data?.token) saveToken(data?.token);
  };

  const logout = () => {
    deleteToken();
  };

  return { connectWallet, logout, isLoggedIn, loading };
};

export default useAuthorize;
