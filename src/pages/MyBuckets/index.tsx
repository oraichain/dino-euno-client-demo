import React, { useCallback, useEffect, useState } from 'react';
import { notification, Table } from 'antd';
import Container from '../../components/Container';
import useToken from '../../hooks/useToken';
import './index.css';
import { centerTextEllipsis } from '../../utils';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { FiCopy } from 'react-icons/fi';

const MyBuckets: React.FC = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  const getListBuckets = useCallback(async () => {
    const response = await fetch(`https://developers.eueno.io/api/v1/project/lists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setList(data?.items || []);
  }, [token]);

  useEffect(() => {
    if (token) getListBuckets();
  }, [token]);

  const copyValue = (val: any) => {
    navigator.clipboard.writeText(val);
    notification.success({ message: 'Copied!' });
  }

  const columns = [
    {
      title: 'NO.',
      dataIndex: 'no',
      key: 'no',
      render: (text: any, record: any, index: any) => <span>{index+ 1}</span>,
    },
    {
      title: 'BUCKET ID',
      dataIndex: 'pack_id',
      key: 'pack_id',
      render: (text: any) => <div style={{ display: 'flex', alignItems: 'center' }}>{centerTextEllipsis(text)} <FiCopy onClick={(e) => {e.stopPropagation(); copyValue(text)}} style={{ marginLeft: '7px' }} /></div>
    },
    {
      title: 'NAME',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text: any) => <div>{text}</div>
    },
    {
      title: 'SIZE',
      dataIndex: 'size_use',
      key: 'size_use',
      render: (text: any, record: any) => <div>{(text/1024).toFixed(2)}/{(record?.project_size/1024).toFixed(2)} GB</div>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (text: any) => <div>{text}</div>
    },
    {
      title: 'CREATED',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (text: any) => <div>{moment(text).format('ll')}</div>
    },
  ];

  return (
    <div className="dino-page">
      <Container>
        <div className='dino-buckets'>
          <h3 className='dino-buckets-title'>My Buckets</h3>
          <div>
            <Table onRow={(record) => { return { onClick: () => {navigate(`/${record?._id}`)} } }} dataSource={list} columns={columns} />
          </div>
        </div>
      </Container>
    </div>
  )
}

export default MyBuckets;