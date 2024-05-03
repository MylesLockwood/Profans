/* eslint-disable no-await-in-loop */
import { PureComponent } from 'react';
import {
  Table, message, Button, Tag, Modal
} from 'antd';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { DragOutlined, DeleteOutlined } from '@ant-design/icons';
import arrayMove from 'array-move';
import { performerService } from '@services/index';
import { ITrendingPerformer } from 'src/interfaces/index';
import { BreadcrumbComponent } from '@components/common';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import Head from 'next/head';
import './index.less';

const DragHandle = SortableHandle(() => (
  <DragOutlined style={{ cursor: 'pointer', color: '#999' }} />
));

const SortableItem = SortableElement((props) => <tr {...props} />);
const SortContainer = SortableContainer((props) => <tbody {...props} />);

export default class TrendingProfiles extends PureComponent<any> {
  state = {
    submiting: false,
    searching: false,
    dataSource: [],
    addNew: false,
    newProfileId: ''
  };

  async componentDidMount() {
    this.search();
  }

  updateOrdering = async () => {
    const { dataSource } = this.state;
    await this.setState({ submiting: true });
    await Promise.all(dataSource.map((data, index) => performerService.trendingUpdate({ performerId: data._id, ordering: index })));
    message.success('Changes saved');
    await this.setState({ submiting: false });
  }

  onSortEnd = async ({ oldIndex, newIndex }) => {
    const { dataSource } = this.state;
    if (oldIndex !== newIndex) {
      const newData = arrayMove([].concat(dataSource), oldIndex, newIndex).filter((el) => !!el);
      this.setState({ dataSource: newData });
    }
  };

  DraggableContainer = (props) => (
    <SortContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={this.onSortEnd}
      {...props}
    />
  );

  DraggableBodyRow = ({ ...restProps }) => {
    const { dataSource } = this.state;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex((x) => x.index === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  deleteProfile = async (performer: ITrendingPerformer) => {
    if (!window.confirm('Are you sure to remove?')) return;
    try {
      await performerService.trendingRemove(performer._id);
      this.search();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    }
  }

  async search() {
    try {
      await this.setState({ searching: true });
      const resp = await performerService.trendingProfiles({
        listType: 'newest'
      });
      await this.setState({
        searching: false,
        dataSource: resp.data.data.map((d: ITrendingPerformer) => ({ ...d, ...{ index: d.ordering, key: `${d.ordering}` } }))
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      this.setState({ searching: false });
    }
  }

  async createNew() {
    const { newProfileId, dataSource } = this.state;
    if (!newProfileId) {
      message.error('Please select content creator you want to add!');
      return;
    }
    if (dataSource.findIndex((d) => d.performerId === newProfileId) > -1) {
      message.error('This profile already added!');
      return;
    }
    try {
      await performerService.trendingCreate({ performerId: newProfileId, listType: 'newest' });
      message.success('Success');
      this.search();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    }
  }

  render() {
    const {
      dataSource, searching, submiting, addNew
    } = this.state;

    const columns = [
      {
        title: 'Avatar',
        dataIndex: 'avatar',
        className: 'drag-visible',
        render: (avatar) => <img alt="avt" src={avatar || '/no-avatar.png'} style={{ borderRadius: '50%', width: '50px', height: '50px' }} />
      },
      {
        title: 'Name',
        dataIndex: 'name',
        className: 'drag-visible'
      },
      {
        title: 'Username',
        dataIndex: 'username',
        className: 'drag-visible'
      },
      {
        title: 'Auto update',
        dataIndex: 'isProtected',
        className: 'drag-visible',
        render: (isProtected) => {
          switch (isProtected) {
            case true: return <Tag color="red">N</Tag>;
            case false: return <Tag color="green">Y</Tag>;
            default: return <Tag color="blue">{isProtected}</Tag>;
          }
        }
      },
      {
        title: 'Actions',
        dataIndex: '_id',
        className: 'drag-visible',
        render: (id, record) => (
          <Button disabled={submiting} onClick={this.deleteProfile.bind(this, record)}>
            <DeleteOutlined />
          </Button>
        )
      },
      {
        title: 'Sort',
        dataIndex: 'sort',
        className: 'drag-visible',
        fixed: 'right' as 'right',
        render: () => <DragHandle />
      }
    ];
    return (
      <div>
        <Head>
          <title>Newest Profiles</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Newest profiles' }]} />
        <div className="table-responsive">
          <Table
            pagination={false}
            dataSource={dataSource}
            columns={columns}
            rowKey="index"
            loading={searching}
            components={{
              body: {
                wrapper: this.DraggableContainer,
                row: this.DraggableBodyRow
              }
            }}
          />
        </div>
        <div style={{ textAlign: 'center', margin: 20 }}>
          <Button style={{ marginRight: 15 }} disabled={submiting} onClick={() => this.setState({ addNew: true })}>Add new profile</Button>
          <Button disabled={submiting} type="primary" onClick={this.updateOrdering.bind(this)}>Click to save ordering</Button>
        </div>
        <Modal
          title="Add newest profile"
          visible={addNew}
          footer={null}
          onOk={() => this.setState({ addNew: false })}
          onCancel={() => this.setState({ addNew: false })}
        >
          <h5>Select content creator</h5>
          <SelectPerformerDropdown style={{ width: '100%' }} onSelect={(val) => this.setState({ newProfileId: val })} />
          <div style={{ margin: 20 }}><Button type="primary" onClick={this.createNew.bind(this)}>Submit</Button></div>
        </Modal>
      </div>
    );
  }
}
