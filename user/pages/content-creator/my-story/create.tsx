/* eslint-disable no-await-in-loop */
import { PureComponent } from 'react';
import {
  Upload, message, Button, Layout,
  Input, Form, Col, Row, Popover
} from 'antd';
import {
  FileAddOutlined, SmileOutlined, BgColorsOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { IPerformer, IStory, IUIConfig } from 'src/interfaces';
import { storyService } from '@services/index';
import { connect } from 'react-redux';
import { Emotions } from '@components/messages/emotions';
import StoryBackgroundForm from '@components/story/background-form';
import StoryColorPicker from '@components/story/story-text-color';
import MoveAbleText from '@components/story/moveable-text';
import Router from 'next/router';
import Head from 'next/head';
import '@components/story/index.less';

const { TextArea } = Input;
interface IProps {
  ui: IUIConfig;
  user: IPerformer;
  story?: IStory;
}
const validateMessages = {
  required: 'This field is required!'
};

class StoryForm extends PureComponent<IProps> {
  state = {
    text: '',
    uploading: false,
    fileIds: [],
    backgroundUrl: '/static/story-img/1.jpg',
    textColor: '#fff',
    textStyle: {
      rotate: 0,
      translate: [0, 0, 0]
    }
  };

  componentDidMount() {
    const { story, user } = this.props;
    if (!user || !user.verifiedDocument) {
      message.warning('Your ID documents are not verified yet! You could not post any content right now. Please upload your ID documents to get approval then start making money.');
      Router.push('/content-creator/account');
      return;
    }
    if (story) {
      this.setState({
        backgroundUrl: story.backgroundUrl,
        textColor: story.textColor,
        text: story.text,
        fileIds: story.fileIds ? story.fileIds : []
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

  onsubmit = async (values: any) => {
    const { story } = this.props;
    if (!values.text.trim()) {
      message.error('Please add a caption');
      return;
    }
    try {
      await this.setState({ uploading: true });
      !story ? await storyService.create(values) : await storyService.update(story._id, values);
      message.success(!story ? 'Added a story success' : 'Updated your story');
      Router.back();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Something went wrong, please try again later');
    } finally {
      this.setState({ uploading: false });
    }
  }

  onEmojiClick = (emojiObject) => {
    const { text } = this.state;
    this.setState({ text: `${text} ${emojiObject.emoji}` });
  }

  onDiscard = () => {
    this.setState({
      text: '',
      uploading: false,
      fileIds: [],
      backgroundUrl: '/static/story-img/1.jpg',
      textColor: '#fff',
      textStyle: null
    });
  }

  beforeUpload = async (file, fileList) => {
    const { fileIds } = this.state;
    if (!fileList.length) {
      return;
    }
    if (fileList.indexOf(file) === (fileList.length - 1)) {
      await this.setState({ uploading: true });
      const newFileIds = [...fileIds];
      // eslint-disable-next-line no-restricted-syntax
      for (const newFile of fileList) {
        try {
          // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(newFile.status) || newFile._id) continue;
          newFile.status = 'uploading';
          const resp = (newFile.type.indexOf('image') > -1 ? await storyService.uploadPhoto(
            newFile,
            {},
            this.onUploading.bind(this, newFile)
          ) : await storyService.uploadVideo(
            newFile,
            {},
            this.onUploading.bind(this, newFile)
          )) as any;
          this.setState({ backgroundUrl: resp.data.url });
          newFileIds.push(resp.data._id);
          newFile._id = resp.data._id;
        } catch (e) {
          message.error(`File ${newFile.name} error!`);
        }
      }
      this.setState({ uploading: false, fileIds: newFileIds });
    }
  }

  render() {
    const { story, ui } = this.props;
    const {
      uploading, fileIds, text, backgroundUrl, textColor, textStyle
    } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui?.siteName}
            {' '}
            | New Story
          </title>
        </Head>
        <div className="story-form">
          <div className="page-heading" style={{ paddingLeft: 20 }}>
            <a aria-hidden onClick={() => Router.back()}>
              <ArrowLeftOutlined />
              {' '}
              New Story
            </a>
          </div>
          <Form
            onFinish={(payload) => {
              const values = payload;
              values.fileIds = fileIds;
              values.type = 'photo';
              values.textColor = textColor;
              values.backgroundUrl = backgroundUrl;
              values.text = text;
              values.textStyle = textStyle;
              this.onsubmit(values);
            }}
            validateMessages={validateMessages}
            initialValues={story || ({
              text: ''
            } as IStory)}
          >
            <Row className="form-content">
              <Col lg={12} md={12} sm={24} xs={24}>
                <div>
                  <Form.Item rules={[{ required: true, message: 'Please add caption here' }]}>
                    <div className="input-f-desc">
                      <TextArea value={text} autoFocus rows={3} onChange={(e) => this.setState({ text: e.target.value })} className="story-input" placeholder="Add caption here" allowClear />
                      <Popover content={<Emotions onEmojiClick={this.onEmojiClick.bind(this)} />} trigger="click">
                        <span className="grp-emotions">
                          <SmileOutlined />
                        </span>
                      </Popover>
                      <span className="grp-colors">
                        <BgColorsOutlined />
                        <StoryColorPicker onChangeColor={(color) => this.setState({ textColor: color?.hex ? color.hex : color })} />
                      </span>
                    </div>
                  </Form.Item>
                  <StoryBackgroundForm onChangeUrl={(url) => this.setState({ backgroundUrl: url })} />
                  <Upload
                    customRequest={() => true}
                    accept="image/*"
                    beforeUpload={this.beforeUpload}
                    multiple={false}
                    showUploadList={false}
                    disabled={uploading}
                    listType="picture"
                  >
                    <Button type="primary">
                      <FileAddOutlined />
                      {' '}
                      Custom your background
                    </Button>
                  </Upload>
                </div>
              </Col>
              <Col lg={12} md={12} sm={24} xs={24} style={{ display: 'flex' }}>
                <div className="preview-canvas" style={{ backgroundImage: `url(${backgroundUrl || '/static/story-img/1.jpg'})` }}>
                  <MoveAbleText text={text || 'Please add a caption'} color={textColor} onMoveText={(value) => this.setState({ textStyle: { ...textStyle, ...value } })} />
                </div>
              </Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                className="secondary"
                type="default"
                disabled={uploading}
                onClick={() => {
                  if (!window.confirm('Are you sure you want to discard?')) return;
                  this.onDiscard();
                }}
              >
                Discard
              </Button>
              &nbsp;
              <Button
                className="primary"
                htmlType="submit"
                loading={uploading}
                disabled={uploading}
              >
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  user: state.user.current,
  ui: state.ui
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(StoryForm);
