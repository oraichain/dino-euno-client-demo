import { Button, Modal, Select, Upload, Input, notification } from 'antd';
import React, { useCallback, useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import useToken from '../../hooks/useToken';
import { authUploadFile, getTorrent, uploadKeyEncrypt, uploadToCloud, uploadTorrent } from '../../services';
import { getBufferData, getBufferDataEncrypt } from '../../utils';
import { getKeyData, getPublicKey, keyGen } from '../../utils/contract';

const UploadFile: React.FC<{
  projectId: string,
  path: string,
  refreshFileList: () => void,
}> = ({ projectId, path, refreshFileList }) => {
  const { token } = useToken();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('ENCRYPT');
  const [file, setFile]: any = useState({});
  const [keyReadString, setKeyReadString]: any = useState('');
  const [keyData, setKeyData]: any = useState();

  const closeModal = useCallback(() => {
    setFile({});
    setKeyReadString(''); 
    setOpen(false);
  }, []);

  const handleGenKey = useCallback(async () => {
    const { keyReadString, key } = await keyGen();
    setKeyData(key);
    setKeyReadString(keyReadString);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!keyReadString && method === 'ENCRYPT') {notification.error({ message: "Please gen key" }); return};
    if (Object.keys(file).length === 0 && Object.getPrototypeOf(file) === Object.prototype) {notification.error({ message: "Please import file" }); return};
    setLoading(true);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const data = await authUploadFile(projectId, token, path, method, file?.size, file?.type, file?.name);
    const dataBuffer: any = method === 'ENCRYPT' ? await getBufferDataEncrypt(file, iv, keyData) : await getBufferData(file);
    const torrent: any = await getTorrent(dataBuffer, data?.data?.webseed);
    
    if (data?.status === 200) {
      await uploadToCloud(data?.data?.url_upload_file, file?.type, dataBuffer);
      await uploadTorrent(data?.data?.url_upload_torrent, torrent.torrentFile);
      
      if (method === 'ENCRYPT') {
        const resPublicKey = await getPublicKey();
        const encryptedKey = await getKeyData(resPublicKey, keyData, iv);
        const pathList = [{ path, filename: data?.data?.file_name }];

        await uploadKeyEncrypt(token, projectId, pathList, encryptedKey);
      }
      
      setTimeout(() => {
        setLoading(false);
        notification.success({ message: "Upload file successfully" });
        refreshFileList && refreshFileList();
        closeModal();
      }, 3000);
    }
  }, [token, projectId, path, method, file, keyReadString, keyData, refreshFileList, closeModal]);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Upload File</Button>
      <Modal 
        open={open}
        centered
        title="Upload file"
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
          maxCount={1} 
          fileList={Object.keys(file).length === 0 && Object.getPrototypeOf(file) === Object.prototype ? [] : [file]} 
          beforeUpload={(e) => setFile(e)}
          onRemove={() => setFile({})}
        >
          <div className="dino-upload-file">
            <div>
              <AiOutlineCloudUpload />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>Drag and drop a file or click upload</div>
        </Upload>
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

export default UploadFile;
 