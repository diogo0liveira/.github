const cleanBranches = require('./branches');

describe('branches task', () => {
  let github;
  let core;
  let owner;
  let repo;

  beforeEach(() => {
    owner = 'test-owner';
    repo = 'test-repo';

    github = {
      paginate: jest.fn(),
      rest: {
        repos: {
          get: jest.fn(),
          listBranches: jest.fn(),
        },
        git: {
          deleteRef: jest.fn(),
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

  it('should delete non-default branches', async () => {
    github.rest.repos.get.mockResolvedValue({
      data: { default_branch: 'main' },
    });

    const branches = [
      { name: 'main' },
      { name: 'feature-1' },
      { name: 'feature-2' },
    ];
    github.paginate.mockResolvedValue(branches);

    await cleanBranches({ github, owner, repo, core });

    expect(core.startGroup).toHaveBeenCalledWith('🌿 Gerenciamento de Branches');
    expect(github.rest.repos.get).toHaveBeenCalledWith({ owner, repo });
    expect(core.info).toHaveBeenCalledWith('Branch padrão identificada: main');

    expect(github.paginate).toHaveBeenCalledWith(github.rest.repos.listBranches, {
      owner,
      repo,
      per_page: 100,
    });
    expect(core.info).toHaveBeenCalledWith('Encontradas 3 branches');

    expect(core.info).toHaveBeenCalledWith('  ℹ️ Mantendo branch padrão: main');

    expect(github.rest.git.deleteRef).toHaveBeenCalledTimes(2);
    expect(github.rest.git.deleteRef).toHaveBeenCalledWith({ owner, repo, ref: 'heads/feature-1' });
    expect(github.rest.git.deleteRef).toHaveBeenCalledWith({ owner, repo, ref: 'heads/feature-2' });

    expect(core.info).toHaveBeenCalledWith('    ✅ Sucesso');
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should handle error when getting default branch', async () => {
    const error = new Error('Get repo error');
    github.rest.repos.get.mockRejectedValue(error);

    await cleanBranches({ github, owner, repo, core });

    expect(core.warning).toHaveBeenCalledWith('⚠️ Falha ao processar branches: Get repo error');
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should handle error when listing branches', async () => {
    github.rest.repos.get.mockResolvedValue({
      data: { default_branch: 'main' },
    });

    const error = new Error('List branches error');
    github.paginate.mockRejectedValue(error);

    await cleanBranches({ github, owner, repo, core });

    expect(core.warning).toHaveBeenCalledWith('⚠️ Falha ao processar branches: List branches error');
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should handle error when deleting an individual branch and continue', async () => {
    github.rest.repos.get.mockResolvedValue({
      data: { default_branch: 'main' },
    });

    const branches = [
      { name: 'main' },
      { name: 'feature-1' },
      { name: 'feature-2' },
    ];
    github.paginate.mockResolvedValue(branches);

    github.rest.git.deleteRef
      .mockRejectedValueOnce(new Error('Delete error'))
      .mockResolvedValueOnce({});

    await cleanBranches({ github, owner, repo, core });

    expect(github.rest.git.deleteRef).toHaveBeenCalledTimes(2);
    expect(core.error).toHaveBeenCalledWith('    ❌ Erro ao excluir branch feature-1: Delete error');
    expect(core.info).toHaveBeenCalledWith('    ✅ Sucesso');
    expect(core.endGroup).toHaveBeenCalled();
  });
});
