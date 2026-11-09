const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Render the real components, mocking only their external store hooks.
const source = path.resolve(__dirname, '../src');
const componentFiles = [
  path.join(source, 'components/Comments.tsx'),
  path.join(source, 'components/posts/PostAuthorLabel.tsx'),
];
let moderation = { ready: true, role: 'user' };
const localData = { ready: true, profile: { username: 'viewer_12' } };
const originalLoad = Module._load;
const originalTsx = require.extensions['.tsx'];
const originalCache = componentFiles.map(filename => [filename, require.cache[filename]]);
let Comments, PostAuthorLabel;

try {
  require.extensions['.tsx'] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    });
    module._compile(outputText, filename);
  };
  Module._load = function (request, parent, isMain) {
    const resolved = parent && path.resolve(path.dirname(parent.filename), request);
    if (resolved === path.join(source, 'moderation')) return { useModeration: () => moderation };
    if (resolved === path.join(source, 'data/local-store')) return { useLocalData: () => localData };
    return originalLoad.call(this, request, parent, isMain);
  };
  for (const filename of componentFiles) delete require.cache[filename];
  ({ Comments } = require(componentFiles[0]));
  ({ PostAuthorLabel } = require(componentFiles[1]));
} finally {
  Module._load = originalLoad;
  if (originalTsx) require.extensions['.tsx'] = originalTsx;
  else delete require.extensions['.tsx'];
  for (const [filename, cached] of originalCache) {
    if (cached) require.cache[filename] = cached;
    else delete require.cache[filename];
  }
}

const realUsername = 'private_author_99';
function postLabel({ ready = true, role = 'user', named = false, username = realUsername, author = 'Аноним' } = {}) {
  moderation = { ready, role };
  return renderToStaticMarkup(React.createElement(PostAuthorLabel, { author, named, username }));
}
function comments({ ready = true, role = 'user', isAnonymous = true, variant = 'feed' } = {}) {
  moderation = { ready, role };
  return renderToStaticMarkup(React.createElement(Comments, {
    comments: [{ id: 'comment:one', text: 'Текст комментария', username: realUsername, isAnonymous }],
    variant, onAdd: () => true, onDelete: () => {},
  }));
}

for (const state of [{ ready: true, role: 'user' }, { ready: false, role: 'admin' }]) {
  test(`anonymous post has no real username anywhere in markup for ${state.role}, ready=${state.ready}`, () => {
    const html = postLabel(state);
    assert.match(html, /Аноним/);
    assert.equal(html.includes(realUsername), false, 'No hidden text, title or aria attribute may disclose the username');
  });
  for (const variant of ['feed', 'detail']) {
    test(`anonymous ${variant} comment hides real username for ${state.role}, ready=${state.ready}`, () => {
      const html = comments({ ...state, variant });
      assert.match(html, /Аноним/);
      assert.equal(html.includes(realUsername), false, 'The viewer nickname in the form is different from the private author nickname');
    });
  }
}

test('a ready administrator sees an anonymous post username below the anonymous label', () => {
  const html = postLabel({ role: 'admin' });
  assert.match(html, /Аноним<\/span><span[^>]*>@private_author_99<\/span>/);
});

test('a ready administrator sees an anonymous comment username on its own line', () => {
  const html = comments({ role: 'admin' });
  assert.match(html, /Аноним<span class="block[^"]*">@private_author_99<\/span>/);
});

test('named posts and comments retain the visible @username for ordinary readers', () => {
  assert.match(postLabel({ named: true }), />@private_author_99<\/span>/);
  assert.match(comments({ isAnonymous: false }), /@private_author_99:/);
});

test('an anonymous seed without a known username never invents an attribution, even for an administrator', () => {
  moderation = { ready: true, role: 'admin' };
  const html = renderToStaticMarkup(React.createElement(PostAuthorLabel, { author: 'Аноним', named: false }));
  assert.match(html, /Аноним/);
  assert.equal(html.includes('@'), false);
  assert.equal(html.includes(localData.profile.username), false);
});

test('new comments default to a named author and expose an accessible anonymity switch', () => {
  const html = comments();
  assert.match(html, /role="switch" aria-label="Комментировать анонимно" aria-checked="false"/);
  assert.match(html, /Комментарий от <strong>@viewer_12<\/strong>/);
});
