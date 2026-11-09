const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Use the project's existing TypeScript compiler; no additional test dependency.
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(outputText, filename);
};
const { createLocalStore, LOCAL_STORAGE_KEY } = require('../src/data/local-state.ts');

class MemoryStorage {
  values = new Map();
  failWrites = false;
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { if (this.failWrites) throw new Error('QuotaExceededError'); this.values.set(key, value); }
}
function setup() { const storage = new MemoryStorage(); return { storage, store: createLocalStore(() => storage) }; }
function byId(store, id) { return store.getSnapshot().posts.find(post => post.id === id); }

test('likes, saves and comments survive a new store instance', () => {
  const { storage, store } = setup();
  assert.equal(store.getSnapshot().ready, true);
  assert.equal(store.getSnapshot(), store.getSnapshot(), 'Unchanged snapshots must retain their identity for React');
  const before = byId(store, 1);
  assert.equal(store.toggleLocalLike(1), true);
  assert.equal(store.toggleLocalSaved(1), true);
  assert.equal(store.addLocalComment(1, 'Проверка сохранения'), true);
  const reloaded = createLocalStore(() => storage);
  assert.equal(byId(reloaded, 1).likes, before.likes + 1);
  assert.equal(byId(reloaded, 1).liked, true);
  assert.equal(byId(reloaded, 1).saved, true);
  assert.equal(byId(reloaded, 1).comments.at(-1).text, 'Проверка сохранения');
  assert.equal(byId(reloaded, 1).comments.at(-1).username, store.getSnapshot().profile.username);
  assert.ok(byId(reloaded, 1).myCommentIndexes.includes(before.comments.length));
  assert.equal(reloaded.toggleLocalLike(1), true);
  assert.equal(byId(createLocalStore(() => storage), 1).likes, before.likes);
});

test('created, edited and deleted own posts never reappear after reload', () => {
  const { storage, store } = setup();
  assert.equal(store.createLocalPost({ text: 'Новый пост', isAnonymous: false }), true);
  const post = store.getSnapshot().posts.find(post => post.text === 'Новый пост');
  assert.ok(post.isOwn); assert.ok(Number.isSafeInteger(post.id));
  assert.equal(store.editLocalPost(post.id, 'Исправленный пост'), true);
  assert.equal(byId(createLocalStore(() => storage), post.id).text, 'Исправленный пост');
  assert.equal(store.deleteLocalPost(post.id), true);
  assert.equal(byId(createLocalStore(() => storage), post.id), undefined);
  const seedOwnId = store.getSnapshot().posts.find(post => post.isOwn).id;
  assert.equal(store.deleteLocalPost(seedOwnId), true);
  assert.equal(byId(createLocalStore(() => storage), seedOwnId), undefined);
});

test('legacy profile posts and bookmarks migrate without feed id collisions', () => {
  const { storage } = setup();
  storage.setItem('osek-posts', JSON.stringify([{ id: 1, text: 'Старый личный пост', likes: 7, liked: true, saved: false, comments: 1, commentList: ['Старый комментарий'], minutes: 3 }]));
  storage.setItem('osek-saved-posts', JSON.stringify([1]));
  storage.setItem('osek-profile', JSON.stringify({ name: 'Мила', username: 'mila', city: 'Алматы', bio: 'Привет', country: 'Казахстан' }));
  const store = createLocalStore(() => storage);
  const own = store.getSnapshot().posts.find(post => post.text === 'Старый личный пост');
  assert.ok(own && own.id !== 1 && own.isOwn);
  assert.equal(own.likes, 7); assert.equal(own.liked, true);
  assert.deepEqual(own.comments.map(comment => comment.text), ['Старый комментарий']);
  assert.equal(own.comments[0].username, 'mila');
  assert.deepEqual(own.myCommentIndexes, [0]);
  assert.equal(byId(store, 1).saved, true);
  assert.equal(byId(store, 1).isOwn, false);
  assert.equal(store.getSnapshot().profile.name, 'Мила');
  assert.equal(store.toggleLocalLike(own.id), true);
  assert.equal(byId(store, 1).likes, 128);
  assert.equal(byId(createLocalStore(() => storage), own.id).likes, 6);
  assert.ok(storage.getItem('osek-posts'), 'Legacy source must not be deleted');
});

test('an empty legacy posts array stays empty; seeding never restores deleted own posts', () => {
  const { storage } = setup(); storage.setItem('osek-posts', '[]');
  const store = createLocalStore(() => storage);
  assert.equal(store.getSnapshot().posts.filter(post => post.isOwn).length, 0);
  store.toggleLocalLike(1);
  assert.equal(createLocalStore(() => storage).getSnapshot().posts.filter(post => post.isOwn).length, 0);
});

