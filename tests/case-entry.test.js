const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const C = require('../case-model');
const source = fs.readFileSync(path.join(__dirname, '../case-ui.js'), 'utf8');
const loader = source.slice(source.indexOf('function load(){'), source.indexOf("document.querySelector('.site-skip')"));
function open(search, hash = '') {
  const context = { C, URLSearchParams, location: { search, hash }, current: C.initial(), active: false, error: '', render() {}, setJourneyMode() {} };
  context.persist = () => { context.location.hash = C.encode(context.current); };
  vm.runInNewContext(loader + ';load();', context);
  return context;
}
test('overview entry starts a canonical shared case without changing the default walkthrough', () => {
  const entry = open('?example=shared');
  assert.equal(entry.active, true);
  assert.deepEqual(C.decode(entry.location.hash), C.initial());
  assert.equal(open('').active, false);
  assert.equal(open('?example=unknown').active, false);
});
test('explicit overview entry preserves an existing action history instead of resetting it', () => {
  const c = C.replay(['CHECKS', 'APPROVE', 'PUSH']);
  const entry = open('?example=shared', C.encode(c));
  assert.deepEqual(entry.current, c);
});
test('invalid case fragment is rejected rather than replaced by a favorable starter case', () => {
  const entry = open('?example=shared', '#case=%');
  assert.equal(entry.active, true);
  assert.match(entry.error, /Malformed/);
  assert.equal(entry.location.hash, '#case=%');
});
test('shared-case root is hidden on the default landing and revealed for active links', () => {
  const page = fs.readFileSync(path.join(__dirname, '../independent-assurance.html'), 'utf8');
  assert.match(page, /<div id="shared-case-root" hidden><\/div>/);
  assert.match(source, /root\.hidden=!active/);
});
test('active Monitoring lens scrolls without replacing the shared-case fragment', () => {
  const handler = source.slice(source.indexOf("document.querySelector('.lens-switch"), source.indexOf('window.addEventListener'));
  let click, prevented = false, focused = false, scrolled = false;
  const context = {
    active: true,
    isMonitoring: true,
    document: {
      querySelector: () => ({ addEventListener: (type, listener) => { if (type === 'click') click = listener; } }),
      getElementById: id => id === 'stage-title' ? { focus: options => { focused = options.preventScroll; } } : { scrollIntoView: options => { scrolled = options.block === 'start'; } }
    }
  };
  vm.runInNewContext(handler, context);
  const event = { preventDefault: () => { prevented = true; } };
  click(event);
  assert.equal(prevented, true);
  assert.equal(focused, true);
  assert.equal(scrolled, true);
});
