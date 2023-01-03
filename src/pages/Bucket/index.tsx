import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Container from "../../components/Container";
import useToken from "../../hooks/useToken";
import { Table, Breadcrumb, Popconfirm, notification } from 'antd';
import moment from "moment";
import { FaShareAltSquare } from 'react-icons/fa'; 
import { AiFillDelete } from 'react-icons/ai'; 
import { GrServices } from 'react-icons/gr'; 
import './index.css';
import ShareFileDINO from "./ShareFileDINO";
import Upload from './Upload';
import { deleteFile, getBucketWithId, getListFilesMethod, getListFileWithFolderMethod } from "../../services";
import ShareFileEueno from "./ShareFileEueno";
import { isFileImage } from "../../utils";


const Bucket = () => {
  const { token } = useToken();
  const { bucketId }: any = useParams();
  const navigate = useNavigate();
  const [bucket, setBucket]: any = useState({});
  const [listFile, setListFile] = useState([]);
  const [folderId, setFolderId]: any = useState();
  const [refresh, setRefresh] = useState(false);
  const [refreshFileWithFolder, setRefreshFileWithFolder] = useState(false);
  const [infoFileDINO, setInfoFileDINO] = useState();
  const [infoFileEueno, setInfoFileEueno] = useState();
  const [breadcrumb, setBreadcurumb]: any = useState([]);

  const getBucket = useCallback(async () => {
    const data = await getBucketWithId(token, bucketId);
    setBucket(data?.item || {});
  }, [token, bucketId]);

  const getListFiles = useCallback(async () => {
    const { data } = await getListFilesMethod(token, bucketId);
    setListFile(data?.items || []);
    setFolderId(data?.root_folder?._id);
  }, [token, bucketId]);

  const getListFileWithFolder = useCallback(async () => {
    const { data } = await getListFileWithFolderMethod(token, bucketId, folderId);
    setListFile(data?.items || []);
    //breadcrumb
    if (data?.root_folder?.file_name !== '/') {
      if (!breadcrumb.find((item: any) => item?._id === data?.root_folder?._id)) {
        setBreadcurumb([...breadcrumb, data?.root_folder]);
       }
       const num = breadcrumb.length - (data?.root_folder?.dir?.split('/').length - 1);
       if (num >= 1) {
         setBreadcurumb(breadcrumb.slice(0, -num));
       }
    }
  }, [token, bucketId, folderId, breadcrumb]);

  const handleDelete = useCallback(async (kind: string, id: string) => {
    if (!kind && !id) return;

    const data = await deleteFile(kind, id, token, bucketId);
    if (data?.msg === 'success') {
      notification.success({ message: "Delete successfully!" });
      breadcrumb.length > 0 ? setRefreshFileWithFolder(!refreshFileWithFolder) : setRefresh(!refresh);
    }
  }, [bucketId, token, refreshFileWithFolder, breadcrumb, refresh]);

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
  }, [folderId, refreshFileWithFolder]);
  

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
      render: (text: any, record: any) => <div>{record?.kind === 'FILE' && record?.method === 'ENCRYPT' && <div onClick={() => setInfoFileEueno(record)} style={{ cursor: 'pointer', fontSize: '22px', height: '26px' }}><FaShareAltSquare /></div>}</div>
    },
    {
      title: 'DINO SERVICE',
      dataIndex: 'service',
      key: 'service',
      render: (text: any, record: any) => 
      <div>
        {record?.kind === 'FILE' && record?.method === 'ENCRYPT' && record?.type !== 'image/svg+xml' && record?.type !== 'image/webp' && isFileImage(record?.type) && 
          <div onClick={() => setInfoFileDINO(record)} style={{ cursor: 'pointer', fontSize: '20px', height: '24px' }}><GrServices /></div>
        }
      </div>
    },
    {
      title: 'DELETE',
      dataIndex: 'delete',
      key: 'delete',
      render: (text: any, record: any) => (
        <div onClick={(e) => { e.stopPropagation(); }}>
          <Popconfirm onConfirm={(e) => handleDelete(record?.kind, record?._id)} title="Are you sure?" okText="Yes" cancelText="No">
            <div style={{ cursor: 'pointer', fontSize: '22px', color: '#e27a7a', height: '26px' }}><AiFillDelete /></div>
          </Popconfirm>
        </div>
      )
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
          <Upload breadcrumb={breadcrumb} projectId={bucketId} folderParentId={folderId} refreshFileList={() => breadcrumb.length > 0 ? setRefreshFileWithFolder(!refreshFileWithFolder) : setRefresh(!refresh)} />
          <Table onRow={(record) => { return { onClick: () => {
            if (record?.kind === 'FOLDER') {
              setFolderId(record?._id);
            }
          } } }} dataSource={listFile} columns={columns} />
        </div>
        <ShareFileDINO info={infoFileDINO} close={() => setInfoFileDINO(undefined)} />
        <ShareFileEueno info={infoFileEueno} close={() => setInfoFileEueno(undefined)} />
      </Container>
    </div>
  );
}

export default Bucket;