const manageBranches = require('./branches');

describe('Gerenciamento de Branches (branches.js)', () => {
  let github;
  let core;
  let mockGetRepo;
  let mockListBranches;
  let mockDeleteRef;
  let mockPaginate;
  let mockInfo;
  let mockError;
  let mockWarning;
  let mockStartGroup;
  let mockEndGroup;

  const owner = 'test-owner';
  const repo = 'test-repo';

  beforeEach(() => {
    mockGetRepo = jest.fn();
    mockListBranches = jest.fn();
    mockDeleteRef = jest.fn();
    mockPaginate = jest.fn();

    github = {
      rest: {
        repos: {
          get: mockGetRepo,
          listBranches: mockListBranches,
        },
        git: {
          deleteRef: mockDeleteRef,
        },
      },
      paginate: mockPaginate,
    };

    mockInfo = jest.fn();
    mockError = jest.fn();
    mockWarning = jest.fn();
    mockStartGroup = jest.fn();
    mockEndGroup = jest.fn();

    core = {
      info: mockInfo,
      error: mockError,
      warning: mockWarning,
      startGroup: mockStartGroup,
      endGroup: mockEndGroup,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve manter a branch padrão e excluir as outras branches', async () => {
    const defaultBranch = 'main';
    mockGetRepo.mockResolvedValue({ data: { default_branch: defaultBranch } });

    const branches = [
      { name: 'main' },
      { name: 'feature/test-1' },
      { name: 'bugfix/test-2' },
    ];
    mockPaginate.mockResolvedValue(branches);

    await manageBranches({ github, owner, repo, core });

    expect(mockStartGroup).toHaveBeenCalledWith('🌿 Gerenciamento de Branches');
    expect(mockGetRepo).toHaveBeenCalledWith({ owner, repo });
    expect(mockInfo).toHaveBeenCalledWith(`Branch padrão identificada: ${defaultBranch}`);
    expect(mockPaginate).toHaveBeenCalledWith(mockListBranches, { owner, repo, per_page: 100 });
    expect(mockInfo).toHaveBeenCalledWith(`Encontradas ${branches.length} branches`);

    // Verifica se informou que manteve a branch padrão
    expect(mockInfo).toHaveBeenCalledWith(`  ℹ️ Mantendo branch padrão: main`);

    // Verifica exclusões
    expect(mockInfo).toHaveBeenCalledWith(`  🗑️ Excluindo branch: feature/test-1`);
    expect(mockInfo).toHaveBeenCalledWith(`  🗑️ Excluindo branch: bugfix/test-2`);

    expect(mockDeleteRef).toHaveBeenCalledTimes(2);
    expect(mockDeleteRef).toHaveBeenCalledWith({ owner, repo, ref: 'heads/feature/test-1' });
    expect(mockDeleteRef).toHaveBeenCalledWith({ owner, repo, ref: 'heads/bugfix/test-2' });

    expect(mockInfo).toHaveBeenCalledWith(`    ✅ Sucesso`);
    expect(mockEndGroup).toHaveBeenCalled();
  });

  it('deve lidar com erros ao excluir uma branch específica e continuar', async () => {
    const defaultBranch = 'main';
    mockGetRepo.mockResolvedValue({ data: { default_branch: defaultBranch } });

    const branches = [
      { name: 'main' },
      { name: 'feature/failing-branch' },
      { name: 'feature/success-branch' },
    ];
    mockPaginate.mockResolvedValue(branches);

    const errorMessage = 'API rate limit exceeded';
    mockDeleteRef
      .mockRejectedValueOnce(new Error(errorMessage)) // Falha na primeira branch
      .mockResolvedValueOnce({}); // Sucesso na segunda

    await manageBranches({ github, owner, repo, core });

    expect(mockDeleteRef).toHaveBeenCalledTimes(2);
    expect(mockError).toHaveBeenCalledWith(`    ❌ Erro ao excluir branch feature/failing-branch: ${errorMessage}`);
    expect(mockInfo).toHaveBeenCalledWith(`    ✅ Sucesso`); // Apenas uma vez para a branch com sucesso
    expect(mockEndGroup).toHaveBeenCalled();
  });

  it('deve lidar com erro geral (ex: ao buscar o repositório)', async () => {
    const errorMessage = 'Repository not found';
    mockGetRepo.mockRejectedValue(new Error(errorMessage));

    await manageBranches({ github, owner, repo, core });

    expect(mockStartGroup).toHaveBeenCalledWith('🌿 Gerenciamento de Branches');
    expect(mockWarning).toHaveBeenCalledWith(`⚠️ Falha ao processar branches: ${errorMessage}`);
    expect(mockPaginate).not.toHaveBeenCalled();
    expect(mockDeleteRef).not.toHaveBeenCalled();
    expect(mockEndGroup).toHaveBeenCalled();
  });
});
