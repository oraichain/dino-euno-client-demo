import { Button, Modal, Select, Upload, Input, notification } from 'antd';
import React, { useCallback, useState } from 'react';
import { AiOutlineCloudUpload, AiFillCloseCircle } from 'react-icons/ai';
import useToken from '../../hooks/useToken';
import { getTorrent, uploadFolderMethod, uploadKeyEncrypt, uploadToCloud, uploadTorrent } from '../../services';
import { getBufferData, getBufferDataEncrypt } from '../../utils';
import { getKeyData, getPublicKey, keyGen } from '../../utils/contract';

const UploadFolder: React.FC<{
  projectId: string,
  path: string,
  refreshFileList: () => void,
}> = ({ projectId, path, refreshFileList }) => {
  const { token } = useToken();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('ENCRYPT');
  const [fileList, setFileList]: any = useState([]);
  const [keyReadString, setKeyReadString]: any = useState('');
  const [keyData, setKeyData]: any = useState();

  const closeModal = useCallback(() => {
    setKeyReadString(''); 
    setOpen(false);
    setFileList([]);
  }, []);

  const handleGenKey = useCallback(async () => {
    const { keyReadString, key } = await keyGen();
    setKeyData(key);
    setKeyReadString(keyReadString);
  }, []);


  const handleSubmit = useCallback(async () => {
    if (!keyReadString && method === 'ENCRYPT') {notification.error({ message: "Please gen key" }); return};
    if (fileList.length === 0 ) {notification.error({ message: "Please import folder" }); return};

    setLoading(true);

    const pathList = fileList.map((item: any) => {
      return {
        path: path + item?.webkitRelativePath?.split('/')?.slice(0, -1)?.join('/') + '/',
        filename: item?.name,
        content_length: item?.size,
        content_type: item?.type,
        action: "write"
      }
    });

    const data = await uploadFolderMethod(token, projectId, method, pathList);
    
    if (data?.status === 200) {
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      for (const [index, file] of data?.data?.entries()) {
        const dataBuffer: any = method === 'ENCRYPT' ? await getBufferDataEncrypt(fileList[index], iv, keyData) : await getBufferData(fileList[index]);
        const torrent: any = await getTorrent(dataBuffer, file?.webseed);

        await uploadToCloud(file?.url_upload_file, file?.content_type, dataBuffer);
        await uploadTorrent(file?.url_upload_torrent, torrent.torrentFile);
      }

      if (method === 'ENCRYPT') {
        const resPublicKey = await getPublicKey();
        const encryptedKey = await getKeyData(resPublicKey, keyData, iv);
        const modPathList = pathList.map((item: any) => { return { path: item.path, filename: item.filename } })
        await uploadKeyEncrypt(token, projectId, modPathList, encryptedKey);
      }

      setTimeout(() => {
        setLoading(false);
        notification.success({ message: "Upload folder successfully" });
        refreshFileList && refreshFileList();
        closeModal();
      }, 3000);
    }
  }, [token, projectId, path, method, fileList, keyReadString, keyData, refreshFileList, closeModal]);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Upload Folder</Button>
      <Modal 
        open={open}
        centered
        title="Upload Folder"
        okText="Upload" 
        onCancel={closeModal}
        onOk={handleSubmit}
        width={400}
        bodyStyle={{ marginBottom: '30px' }}
        confirmLoading={loading}
      >
        <div className="select-method">
          <div style={{ marginBottom: '10px' }}>Choose method upload:</div>
          <Select value={method} onChange={(e: any) => setMethod(e)}>
            <Select.Option key="ENCRYPT">Encrypted</Select.Option>
            <Select.Option key="UN_ENCRYPT">Unencrypted</Select.Option>
          </Select>
        </div>
        <Upload
          beforeUpload={(file, fileList) => setFileList(fileList)}
          showUploadList={false}
          directory
        >
          <div className="dino-upload-file">
            <div>
              <AiOutlineCloudUpload />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>Drag and drop a file or click upload</div>
        </Upload>
        {fileList.length > 0 && (
          <div className="dino-upload-show">
            <AiFillCloseCircle onClick={() => setFileList([])} />
            {fileList[0]?.webkitRelativePath?.split('/')?.[0]}
          </div>
        )}
        {method === 'ENCRYPT' && (
          <div className="dino-gen-key">
            <div className="gen-key-head">
              <span>Key</span> <span onClick={handleGenKey}>GEN KEY</span>
            </div>
            <Input value={keyReadString} onChange={(e) => setKeyReadString(e.target.value)} placeholder="Generate key or import key (43 characters)" />
          </div>
        )}
      </Modal>
    </div>
  );
} 

export default UploadFolder;
 