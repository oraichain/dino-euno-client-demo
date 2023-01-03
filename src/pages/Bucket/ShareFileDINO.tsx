import { Button, Modal, notification } from "antd";
import { useCallback, useEffect, useState } from "react";
import useToken from "../../hooks/useToken";
import { useAuthorization } from "../../providers/AuthorizationProvider";
import { getFileInfoMethod, sendDataDinohub, uploadKey } from "../../services";
import { classifyMediaType, MediaType } from "../../utils/classifyMediaType";
import { getMasterKey } from "../../utils/contract";
import ShareResultDINO from './ShareResultDINO';

const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY;

const ShareFileDINO = ({ info, close }: {info: any, close: () => void}) => {
  const { token } = useToken();
  const { user }: any = useAuthorization();
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo]: any = useState({});
  const [result, setResult]: any = useState(null);
  const [typeResult, setTypeResult] = useState(MediaType['JSON']);

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
      if (res?.status === 200 && res?.encryptedData) {
        const resData: any = await sendDataDinohub(res?.encryptedData, fileInfo?.url_torrent);
        if (resData?.data?.status === 'error') {
          setLoading(false);
          close();
          notification.success({ message: "Success" });
          return;
        }
        const mediaType = classifyMediaType(resData?.headers.get("Content-Type") || '');
        setTypeResult(mediaType);
        switch (mediaType) {
          case MediaType['IMAGE']:
          case MediaType['AUDIO']:
          case MediaType['VIDEO']:
            setResult(await resData.arrayBuffer())
            break;
          case MediaType['TEXT']:
            setResult(await resData.text())
            break;
        
          default:
            setResult(await resData.json());
            break;
        }
        setLoading(false);
        notification.success({ message: "Success" });
      }
    }
  }, [fileInfo, info, token, user]);

  return (
    <Modal 
      open={!!info}
      onCancel={() => {close(); setResult(null)}}
      centered
      width={450}
      footer={null}
    >
      {result ? (
        <>
          <ShareResultDINO result={result} typeResult={typeResult} />
          <div style={{ textAlign: 'right', marginTop: '10px' }}><Button onClick={() => {close(); setResult(null)}}>Cancel</Button></div>
        </>
      ) : (
        <>
          <h3 style={{ marginTop: '0' }}>Share to public key:</h3>
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
          <div style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: '10px' }} onClick={() => {close(); setResult(null)}}>Cancel</Button>
            <Button type="primary" loading={loading} onClick={handleShare}>Share</Button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default ShareFileDINO;