test('independent tabs merge updates with the latest persisted state and reload notifications', () => {
  const { storage, store: first } = setup(); const second = createLocalStore(() => storage);
  first.getSnapshot(); second.getSnapshot();
  first.toggleLocalLike(1);
  second.toggleLocalSaved(2);
  let notifications = 0; const unsubscribe = first.subscribe(() => notifications++);
  first.reload();
  assert.equal(byId(first, 1).liked, true); assert.equal(byId(first, 2).saved, true);
  assert.ok(notifications > 0); unsubscribe();
  second.reload(); assert.equal(byId(second, 1).liked, true);
});

test('storage quota failure leaves the saved state unchanged and reports failure', () => {
  const { storage, store } = setup(); store.toggleLocalLike(1);
  const saved = storage.getItem(LOCAL_STORAGE_KEY);
  storage.failWrites = true;
  assert.equal(store.createLocalPost({ text: 'Не должен потеряться черновик' }), false);
  assert.equal(store.getSnapshot().posts.some(post => post.text === 'Не должен потеряться черновик'), false);
  assert.ok(store.getSnapshot().error);
  assert.equal(storage.getItem(LOCAL_STORAGE_KEY), saved);
  storage.failWrites = false;
  assert.equal(store.createLocalPost({ text: 'Повторное сохранение' }), true);
  assert.equal(store.getSnapshot().error, null);
});

test('corrupted and unsupported stored formats are not silently overwritten', () => {
  for (const raw of ['{broken', JSON.stringify({version:99,posts:[]}), JSON.stringify({version:1,posts:[{id:'bad'}]})]) {
    const { storage } = setup(); storage.setItem(LOCAL_STORAGE_KEY, raw);
    const store = createLocalStore(() => storage);
    assert.ok(store.getSnapshot().error);
    assert.equal(store.toggleLocalLike(1), false);
    assert.equal(storage.getItem(LOCAL_STORAGE_KEY), raw);
  }
});

test('generated post IDs stay unique even when created during the same millisecond', () => {
  const { store } = setup(); const actualNow = Date.now;
  try {
    Date.now = () => 1234567890000;
    store.createLocalPost({ text: 'Первый' }); store.createLocalPost({ text: 'Второй' });
  } finally { Date.now = actualNow; }
  const all = store.getSnapshot().posts;
  assert.equal(new Set(all.map(post => post.id)).size, all.length);
});

test('account username and avatar appear on all own named posts after reload while anonymous posts remain anonymous', () => {
  const { storage, store } = setup();
  store.createLocalPost({ text: 'Именной', isAnonymous: false });
  store.createLocalPost({ text: 'Без имени', isAnonymous: true });
  assert.equal(store.getSnapshot().posts.find(post => post.text === 'Именной').author, store.getSnapshot().profile.username);
  const avatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
  assert.equal(store.saveLocalProfile({ ...store.getSnapshot().profile, name: 'Новое имя', username: 'new_handle' }), true);
  assert.equal(store.saveLocalAvatar(avatar), true);
  const state = createLocalStore(() => storage).getSnapshot();
  const named = state.posts.find(post => post.text === 'Именной');
  assert.equal(named.author, 'new_handle'); assert.equal(named.avatar, avatar);
  assert.ok(state.posts.filter(post => post.isOwn && post.named).every(post => post.author === 'new_handle'));
  assert.equal(state.posts.find(post => post.id === 2).author, 'Айдана');
  const anonymous = state.posts.find(post => post.text === 'Без имени');
  assert.equal(anonymous.author, 'Аноним'); assert.ok(!anonymous.avatar);
});

test('comment deletion and its indexes persist correctly', () => {
  const { storage, store } = setup();
  store.addLocalComment(1, 'Мой первый'); store.addLocalComment(1, 'Мой второй'); store.addLocalComment(1, 'Мой третий');
  assert.equal(store.deleteLocalComment(1, 0), true);
  let post = byId(createLocalStore(() => storage), 1);
  assert.deepEqual(post.myCommentIndexes, [0, 1]);
  assert.equal(store.deleteLocalComment(1, 0), true);
  post = byId(createLocalStore(() => storage), 1);
  assert.equal(post.comments.at(-1).text, 'Мой третий');
  assert.deepEqual(post.myCommentIndexes, [0]);
});

test('photo-only posts migrate and survive creation, editing and reload', () => {
  const { storage } = setup();
  const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
  storage.setItem('osek-posts', JSON.stringify([{ id: 55, text: '', image, likes: 0, liked: false, saved: false, comments: 0, commentList: [], minutes: 0 }]));
  const store = createLocalStore(() => storage);
  assert.equal(store.getSnapshot().error, null);
  assert.equal(byId(store, 55).image, image);
  assert.equal(store.createLocalPost({ text: '', image }), true);
  const created = store.getSnapshot().posts.find(post => post.id !== 55 && post.image === image);
  assert.ok(created);
  assert.equal(store.editLocalPost(created.id, ''), true);
  assert.equal(byId(createLocalStore(() => storage), created.id).image, image);
  assert.equal(store.createLocalPost({ text: '   ' }), false);
});

