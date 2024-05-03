/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-tag-spacing */
import { PureComponent } from 'react';
import { FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { Progress } from 'antd';

interface IProps {
  remove: Function;
  files: any[];
}

export default class VideoUploadList extends PureComponent<IProps> {
  render() {
    const { files, remove } = this.props;
    return (
      <div className="ant-upload-list ant-upload-list-picture">
        {files.map((file) => (
          <div className="ant-upload-list-item ant-upload-list-item-uploading ant-upload-list-item-list-type-picture" key={file.uid}>
            <div className="ant-upload-list-item-info">
              <div>
                <span className="ant-upload-list-item-thumbnail ant-upload-list-item-file">
                  <FileAddOutlined />
                </span>
                <span className="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1">
                  <span><b>{file.name}</b></span>
                  {' '}
                  |
                  <span>
                    {(file.size / (1024 * 1024)).toFixed(2)}
                    {' '}
                    MB
                  </span>
                </span>
                {file.percent !== 100
                  && (
                  <span className="ant-upload-list-item-card-actions picture">
                    <a onClick={remove.bind(this, file)} >
                      <DeleteOutlined />
                    </a>
                  </span>
                  )}
                {file.percent && <Progress percent={Math.round(file.percent)} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
