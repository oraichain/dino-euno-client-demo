import { Button, Modal, Input, notification } from "antd";
import React, { useCallback, useState } from "react";
import useToken from "../../hooks/useToken";
import { createFolderMethod } from "../../services";

const CreateFolder: React.FC<{
  projectId: string,
  folderParentId: string,
  refreshFileList: () => void,
}> = ({ projectId, folderParentId, refreshFileList }) => {
  const { token } = useToken(); 
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');

  const createFolder = useCallback(async () => {
    setLoading(true);
    const data = await createFolderMethod(token, projectId, folderParentId, value);
    setLoading(false);

    if (data?.msg === 'success' && refreshFileList) {
      notification.success({ message: 'Create folder successfully!' });
      setOpen(false);
      refreshFileList();
    }
  }, [token, projectId, folderParentId, value, refreshFileList]);

  const handleSubmit = useCallback(async () => {
    if (!value && !token) return;
    createFolder();
  }, [value, token, createFolder]);

  return (
    <div>
      <Button onClick={() => setOpen(true)} type="primary">Create Folder</Button>
      <Modal 
        open={open}
        centered
        title="Create folder"
        okText="Create" 
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={400}
      >
        <Input onChange={(e) => setValue(e.target.value)} style={{ fontSize: '16px', marginTop: '15px' }} placeholder="Enter folder name" />
      </Modal>
    </div>
  );
}

export default CreateFolder;