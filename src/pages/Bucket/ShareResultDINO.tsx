import React from 'react';
import ReactJson from 'react-json-view';
import { MediaType } from '../../utils/classifyMediaType';
import './index.css';

const ShareResultDINO: React.FC<{
  result: any,
  typeResult: MediaType,
}> = ({ result, typeResult }) => {

  const renderResult = {
    [MediaType.IMAGE] : () => {
      const image = new Buffer(result, "binary").toString("base64");
      return <img style={{ maxWidth: '100%', borderRadius: '4px' }} src={'data:image/png;base64,' + image} alt="" />;
    },
    [MediaType.JSON] : () => {
      return (
        <div className="dino-result">
          <ReactJson 
            style={{ fontSize: 13 }}
            name={null}
            enableClipboard={false} 
            src={result} 
            displayDataTypes={false}
          />
        </div>
      )
    },
    [MediaType.TEXT]: () => {
      return (
        <div>{result}</div>
      )
    },
    [MediaType.VIDEO]: () => {
      const blob = new Blob([result]);
      const videoSrc = URL.createObjectURL(blob);
      return <video style={{ maxWidth: 500 }} src={videoSrc} />;
    },
    [MediaType.AUDIO]: () => {
      const blob = new Blob([result]);
      const audioSrc = URL.createObjectURL(blob);
      return <audio src={audioSrc} />;
    },
  }
  
  return (
    <div className="dino-share-result">
      <div style={{ marginBottom: '7px' }}><b>Result:</b></div>
      {renderResult[typeResult]()}
    </div>
  );
}

export default ShareResultDINO;