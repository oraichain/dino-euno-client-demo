import { encryptFile } from "./contract";

export const centerTextEllipsis = (text, size, key) => {
  return `${text?.slice(0, size || 5)}${key || "..."}${text?.slice(
    -(size || 5)
  )}`;
};

export const makeKey = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const isFileImage = (type) => {
  return type && type.split("/")[0] === "image";
};

export const getBufferData = async (file) => {
  try {
    const buf = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsArrayBuffer(file);
    });

    const bufferData = Buffer.from(new Uint8Array(buf));
    bufferData.name = file.name;
    return bufferData;
  } catch (error) {
    console.log(error);
  }
};

export const getBufferDataEncrypt = async (file, iv, key) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);

  const encryptedFile = await new Promise(async (resolve) => {
    reader.onloadend = async (evt) => {
      if (evt.target.readyState === FileReader.DONE) {
        const encryptedData = await encryptFile(file, iv, key);
        resolve(encryptedData);
        return;
      }
    };
  });
  const bufferData = Buffer.from(new Uint8Array(encryptedFile));
  bufferData.name = file.name;
  return bufferData;
};
