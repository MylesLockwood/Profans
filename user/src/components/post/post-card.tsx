/* eslint-disable no-prototype-builtins */
import { Component } from 'react';
import {
  Menu, Dropdown, Divider, message, Modal, Tooltip, Button
} from 'antd';
import {
  HeartOutlined, CommentOutlined, BookOutlined,
  MoreOutlined, DollarOutlined, LockOutlined,
  FileImageOutlined, VideoCameraOutlined,
  UnlockOutlined, EyeOutlined
} from '@ant-design/icons';
import { TickIcon } from 'src/icons';
import Link from 'next/link';
import { CommentForm, ListComments } from '@components/comment';
import {
  getComments, moreComment, createComment, deleteComment
} from '@redux/comment/actions';
import { formatDateFromnow, videoDuration, shortenLargeNumber } from '@lib/index';
import { reactionService, paymentService, feedService } from '@services/index';
import { connect } from 'react-redux';
import { TipPerformerForm } from '@components/performer/tip-form';
import ReactMomentCountDown from 'react-moment-countdown';
import moment from 'moment';
import { Twitter, Facebook } from 'react-social-sharing';
import { VideoPlayer } from '@components/common/video-player';
import { ConfirmSubscriptionPerformerForm } from '@components/performer';
import { IFeed, IUser } from 'src/interfaces';
import { PurchaseFeedForm } from './confirm-purchase';
import FeedSlider from './post-slider';
import './index.less';

interface IProps {
  feed: IFeed;
  onDelete?: Function;
  user: IUser;
  getComments: Function;
  moreComment: Function;
  createComment: Function;
  deleteComment: Function;
  commentMapping: any;
  comment: any;
}

class FeedCard extends Component<IProps> {
  subscriptionType = 'monthly';

  state = {
    isOpenComment: false,
    isLiked: false,
    isBookMarked: false,
    totalLike: 0,
    totalComment: 0,
    isFirstLoadComment: true,
    itemPerPage: 10,
    commentPage: 0,
    isHovered: false,
    openTipModal: false,
    openPurchaseModal: false,
    openTeaser: false,
    submiting: false,
    polls: [],
    requesting: false,
    shareUrl: '',
    openSubscriptionModal: false
  }

  componentDidMount() {
    const { feed } = this.props;
    if (feed) {
      this.setState({
        isLiked: feed.isLiked,
        isBookMarked: feed.isBookMarked,
        totalLike: feed.totalLike,
        totalComment: feed.totalComment,
        polls: feed.polls ? feed.polls : [],
        shareUrl: `${window.location.origin}/post/${feed._id}`
      });
      // preload images
      const images = feed.files && feed.files.filter((f) => f.type === 'feed-photo');
      images && images.length && images.forEach((img) => {
        setTimeout(() => { new Image().src = img?.photo?.url; }, 1000);
        return img;
      });
      this.subscriptionType = feed?.performer?.isFreeSubscription ? 'free' : 'monthly';
    }
  }

