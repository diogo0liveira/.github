const managePackages = require('./packages');

describe('Packages Task', () => {
  let github, core;
  const owner = 'test-owner';
  const repo = 'test-repo';

  beforeEach(() => {
    github = {
      paginate: jest.fn(),
      rest: {
        packages: {
          listPackagesForUser: jest.fn(),
          deletePackageForUser: jest.fn(),
        },
      },
    };

    core = {
      startGroup: jest.fn(),
      endGroup: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully list and delete packages for all defined package types', async () => {
    github.paginate.mockImplementation(async (method, params) => {
      if (params.package_type === 'container') {
        return [{ name: 'pkg-1' }, { name: 'pkg-2' }];
      }
      return [];
    });

    github.rest.packages.deletePackageForUser.mockResolvedValue();

    await managePackages({ github, owner, repo, core });

    expect(core.startGroup).toHaveBeenCalledWith('📦 Gerenciamento de Packages');

    // verify paginate was called for all types
    expect(github.paginate).toHaveBeenCalledTimes(5);
    ['container', 'npm', 'maven', 'rubygems', 'nuget'].forEach((type) => {
      expect(github.paginate).toHaveBeenCalledWith(
        github.rest.packages.listPackagesForUser,
        {
          username: owner,
          package_type: type,
          per_page: 100,
        }
      );
    });

    expect(core.info).toHaveBeenCalledWith('🔹 Tipo [CONTAINER]: 2 packages encontrados');
    expect(core.info).toHaveBeenCalledWith('  🗑️ Excluindo Package: pkg-1');
    expect(core.info).toHaveBeenCalledWith('  🗑️ Excluindo Package: pkg-2');

    expect(github.rest.packages.deletePackageForUser).toHaveBeenCalledTimes(2);
    expect(github.rest.packages.deletePackageForUser).toHaveBeenCalledWith({
      username: owner,
      package_type: 'container',
      package_name: 'pkg-1',
    });
    expect(github.rest.packages.deletePackageForUser).toHaveBeenCalledWith({
      username: owner,
      package_type: 'container',
      package_name: 'pkg-2',
    });

    expect(core.info).toHaveBeenCalledWith('    ✅ Sucesso');
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should handle empty package lists without errors', async () => {
    github.paginate.mockResolvedValue([]);

    await managePackages({ github, owner, repo, core });

    expect(github.paginate).toHaveBeenCalledTimes(5);
    expect(core.info).not.toHaveBeenCalledWith(expect.stringContaining('packages encontrados'));
    expect(github.rest.packages.deletePackageForUser).not.toHaveBeenCalled();
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should correctly log an error when a package deletion fails', async () => {
    github.paginate.mockImplementation(async (method, params) => {
      if (params.package_type === 'npm') {
        return [{ name: 'pkg-fail' }];
      }
      return [];
    });

    const errorMsg = 'Failed to delete';
    github.rest.packages.deletePackageForUser.mockRejectedValue(new Error(errorMsg));

    await managePackages({ github, owner, repo, core });

    expect(core.info).toHaveBeenCalledWith('🔹 Tipo [NPM]: 1 packages encontrados');
    expect(core.info).toHaveBeenCalledWith('  🗑️ Excluindo Package: pkg-fail');
    expect(github.rest.packages.deletePackageForUser).toHaveBeenCalledTimes(1);

    expect(core.error).toHaveBeenCalledWith(`    ❌ Erro ao excluir package pkg-fail: ${errorMsg}`);
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should handle listing failures and log warnings except for 404s', async () => {
    const error500 = new Error('Server error');
    error500.status = 500;

    github.paginate.mockImplementation(async (method, params) => {
      if (params.package_type === 'maven') {
        throw error500;
      }
      return [];
    });

    await managePackages({ github, owner, repo, core });

    expect(core.warning).toHaveBeenCalledWith(`⚠️ Falha ao processar packages maven: Server error`);
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should gracefully ignore 404 errors during listing', async () => {
    const error404 = new Error('Not found');
    error404.status = 404;

    github.paginate.mockImplementation(async (method, params) => {
      if (params.package_type === 'rubygems') {
        throw error404;
      }
      return [];
    });

    await managePackages({ github, owner, repo, core });

    expect(core.warning).not.toHaveBeenCalledWith(expect.stringContaining('rubygems'));
    expect(core.endGroup).toHaveBeenCalled();
  });
});
