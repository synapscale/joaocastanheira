const { act } = require('react-dom/test-utils');
const ReactDOMClient = require('react-dom/client');

exports.render = (ui) => {
  const container = globalThis.document.createElement('div');
  globalThis.document.body.appendChild(container);
  let root;
  act(() => {
    root = ReactDOMClient.createRoot(container);
    root.render(ui);
  });
  return { container, unmount: () => root.unmount() };
};

exports.screen = {
  getByPlaceholderText: (text) => {
    const el = globalThis.document.querySelector(`[placeholder="${text}"]`);
    if (!el) throw new Error(`Unable to find element with placeholder ${text}`);
    return el;
  },
  getByRole: (role, options = {}) => {
    const elements = Array.from(globalThis.document.querySelectorAll(role));
    const { name } = options;
    const regex = name ? (name instanceof RegExp ? name : new RegExp(name, 'i')) : null;
    const el = elements.find((e) => !regex || regex.test(e.textContent || ''));
    if (!el) throw new Error(`Unable to find role ${role}`);
    return el;
  },
};

exports.fireEvent = {
  click: (element) => {
    act(() => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  },
  change: (element, { target }) => {
    act(() => {
      element.value = target.value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
  },
};
