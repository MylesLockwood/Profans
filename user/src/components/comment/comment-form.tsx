import { PureComponent, createRef } from 'react';
import {
  Form, Input, Button, Popover
} from 'antd';
import {
  SendOutlined, SmileOutlined
} from '@ant-design/icons';
import { IUser } from 'src/interfaces';
import { Emotions } from '@components/messages/emotions';
import { FormInstance } from 'antd/lib/form';
import { ICreateComment } from '../../interfaces/comment';
import './comment.less';

interface IProps {
  objectId: string;
  objectType?: string;
  onSubmit: Function;
  creator: IUser;
  requesting?: boolean;
  isReply?: boolean;
  onCancel?: Function
}

const { TextArea } = Input;

export class CommentForm extends PureComponent<IProps> {
  formRef: any;

  state = {
    text: ''
  }

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  onFinish(values: ICreateComment) {
    const { onSubmit: handleComment, objectId, objectType } = this.props;
    const data = values;
    if (!data.content || !data.content.trim()) return;
    data.objectId = objectId;
    data.objectType = objectType || 'video';
    this.formRef.resetFields();
    handleComment(data);
  }

  async onEmojiClick(value) {
    const { text } = this.state;
    const instance = this.formRef as FormInstance;
    instance.setFieldsValue({
      content: `${instance.getFieldValue('content')} ${value?.emoji} `
    });
    this.setState({ text: `${text} ${value?.emoji} ` });
  }

  render() {
    const {
      creator, requesting, isReply
    } = this.props;
    if (!this.formRef) this.formRef = createRef();
    return (
      <Form
        ref={(ref) => { this.formRef = ref; }}
        name="comment-form"
        onFinish={this.onFinish.bind(this)}
        initialValues={{
          content: ''
        }}
      >
        <div className="comment-form">
          <div className="cmt-user">
            <img alt="creator-img" src={creator && creator.avatar ? creator.avatar : '/static/no-avatar.png'} />
          </div>
          <div className="cmt-area">
            <Form.Item
              name="content"
              validateTrigger={['onChange']}
            >
              <TextArea maxLength={250} rows={!isReply ? 2 : 1} placeholder={!isReply ? 'Add a comment here' : 'Add a reply here'} />
            </Form.Item>
            <Popover content={<Emotions onEmojiClick={this.onEmojiClick.bind(this)} />} trigger="click">
              <div className="grp-emotions">
                <SmileOutlined />
              </div>
            </Popover>
          </div>
          <Button className={!isReply ? 'submit-btn' : ''} htmlType="submit" disabled={requesting}>
            {!isReply ? <SendOutlined /> : 'Reply'}
          </Button>
        </div>
      </Form>
    );
  }
}
