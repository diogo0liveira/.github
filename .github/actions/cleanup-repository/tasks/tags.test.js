const cleanTags = require('./tags');

describe('tags task', () => {
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
        git: {
          listMatchingRefs: jest.fn(),
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

  it('should delete all returned tag references', async () => {
    const refs = [
      { ref: 'refs/tags/v1.0.0' },
      { ref: 'refs/tags/v1.0.1' },
    ];
    github.paginate.mockResolvedValue(refs);

    await cleanTags({ github, owner, repo, core });

    expect(core.startGroup).toHaveBeenCalledWith('🏷️ Gerenciamento de Tags (Git Refs)');
    expect(github.paginate).toHaveBeenCalledWith(github.rest.git.listMatchingRefs, {
      owner,
      repo,
      ref: 'tags/',
      per_page: 100,
    });
    expect(core.info).toHaveBeenCalledWith('Encontradas 2 refs de tags');
    expect(github.rest.git.deleteRef).toHaveBeenCalledTimes(2);
    expect(github.rest.git.deleteRef).toHaveBeenCalledWith({ owner, repo, ref: 'tags/v1.0.0' });
    expect(github.rest.git.deleteRef).toHaveBeenCalledWith({ owner, repo, ref: 'tags/v1.0.1' });
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should handle 404 error when no tags are found', async () => {
    const error = new Error('Not found');
    error.status = 404;
    github.paginate.mockRejectedValue(error);

    await cleanTags({ github, owner, repo, core });

    expect(core.info).toHaveBeenCalledWith('ℹ️ Nenhuma tag encontrada para este repositório.');
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should handle generic error when listing tags', async () => {
    const error = new Error('Generic error');
    github.paginate.mockRejectedValue(error);

    await cleanTags({ github, owner, repo, core });

    expect(core.warning).toHaveBeenCalledWith('⚠️ Problema ao processar tags: Generic error');
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should handle error when deleting an individual tag and continue', async () => {
    const refs = [
      { ref: 'refs/tags/v1.0.0' },
      { ref: 'refs/tags/v1.0.1' },
    ];
    github.paginate.mockResolvedValue(refs);

    github.rest.git.deleteRef
      .mockRejectedValueOnce(new Error('Delete error'))
      .mockResolvedValueOnce({});

    await cleanTags({ github, owner, repo, core });

    expect(github.rest.git.deleteRef).toHaveBeenCalledTimes(2);
    expect(core.error).toHaveBeenCalledWith('    ❌ Erro ao excluir ref tags/v1.0.0: Delete error');
    expect(core.info).toHaveBeenCalledWith('    ✅ Sucesso');
    expect(core.endGroup).toHaveBeenCalled();
  });
});
