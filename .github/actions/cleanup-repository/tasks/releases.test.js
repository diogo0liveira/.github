const releases = require('./releases');

describe('Gerenciamento de Releases', () => {
  let mockGithub;
  let mockCore;
  const owner = 'test-owner';
  const repo = 'test-repo';

  beforeEach(() => {
    mockGithub = {
      paginate: jest.fn(),
      rest: {
        repos: {
          listReleases: jest.fn(),
          deleteRelease: jest.fn(),
        },
      },
    };
    mockCore = {
      startGroup: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      endGroup: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete releases', async () => {
    const mockReleasesList = [
      { id: 1, tag_name: 'v1.0.0' },
      { id: 2, tag_name: 'v1.0.1' },
    ];
    mockGithub.paginate.mockResolvedValue(mockReleasesList);
    mockGithub.rest.repos.deleteRelease.mockResolvedValue({});

    await releases({ github: mockGithub, owner, repo, core: mockCore });

    expect(mockCore.startGroup).toHaveBeenCalledWith('🎁 Gerenciamento de Releases');
    expect(mockGithub.paginate).toHaveBeenCalledWith(
      mockGithub.rest.repos.listReleases,
      { owner, repo, per_page: 100 }
    );
    expect(mockCore.info).toHaveBeenCalledWith(`Encontradas ${mockReleasesList.length} releases`);

    for (const r of mockReleasesList) {
      expect(mockCore.info).toHaveBeenCalledWith(`  🗑️ Excluindo Release: ${r.tag_name} (id: ${r.id})`);
      expect(mockGithub.rest.repos.deleteRelease).toHaveBeenCalledWith({
        owner,
        repo,
        release_id: r.id,
      });
    }
    expect(mockCore.info).toHaveBeenCalledWith(`    ✅ Sucesso`);
    expect(mockCore.endGroup).toHaveBeenCalled();
    expect(mockCore.error).not.toHaveBeenCalled();
    expect(mockCore.warning).not.toHaveBeenCalled();
  });

  it('should handle no releases found', async () => {
    mockGithub.paginate.mockResolvedValue([]);

    await releases({ github: mockGithub, owner, repo, core: mockCore });

    expect(mockCore.info).toHaveBeenCalledWith(`Encontradas 0 releases`);
    expect(mockGithub.rest.repos.deleteRelease).not.toHaveBeenCalled();
    expect(mockCore.endGroup).toHaveBeenCalled();
  });

  it('should handle error when fetching releases', async () => {
    const error = new Error('API Error');
    mockGithub.paginate.mockRejectedValue(error);

    await releases({ github: mockGithub, owner, repo, core: mockCore });

    expect(mockCore.warning).toHaveBeenCalledWith(`⚠️ Falha ao processar releases: ${error.message}`);
    expect(mockGithub.rest.repos.deleteRelease).not.toHaveBeenCalled();
    expect(mockCore.endGroup).toHaveBeenCalled();
  });

  it('should continue processing when deleting a specific release fails', async () => {
    const mockReleasesList = [
      { id: 1, tag_name: 'v1.0.0' },
      { id: 2, tag_name: 'v1.0.1' },
    ];
    mockGithub.paginate.mockResolvedValue(mockReleasesList);

    const error = new Error('Delete Error');
    mockGithub.rest.repos.deleteRelease
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(error);

    await releases({ github: mockGithub, owner, repo, core: mockCore });

    expect(mockGithub.rest.repos.deleteRelease).toHaveBeenCalledTimes(2);
    expect(mockCore.error).toHaveBeenCalledWith(`    ❌ Erro ao excluir release 2: ${error.message}`);
    expect(mockCore.warning).not.toHaveBeenCalled();
    expect(mockCore.endGroup).toHaveBeenCalled();
  });
});
