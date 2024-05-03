import { PureComponent } from 'react';
import { Select, message } from 'antd';
import { debounce } from 'lodash';
import { userService } from '@services/user.service';
// import '../../../pages/model/block-user/index.less';

interface IProps {
  placeholder?: string;
  style?: Record<string, string>;
  onSelect: Function;
  defaultValue?: string;
  disabled?: boolean;
}

export class SelectUserDropdown extends PureComponent<IProps> {
  state = {
    loading: false,
    data: [] as any
  };

  loadUsers = debounce(async (q) => {
    try {
      await this.setState({ loading: true });
      const resp = await (await userService.search({ q, limit: 99 })).data;
      this.setState({
        data: resp.data,
        loading: false
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
      this.setState({ loading: false });
    }
  }, 500);

  componentDidMount() {
    this.loadUsers('');
  }

  render() {
    const {
      style, onSelect, defaultValue, disabled
    } = this.props;
    const { data, loading } = this.state;
    return (
      <Select
        showSearch
        defaultValue={defaultValue}
        placeholder="Type to search user"
        style={style}
        onSearch={this.loadUsers.bind(this)}
        onChange={onSelect.bind(this)}
        loading={loading}
        optionFilterProp="children"
        disabled={disabled}
      >
        {data && data.length > 0 && data.map((u) => (
          <Select.Option value={u._id} key={u._id} style={{ textTransform: 'capitalize' }}>
            {`${u?.name || u?.username || 'N/A'}`}
          </Select.Option>
        ))}
      </Select>
    );
  }
}
