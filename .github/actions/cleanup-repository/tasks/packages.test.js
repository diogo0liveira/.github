const packagesTask = require('./packages');

describe('packages task', () => {
  let github;
  let core;

  beforeEach(() => {
    github = {
      paginate: jest.fn().mockImplementation(async (method, options) => {
        return [{ name: 'test-package' }];
      }),
      rest: {
        packages: {
          listPackagesForUser: jest.fn(),
          deletePackageForUser: jest.fn()
        }
      }
    };
    core = {
      startGroup: jest.fn(),
      endGroup: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    };
  });

  it('should handle errors when deleting a package', async () => {
    const error = new Error('Delete failed');
    github.rest.packages.deletePackageForUser.mockRejectedValue(error);

    await packagesTask({ github, owner: 'test-owner', repo: 'test-repo', core });

    expect(core.error).toHaveBeenCalledWith('    ❌ Erro ao excluir package test-package: Delete failed');
  });
});
