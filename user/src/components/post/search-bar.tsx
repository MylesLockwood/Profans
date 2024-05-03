import { PureComponent } from 'react';
import {
  Input, DatePicker
} from 'antd';
import {
  AppstoreOutlined, MenuOutlined, SearchOutlined, CalendarOutlined
} from '@ant-design/icons';
import { debounce } from 'lodash';
import './index.less';

const { RangePicker } = DatePicker;

const { Search } = Input;
interface IProps {
  searching: boolean;
  handleSearch: Function;
  handleViewGrid?: Function;
  tab: string;
}

export default class SearchFeedBar extends PureComponent<IProps> {
  state = {
    q: '',
    isGrid: false,
    showSearch: false,
    showCalendar: false
  }

  componentDidUpdate(prevProps) {
    const { tab: prevTab } = prevProps;
    const { tab } = this.props;
    if (prevTab !== tab) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ q: '' });
    }
  }

  onSearch = debounce(async (e) => {
    const { handleSearch } = this.props;
    const value = (e.target && e.target.value) || '';
    handleSearch({
      q: value
    });
  }, 500)

  handleViewGrid(isGrid: boolean) {
    const { handleViewGrid: viewGrid } = this.props;
    this.setState({ isGrid });
    viewGrid(isGrid);
  }

  searchDateRange(dates: [any, any], dateStrings: [string, string]) {
    if (!dateStrings.length) return;
    const { handleSearch } = this.props;
    handleSearch({
      fromDate: dateStrings[0],
      toDate: dateStrings[1]
    });
  }

  render() {
    const {
      q, isGrid, showSearch, showCalendar
    } = this.state;
    const { searching, tab } = this.props;
    return (
      <div className="search-post-bar">
        {showCalendar && <RangePicker onChange={this.searchDateRange.bind(this)} />}
        {showSearch && (
        <Search
          placeholder="Enter keyword here..."
          onChange={(e) => {
            e.persist();
            this.setState({ q: e?.target?.value || '' });
            this.onSearch(e);
          }}
          value={q}
          loading={searching}
          allowClear
          enterButton
        />
        )}

        <div className="grid-btns">
          <a aria-hidden className={showSearch ? 'active' : ''} onClick={() => this.setState({ showSearch: !showSearch, showCalendar: false })}><SearchOutlined /></a>
          <a aria-hidden className={showCalendar ? 'active' : ''} onClick={() => this.setState({ showCalendar: !showCalendar, showSearch: false })}><CalendarOutlined /></a>
          {!['store', 'blog', 'story'].includes(tab) && <a aria-hidden className={isGrid ? 'active' : ''} onClick={this.handleViewGrid.bind(this, true)}><AppstoreOutlined /></a>}
          {!['store', 'blog', 'story'].includes(tab) && <a aria-hidden className={!isGrid ? 'active' : ''} onClick={this.handleViewGrid.bind(this, false)}><MenuOutlined /></a>}
        </div>
      </div>
    );
  }
}
