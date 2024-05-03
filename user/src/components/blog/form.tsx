/* eslint-disable no-await-in-loop */
import { PureComponent } from 'react';
import dynamic from 'next/dynamic';
import {
  Upload, message, Button, Input, Form
} from 'antd';
import { } from '@ant-design/icons';
import { IBlog } from 'src/interfaces';
import { blogService } from '@services/index';
import Router from 'next/router';
import UploadList from '@components/file/list-media';
import './index.less';

const WYSIWYG = dynamic(() => import('@components/wysiwyg'), {
  ssr: false
});

interface IProps {
  blog?: IBlog;
}
const validateMessages = {
  required: 'This field is required!'
};

export default class BlogForm extends PureComponent<IProps> {
  private _content: string = '';

  state = {
    uploading: false,
    fileList: [],
    fileIds: []
  };

  componentDidMount() {
    const { blog } = this.props;
    if (blog) {
      this._content = blog.text;
      this.setState({
        fileList: blog.files ? blog.files : [],
        fileIds: blog.fileIds ? blog.fileIds : []
      });
    }
  }

  onUploading(file, resp: any) {
    // eslint-disable-next-line no-param-reassign
    file.percent = resp.percentage;
    // eslint-disable-next-line no-param-reassign
    if (file.percent === 100) file.status = 'done';
    this.forceUpdate();
  }

  async onsubmit(blog, values) {
    try {
      !blog
        ? await blogService.create(values)
        : await blogService.update(blog._id, values);
      message.success('Posted successfully!');
      Router.back();
    } catch {
      message.success('Something went wrong, please try again later');
      this.setState({ uploading: false });
    }
  }

  async remove(file) {
    const { fileList, fileIds } = this.state;
    this.setState({
      fileList: fileList.filter((f) => (f._id ? f._id !== file._id : f.uid !== file.uid)),
      fileIds: fileIds.filter((id) => id !== file?._id)
    });
  }

  async beforeUpload(file, fileList) {
    const { fileIds } = this.state;
    if (!fileList.length) {
      this.setState({ fileList: [] });
      return;
    }
    if (fileList.indexOf(file) === fileList.length - 1) {
      const files = await Promise.all(fileList.map((f) => {
        const newFile = f;
        const reader = new FileReader();
        reader.addEventListener('load', () => { newFile.thumbnail = reader.result; });
        reader.readAsDataURL(newFile);
        return newFile;
      }));
      await this.setState({ fileList: files, uploading: true });
      const newFileIds = [...fileIds];
      // eslint-disable-next-line no-restricted-syntax
      for (const newFile of fileList) {
        try {
          // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(newFile.status) || newFile._id) continue;
          newFile.status = 'uploading';
          const resp = (newFile.type.indexOf('image') > -1
            ? await blogService.uploadPhoto(
              newFile,
              {},
              this.onUploading.bind(this, newFile)
            )
            : await blogService.uploadVideo(
              newFile,
              {},
              this.onUploading.bind(this, newFile)
            )) as any;
          newFileIds.push(resp.data._id);
          newFile._id = resp.data._id;
        } catch (e) {
          message.error(`File ${newFile.name} error!`);
        }
      }
      this.setState({ uploading: false, fileIds: newFileIds });
    }
  }

  contentChange(content: { [html: string]: string }) {
    this._content = content.html;
  }

  async submit(payload: any) {
    const { blog } = this.props;
    const { fileIds } = this.state;
    const formValues = payload;
    if (!formValues.text || !formValues.text.trim()) {
      message.error('Please add a description');
      return;
    }
    formValues.fileIds = fileIds;
    formValues.text = this._content;
    await this.setState({ uploading: true });
    this.onsubmit(blog, formValues);
  }

  render() {
    const { blog } = this.props;
    const { uploading, fileList } = this.state;
    return (
      <div className="blog-form">
        <Form
          onFinish={(values) => {
            this.submit(values);
          }}
          validateMessages={validateMessages}
          initialValues={blog || ({ title: '', text: '' } as IBlog)}
        >
          <div>
            <Form.Item
              name="title"
              rules={[{ required: true, message: 'Please add a title' }]}
            >
              <Input
                className="blog-input"
                placeholder="Add a title"
                allowClear
              />
            </Form.Item>
            <Form.Item>
              <WYSIWYG onChange={this.contentChange.bind(this)} html={this._content} />
            </Form.Item>
            <div>
              <Upload
                customRequest={() => true}
                accept="image/*"
                beforeUpload={this.beforeUpload.bind(this)}
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                listType="picture"
              >
                <Button type="primary">
                  Upload background Image
                </Button>
              </Upload>
              <UploadList
                files={fileList}
                remove={this.remove.bind(this)}
                onAddMore={null}
                uploading={uploading}
              />
            </div>

          </div>
          <div className="text-center">
            <Button
              className="secondary"
              htmlType="submit"
              loading={uploading}
              disabled={uploading}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
