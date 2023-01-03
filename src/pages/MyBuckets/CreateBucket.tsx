import { Button, Modal, Input, notification } from "antd";
import React, { useCallback, useState } from "react";
import useToken from "../../hooks/useToken";
import { createNewBucket } from "../../services";

const CreateBucket: React.FC<{
  reLoad: () => void,
}> = ({ reLoad }) => {
  const { token } = useToken();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = useCallback(async () => {
    if (!value && !token) return;
    setLoading(true);
    const res = await createNewBucket(token, value);
    setLoading(false);
    if (res?.status === 200) {
      notification.success({ message: "Create bucket successfully!" });
      setOpen(false);
      reLoad();
    }
    if (res?.status === 500) {
      notification.error({ message: res?.msg });
    }
  }, [value, token]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}><Button onClick={() => setOpen(true)} type="primary"><b>Create bucket</b></Button></div>
      <Modal 
        open={open}
        centered
        title="Create bucket"
        okText="Create" 
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={400}
      >
        <Input onChange={(e) => setValue(e.target.value)} style={{ fontSize: '16px', marginTop: '15px' }} placeholder="Enter bucket name" />
        <div style={{ fontSize: '13px', marginTop: '10px' }}><i>5.00 GB - FREE</i></div>
      </Modal>
    </div>
  );
}

export default CreateBucket;