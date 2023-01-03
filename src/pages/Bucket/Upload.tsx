import { Button } from "antd";
import React from "react";
import CreateFolder from "./CreateFolder";
import UploadFile from "./UploadFile";
import UploadFolder from "./UploadFolder";

const Upload: React.FC<{
  projectId: string,
  folderParentId: string,
  refreshFileList: () => void,
  breadcrumb: any,
}> = ({ projectId, folderParentId, refreshFileList, breadcrumb }) => {
  const pathUpload = breadcrumb?.length > 0 ? '/'+breadcrumb.map((item: any) => item?.file_name)?.join('/')+'/' : '/';

  return (
    <div className="dino-upload">
      <div>
        <UploadFolder refreshFileList={refreshFileList} projectId={projectId} path={pathUpload} />
      </div>
      <div>
        <UploadFile refreshFileList={refreshFileList} projectId={projectId} path={pathUpload} />
      </div>
      <div>
        <CreateFolder projectId={projectId} folderParentId={folderParentId} refreshFileList={refreshFileList} />
      </div>
    </div>
  );
}

export default Upload;