  componentDidUpdate(prevProps) {
    const { feed, commentMapping, comment } = this.props;
    const { totalComment } = this.state;
    if ((!prevProps.comment.data && comment.data && comment.data.objectId === feed._id)
      || (prevProps.commentMapping[feed._id] && totalComment !== commentMapping[feed._id].total)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ totalComment: commentMapping[feed._id].total });
    }
  }

  async handleLike() {
    const { feed } = this.props;
    const { isLiked, totalLike, requesting } = this.state;
    if (requesting) return;
    try {
      await this.setState({ requesting: true });
      if (!isLiked) {
        await reactionService.create({
          objectId: feed._id,
          action: 'like',
          objectType: `feed_${feed.type}`
        });
        this.setState({ isLiked: true, totalLike: totalLike + 1 });
      } else {
        await reactionService.delete({
          objectId: feed._id,
          action: 'like',
          objectType: `feed_${feed.type}`
        });
        this.setState({ isLiked: false, totalLike: totalLike - 1 });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      await this.setState({ requesting: false });
    }
  }

  async handleBookmark() {
    const { feed, user } = this.props;
    const { isBookMarked, requesting } = this.state;
    if (requesting || !user._id || user.isPerformer) return;
    try {
      await this.setState({ requesting: true });
      if (!isBookMarked) {
        await reactionService.create({
          objectId: feed._id,
          action: 'book_mark',
          objectType: `feed_${feed.type}`
        });
        this.setState({ isBookMarked: true });
      } else {
        await reactionService.delete({
          objectId: feed._id,
          action: 'book_mark',
          objectType: `feed_${feed.type}`
        });
        this.setState({ isBookMarked: false });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      await this.setState({ requesting: false });
    }
  }

  async onOpenComment() {
    const { feed, getComments: handleGetComment } = this.props;
    const {
      isOpenComment, isFirstLoadComment, itemPerPage, commentPage
    } = this.state;
    this.setState({ isOpenComment: !isOpenComment });
    if (isFirstLoadComment) {
      await this.setState({ isFirstLoadComment: false });
      handleGetComment({
        objectId: feed._id,
        limit: itemPerPage,
        offset: commentPage
      });
    }
  }

  copyLink(feedId: string) {
    const str = `${window.location.origin}/post/${feedId}`;
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    message.success('Copied to clipboard');
  }

  async moreComment() {
    const { feed, moreComment: handleLoadMore } = this.props;
    const { commentPage, itemPerPage } = this.state;
    await this.setState({
      commentPage: commentPage + 1
    });
    handleLoadMore({
      limit: itemPerPage,
      offset: (commentPage + 1) * itemPerPage,
      objectId: feed._id
    });
  }

  async deleteComment(item) {
    const { deleteComment: handleDelete } = this.props;
    if (!window.confirm('Are you sure to remove this comment?')) return;
    handleDelete(item._id);
  }

  async subscribe() {
    const { feed, user } = this.props;
    if (!user.authorisedCard && this.subscriptionType !== 'free') {
      this.authorisedCard();
      return;
    }
    try {
      await this.setState({ submiting: true });
      const resp = await (
        await paymentService.subscribe({ type: this.subscriptionType, performerId: feed.performer._id })
      ).data;
      if (resp && resp.success) {
        message.success('Subscribed!');
        window.location.reload();
      } else {
        message.success('Error occured, please try again later');
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async sendTip(price) {
    const { feed } = this.props;
    try {
      await this.setState({ submiting: true });
      const resp = await (
        await paymentService.tipPerformer({ performerId: feed?.performer?._id, price })
      ).data;
      if (resp && resp.success) {
        message.success('Thank you!');
      } else {
        message.success('Error occured, please try again later');
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async purchaseFeed(couponCode: string) {
    const { feed } = this.props;
    try {
      await this.setState({ submiting: true });
      const resp = await (await paymentService.purchaseFeed({ feedId: feed._id, couponCode })).data;
      if (resp && resp.success) {
        message.success('Thank you!');
      } else {
        message.success('Error occured, please try again later');
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async votePoll(poll: any) {
    const { feed } = this.props;
    const { polls } = this.state;
    const isExpired = new Date(feed.pollExpiredAt) < new Date();
    if (isExpired) {
      message.error('Poll has already expired to vote');
      return;
    }
    if (!window.confirm('Vote it?')) return;
    try {
      await this.setState({ requesting: true });
      await feedService.votePoll(poll._id);
      const index = polls.findIndex((p) => p._id === poll._id);
      await this.setState((prevState: any) => {
        const newItems = [...prevState.polls];
        newItems[index].totalVote += 1;
        return { polls: newItems };
      });
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Something went wrong, please try again later');
    } finally {
      this.setState({ requesting: false });
    }
  }

  async authorisedCard() {
    try {
      if (!window.confirm('By agreeing to add your payment card, you will be charged a minimum price.')) return;
      await this.setState({ submiting: true });
      const resp = await (await paymentService.authoriseCard()).data;
      if (resp && resp.paymentUrl) {
        window.location.href = resp.paymentUrl;
      }
    } catch (e) {
      this.setState({ submiting: false });
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    }
  }

  render() {
    const {
      feed, user, commentMapping, comment, onDelete: handleDelete, createComment: handleCreateComment
    } = this.props;
    const { performer } = feed;
    const { requesting: commenting } = comment;
    const fetchingComment = commentMapping.hasOwnProperty(feed._id) ? commentMapping[feed._id].requesting : false;
    const comments = commentMapping.hasOwnProperty(feed._id) ? commentMapping[feed._id].items : [];
    const totalComments = commentMapping.hasOwnProperty(feed._id) ? commentMapping[feed._id].total : 0;
    const {
      isOpenComment, isLiked, totalComment, totalLike, isHovered,
      openTipModal, openPurchaseModal, submiting, polls, isBookMarked,
      shareUrl, openTeaser, openSubscriptionModal
    } = this.state;
    const canView = (!feed.isSale && feed.isSubscribed) || (feed.isSale && feed.isBought) || feed.type === 'text';
    const images = feed.files && feed.files.filter((f) => f.type === 'feed-photo');
    const videos = feed.files && feed.files.filter((f) => f.type === 'feed-video');
    const thumbUrl = feed?.thumbnailUrl || (images && images[0] && images[0]?.thumbnails && images[0]?.thumbnails[0]) || (videos && videos[0] && videos[0]?.thumbnails && videos[0]?.thumbnails[0]) || '/static/leaf.jpg';
    let totalVote = 0;
    polls && polls.forEach((poll) => {
      totalVote += poll.totalVote;
    });
    const menu = (
      <Menu key={`menu_${feed._id}`}>
        <Menu.Item key={`post_detail_${feed._id}`}>
          <Link href={{ pathname: '/post', query: { id: feed._id } }} as={`/post/${feed._id}`}>
            <a>
              Post details
            </a>
          </Link>
        </Menu.Item>
        <Menu.Item key={`copy_link_${feed._id}`} onClick={this.copyLink.bind(this, feed._id)}>
          <a>
            Copy link to clipboard
          </a>
        </Menu.Item>
        {user._id === feed.fromSourceId && (
          <Menu.Item key={`pin_profile_${feed._id}`}>
            <a target="_blank" rel="noopener noreferrer" href="#">
              Pin to profile page
            </a>
          </Menu.Item>
        )}
        {user._id === feed.fromSourceId && (
          <Menu.Item key={`edit_post_${feed._id}`}>
            <Link href={{ pathname: '/content-creator/my-post/edit', query: { id: feed._id } }}>
              <a>
                Edit post
              </a>
            </Link>
          </Menu.Item>
        )}
        {/* <Menu.Item key={`statistic_${feed._id}`}>
          <a target="_blank" href="#">
            Post statistics
          </a>
        </Menu.Item> */}
        {user._id === feed.fromSourceId && <Divider style={{ margin: '10px 0' }} />}
        {user._id === feed.fromSourceId && <Menu.Item key={`delete_post_${feed._id}`}><a aria-hidden onClick={handleDelete.bind(this, feed)}>Delete post</a></Menu.Item>}
      </Menu>
    );
    const dropdown = (
      <Dropdown overlay={menu}>
        <a aria-hidden className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          <MoreOutlined />
        </a>
      </Dropdown>
    );
    return (
      <div className="feed-card">
        <div className="feed-top">
          <Link href={{ pathname: '/content-creator/profile', query: { username: performer?.username || performer?._id } }} as={`/${performer?.username || performer?._id}`}>
            <div className="feed-top-left">
              <img alt="per_atv" src={performer?.avatar || '/static/no-avatar.png'} width="50px" />
              <div className="feed-name">
                <h4>
                  {performer?.name || 'N/A'}
                  {' '}
                  {performer?.verifiedAccount && <TickIcon className="theme-color" />}
                </h4>
                <h5>
                  @
                  {performer?.username || 'N/A'}
                </h5>
              </div>
              {performer?.isOnline ? <span className="online-status" /> : <span className="online-status off" />}
            </div>
          </Link>
          <div className="feed-top-right">
            <span className="feed-time">{formatDateFromnow(feed.updatedAt)}</span>
            {dropdown}
          </div>
        </div>
        <div className="feed-container">
          <div className="feed-text">
            {feed.text}
          </div>
          {((!feed.isSale && feed.isSubscribed) || (feed.isSale && feed.isBought)) && (
            <div className="feed-content">
              <FeedSlider feed={feed} />
            </div>
          )}
          {((!feed.isSale && !feed.isSubscribed) || (feed.isSale && !feed.isBought)) && (
            <div className="lock-content">
              {/* eslint-disable-next-line no-nested-ternary */}
              <div className="feed-bg" style={{ backgroundImage: `url(${thumbUrl})`, filter: 'blur(20px)' }} />
              <div className="lock-middle">
                {(isHovered || canView) ? <UnlockOutlined /> : <LockOutlined />}
                {!feed.isSale && !feed.isSubscribed && (
                  <Button
                    onMouseEnter={() => this.setState({ isHovered: true })}
                    onMouseLeave={() => this.setState({ isHovered: false })}
                    disabled={user.isPerformer}
                    className="secondary"
                    onClick={() => this.setState({ openSubscriptionModal: true })}
                  >
                    Subcribe to unlock
                  </Button>
                )}
                {feed.isSale && !feed.isBought && (
                  <Button
                    onMouseEnter={() => this.setState({ isHovered: true })}
                    onMouseLeave={() => this.setState({ isHovered: false })}
                    disabled={user.isPerformer}
                    className="secondary"
                    onClick={() => this.setState({ openPurchaseModal: true })}
                  >
                    Pay $
                    {feed.price.toFixed(2)}
                    {' '}
                    to unlock
                  </Button>
                )}
                {feed.teaser && (
                  <Button type="link" onClick={() => this.setState({ openTeaser: true })}>
                    <EyeOutlined />
                    View teaser
                  </Button>
                )}
              </div>
              {feed.files && feed.files.length > 0 && (
                <div className="count-media">
                  <span className="count-media-item">
                    {images.length > 0 && (
                      <span>
                        {images.length}
                        {' '}
                        <FileImageOutlined />
                        {' '}
                      </span>
                    )}
                    {videos.length > 0 && images.length > 0 && '|'}
                    {videos.length > 0 && (
                      <span>
                        {videos.length > 1 && videos.length}
                        {' '}
                        <VideoCameraOutlined />
                        {' '}
                        {videos.length === 1 && videoDuration(videos[0].duration)}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
          {feed.tagline && (
            <div className="feed-tagline">
              <Link href={{ pathname: '/search', query: { type: 'feed', keyword: feed.tagline } }}><a>{feed.tagline}</a></Link>
            </div>
          )}
          {polls && polls.length > 0 && polls.map((poll) => (
            <div aria-hidden className="feed-poll" key={poll._id} onClick={this.votePoll.bind(this, poll)}>
              <span>{poll.description}</span>
              {' '}
              <span>{poll.totalVote}</span>
            </div>
          ))}
          {polls && polls.length > 0 && (
            <div className="total-vote">
              <span>
                Total
                {' '}
                {totalVote}
                {' '}
                votes
              </span>
              {feed.pollExpiredAt && moment(feed.pollExpiredAt).isAfter(moment()) ? (
                <span>
                  {`${moment(feed.pollExpiredAt).diff(moment(), 'days')} day(s) `}
                  <ReactMomentCountDown toDate={moment(feed.pollExpiredAt)} />
                </span>
              ) : <span>Expired</span>}
            </div>
          )}
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
              {performer && (
                <span aria-hidden className="action-ico" onClick={() => this.setState({ openTipModal: true })}>
                  <DollarOutlined />
                  {' '}
                  Send tip
                </span>
              )}
            </div>
            <div className="action-item">
              <Twitter link={shareUrl} />
              <Facebook link={shareUrl} />
              {user._id && !user.isPerformer && (
                <span aria-hidden className={isBookMarked ? 'action-ico active' : 'action-ico'} onClick={this.handleBookmark.bind(this)}>
                  <Tooltip title={!isBookMarked ? 'Add to Bookmarks' : 'Remove from Bookmarks'}><BookOutlined /></Tooltip>
                </span>
              )}
            </div>
          </div>
          {isOpenComment && (
            <div className="feed-comment">
              <CommentForm
                creator={user}
                onSubmit={handleCreateComment.bind(this)}
                objectId={feed._id}
                objectType="feed"
                requesting={commenting}
              />
              <ListComments
                key={`list_comments_${feed._id}_${comments.length}`}
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
        <Modal
          key="tip_performer"
          className="subscription-modal"
          title={null}
          width={350}
          visible={openTipModal}
          onOk={() => this.setState({ openTipModal: false })}
          footer={null}
          onCancel={() => this.setState({ openTipModal: false })}
        >
          <TipPerformerForm user={user} performer={performer} submiting={submiting} onFinish={this.sendTip.bind(this)} />
        </Modal>
        <Modal
          key="purchase_post"
          className="subscription-modal"
          title={null}
          visible={openPurchaseModal}
          confirmLoading={submiting}
          footer={null}
          onCancel={() => this.setState({ openPurchaseModal: false })}
        >
          <PurchaseFeedForm user={user} feed={feed} submiting={submiting} onFinish={this.purchaseFeed.bind(this)} />
        </Modal>
        <Modal
          key="subscribe_performer"
          className="subscription-modal"
          width={350}
          title={null}
          visible={openSubscriptionModal}
          footer={null}
          onCancel={() => this.setState({ openSubscriptionModal: false })}
        >
          <ConfirmSubscriptionPerformerForm
            user={user}
            type={this.subscriptionType || 'monthly'}
            performer={performer}
            submiting={submiting}
            onFinish={this.subscribe.bind(this)}
          />
        </Modal>
        <Modal
          key="teaser_video"
          title="Teaser video"
          visible={openTeaser}
          footer={null}
          onCancel={() => this.setState({ openTeaser: false })}
          width={990}
          destroyOnClose
        >
          <VideoPlayer
            key={feed?.teaser?._id}
            {...{
              autoplay: true,
              controls: true,
              playsinline: true,
              fluid: true,
              sources: [
                {
                  src: feed?.teaser?.url,
                  type: 'video/mp4'
                }
              ]
            }}
          />
        </Modal>
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
export default connect(mapStates, mapDispatch)(FeedCard);
