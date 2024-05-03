import { PureComponent } from 'react';
import {
  Input, Row, Col, Select, DatePicker
} from 'antd';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';

const { RangePicker } = DatePicker;
interface IProps {
  onSubmit?: Function;
  statuses?: {
    key: string;
    text?: string;
  }[];
  type?: {
    key: string;
    text?: string;
  }[];
  searchWithPerformer?: boolean;
  searchWithKeyword?: boolean;
  dateRange?: boolean;
}

export class SearchFilter extends PureComponent<IProps> {
  constructor(props) {
    super(props);

    this.state = {
      q: '',
      performerId: '',
      status: '',
      type: ''
    };
  }

  render() {
    const {
      statuses = [],
      type = [],
      searchWithPerformer,
      searchWithKeyword,
      dateRange,
      onSubmit
    } = this.props;
    return (
      <Row className="search-filter">
        {searchWithKeyword && (
          <Col lg={8} md={8} xs={12}>
            <Input
              placeholder="Enter keyword"
              onChange={(evt) => this.setState({ q: evt.target.value }, () => onSubmit(this.state))}
              onPressEnter={() => onSubmit(this.state)}
            />
          </Col>
        )}
        {statuses && statuses.length ? (
          <Col lg={8} md={6} xs={12}>
            <Select
              onChange={(val) => this.setState({ status: val }, () => onSubmit(this.state))}
              style={{ width: '100%' }}
              placeholder="Select status"
              defaultValue=""
            >
              {statuses.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {type && type.length ? (
          <Col lg={8} md={6} xs={12}>
            <Select
              onChange={(val) => this.setState({ type: val }, () => onSubmit(this.state))}
              style={{ width: '100%' }}
              placeholder="Select type"
              defaultValue=""
            >
              {type.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {searchWithPerformer && (
          <Col lg={8} md={8} xs={12}>
            <SelectPerformerDropdown
              placeholder="Search content creator here"
              style={{ width: '100%' }}
              onSelect={(val) => this.setState({ performerId: val || '' }, () => onSubmit(this.state))}
            />
          </Col>
        )}
        {dateRange && (
          <Col lg={8} md={8} xs={12}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates: [any, any], dateStrings: [string, string]) => this.setState({
                fromDate: dateStrings[0],
                toDate: dateStrings[1]
              }, () => onSubmit(this.state))}
            />
          </Col>
        )}
      </Row>
    );
  }
}
