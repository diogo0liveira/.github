const actionsTask = require('../../.github/actions/cleanup-repository/tasks/actions');

describe('Gerenciamento de Actions (actions.js)', () => {
  let github;
  let context;
  let core;
  let owner = 'test-owner';
  let repo = 'test-repo';

  beforeEach(() => {
    github = {
      paginate: jest.fn(),
      rest: {
        actions: {
          listWorkflowRunsForRepo: jest.fn(),
          deleteWorkflowRun: jest.fn(),
        },
      },
    };

    context = {
      runId: 100, // current run ID
    };

    core = {
      startGroup: jest.fn(),
      endGroup: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deve não excluir nenhuma execução se apenas a execução atual for encontrada', async () => {
    github.paginate.mockResolvedValue([
      { id: 100, name: 'Current Run' }
    ]);

    await actionsTask({ github, owner, repo, context, core });

    expect(core.startGroup).toHaveBeenCalledWith('🔄 Gerenciamento de Actions');
    expect(github.paginate).toHaveBeenCalledWith(
      github.rest.actions.listWorkflowRunsForRepo,
      { owner, repo, per_page: 100 }
    );
    expect(core.info).toHaveBeenCalledWith('✨ Nenhuma execução de workflow encontrada para excluir (além da atual).');
    expect(github.rest.actions.deleteWorkflowRun).not.toHaveBeenCalled();
    expect(core.endGroup).toHaveBeenCalled();
  });

  test('deve excluir outras execuções de workflow encontradas', async () => {
    github.paginate.mockResolvedValue([
      { id: 100, name: 'Current Run' },
      { id: 101, name: 'Old Run 1' },
      { id: 102, name: 'Old Run 2' }
    ]);

    await actionsTask({ github, owner, repo, context, core });

    expect(core.info).toHaveBeenCalledWith('🔹 Encontradas 2 execuções de workflow para remover.');
    expect(github.rest.actions.deleteWorkflowRun).toHaveBeenCalledTimes(2);
    expect(github.rest.actions.deleteWorkflowRun).toHaveBeenCalledWith({ owner, repo, run_id: 101 });
    expect(github.rest.actions.deleteWorkflowRun).toHaveBeenCalledWith({ owner, repo, run_id: 102 });
    expect(core.info).toHaveBeenCalledWith('  🗑️ Excluída execução: 101 (Old Run 1)');
    expect(core.info).toHaveBeenCalledWith('  🗑️ Excluída execução: 102 (Old Run 2)');
  });

  test('deve registrar erro se falhar ao excluir uma execução específica', async () => {
    github.paginate.mockResolvedValue([
      { id: 100, name: 'Current Run' },
      { id: 101, name: 'Old Run 1' }
    ]);

    github.rest.actions.deleteWorkflowRun.mockRejectedValue(new Error('Failed to delete'));

    await actionsTask({ github, owner, repo, context, core });

    expect(github.rest.actions.deleteWorkflowRun).toHaveBeenCalledTimes(1);
    expect(core.error).toHaveBeenCalledWith('  ❌ Erro ao excluir execução 101: Failed to delete');
    // Deve continuar apesar do erro para processar os próximos runs ou finalizar
    expect(core.endGroup).toHaveBeenCalled();
  });

  test('deve registrar erro no grupo se falhar ao obter execuções (erro na paginação)', async () => {
    github.paginate.mockRejectedValue(new Error('API error'));

    await actionsTask({ github, owner, repo, context, core });

    expect(core.error).toHaveBeenCalledWith('⚠️ Falha ao processar workflow runs: API error');
    expect(github.rest.actions.deleteWorkflowRun).not.toHaveBeenCalled();
    expect(core.endGroup).toHaveBeenCalled();
  });
});
