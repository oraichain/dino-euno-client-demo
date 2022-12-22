import { publicToAddress } from "@ethereumjs/util";
import { joinSignature } from "@ethersproject/bytes";
import eccrypto from "eccrypto";

export const convertPublicToAddress = (publicKey) => {
  if (!publicKey) return;
  try {
    const postAddress = publicToAddress(
      Buffer.from(publicKey, "hex"),
      true
    ).toString("hex");
    return "0x" + postAddress;
  } catch (error) {
    console.log(error);
    return "Invalid address";
  }
};

export const getPublicKey = async () => {
  try {
    const res = await window.eth_owallet.request({
      method: "public_key",
      params: [],
    });
    const publicKey = JSON.parse(res.result);
    return publicKey;
  } catch (error) {
    console.error(error);
  }
};

export const signV4 = async (data) => {
  const res = await window.eth_owallet.request({
    method: "eth_signTypedData_v4",
    params: [
      {
        typedMessage: JSON.parse(data),
        version: "V4",
        defaultCoinType: 60,
      },
    ],
  });
  const signature = JSON.parse(res.result);
  const r = "0x" + Buffer.from(signature.r.data).toString("hex");
  const s = "0x" + Buffer.from(signature.s.data).toString("hex");
  const v = signature.v;
  const hexSignature = joinSignature({
    r,
    s,
    recoveryParam: v === 27 ? 0 : 1,
  });
  return { v, r, s, signature: hexSignature };
};

export const signDecrypt = async (data) => {
  try {
    const res = await window.eth_owallet.request({
      method: "eth_signDecryptData",
      params: [data],
    });
    if (res?.result) {
      return JSON.parse(res.result);
    }
  } catch (error) {
    console.error(error);
  }
};

export const getMasterKey = async (key) => {
  const [ciphertext, ephemPublicKey, iv, mac] = key.split("@@");
  const encryptedData = {
    ciphertext,
    ephemPublicKey,
    iv,
    mac,
  };
  let result = await signDecrypt(encryptedData);
  if (!result) {
    alert("Signature required!");
    throw new Error("Signature required!");
  }
  result = Buffer.from(result.data.data).toString();
  result = JSON.parse(result);

  const masterKey = await window.crypto.subtle.importKey(
    "raw",
    Buffer.from(result.key, "hex"),
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );

  return [masterKey, result.iv];
};

export const uploadKey = async (
  key,
  iv,
  projectId,
  fileId,
  token,
  publicKey,
  myPublicKey
) => {
  try {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    const data = {
      iv: typeof iv === "string" ? iv : Buffer.from(iv).toString("hex"),
      key: Buffer.from(exported).toString("hex"),
    };
    if (!publicKey) publicKey = myPublicKey;
    console.log("Share from \n" + myPublicKey + "\n to \n" + publicKey);
    const selfEncrypted = await eccrypto.encrypt(
      Buffer.from(`${publicKey}`, "hex"),
      Buffer.from(JSON.stringify(data), "utf-8")
    );
    const encryptedKey = `${selfEncrypted.ciphertext.toString(
      "hex"
    )}@@${selfEncrypted.ephemPublicKey.toString(
      "hex"
    )}@@${selfEncrypted.iv.toString("hex")}@@${selfEncrypted.mac.toString(
      "hex"
    )}`;
    // let symetricKey;
    // if (share) {
    const symetricKey = {
      project_id: projectId,
      file_id: fileId,
      encrypt_key: encryptedKey,
      share_to: convertPublicToAddress(publicKey),
    };
    //   };
    // } else {
    //   symetricKey = {
    //     project_id: projectId,
    //     file_id: fileId,
    //     encrypt_key: encryptedKey,
    //   };
    // }

    const res = await fetch(
      `https://developers.eueno.io/api/v1/project-file/encrypt/upload-key-encrypt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(symetricKey),
      }
    );
    const result = await res.json();
    return result;
  } catch (error) {
    console.log(error);
    alert(error);
    return false;
  }
};
