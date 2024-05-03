/* eslint-disable no-await-in-loop */
import { PureComponent, createRef } from 'react';
import {
  Upload, message, Button, Tooltip, Select,
  Input, Form, InputNumber, Switch, Progress
} from 'antd';
import {
  FileAddOutlined, BarChartOutlined, PictureOutlined, VideoCameraAddOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import UploadList from '@components/file/list-media';
import { IFeed } from 'src/interfaces';
import { feedService } from '@services/index';
import Router from 'next/router';
import moment from 'moment';
import { formatDate } from '@lib/date';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import { FormInstance } from 'antd/lib/form';
import AddPollDurationForm from './add-poll-duration';
import './index.less';

const { TextArea } = Input;
const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};
interface IProps {
  discard?: Function;
  feed?: IFeed
}
const validateMessages = {
  required: 'This field is required!'
};

export default class FormFeed extends PureComponent<IProps> {
  formRef: any;

  pollIds = [];

  thumbnailId = '';

  teaserId = '';

  teaser = null;

  state = {
    type: 'text',
    uploading: false,
    thumbnail: null,
    fileList: [],
    fileIds: [],
    pollList: [],
    isSale: false,
    addPoll: false,
    openPollDuration: false,
    expirePollTime: 7,
    expiredPollAt: moment().endOf('day').add(7, 'days')
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    const { feed } = this.props;
    if (feed) {
      this.setState({
        type: feed.type,
        fileList: feed.files ? feed.files : [],
        fileIds: feed.fileIds ? feed.fileIds : [],
        isSale: feed.isSale,
        addPoll: !!feed.pollIds.length,
        pollList: feed.polls,
        thumbnail: feed.thumbnailUrl
      });
      this.teaser = feed.teaser;
    }
  }

  async onAddMore(file, listFile) {
    const { fileList, fileIds } = this.state;
    if (!listFile.length) {
      return;
    }
    if (listFile.indexOf(file) === (listFile.length - 1)) {
      const files = await Promise.all(listFile.map((f) => {
        const newFile = f;
        if (newFile.type.includes('video')) return f;
        const reader = new FileReader();
        reader.addEventListener('load', () => { newFile.thumbnail = reader.result; });
        reader.readAsDataURL(newFile);
        return newFile;
      }));
      await this.setState({
        fileList: [...fileList, ...files],
        uploading: true
      });
      const newFileIds = [...fileIds];
      // eslint-disable-next-line no-restricted-syntax
      for (const fileItem of listFile) {
        try {
          // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(fileItem.status) || fileItem._id) continue;
          fileItem.status = 'uploading';
          const resp = (fileItem.type.indexOf('image') > -1 ? await feedService.uploadPhoto(
            fileItem,
            {},
            this.onUploading.bind(this, fileItem)
          ) : await feedService.uploadVideo(
            fileItem,
            {},
            this.onUploading.bind(this, fileItem)
          )) as any;
          newFileIds.push(resp.data._id);
          fileItem._id = resp.data._id;
        } catch (e) {
          message.error(`File ${fileItem.name} error!`);
        }
      }
      this.setState({ uploading: false, fileIds: newFileIds });
    }
  }

  onUploading(file, resp: any) {
    // eslint-disable-next-line no-param-reassign
    file.percent = resp.percentage;
    // eslint-disable-next-line no-param-reassign
    if (file.percent === 100) file.status = 'done';
    this.forceUpdate();
  }

  async onAddPoll() {
    const { addPoll } = this.state;
    await this.setState({ addPoll: !addPoll });
    if (!addPoll) {
      this.pollIds = [];
      this.setState({ pollList: [] });
    }
  }

  async onChangePoll(index, e) {
    const { value } = e.target;
    this.setState((prevState: any) => {
      const newItems = [...prevState.pollList];
      newItems[index] = value;
      return { pollList: newItems };
    });
  }

