import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Container from "../../components/Container";
import useToken from "../../hooks/useToken";
import { notification, Table, Breadcrumb } from 'antd';
import moment from "moment";
import { FaShareAltSquare } from 'react-icons/fa';
import './index.css';
import ShareFile from "./ShareFile";


const Bucket = () => {
  const { token } = useToken();
  const { bucketId } = useParams();
  const navigate = useNavigate();
  const [bucket, setBucket]: any = useState({});
  const [listFile, setListFile] = useState([]);
  const [folderId, setFolderId] = useState();
  const [refresh, setRefresh] = useState(false);
  const [infoFile, setInfoFile] = useState();
  const [breadcrumb, setBreadcurumb]: any = useState([]);

  const getBucket = useCallback(async () => {
    const response = await fetch(`https://developers.eueno.io/api/v1/project/${bucketId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setBucket(data?.item || {});
  }, [token, bucketId]);

  const getListFiles = useCallback(async () => {
    const response = await fetch(`https://developers.eueno.io/api/v2/project-file/file/lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: bucketId })
    });
    const { data } = await response.json();
    setListFile(data?.items || []);
  }, [token, bucketId]);

  const getListFileWithFolder = useCallback(async () => {
    const response = await fetch(`https://developers.eueno.io/api/v2/project-file/file/lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: bucketId, folder_parent_id: folderId })
    });
    const { data } = await response.json();
    setListFile(data?.items || []);
    if (!breadcrumb.find((item: any) => item?._id === data?.root_folder?._id)) {
      setBreadcurumb([...breadcrumb, data?.root_folder]);
    }
    const num = breadcrumb.length - (data?.root_folder?.dir?.split('/').length - 1);
    if (num >= 1) {
      setBreadcurumb(breadcrumb.slice(0, -num));
    }
  }, [token, bucketId, folderId, breadcrumb]);

  useEffect(() => {
    if (token && bucketId) {
      getListFiles();
      getBucket();
    };
  }, [token, bucketId, refresh]);
  
  useEffect(() => {
    if (token && bucketId && folderId) {
      getListFileWithFolder();
    };
  }, [folderId]);

  const columns = [
    {
      title: 'NO.',
      dataIndex: 'no',
      key: 'no',
      render: (text: any, record: any, index: any) => <span>{index+ 1}</span>,
    },
    {
      title: 'KIND',
      dataIndex: 'kind',
      key: 'kind',
      render: (text: any) => <div>{text}</div>
    },
    {
      title: 'NAME',
      dataIndex: 'file_name',
      key: 'file_name',
      width: 300,
      render: (text: any) => <div>{text}</div>
    },
    {
      title: 'ENCRYPTED',
      dataIndex: 'method',
      key: 'method',
      render: (text: any, record: any) => <div>{text === 'ENCRYPT' ? 'Yes' : ''}</div>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (text: any) => <div>{bucket?.status}</div>
    },
    {
      title: 'CREATED',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (text: any) => <div>{moment(text).format('ll')}</div>
    },
    {
      title: 'SHARE',
      dataIndex: 'share',
      key: 'share',
      render: (text: any, record: any) => <div>{record?.kind === 'FILE' && record?.method === 'ENCRYPT' && <div onClick={() => setInfoFile(record)} style={{ cursor: 'pointer', fontSize: '22px', color: '#a779cb', height: '26px' }}><FaShareAltSquare /></div>}</div>
    },
  ];

  return (
    <div className='dino-bucket-detail'>
      <Container>
        <Breadcrumb style={{ fontSize: '16px' }}>
          <Breadcrumb.Item><a style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</a></Breadcrumb.Item>
          <Breadcrumb.Item>
            <a 
              style={{ cursor: 'pointer' }} 
              onClick={() => {
                setFolderId(undefined); 
                setRefresh(!refresh);
                setBreadcurumb([]);
              }}>
                {bucket?.project_name}
            </a>
          </Breadcrumb.Item>
          {breadcrumb.map((el: any) => (
            <Breadcrumb.Item>
              <a 
                style={{ cursor: 'pointer' }} 
                onClick={() => {
                  setFolderId(el?._id);
                }}
              >
                {el?.file_name}
              </a>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <div className='dino-bucket-page'>
          <Table onRow={(record) => { return { onClick: () => {
            if (record?.kind === 'FOLDER') {
              setFolderId(record?._id);
            }
          } } }} dataSource={listFile} columns={columns} />
        </div>
        <ShareFile info={infoFile} close={() => setInfoFile(undefined)} />
      </Container>
    </div>
  );
}

export default Bucket;