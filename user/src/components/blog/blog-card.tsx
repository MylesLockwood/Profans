import { PureComponent } from 'react';
import {
  Menu, Dropdown, Divider
} from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import Link from 'next/link';
import './index.less';
import { formatDateNoTime } from '@lib/index';
import { connect } from 'react-redux';
import { IBlog, IUser } from '../../interfaces';

interface IProps {
  blog: IBlog;
  onDelete?: Function;
  user: IUser;
}

// function thoudsandToK(value: number) {
//   if (value < 1000) return value;
//   return `${(value / 1000).toFixed(1)}K`;
// }

class BlogCard extends PureComponent<IProps> {
  render() {
    const { blog, user, onDelete: handleDelete } = this.props;

    const menu = (
      <Menu key={`menu_${blog._id}`}>
        <Menu.Item key={`post_detail_${blog._id}`}>
          <Link href={{ pathname: '/blog', query: { id: blog._id } }} as={`/blog/${blog._id}`}>
            <a>
              Blog details
            </a>
          </Link>
        </Menu.Item>
        {user._id === blog.fromSourceId && (
          <Menu.Item key={`edit_post_${blog._id}`}>
            <Link
              href={{
                pathname: '/content-creator/my-blog/edit',
                query: { id: blog._id }
              }}
            >
              <a>Edit blog</a>
            </Link>
          </Menu.Item>
        )}
        {user._id === blog.fromSourceId && (
          <Divider style={{ margin: '10px 0' }} />
        )}
        {user._id === blog.fromSourceId && (
          <Menu.Item key={`delete_post_${blog._id}`}>
            <a aria-hidden onClick={handleDelete.bind(this, blog)}>Delete blog</a>
          </Menu.Item>
        )}
      </Menu>
    );
    const dropdown = (
      <Dropdown overlay={menu}>
        <a aria-hidden className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          <MoreOutlined />
        </a>
      </Dropdown>
    );
    const backgroundUrl = blog.files && blog.files.length ? blog.files[0].url : '/static/placeholder-image.jpg';

    return (
      <div className="blog-card">
        <Link href={{ pathname: '/blog', query: { id: blog._id } }} as={`/blog/${blog._id}`}>
          <div className="card-left" style={{ backgroundImage: `url(${backgroundUrl})` }} />
        </Link>
        <div className="card-right">
          <div className="blog-top">
            <span className="blog-time">
              {formatDateNoTime(blog.updatedAt)}
            </span>
            <div className="blog-top-right">
              {dropdown}
            </div>
          </div>
          <div className="blog-title">
            <Link href={{ pathname: '/blog', query: { id: blog._id } }} as={`/blog/${blog._id}`}>
              <a>{blog.title}</a>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    user: state.user.current,
    commentMapping,
    comment
  };
};

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(BlogCard);
