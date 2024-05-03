// import Routes from 'next-routes';
const routes = require('next-routes');

/**
 * routes.add([name], pattern = /name, page = name)
   routes.add(object)
 */

export default routes()
  .add('dashboard', '/', '/')
  .add('contact', '/contact', '/contact')
  .add('blog', '/blog/:id', '/blog')
  .add('video', '/video/:id', '/video')
  .add('store', '/store/:id', '/store')
  .add('page', '/page/:id', '/page')
  .add('feed', '/post/:id', '/post')
  .add('message', '/messages', '/messages')
  .add('cart', '/cart', '/cart')
  .add('home', '/home', '/home')
  .add('search', '/search', '/search')
  .add('referral', '/referral-program', '/referral-program')
  // performer
  .add('content-creators', '/content-creator', '/content-creator')
  .add('restrict-user', '/content-creator/restrict-user', '/content-creator/restrict-user')
  .add('account', '/content-creator/account', '/content-creator/account')
  .add('earning', '/content-creator/earning', '/content-creator/earning')
  .add('feed-manager', '/content-creator/my-post', '/content-creator/my-post')
  .add('blog-manager', '/content-creator/my-blog', '/content-creator/my-blog')
  .add('gallery-manager', '/content-creator/my-gallery', '/content-creator/my-gallery')
  .add('order-manager', '/content-creator/my-order', '/content-creator/my-order')
  .add('photo-manager', '/content-creator/my-photo', '/content-creator/my-photo')
  .add('store-manager', '/content-creator/my-store', '/content-creator/my-store')
  .add('video-manager', '/content-creator/my-video', '/content-creator/my-video')
  .add('my-subscriber', '/content-creator/my-subscriber', '/content-creator/my-subscriber')
  .add('story-manager', '/content-creator/my-story', '/content-creator/my-story')
  .add('public-chat', '/content-creator/live', '/content-creator/live')
  .add('content-creator-private-chat', '/content-creator/live/privatechat/:id', '/content-creator/live/privatechat')
  .add('webrtc-content-creator-private-chat', '/content-creator/live/webrtc/privatechat/:id', '/content-creator/live/webrtc/privatechat')
  // user
  .add('public-stream', '/stream/:username', '/stream')
  .add('user-private-chat', '/stream/privatechat/:username', '/stream/privatechat')
  .add('webrtc-user-private-chat', '/stream/webrtc/privatechat/:username', '/stream/webrtc/privatechat')
  // must be in the last
  .add('content-creator', '/:username', '/content-creator/profile');