test('own posts derive the current avatar after reload without storing duplicate images', () => {
  const { storage, store } = setup();
  const avatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
  const updatedAvatar = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  assert.equal(store.createLocalPost({ text: 'Ещё один собственный пост' }), true);
  assert.equal(store.saveLocalAvatar(avatar), true);
  let persisted = JSON.parse(storage.getItem(LOCAL_STORAGE_KEY));
  assert.equal(persisted.avatar, avatar);
  assert.ok(persisted.posts.filter(post => post.isOwn).every(post => !Object.hasOwn(post, 'avatar')));
  assert.equal(persisted.posts.find(post => post.id === 2).avatar, '/images/aidana-avatar.svg');
  const reloaded = createLocalStore(() => storage);
  assert.ok(reloaded.getSnapshot().posts.filter(post => post.isOwn && post.named).every(post => post.avatar === avatar));
  assert.equal(reloaded.saveLocalAvatar(updatedAvatar), true);
  persisted = JSON.parse(storage.getItem(LOCAL_STORAGE_KEY));
  assert.equal(persisted.avatar, updatedAvatar);
  assert.ok(persisted.posts.filter(post => post.isOwn).every(post => !Object.hasOwn(post, 'avatar')));
  assert.ok(createLocalStore(() => storage).getSnapshot().posts.filter(post => post.isOwn && post.named).every(post => post.avatar === updatedAvatar));
});

test('a stale comment index cannot delete another comment after a different tab changes the list', () => {
  const { storage, store: first } = setup();
  first.addLocalComment(1, 'Первый комментарий'); first.addLocalComment(1, 'Второй комментарий');
  const second = createLocalStore(() => storage);
  const visibleComments = [...byId(first, 1).comments];
  assert.equal(second.deleteLocalComment(1, 0, byId(second, 1).comments), true);
  const afterDelete = storage.getItem(LOCAL_STORAGE_KEY);
  assert.equal(first.deleteLocalComment(1, 0, visibleComments), false);
  assert.match(first.getSnapshot().error, /обновились/);
  assert.equal(storage.getItem(LOCAL_STORAGE_KEY), afterDelete);
  assert.deepEqual(byId(createLocalStore(() => storage), 1).comments, [visibleComments[1]]);

  // Equal lengths are insufficient: compare each comment's stored identity and content too.
  assert.equal(second.addLocalComment(1, 'Новый комментарий из другой вкладки'), true);
  const afterAdd = storage.getItem(LOCAL_STORAGE_KEY);
  assert.equal(first.deleteLocalComment(1, 0, visibleComments), false);
  assert.equal(storage.getItem(LOCAL_STORAGE_KEY), afterAdd);
  first.reload();
  assert.equal(first.deleteLocalComment(1, 0, byId(first, 1).comments), true);
  assert.deepEqual(byId(createLocalStore(() => storage), 1).comments.map(comment => comment.text), ['Новый комментарий из другой вкладки']);
});

test('static comments without known authors are archived and excluded from visible counts', () => {
  const { storage, store } = setup();
  assert.deepEqual(byId(store, 1).comments, []);
  assert.equal(byId(store, 1).legacyAnonymousComments.length, 2);
  assert.deepEqual(byId(store, 4).comments, []);
  assert.deepEqual(byId(store, 4).legacyAnonymousComments, ['Frito', 'Durum']);
  assert.equal(storage.getItem(LOCAL_STORAGE_KEY), null, 'Reading migration must not write automatically');
  store.toggleLocalSaved(4);
  assert.equal(JSON.parse(storage.getItem(LOCAL_STORAGE_KEY)).version, 2);
  assert.deepEqual(byId(createLocalStore(() => storage), 4).legacyAnonymousComments, ['Frito', 'Durum']);
});