  async onsubmit(feed, values) {
    const { type } = this.state;
    try {
      await this.setState({ uploading: true });
      !feed ? await feedService.create({ ...values, type }) : await feedService.update(feed._id, { ...values, type: feed.type });
      message.success(`${!feed ? 'Posted' : 'Updated'} successfully!`);
      Router.replace('/feed');
    } catch {
      message.success('Something went wrong, please try again later');
      this.setState({ uploading: false });
    }
  }

  async onChangePollDuration(numberDays) {
    const date = !numberDays ? moment().endOf('day').add(99, 'years') : moment().endOf('day').add(numberDays, 'days');
    this.setState({ openPollDuration: false, expiredPollAt: date, expirePollTime: numberDays });
  }

  async onClearPolls() {
    this.setState({ pollList: [] });
    this.pollIds = [];
  }

  async setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  async remove(file) {
    const { fileList, fileIds } = this.state;
    this.setState({
      fileList: fileList.filter((f) => f?._id !== file?._id || f?.uid !== file?.uid),
      fileIds: fileIds.filter((id) => id !== file?._id)
    });
  }

  async beforeUpload(file, fileList) {
    const { fileIds } = this.state;
    if (!fileList.length) {
      this.setState({ fileList: [] });
      return;
    }
    if (fileList.indexOf(file) === (fileList.length - 1)) {
      const files = await Promise.all(fileList.map((f) => {
        if (f._id || f.type.includes('video')) return f;
        const reader = new FileReader();
        // eslint-disable-next-line no-param-reassign
        reader.addEventListener('load', () => { f.thumbnail = reader.result; });
        reader.readAsDataURL(f);
        return f;
      }));
      await this.setState({ fileList: files, uploading: true });
      const newFileIds = [...fileIds];
      // eslint-disable-next-line no-restricted-syntax
      for (const newFile of fileList) {
        try {
          // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(newFile.status) || newFile._id) continue;
          newFile.status = 'uploading';
          const resp = (newFile.type.indexOf('image') > -1 ? await feedService.uploadPhoto(
            newFile,
            {},
            this.onUploading.bind(this, newFile)
          ) : await feedService.uploadVideo(
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

  async beforeUploadThumbnail(file) {
    if (!file) {
      return;
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error('Thumbnail must be smaller than 5MB!');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => { this.setState({ thumbnail: reader.result }); });
    reader.readAsDataURL(file);
    try {
      const resp = await feedService.uploadThumbnail(
        file,
        {},
        this.onUploading.bind(this, file)
      ) as any;
      this.thumbnailId = resp.data._id;
    } catch (e) {
      message.error(`Thumbnail file ${file.name} error!`);
    } finally {
      this.setState({ uploading: false });
    }
  }

  async beforeUploadteaser(file) {
    if (!file) {
      return;
    }
    const isLt2M = file.size / 1024 / 1024 < 100;
    if (!isLt2M) {
      message.error('Teaser must be smaller than 100MB!');
      return;
    }
    this.teaser = file;
    try {
      const resp = await feedService.uploadTeaser(
        file,
        {},
        this.onUploading.bind(this, this.teaser)
      ) as any;
      this.teaserId = resp.data._id;
    } catch (e) {
      message.error(`teaser file ${file.name} error!`);
    } finally {
      this.setState({ uploading: false });
    }
  }

  async submit(payload: any) {
    const { feed } = this.props;
    const {
      pollList, addPoll, isSale, expiredPollAt, fileIds, type
    } = this.state;
    const formValues = { ...payload };
    if (!formValues.text) {
      message.error('Please add a description');
      return;
    }
    if (formValues.price < 1) {
      message.error('Price must be greater than $1');
      return;
    }
    if (this.teaserId) {
      formValues.teaserId = this.teaserId;
    }
    if (this.thumbnailId) {
      formValues.thumbnailId = this.thumbnailId;
    }
    formValues.isSale = isSale;
    formValues.fileIds = fileIds;
    if (['video', 'photo'].includes(feed?.type || type) && !fileIds.length) {
      message.error(`Please add ${feed?.type || type} file`);
      return;
    }
    await this.setState({ uploading: true });
    // create polls
    if (addPoll && pollList.length < 2) {
      message.error('Polls must have at least 2 options');
      return;
    } if (addPoll && pollList.length >= 2) {
      // eslint-disable-next-line no-restricted-syntax
      for (const poll of pollList) {
        try {
          // eslint-disable-next-line no-continue
          if (!poll.length || poll._id) continue;
          const resp = await feedService.addPoll({
            description: poll,
            expiredAt: expiredPollAt
          });
          if (resp && resp.data) {
            this.pollIds = [...this.pollIds, resp.data._id];
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('err_create_poll', await e);
        }
      }
      formValues.pollIds = this.pollIds;
      formValues.pollExpiredAt = expiredPollAt;
      this.onsubmit(feed, formValues);
    } else {
      this.onsubmit(feed, formValues);
    }
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { feed } = this.props;
    const {
      uploading, fileList, isSale, pollList, type,
      addPoll, openPollDuration, expirePollTime, thumbnail
    } = this.state;
    return (
      <div className="feed-form">
        <Form
          {...layout}
          ref={this.formRef}
          onFinish={(values) => {
            this.submit(values);
          }}
          validateMessages={validateMessages}
          initialValues={feed || ({
            type: 'text',
            text: '',
            price: 0,
            isSale: false
          } as IFeed)}
        >
          <Form.Item
            name="fromSourceId"
            label="Select content creator"
            rules={[
              { required: true, message: 'Please select a content creator!' }]}
          >
            <SelectPerformerDropdown
              defaultValue={feed && (feed?.fromSourceId || '')}
              onSelect={(val) => this.setFormVal('fromSourceId', val)}
            />
          </Form.Item>
          <Form.Item name="type" label="Select post type" rules={[{ required: true }]}>
            <Select value={type} onChange={(val) => this.setState({ type: val })}>
              <Select.Option value="text">Text</Select.Option>
              <Select.Option value="video">Video</Select.Option>
              <Select.Option value="photo">Photos</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Add description" name="text" rules={[{ required: true, message: 'Please add a description' }]}>
            <TextArea className="feed-input" rows={3} placeholder="Add a description" allowClear />
          </Form.Item>
          <Form.Item label={type === 'video' ? 'Video file' : 'Photo files'}>
            {fileList.length ? (
              <UploadList
                canAddMore={feed?.type === 'photo' || type === 'photo'}
                type={feed?.type || type}
                files={fileList}
                remove={this.remove.bind(this)}
                onAddMore={this.onAddMore.bind(this)}
                uploading={uploading}
              />
            ) : (
              <p>
                Please upload
                {' '}
                {type === 'video' ? 'video file' : 'photo files'}
              </p>
            )}
          </Form.Item>
          {['video', 'photo'].includes(feed?.type || type) && (
            <Form.Item name="tagline" label="Tagline">
              <Input className="feed-input" placeholder="Add a tagline here" />
            </Form.Item>
          )}
          <Form.Item>
            <Switch checkedChildren="Sale" unCheckedChildren="Free" checked={isSale} onChange={() => this.setState({ isSale: !isSale })} />
          </Form.Item>
          {isSale && (
            <Form.Item label="Set price here" name="price" rules={[{ required: isSale, message: 'Please add price' }]}>
              <InputNumber min={1} />
            </Form.Item>
          )}
          {thumbnail && (
            <Form.Item label="Thumbnail">
              <img alt="thumbnail" src={thumbnail} width="100px" />
            </Form.Item>
          )}
          {this.teaser && (
            <Form.Item label="Teaser">
              <div className="f-upload-list">
                <div className="f-upload-item">
                  <div className="f-upload-thumb">
                    <span className="f-thumb-vid">
                      <PlayCircleOutlined />
                    </span>
                  </div>
                  <div className="f-upload-name">
                    <Tooltip title={this.teaser?.name}>{this.teaser?.name}</Tooltip>
                  </div>
                  <div className="f-upload-size">
                    {(this.teaser.size / (1024 * 1024)).toFixed(2)}
                    {' '}
                    MB
                  </div>
                  {this.teaser.percent && <Progress percent={Math.round(this.teaser.percent)} />}
                </div>
              </div>
            </Form.Item>
          )}
          {addPoll
            && (
              <Form.Item label="Add Polls">
                <div className="poll-form">
                  <div className="poll-top">
                    {!feed ? (
                      <>
                        <span aria-hidden="true" onClick={() => this.setState({ openPollDuration: true })}>
                          Poll duration -
                          {' '}
                          {!expirePollTime ? 'No limit' : `${expirePollTime} days`}
                        </span>
                        <a aria-hidden="true" onClick={this.onAddPoll.bind(this)}>x</a>
                      </>
                    )
                      : (
                        <span>
                          Poll expiration
                          {' '}
                          {formatDate(feed?.pollExpiredAt)}
                        </span>
                      )}
                  </div>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  <Input disabled={!!feed?._id} className="poll-input" value={pollList && pollList.length > 0 && pollList[0]._id ? pollList[0].description : pollList[0] ? pollList[0] : ''} onChange={this.onChangePoll.bind(this, 0)} />
                  {/* eslint-disable-next-line no-nested-ternary */}
                  <Input disabled={!!feed?._id || !pollList.length} className="poll-input" value={pollList && pollList.length > 1 && pollList[1]._id ? pollList[1].description : pollList[1] ? pollList[1] : ''} onChange={this.onChangePoll.bind(this, 1)} />
                  {pollList.map((poll, index) => {
                    if (index === 0 || index === 1) return null;
                    // eslint-disable-next-line react/no-array-index-key
                    return <Input disabled={!!feed?._id} key={`poll_${index}`} value={(poll._id ? poll.description : poll) || ''} className="poll-input" onChange={this.onChangePoll.bind(this, index)} />;
                  })}
                  {!feed && pollList.length > 1 && (
                    <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <a aria-hidden onClick={() => this.setState({ pollList: pollList.concat(['']) })}>Add another option</a>
                      <a aria-hidden onClick={this.onClearPolls.bind(this)}>
                        Clear polls
                      </a>
                    </p>
                  )}
                </div>
              </Form.Item>
            )}
          <div style={{ display: 'flex' }}>
            {['video', 'photo'].includes(feed?.type || type) && [
              <Upload
                key="upload_media_file"
                customRequest={() => true}
                accept={(feed?.type === 'video' || type === 'video') ? 'video/*' : 'image/*'}
                beforeUpload={this.beforeUpload.bind(this)}
                multiple={feed?.type === 'photo' || type === 'photo'}
                showUploadList={false}
                disabled={uploading}
                listType="picture"
              >
                <Button type="primary">
                  <FileAddOutlined />
                  {' '}
                  Add files
                </Button>
              </Upload>,
              <Upload
                key="upload_thumb"
                customRequest={() => true}
                accept={'image/*'}
                beforeUpload={this.beforeUploadThumbnail.bind(this)}
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                listType="picture"
              >
                <Button type="primary" style={{ marginLeft: 15 }}>
                  <PictureOutlined />
                  {' '}
                  Add thumbnail
                </Button>
              </Upload>
            ]}
            {['video'].includes(feed?.type || type) && [
              <Upload
                key="upload_teaser"
                customRequest={() => true}
                accept={'video/*'}
                beforeUpload={this.beforeUploadteaser.bind(this)}
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                listType="picture"
              >
                <Button type="primary" style={{ marginLeft: 15 }}>
                  <VideoCameraAddOutlined />
                  Add teaser
                </Button>
              </Upload>
            ]}
            <Button disabled={addPoll || (!!(feed && feed._id))} type="primary" style={{ marginLeft: '15px' }} onClick={this.onAddPoll.bind(this)}>
              <BarChartOutlined style={{ transform: 'rotate(90deg)' }} />
              Add polls
            </Button>
          </div>
          <AddPollDurationForm onAddPollDuration={this.onChangePollDuration.bind(this)} openDurationPollModal={openPollDuration} />
          <div className="submit-btns">
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              disabled={uploading}
            >
              {!feed ? 'Post' : 'Update'}
            </Button>
            <Button
              onClick={() => Router.back()}
              type="default"
              loading={uploading}
              disabled={uploading}
            >
              Back
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
