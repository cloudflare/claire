const $ = require('jquery');
const html = `
  <input id="claire_guide" type="checkbox"></input>
  <input id="debug_log_checkbox" type="checkbox"></input>
`;

test('update localStorage', () => {
  global.localStorage = {};
  document.body.innerHTML = html;
  const options = require('./options');

  options.run();

  expect($('#claire_guide').click().prop('checked')).toBe(true);
  expect(localStorage.hide_guide).toBe('yes');

  expect($('#debug_log_checkbox').click().prop('checked')).toBe(true);
  expect(localStorage.debug_logging).toBe('yes');

  expect($('#claire_guide').click().prop('checked')).toBe(false);
  expect(localStorage.hide_guide).toBe('no');

  expect($('#debug_log_checkbox').click().prop('checked')).toBe(false);
  expect(localStorage.debug_logging).toBe('no');
});

test('renders from localStorage', () => {
  global.localStorage = {
    hide_guide: 'yes', // eslint-disable-line camelcase
    debug_logging: 'no' // eslint-disable-line camelcase
  };
  document.body.innerHTML = html;
  const options = require('./options');

  options.run();

  expect($('#claire_guide').prop('checked')).toBe(true);
  expect($('#debug_log_checkbox').prop('checked')).toBe(false);
});