test('version 1 migration preserves known authors and archives unknown comments without losing other data', () => {
  const { storage, store } = setup();
  const baseline = store.getSnapshot();
  const oldPosts = baseline.posts.map(({ legacyAnonymousComments, ...post }) => ({ ...post, comments: [], myCommentIndexes: [] }));
  oldPosts[0] = { ...oldPosts[0], comments: ['Без автора A', 'Мой старый A', 'Без автора B', 'Мой старый B'], myCommentIndexes: [1, 3], liked: true, saved: true, likes: 129 };
  const raw = JSON.stringify({ version: 1, posts: oldPosts, profile: baseline.profile, avatar: baseline.avatar });
  storage.setItem(LOCAL_STORAGE_KEY, raw);
  const migrated = createLocalStore(() => storage);
  const post = byId(migrated, 1);
  assert.deepEqual(post.comments, [
    { id: 'legacy:1:1', text: 'Мой старый A', username: baseline.profile.username },
    { id: 'legacy:1:3', text: 'Мой старый B', username: baseline.profile.username },
  ]);
  assert.deepEqual(post.myCommentIndexes, [0, 1]);
  assert.deepEqual(post.legacyAnonymousComments, ['Без автора A', 'Без автора B']);
  assert.equal(post.comments.length, 2); assert.equal(post.likes, 129); assert.equal(post.liked, true); assert.equal(post.saved, true);
  assert.deepEqual(migrated.getSnapshot().profile, baseline.profile);
  assert.deepEqual(JSON.parse(JSON.stringify(byId(migrated, 2))), JSON.parse(JSON.stringify({ ...baseline.posts[1], legacyAnonymousComments: [] })));
  assert.equal(storage.getItem(LOCAL_STORAGE_KEY), raw);
  assert.deepEqual(byId(createLocalStore(() => storage), 1).comments, post.comments, 'Unpersisted migration IDs must be deterministic');
  assert.equal(migrated.deleteLocalComment(1, 0, JSON.parse(JSON.stringify(post.comments))), true);
  const reloaded = byId(createLocalStore(() => storage), 1);
  assert.deepEqual(reloaded.comments, [post.comments[1]]);
  assert.deepEqual(reloaded.myCommentIndexes, [0]);
  assert.deepEqual(reloaded.legacyAnonymousComments, post.legacyAnonymousComments);
  assert.equal(JSON.parse(storage.getItem(LOCAL_STORAGE_KEY)).version, 2);
});

test('new comments capture the latest stored account username and never change it retrospectively', () => {
  const { storage, store: first } = setup();
  first.getSnapshot();
  const second = createLocalStore(() => storage);
  assert.equal(second.saveLocalProfile({ ...second.getSnapshot().profile, username: 'new_account' }), true);
  assert.equal(first.addLocalComment(1, 'Под новым ником'), true);
  const originalComment = byId(first, 1).comments[0];
  assert.equal(originalComment.username, 'new_account');
  assert.ok(originalComment.id);
  assert.equal(second.saveLocalProfile({ ...second.getSnapshot().profile, username: 'changed_again' }), true);
  assert.equal(first.addLocalComment(1, 'После смены ника'), true);
  const reloaded = byId(createLocalStore(() => storage), 1);
  assert.deepEqual(reloaded.comments[0], originalComment);
  assert.equal(reloaded.comments[1].username, 'changed_again');
  assert.notEqual(reloaded.comments[0].id, reloaded.comments[1].id);
});

test('version 2 rejects missing, blank and invalid comment usernames without overwriting storage', () => {
  for (const author of [undefined, null, '', '   ', 'Аноним', 'name with space']) {
    const { storage, store } = setup(); store.toggleLocalLike(1);
    const data = JSON.parse(storage.getItem(LOCAL_STORAGE_KEY));
    data.posts[0].comments = [{ id: 'comment:invalid', text: 'Текст без корректного автора', username: author }];
    data.posts[0].myCommentIndexes = [0];
    const raw = JSON.stringify(data); storage.setItem(LOCAL_STORAGE_KEY, raw);
    const reloaded = createLocalStore(() => storage);
    assert.ok(reloaded.getSnapshot().error);
    assert.equal(reloaded.addLocalComment(1, 'Новый текст'), false);
    assert.equal(storage.getItem(LOCAL_STORAGE_KEY), raw);
  }
});

test('a comment cannot be submitted with an invalid stored account username', () => {
  const { storage, store } = setup(); store.toggleLocalLike(1);
  const data = JSON.parse(storage.getItem(LOCAL_STORAGE_KEY));
  data.profile.username = '   ';
  const raw = JSON.stringify(data); storage.setItem(LOCAL_STORAGE_KEY, raw);
  assert.equal(store.addLocalComment(1, 'Нельзя опубликовать без ника'), false);
  assert.match(store.getSnapshot().error, /ник аккаунта/);
  assert.equal(storage.getItem(LOCAL_STORAGE_KEY), raw);
});

test('comment deletion compares id, text and username rather than object references', () => {
  const { storage, store } = setup(); store.addLocalComment(1, 'Комментарий');
  const original = byId(store, 1).comments;
  for (const field of ['id', 'text', 'username']) {
    const expected = JSON.parse(JSON.stringify(original)); expected[0][field] += '_different';
    const raw = storage.getItem(LOCAL_STORAGE_KEY);
    assert.equal(store.deleteLocalComment(1, 0, expected), false);
    assert.equal(storage.getItem(LOCAL_STORAGE_KEY), raw);
  }
  assert.equal(store.deleteLocalComment(1, 0, JSON.parse(JSON.stringify(original))), true);
  assert.deepEqual(byId(createLocalStore(() => storage), 1).comments, []);
});
