import next from 'next';
import express from 'express';
import routes from './routes';

require('dotenv');

const port = parseInt(process.env.PORT || '8081', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handler = routes.getRequestHandler(app, ({
  req, res, route, query
}) => {
  if (route.name === 'content-creator') {
    // eslint-disable-next-line no-param-reassign
    route.page = '/content-creator/profile';
  }
  app.render(req, res, route.page, query);
});

app.prepare().then(() => {
  const expressApp = express();
  expressApp.use('/static', express.static('../static'));
  expressApp.use(handler).listen(port);
  // eslint-disable-next-line no-console
  console.log(`> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV}`);
})
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Something went wrong: ', e);
    process.exit();
  });
