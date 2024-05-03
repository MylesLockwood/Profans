/* eslint-disable no-nested-ternary */
/* eslint-disable no-await-in-loop */
import { PureComponent } from 'react';
import {
  Upload, message, Button, Tooltip, Input, Form, InputNumber, Switch, Progress, Popover
} from 'antd';
import {
  BarChartOutlined, PictureOutlined, VideoCameraAddOutlined,
  PlayCircleOutlined, SmileOutlined
} from '@ant-design/icons';
import UploadList from '@components/file/list-media';
import { IFeed } from 'src/interfaces';
import { feedService } from '@services/index';
import Router from 'next/router';
import moment from 'moment';
import { formatDate } from '@lib/date';
import { Emotions } from '@components/messages/emotions';
import AddPollDurationForm from './add-poll-duration';
import './index.less';

const { TextArea } = Input;
const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};
interface IProps {
  type?: string;
  discard?: Function;
  feed?: IFeed
}
const validateMessages = {
  required: 'This field is required!'
};

export default class FeedForm extends PureComponent<IProps> {
  pollIds = [];

  thumbnailId = '';

  teaserId = '';

  teaser = null;

  state = {
    uploading: false,
    thumbnail: null,
    fileList: [],
    fileIds: [],
    pollList: [],
    isSale: false,
    addPoll: false,
    openPollDuration: false,
    expirePollTime: 7,
    expiredPollAt: moment().endOf('day').add(7, 'days'),
    text: ''
  };

