import { PureComponent } from 'react';
import {
  Row, Button,
  Col, Modal
} from 'antd';
import { } from '@ant-design/icons';
import './index.less';

interface IProps {
  onAddPollDuration: Function;
  openDurationPollModal: boolean;
}

export default class AddPollDurationForm extends PureComponent<IProps> {
  state = {
    limitTime: 7
  };

  async onChangePoll(value) {
    this.setState({ limitTime: value });
  }

  render() {
    const { onAddPollDuration, openDurationPollModal = false } = this.props;
    const { limitTime } = this.state;

    return (
      <Modal
        title={`Poll duration - ${!limitTime ? 'No limit' : `${limitTime} days`}`}
        visible={openDurationPollModal}
        onCancel={() => onAddPollDuration(7)}
        onOk={() => onAddPollDuration(limitTime)}
      >
        <Row>
          <Col span={4.5}>
            <Button type={limitTime === 1 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 1)}>1 day</Button>
          </Col>
          <Col span={4.5}>
            <Button type={limitTime === 3 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 3)}>3 days</Button>
          </Col>
          <Col span={4.5}>
            <Button type={limitTime === 7 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 7)}>7 days</Button>
          </Col>
          <Col span={4.5}>
            <Button type={limitTime === 30 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 30)}>30 days</Button>
          </Col>
          <Col span={6}>
            <Button type={limitTime === 0 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 0)}>No limit</Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}
