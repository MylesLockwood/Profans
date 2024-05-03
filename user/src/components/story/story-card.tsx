import { Component } from 'react';
import {
  Menu, Dropdown, message
} from 'antd';
import {
  HeartOutlined, CommentOutlined, MoreOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { CommentForm, ListComments } from '@components/comment';
import {
  getComments, moreComment, createComment, deleteComment
} from '@redux/comment/actions';
import { formatDateFromnow, shortenLargeNumber } from '@lib/index';
import { reactionService } from '@services/index';
import { connect } from 'react-redux';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import { IStory, IUser } from '../../interfaces';
import './index.less';

interface IProps {
  story: IStory;
  onDelete?: Function;
  user: IUser;
  getComments: Function;
  moreComment: Function;
  createComment: Function;
  deleteComment: Function;
  commentMapping: any;
  comment: any;
}

class StoryCard extends Component<IProps> {
  enquireHandler: any;

  state = {
    isMobile: false,
    isOpenComment: false,
    isLiked: false,
    totalLike: 0,
    totalComment: 0,
    isFirstLoadComment: true,
    itemPerPage: 10,
    commentPage: 0,
    requesting: false
  }

  componentDidMount() {
    const { story } = this.props;
    if (story) {
      this.enquireHandler = enquireScreen((mobile) => {
        const { isMobile } = this.state;
        if (isMobile !== mobile) {
          this.setState({
            isMobile: mobile
          });
        }
      });
      this.setState({
        isLiked: story.isLiked,
        totalLike: story.totalLike,
        totalComment: story.totalComment
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { story, commentMapping, comment } = this.props;
    const { totalComment } = this.state;
    if ((!prevProps.comment.data && comment.data && comment.data.objectId === story._id)
      || (prevProps.commentMapping[story._id] && totalComment !== commentMapping[story._id].total)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ totalComment: commentMapping[story._id].total });
    }
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }

  async handleLike() {
    const { story } = this.props;
    const { isLiked, totalLike, requesting } = this.state;
    if (requesting) return;
    try {
      await this.setState({ requesting: true });
      if (!isLiked) {
        await reactionService.create({
          objectId: story._id,
          action: 'like',
          objectType: 'story'
        });
        this.setState({ isLiked: true, totalLike: totalLike + 1 });
      } else {
        await reactionService.delete({
          objectId: story._id,
          action: 'like',
          objectType: 'story'
        });
        this.setState({ isLiked: false, totalLike: totalLike - 1 });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      this.setState({ requesting: false });
    }
  }

  async onOpenComment() {
    const { story, getComments: handleGetComment } = this.props;
    const {
      isOpenComment, isFirstLoadComment, itemPerPage, commentPage
    } = this.state;
    this.setState({ isOpenComment: !isOpenComment });
    if (isFirstLoadComment) {
      await this.setState({ isFirstLoadComment: false });
      handleGetComment({
        objectId: story._id,
        objectType: 'story',
        limit: itemPerPage,
        offset: commentPage
      });
    }
  }

  async moreComment() {
    const { story, moreComment: handleLoadMore } = this.props;
    const { commentPage, itemPerPage } = this.state;
    await this.setState({
      commentPage: commentPage + 1
    });
    handleLoadMore({
      limit: itemPerPage,
      objectType: 'story',
      offset: (commentPage + 1) * itemPerPage,
      objectId: story._id
    });
  }

  async deleteComment(item) {
    const { deleteComment: handleDelete } = this.props;
    if (!window.confirm('Are you sure to remove this comment?')) return;
    handleDelete(item._id);
  }

  render() {
    const {
      story, user, commentMapping, comment, onDelete: handleDelete, createComment: handleCreateComment
    } = this.props;
    const { performer } = story;
    const { requesting: commenting } = comment;
    // eslint-disable-next-line no-prototype-builtins
    const fetchingComment = commentMapping.hasOwnProperty(story._id) ? commentMapping[story._id].requesting : false;
    // eslint-disable-next-line no-prototype-builtins
    const comments = commentMapping.hasOwnProperty(story._id) ? commentMapping[story._id].items : [];
    // eslint-disable-next-line no-prototype-builtins
    const totalComments = commentMapping.hasOwnProperty(story._id) ? commentMapping[story._id].total : 0;
    const {
      isOpenComment, isLiked, totalComment, totalLike, isMobile
    } = this.state;

    const menu = (
      <Menu key={`menu_${story._id}`}>
        <Menu.Item key={`delete_post_${story._id}`}><a aria-hidden onClick={handleDelete.bind(this, story)}>Delete story</a></Menu.Item>
      </Menu>
    );
    const dropdown = (
      <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" aria-hidden onClick={(e) => e.preventDefault()}>
          <MoreOutlined />
        </a>
      </Dropdown>
    );
    return (
      <div className="feed-card">
        <div className="feed-top">
          <Link href={{ pathname: '/content-creator/profile', query: { username: performer?.username || performer?._id } }} as={`/${performer?.username || performer?._id}`}>
            <div className="feed-top-left">
              <img alt="per_atv" src={performer && performer.avatar ? performer.avatar : '/static/no-avatar.png'} width="50px" />
              <div className="feed-name">
                <h4>{performer?.name || 'Unknow'}</h4>
                <h5>
                  @
                  {performer?.username || 'N/A'}
                </h5>
              </div>
              {performer?.isOnline ? <span className="online-status" /> : <span className="online-status off" />}
            </div>
          </Link>
          <div className="feed-top-right">
            <span className="feed-time">{formatDateFromnow(story.updatedAt)}</span>
            {user._id === story.fromSourceId && dropdown}
          </div>
        </div>
        <div className="feed-container">
          <div className="story-content" style={story.backgroundUrl ? { backgroundImage: `url(${story.backgroundUrl})` } : { background: '#333' }}>
            {/* ADD CONTENT */}
            <div
              className="story-text"
              style={{
                color: story?.textColor || '#fff',
                transform: `translate(${isMobile ? ((story?.textStyle?.translate[0] || 0) / 2.32) : (story?.textStyle?.translate[0] || 0)}px, ${isMobile ? ((story?.textStyle?.translate[1] || 0) / 1.35) : (story?.textStyle?.translate[1] || 0)}px) rotate(${story?.textStyle?.rotate || 0}deg)`
              }}
            >
              {story.text}
            </div>
          </div>
        </div>
        <div className="feed-bottom">
          <div className="feed-actions">
            <div className="action-item">
              <span aria-hidden className={isLiked ? 'action-ico liked' : 'action-ico'} onClick={this.handleLike.bind(this)}>
                <HeartOutlined />
                {' '}
                {shortenLargeNumber(totalLike || 0)}
              </span>
              <span aria-hidden className={isOpenComment ? 'action-ico active' : 'action-ico'} onClick={this.onOpenComment.bind(this)}>
                <CommentOutlined />
                {' '}
                {shortenLargeNumber(totalComment || 0)}
              </span>
            </div>
            <div className="action-item">
              {/* <span className={isBookMarked ? 'action-ico active' : 'action-ico'} onClick={this.handleBookmark.bind(this)}>
                <Tooltip title={!isBookMarked ? 'Add to Bookmarks' : 'Remove from Bookmarks'}><BookOutlined /></Tooltip>
              </span> */}
            </div>
          </div>
          {isOpenComment && (
            <div className="feed-comment">
              <CommentForm
                creator={user}
                onSubmit={handleCreateComment.bind(this)}
                objectId={story._id}
                objectType="story"
                requesting={commenting}
              />
              <ListComments
                key={`list_comments_${story._id}_${comments.length}`}
                requesting={fetchingComment}
                comments={comments}
                total={totalComments}
                onDelete={this.deleteComment.bind(this)}
                user={user}
                canReply
              />
              {comments.length < totalComments && <p className="text-center"><a aria-hidden onClick={this.moreComment.bind(this)}>More comments...</a></p>}
            </div>
          )}
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

const mapDispatch = {
  getComments, moreComment, createComment, deleteComment
};
export default connect(mapStates, mapDispatch)(StoryCard);
