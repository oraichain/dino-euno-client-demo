import { Button, Modal, notification, Radio } from "antd";
import { useCallback, useEffect, useState } from "react";
import useToken from "../../hooks/useToken";
import { useAuthorization } from "../../providers/AuthorizationProvider";
import { getFileInfoMethod, getListOption, sendDataDinohub, uploadKey } from "../../services";
import { classifyMediaType, MediaType } from "../../utils/classifyMediaType";
import { getMasterKey } from "../../utils/contract";
import ShareResultDINO from './ShareResultDINO';

const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY;

const ShareFileDINO = ({ info, close }: {info: any, close: () => void}) => {
  const { token } = useToken();
  const { user }: any = useAuthorization();
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo]: any = useState({});
  const [optionId, setOptionId] = useState();
  const [listOption, setListOption] = useState([]);
  const [result, setResult]: any = useState(null);
  const [typeResult, setTypeResult] = useState(MediaType['JSON']);

  const getListService = useCallback(async () => {
    const response = await getListOption();
    setListOption(response);
    setOptionId(response[0]?.id);
  }, []);

  const getFileInfo = useCallback(async () => {
    const { data } = await getFileInfoMethod(token, info?.project_id, info?._id);
    setFileInfo(data || {});
  }, [token, info]);

  useEffect(() => {
    if (token && info) {
      getFileInfo();
    }
  }, [info, token]);

  useEffect(() => {
    getListService();
  }, []);

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
        const resData: any = await sendDataDinohub(res?.encryptedData, fileInfo?.url_torrent, optionId);
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
      }
    }
  }, [fileInfo, info, token, user, optionId]);

  return (
    <Modal 
      open={!!info}
      onCancel={() => {close(); setResult(null)}}
      centered
      width={500}
      footer={null}
      title="DINO Service"
    >
      <div style={{ marginBottom: '10px' }}><b>Please choose an AI API service from DINO AI Marketplace:</b></div>
      <Radio.Group onChange={(e) => setOptionId(e.target.value)} value={optionId}>
        {listOption?.map((item:any) => (
           <Radio value={item.id}>{item.name}</Radio>
        ))}
      </Radio.Group>
      <div style={{ marginTop: '15px' }}>
        <div><b>Input:</b> {info?.file_name}</div>
      </div>
      {result && (
        <ShareResultDINO result={result} typeResult={typeResult} />
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <Button loading={loading} onClick={handleShare} style={{ width: '100px' }} type="primary">Run</Button>
      </div>
    </Modal>
  );
}

export default ShareFileDINO;