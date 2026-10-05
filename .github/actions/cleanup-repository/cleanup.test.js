const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

// Helper to mock required tasks using require.cache
function mockTask(taskName) {
  const fullPath = require.resolve(`./tasks/${taskName}`);
  let callArgs = null;
  let throwError = null;

  require.cache[fullPath] = {
    id: fullPath,
    filename: fullPath,
    loaded: true,
    exports: async (tools) => {
      if (throwError) {
        throw throwError;
      }
      callArgs = tools;
    }
  };

  return {
    get callArgs() {
      return callArgs;
    },
    mockImplementation(impl) {
      require.cache[fullPath].exports = impl;
    },
    mockRejectedValue(err) {
      throwError = err;
    },
    reset() {
      callArgs = null;
      throwError = null;
    }
  };
}

test('cleanup-repository cleanup.js', async (t) => {
  // Set up mocks
  const mocks = {
    packages: mockTask('packages'),
    releases: mockTask('releases'),
    branches: mockTask('branches'),
    actions: mockTask('actions'),
    tags: mockTask('tags')
  };

  const cleanupModulePath = require.resolve('./cleanup.js');

  t.beforeEach(() => {
    // Reset all mock call state
    for (const mock of Object.values(mocks)) {
      mock.reset();
    }
    // Delete cleanup module from cache to ensure fresh loads if needed,
    // but in this case we just require it once since we mock its dependencies.
  });

  const cleanup = require(cleanupModulePath);

  const baseTools = {
    github: { rest: {} },
    context: { repo: { owner: 'test-owner', repo: 'test-repo' } },
    core: { info: () => {}, error: () => {} }
  };

  await t.test('calls all tasks by default when flags are empty', async () => {
    await cleanup({ ...baseTools, flags: {} });

    assert.ok(mocks.actions.callArgs);
    assert.ok(mocks.packages.callArgs);
    assert.ok(mocks.releases.callArgs);
    assert.ok(mocks.branches.callArgs);
    assert.ok(mocks.tags.callArgs);
  });

  await t.test('passes correct tools object to tasks', async () => {
    await cleanup({ ...baseTools, flags: {} });

    const expectedTools = {
      github: baseTools.github,
      owner: 'test-owner',
      repo: 'test-repo',
      context: baseTools.context,
      core: baseTools.core
    };

    assert.deepStrictEqual(mocks.actions.callArgs, expectedTools);
  });

  await t.test('skips tasks when flag is boolean false', async () => {
    await cleanup({
      ...baseTools,
      flags: {
        actions: false,
        packages: true,
        releases: false,
        branches: true,
        tags: false
      }
    });

    assert.strictEqual(mocks.actions.callArgs, null);
    assert.ok(mocks.packages.callArgs);
    assert.strictEqual(mocks.releases.callArgs, null);
    assert.ok(mocks.branches.callArgs);
    assert.strictEqual(mocks.tags.callArgs, null);
  });

  await t.test('skips tasks when flag is string "false"', async () => {
    await cleanup({
      ...baseTools,
      flags: {
        actions: 'false',
        packages: 'true',
        releases: 'false',
        branches: 'true',
        tags: 'false'
      }
    });

    assert.strictEqual(mocks.actions.callArgs, null);
    assert.ok(mocks.packages.callArgs);
    assert.strictEqual(mocks.releases.callArgs, null);
    assert.ok(mocks.branches.callArgs);
    assert.strictEqual(mocks.tags.callArgs, null);
  });

  await t.test('bubbles up errors from tasks', async () => {
    const error = new Error('Test error in actions');
    mocks.actions.mockRejectedValue(error);

    await assert.rejects(
      cleanup({ ...baseTools, flags: { actions: true } }),
      error
    );
  });

});
