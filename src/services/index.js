import WebTorrent from "webtorrent";
import { convertPublicToAddress, getEncryptedKey } from "../utils/contract";
const client = new WebTorrent();

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
    const encryptedKey = await getEncryptedKey(publicKey, myPublicKey, key, iv);
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
    return { ...result, encryptedData: encryptedKey };
  } catch (error) {
    console.log(error);
    alert(error);
    return false;
  }
};

export const uploadToCloud = async (url, fileType, dataBuffer) => {
  let finalResponse;
  try {
    finalResponse = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": fileType,
      },
      body: dataBuffer,
    });
  } catch (error) {
    console.log(error);
  }
  return finalResponse;
};

export const getTorrent = async (bufferData, webseed) =>
  await new Promise((resolve, reject) => {
    try {
      client.seed(
        bufferData,
        {
          private: true,
          announce: [
            "wss://tracker.eueno.io",
            "https://tracker.eueno.io/announce",
          ],
          urlList: webseed,
        },
        resolve
      );
    } catch (error) {
      reject(error);
    }
  });

export const uploadTorrent = async (url, torrentFile) => {
  const response = fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-bittorrent",
    },
    body: torrentFile,
  });

  return response;
};

export const authUploadFile = async (
  projectId,
  token,
  path,
  method,
  fileSize,
  fileType,
  fileName
) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v3/project-file/auth-upload`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        path,
        method: method,
        action: "write",
        content_length: fileSize,
        content_type: fileType,
        file_name: fileName,
      }),
    }
  );

  const data = await response.json();
  return data;
};

export const uploadKeyEncrypt = async (
  token,
  projectId,
  pathList,
  encryptedKey
) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v3/project-file/upload-key-encrypt`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        path_list: pathList,
        encrypt_key: encryptedKey,
      }),
    }
  );

  const data = await response.json();
  return data;
};

export const createFolderMethod = async (
  token,
  projectId,
  folderParentId,
  folderName
) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v3/project-folder/create-folder`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        folder_parent_id: folderParentId,
        folder_name: folderName,
      }),
    }
  );

  const data = await response.json();
  return data;
};

export const getBucketWithId = async (token, bucketId) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v1/project/${bucketId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return data;
};

export const getListFilesMethod = async (token, bucketId) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v2/project-file/file/lists`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: bucketId }),
    }
  );

  const data = await response.json();
  return data;
};

export const getListFileWithFolderMethod = async (
  token,
  bucketId,
  folderParentId
) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v2/project-file/file/lists`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: bucketId,
        folder_parent_id: folderParentId,
      }),
    }
  );

  const data = await response.json();
  return data;
};

export const deleteFile = async (kind, id, token, bucketId) => {
  const url =
    kind === "FILE"
      ? "https://developers.eueno.io/api/v3/project-file/delete"
      : "https://developers.eueno.io/api/v3/project-folder/delete";
  const body =
    kind === "FILE"
      ? { file_id: id, project_id: bucketId }
      : { folder_id: id, project_id: bucketId };
  const response = await await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data;
};

export const getFileInfoMethod = async (token, projectId, fileId) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v3/project-file/detail/${projectId}/${fileId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return data;
};

export const sendDataDinohub = async (encryptedData, torrentURL) => {
  return await fetch(`https://api-forwarding.dinohub.io/forwarding/send-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      encryptedData: encryptedData,
      torrenUrl: torrentURL,
    }),
  });
};

export const uploadFolderMethod = async (
  token,
  projectId,
  method,
  pathList
) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v3/project-file/auth-upload-lists`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        method: method,
        path_list: pathList,
      }),
    }
  );

  const data = await response.json();
  return data;
};

export const createNewBucket = async (token, bucketName) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v1/project/create-project`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        limit_size: 1000000,
        pack_id: "63315c5e28a650d6798ea9f7",
        project_name: bucketName,
      }),
    }
  );

  const data = await response.json();
  return data;
};

export const deleteBucket = async (token, bucketId) => {
  const response = await fetch(
    `https://developers.eueno.io/api/v1/project/delete-project`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: bucketId,
      }),
    }
  );

  const data = await response.json();
  return data;
};
