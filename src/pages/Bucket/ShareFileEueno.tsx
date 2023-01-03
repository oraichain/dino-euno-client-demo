import { Button, Modal, notification } from "antd";
import { useCallback, useEffect, useState } from "react";
import useToken from "../../hooks/useToken";
import { useAuthorization } from "../../providers/AuthorizationProvider";
import { getFileInfoMethod, uploadKey } from "../../services";
import { getMasterKey } from "../../utils/contract";
import { Input } from 'antd';

const ShareFileEueno = ({ info, close }: {info: any, close: () => void}) => {
  const { token } = useToken();
  const { user }: any = useAuthorization();
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo]: any = useState({});
  const [publicKey, setPublicKey] = useState('');

  const getFileInfo = useCallback(async () => {
    const { data } = await getFileInfoMethod(token, info?.project_id, info?._id);
    setFileInfo(data || {});
  }, [token, info]);

  useEffect(() => {
    if (token && info) {
      getFileInfo();
    }
  }, [info, token]);

  const handleShare = useCallback(async () => {
    if (!publicKey) notification.error({ message: 'Please input valid public key!' });
    if (fileInfo?.encrypt_key && publicKey) {
      setLoading(true);
      const [masterKey, iv] = await getMasterKey(fileInfo?.encrypt_key);
      const res = await uploadKey(
        masterKey, 
        iv, 
        info?.project_id, 
        info?._id, 
        token, 
        publicKey,
        user?.account,
      );
      setLoading(false);
      if (res?.status === 200) {
          close();
          setPublicKey('');
          notification.success({ message: "Success" });
      }
    }
  }, [fileInfo, info, token, user, publicKey, close]);

  return (
    <Modal 
      open={!!info}
      onCancel={() => {close(); setPublicKey('')}}
      centered
      width={450}
      footer={null}
    >
      <h2 style={{ marginTop: '0' }}>Share File</h2>
      <b>Please enter the recipient's public key:</b>
      <Input.Password 
        style={{ 
          width: '100%', 
          height: '40px', 
          fontSize: '16px', 
          padding: '6px 15px 6px 15px',
          marginBottom: '30px', 
          marginTop: '7px' 
        }}
        placeholder="Public key" 
        onChange={(e) => setPublicKey(e.target.value)}
        value={publicKey} 
      />
      <div style={{ textAlign: 'right' }}>
        <Button style={{ marginRight: '10px' }} onClick={() => {close(); setPublicKey('')}}>Cancel</Button>
        <Button type="primary" loading={loading} onClick={handleShare}>Share</Button>
      </div>
    </Modal>
  );
}

export default ShareFileEueno;