/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { PureComponent } from 'react';
import { PictureOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { Progress } from 'antd';

interface IProps {
  remove: Function;
  files: any[];
}

export default class UploadList extends PureComponent<IProps> {
  state = {
    previews: {} as Record<string, any>
  };

  renderPreview(file) {
    const { previews } = this.state;
    if (file.status === 'uploading') {
      return <LoadingOutlined />;
    }
    if (previews[file.uid]) {
      return <img src={previews[file.uid]} alt="uid" />;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const preview = {
        ...previews,
        [file.uid]: reader.result
      };
      this.setState({ previews: { preview } });
    });
    reader.readAsDataURL(file);
    return <PictureOutlined />;
  }

  render() {
    const { files, remove } = this.props;
    return (
      <div className="ant-upload-list ant-upload-list-picture">
        {files.map((file) => (
          <div className="ant-upload-list-item ant-upload-list-item-uploading ant-upload-list-item-list-type-picture" key={file.uid}>
            <div className="ant-upload-list-item-info">
              <div>
                <span className="ant-upload-list-item-thumbnail ant-upload-list-item-file">
                  {this.renderPreview(file)}
                </span>
                <span className="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1">
                  <span>{file.name}</span>
                </span>
                {file.percent !== 100
                  && (
                  <span className="ant-upload-list-item-card-actions picture">
                    <a onClick={remove.bind(this, file)}>
                      <DeleteOutlined />
                    </a>
                  </span>
                  )}

                {file.percent && <Progress percent={file.percent} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
