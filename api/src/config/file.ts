import { join } from 'path';

export default {
  publicDir: join(__dirname, '..', '..', 'public'),
  avatarDir: join(__dirname, '..', '..', 'public', 'avatars'),
  coverDir: join(__dirname, '..', '..', 'public', 'covers'),
  settingDir: join(__dirname, '..', '..', 'public', 'settings'),
  imageDir: join(__dirname, '..', '..', 'public', 'images'), // common images here
  // protected dir
  documentDir: join(__dirname, '..', '..', 'public', 'documents'),
  // public dir
  videoDir: join(__dirname, '..', '..', 'public', 'videos'),
  // protected with auth and some permissions, will check via http-auth-module
  videoProtectedDir: join(
    __dirname,
    '..',
    '..',
    'public',
    'videos',
    'protected'
  ),
  feedDir: join(
    __dirname,
    '..',
    '..',
    'public',
    'feeds'
  ),
  feedProtectedDir: join(
    __dirname,
    '..',
    '..',
    'public',
    'feeds',
    'protected'
  ),
  // store performer photo here?
  photoDir: join(__dirname, '..', '..', 'public', 'photos'),
  // protected dir
  photoProtectedDir: join(
    __dirname,
    '..',
    '..',
    'public',
    'photos',
    'protected'
  ),
  // protected dir
  digitalProductDir: join(
    __dirname,
    '..',
    '..',
    'public',
    'digital-products',
    'protected'
  )
};
