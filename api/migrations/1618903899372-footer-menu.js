const { readFileSync } = require('fs');
const { join } = require('path');
const { replace } = require('lodash');
const { DB, COLLECTION } = require('./lib');

module.exports.up = async function up(next) {
  const regExp = /\[\[DOMAIN\]\]/g;
  const page2257 = readFileSync(join(__dirname, 'content', '2257.html')).toString();
  const pageDMCA = readFileSync(join(__dirname, 'content', 'dmca.html')).toString();
  const pageToS = readFileSync(join(__dirname, 'content', 'tos.html')).toString();
  const privacy = readFileSync(join(__dirname, 'content', 'privacy_policy.html')).toString();

  const [
    page2257Content,
    pageDMCAContent,
    pageToSContent,
    privacyContent
  ] = await Promise.all([
    replace(page2257, regExp, process.env.DOMAIN),
    replace(pageDMCA, regExp, process.env.DOMAIN),
    replace(pageToS, regExp, process.env.DOMAIN),
    replace(privacy, regExp, process.env.DOMAIN)
  ]);

  const KEYS = {
    TOS: 'terms-of-service',
    USC2257: 'u.s.c-2257',
    DMCA: 'dmca',
    PRIVACY: 'privacy-policy'
  };

  const pages = [
    {
      title: 'TERMS OF SERVICE',
      type: 'post',
      status: 'published',
      authorId: null,
      shortDescription: 'Terms of service',
      content: pageToSContent,
      slug: KEYS.TOS
    },
    {
      title: 'PRIVACY & POLICY',
      type: 'post',
      status: 'published',
      authorId: null,
      shortDescription: 'Privacy and Policy',
      content: privacyContent,
      slug: KEYS.PRIVACY
    },
    {
      title: 'U.S.C 2257',
      type: 'post',
      status: 'published',
      authorId: null,
      shortDescription: 'USC2257',
      content: page2257Content,
      slug: KEYS.USC2257
    },
    {
      title: 'DMCA',
      type: 'post',
      status: 'published',
      authorId: null,
      shortDescription: 'DMCA',
      content: pageDMCAContent,
      slug: KEYS.DMCA
    }
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const p of pages) {
    // eslint-disable-next-line no-await-in-loop
    const post = await DB.collection(COLLECTION.POST).findOne({ slug: p.slug });
    if (!post) {
      // eslint-disable-next-line no-await-in-loop
      await DB.collection(COLLECTION.POST).insertOne({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      // eslint-disable-next-line no-console
      console.log(`Created post ${p.title}`);
      // eslint-disable-next-line no-await-in-loop
      await DB.collection(COLLECTION.MENU).insertOne({
        internal: true,
        isNewTab: true,
        parentId: null,
        path: `/page/${p.slug}`,
        section: 'footer',
        title: p.title,
        help: '',
        ordering: 0
      });
    } else {
      // eslint-disable-next-line no-console
      console.log(`Post ${p.title} existed!`);
    }
  }

  next();
};

module.exports.down = function down(next) {
  next();
};
