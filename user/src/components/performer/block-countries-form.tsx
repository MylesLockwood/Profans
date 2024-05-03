/* eslint-disable no-template-curly-in-string */
import { PureComponent } from 'react';
import {
  Form, Button, Row, Col, Select, Image
} from 'antd';
import { IBlockCountries, ICountry } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  },
  number: {
    range: 'Must be between ${min} and ${max}'
  }
};

interface IProps {
  onFinish: Function;
  blockCountries?: IBlockCountries;
  updating?: boolean;
  countries?: ICountry[];
}

const { Option } = Select;

export class PerformerBlockCountriesForm extends PureComponent<IProps> {
  render() {
    const {
      onFinish, blockCountries, updating, countries
    } = this.props;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        validateMessages={validateMessages}
        initialValues={blockCountries}
        labelAlign="left"
        className="account-form"
      >
        <Row>
          <Col span={24}>
            <Form.Item name="countryCodes" label="Select countries you want to block">
              <Select
                showSearch
                optionFilterProp="label"
                mode="multiple"
              >
                {countries
                  && countries.length > 0
                  && countries.map((c) => (
                    <Option value={c.code} label={c.name} key={c.code}>
                      <Image src={c.flag} alt="flag" fallback="/static/no-image.jpg" width={25} preview={false} />
                      {' '}
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item wrapperCol={{ ...layout.wrapperCol }}>
          <Button type="primary" htmlType="submit" className="primary" loading={updating}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