  componentDidMount() {
    const { feed } = this.props;
    if (feed) {
      this.setState({
        fileList: feed.files ? feed.files : [],
        fileIds: feed.fileIds ? feed.fileIds : [],
        isSale: feed.isSale,
        addPoll: !!feed.pollIds.length,
        pollList: feed.polls,
        thumbnail: feed.thumbnailUrl,
        text: feed.text
      });
      this.teaser = feed.teaser;
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
    const { type } = this.props;
    try {
      await this.setState({ uploading: true });
      !feed ? await feedService.create({ ...values, type }) : await feedService.update(feed._id, { ...values, type: feed.type });
      message.success('Posted successfully!');
      Router.back();
    } catch (e) {
      const err = await e;
      message.success(err?.message || 'Something went wrong, please try again later');
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

  onEmojiClick = (emojiObject) => {
    const { text } = this.state;
    this.setState({ text: `${text} ${emojiObject.emoji}` });
  }

  async remove(file) {
    const { fileList, fileIds } = this.state;
    this.setState({
      fileList: fileList.filter((f) => (f._id ? f._id !== file._id : f.uid !== file.uid)),
      fileIds: fileIds.filter((id) => id !== file?._id)
    });
  }

  async beforeUpload(file, listFile) {
    const { fileList, fileIds } = this.state;
    if (file.type.includes('image')) {
      const valid = (file.size / 1024 / 1024) < (process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5);
      if (!valid) {
        message.error(`Image ${file.name} must be smaller than ${process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB!`);
        return false;
      }
    }
    if (file.type.includes('video')) {
      const valid = (file.size / 1024 / 1024) < (process.env.NEXT_PUBLIC_MAX_SIZE_TEASER || 200);
      if (!valid) {
        message.error(`Video ${file.name} must be smaller than ${process.env.NEXT_PUBLIC_MAX_SIZE_TEASER || 200}MB!`);
        return false;
      }
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
        fileList: file.type.includes('video') ? files : [...fileList, ...files],
        uploading: true
      });
      const newFileIds = file.type.includes('video') ? [] : [...fileIds];
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
    return true;
  }

  async beforeUploadThumbnail(file) {
    if (!file) {
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 10);
    if (!isLt2M) {
      message.error(`Image is too large please provide an image ${process.env.NEXT_PUBLIC_MAX_SIZE_IMAGE || 10}MB or below`);
      return false;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => { this.setState({ thumbnail: reader.result }); });
    reader.readAsDataURL(file);
    await this.setState({ uploading: true });
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
    return true;
  }

  async beforeUploadteaser(file) {
    if (!file) {
      return false;
    }
    this.teaser = file;
    const isLt2M = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_TEASER || 200);
    if (!isLt2M) {
      message.error(`Teaser is too large please provide an video ${process.env.NEXT_PUBLIC_MAX_SIZE_TEASER || 200}MB or below`);
      return false;
    }
    try {
      await this.setState({ uploading: true });
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
    return true;
  }

  async beforeSubmit(payload: any) {
    const { feed, type } = this.props;
    const {
      pollList, addPoll, isSale, expiredPollAt, fileIds, text
    } = this.state;
    const formValues = { ...payload };
    if (!text) {
      message.error('Please add a description');
      return;
    }
    if (text.length > 300) {
      message.error('Description is over 300 characters');
      return;
    }
    if (formValues.price < 1) {
      message.error('Price must be greater than $1');
      return;
    }
    formValues.teaserId = this.teaserId || null;
    formValues.thumbnailId = this.thumbnailId || null;
    formValues.isSale = isSale;
    formValues.text = text;
    formValues.fileIds = fileIds;
    if (['video', 'photo'].includes(feed?.type || type) && !fileIds.length) {
      message.error(`Please add ${feed?.type || type} file`);
      return;
    }

    // create polls
    if (addPoll && pollList.length < 2) {
      message.error('Polls must have at least 2 options');
      return;
    } if (addPoll && pollList.length >= 2) {
      await this.setState({ uploading: true });
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
            this.pollIds = [...this.pollIds, ...[resp.data._id]];
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
    const { feed, type, discard } = this.props;
    const {
      uploading, fileList, fileIds, isSale, pollList, text,
      addPoll, openPollDuration, expirePollTime, thumbnail
    } = this.state;
    return (
      <div className="feed-form">
        <Form
          {...layout}
          onFinish={this.beforeSubmit.bind(this)}
          validateMessages={validateMessages}
          initialValues={feed || ({
            text: '',
            price: 0,
            isSale: false
          } as IFeed)}
        >
          <Form.Item rules={[{ required: true, message: 'Please add a description' }]}>
            <div className="input-f-desc">
              <TextArea maxLength={300} showCount value={text} onChange={(e) => this.setState({ text: e.target.value })} className="feed-input" rows={3} placeholder={!fileIds.length ? 'Compose new post...' : 'Add a description'} allowClear />
              <Popover content={<Emotions onEmojiClick={this.onEmojiClick.bind(this)} />} trigger="click">
                <span className="grp-emotions">
                  <SmileOutlined />
                </span>
              </Popover>
            </div>
          </Form.Item>
          {['video', 'photo'].includes(feed?.type || type) && (
            <Form.Item name="tagline">
              <Input className="feed-input" placeholder="Add a tagline here" />
            </Form.Item>
          )}
          <Form.Item>
            <Switch checkedChildren="Pay per view" unCheckedChildren="Subscribe to view" checked={isSale} onChange={() => this.setState({ isSale: !isSale })} />
          </Form.Item>
          {isSale && (
            <Form.Item label="Set price here" name="price" rules={[{ required: isSale, message: 'Please add price' }]}>
              <InputNumber min={1} />
            </Form.Item>
          )}
          {['video', 'photo'].includes(feed?.type || type) && (
          <UploadList
            type={feed?.type || type}
            files={fileList}
            remove={this.remove.bind(this)}
            onAddMore={this.beforeUpload.bind(this)}
            uploading={uploading}
          />
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
                <Input disabled={!!feed?._id} className="poll-input" value={pollList && pollList.length > 0 && pollList[0]._id ? pollList[0].description : pollList[0] ? pollList[0] : ''} onChange={this.onChangePoll.bind(this, 0)} />
                <Input disabled={!!feed?._id || !pollList.length} className="poll-input" value={pollList && pollList.length > 1 && pollList[1]._id ? pollList[1].description : pollList[1] ? pollList[1] : ''} onChange={this.onChangePoll.bind(this, 1)} />

                {pollList.map((poll, index) => {
                  if (index === 0 || index === 1) return null;
                  return <Input disabled={!!feed?._id} key={poll?.description || poll} value={(poll._id ? poll.description : poll) || ''} className="poll-input" onChange={this.onChangePoll.bind(this, index)} />;
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
            )}
          <div style={{ margin: 15 }}>
            {['video', 'photo'].includes(feed?.type || type) && [
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
            {['video'].includes(feed?.type || type)
              && (
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
                    {' '}
                    Add teaser
                  </Button>
                </Upload>
              )}
            <Button disabled={addPoll || (!!(feed && feed._id))} type="primary" style={{ marginLeft: '15px' }} onClick={this.onAddPoll.bind(this)}>
              <BarChartOutlined style={{ transform: 'rotate(90deg)' }} />
              {' '}
              Add polls
            </Button>
          </div>
          <AddPollDurationForm onAddPollDuration={this.onChangePollDuration.bind(this)} openDurationPollModal={openPollDuration} />
          <div className="submit-btns">
            <Button
              className="primary"
              htmlType="submit"
              loading={uploading}
              disabled={uploading}
            >
              {!feed ? 'Post' : 'Update'}
            </Button>
            {(!feed || !feed._id) && (
              <Button
                onClick={() => discard()}
                className="secondary"
                disabled={uploading}
              >
                Discard
              </Button>
            )}
          </div>
        </Form>
      </div>
    );
  }
}
