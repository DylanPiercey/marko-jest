/* eslint-env browser, jest */

// This map is generated by scripts/generate-marko-module-map.js
// which allows Jest to mock Marko's browser-side dependencies (browser field from pakacge.json) on server/Node.js env.
const markoModulesMockingMap = require('./marko-modules-mocking-map');

// load Marko's browser-field dependecies on Node.js. This is done in order to load browser-side modules on server-side
function loadMarkoBrowserDependencies() {
  Object.keys(markoModulesMockingMap).forEach(moduleToMock => {
    jest.mock(moduleToMock, () => require.requireActual(markoModulesMockingMap[moduleToMock]));
  });
}

const mountedContainers = new Set();

/* eslint global-require: 1 */
/* eslint import/no-dynamic-require: 1 */
function init(componentFullPath) {
  loadMarkoBrowserDependencies();

  // require the component to test
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const renderable = require(componentFullPath);

  // init marko component
  // eslint-disable-next-line global-require
  require('marko/components').init();

  return {
    componentClass: renderable.Component,

    render(input) {
      const container = createContainer();

      return renderable.render(input)
        .then((result) => {
          result.appendTo(container);

          return {
            container,
            component: result.getComponent(),
            getNodes: () => Array.from(container.childNodes)
          };
        });
    }
  };
};

function createContainer() {
  const container = document.createElement('div');
  container.id = 'marko-jest-sandbox-' + Math.floor(Math.random() * 10000);
  document.body.appendChild(container);
  mountedContainers.add(container);

  return container;
}

function cleanup() {
  mountedContainers.forEach((container) => {
    if (container.parentNode === document.body) {
      document.body.removeChild(container);
    }

    mountedContainers.delete(container);
  });
}

module.exports = {
  init,
  cleanup
};
