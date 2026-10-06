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

// We need to load it dynamically because we want to use test runner.
// The code uses node:test which doesn't mix well with Jest out of the box in this specific configuration if it requires node:test explicitely.

describe('cleanup-repository cleanup.js', () => {
  let mocks;
  let baseTools;
  let cleanup;

  beforeEach(() => {
    // Reset require cache
    jest.resetModules();

    // Mock tasks
    mocks = {
      packages: jest.fn(),
      releases: jest.fn(),
      branches: jest.fn(),
      actions: jest.fn(),
      tags: jest.fn()
    };

    jest.mock('./tasks/packages', () => mocks.packages);
    jest.mock('./tasks/releases', () => mocks.releases);
    jest.mock('./tasks/branches', () => mocks.branches);
    jest.mock('./tasks/actions', () => mocks.actions);
    jest.mock('./tasks/tags', () => mocks.tags);

    cleanup = require('./cleanup.js');

    baseTools = {
      github: { rest: {} },
      context: { repo: { owner: 'test-owner', repo: 'test-repo' } },
      core: { info: jest.fn(), error: jest.fn(), startGroup: jest.fn(), endGroup: jest.fn(), warning: jest.fn() }
    };
  });

  it('calls all tasks by default when flags are empty', async () => {
    await cleanup({ ...baseTools, flags: {} });

    expect(mocks.actions).toHaveBeenCalled();
    expect(mocks.packages).toHaveBeenCalled();
    expect(mocks.releases).toHaveBeenCalled();
    expect(mocks.branches).toHaveBeenCalled();
    expect(mocks.tags).toHaveBeenCalled();
  });

  it('passes correct tools object to tasks', async () => {
    await cleanup({ ...baseTools, flags: {} });

    const expectedTools = {
      github: baseTools.github,
      owner: 'test-owner',
      repo: 'test-repo',
      context: baseTools.context,
      core: baseTools.core
    };

    expect(mocks.actions).toHaveBeenCalledWith(expectedTools);
  });

  it('skips tasks when flag is boolean false', async () => {
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

    expect(mocks.actions).not.toHaveBeenCalled();
    expect(mocks.packages).toHaveBeenCalled();
    expect(mocks.releases).not.toHaveBeenCalled();
    expect(mocks.branches).toHaveBeenCalled();
    expect(mocks.tags).not.toHaveBeenCalled();
  });

  it('skips tasks when flag is string "false"', async () => {
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

    expect(mocks.actions).not.toHaveBeenCalled();
    expect(mocks.packages).toHaveBeenCalled();
    expect(mocks.releases).not.toHaveBeenCalled();
    expect(mocks.branches).toHaveBeenCalled();
    expect(mocks.tags).not.toHaveBeenCalled();
  });

  it('bubbles up errors from tasks', async () => {
    const error = new Error('Test error in actions');
    mocks.actions.mockRejectedValue(error);

    await expect(cleanup({ ...baseTools, flags: { actions: true } })).rejects.toThrow('Test error in actions');
  });

});
