import { Modal, notification } from "antd";
import { useCallback, useEffect, useState } from "react";
import useToken from "../../hooks/useToken";
import { useAuthorization } from "../../providers/AuthorizationProvider";
import { getMasterKey, uploadKey } from "../../utils/contract";

const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY;

const ShareFile = ({ info, close }: {info: any, close: () => void}) => {
  const { token } = useToken();
  const { user }: any = useAuthorization();
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo]: any = useState({});

  const getFileInfo = useCallback(async () => {
    const response = await fetch(`https://developers.eueno.io/api/v3/project-file/detail/${info?.project_id}/${info?._id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const { data } = await response.json();
    setFileInfo(data || {});
  }, [token, info]);

  useEffect(() => {
    if (token && info) {
      getFileInfo();
    }
  }, [info, token]);

  const handleShare = useCallback(async () => {
    if (fileInfo?.encrypt_key) {
      setLoading(true);
      const [masterKey, iv] = await getMasterKey(fileInfo?.encrypt_key);
      const res = await uploadKey(
        masterKey, 
        iv, 
        info?.project_id, 
        info?._id, 
        token, 
        PUBLIC_KEY,
        user?.account,
      );
      setLoading(false);
      if (res?.status === 200) {
        notification.success({ message: "Success" });
        close();
      }
    }
  }, [fileInfo, info, token, user, PUBLIC_KEY]);

  return (
    <Modal 
      open={!!info}
      onCancel={close}
      centered
      width={400}
      okText="Share"
      confirmLoading={loading}
      onOk={handleShare}
    >
      <h3>Share to public key:</h3>
      <input 
        style={{ 
          width: '100%', 
          height: '40px', 
          fontSize: '20px', 
          padding: '15px 15px 6px 15px', 
          borderRadius: '5px', 
          border: '1px solid #999', 
          marginBottom: '30px' 
        }} 
        disabled 
        placeholder="Public key" 
        value="*****************************************" 
      />
    </Modal>
  );
}

export default ShareFile;