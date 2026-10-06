const actionsTask = require('../../.github/actions/cleanup-repository/tasks/actions');

describe('cleanup-repository actions task', () => {
  let github;
  let context;
  let core;
  let owner;
  let repo;

  beforeEach(() => {
    owner = 'test-owner';
    repo = 'test-repo';

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
      runId: 12345,
    };

    core = {
      startGroup: jest.fn(),
      endGroup: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
  });

  it('should delete workflow runs except the current run', async () => {
    const runs = [
      { id: 11111, name: 'Run 1' },
      { id: 12345, name: 'Current Run' }, // should not be deleted
      { id: 22222 }, // missing name, should handle 'N/A'
    ];

    github.paginate.mockResolvedValue(runs);
    github.rest.actions.deleteWorkflowRun.mockResolvedValue({});

    await actionsTask({ github, owner, repo, context, core });

    expect(core.startGroup).toHaveBeenCalledWith('🔄 Gerenciamento de Actions');
    expect(github.paginate).toHaveBeenCalledWith(github.rest.actions.listWorkflowRunsForRepo, {
      owner,
      repo,
      per_page: 100,
    });

    expect(core.info).toHaveBeenCalledWith('🔹 Encontradas 2 execuções de workflow para remover.');
    expect(github.rest.actions.deleteWorkflowRun).toHaveBeenCalledTimes(2);
    expect(github.rest.actions.deleteWorkflowRun).toHaveBeenCalledWith({
      owner,
      repo,
      run_id: 11111,
    });
    expect(github.rest.actions.deleteWorkflowRun).toHaveBeenCalledWith({
      owner,
      repo,
      run_id: 22222,
    });

    expect(core.info).toHaveBeenCalledWith('  🗑️ Excluída execução: 11111 (Run 1)');
    expect(core.info).toHaveBeenCalledWith('  🗑️ Excluída execução: 22222 (N/A)');
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should do nothing if there are no workflow runs to delete', async () => {
    const runs = [
      { id: 12345, name: 'Current Run' }
    ];

    github.paginate.mockResolvedValue(runs);

    await actionsTask({ github, owner, repo, context, core });

    expect(github.rest.actions.deleteWorkflowRun).not.toHaveBeenCalled();
    expect(core.info).toHaveBeenCalledWith('✨ Nenhuma execução de workflow encontrada para excluir (além da atual).');
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should continue deleting even if one deletion fails', async () => {
    const runs = [
      { id: 11111, name: 'Run 1' },
      { id: 22222, name: 'Run 2' },
    ];

    github.paginate.mockResolvedValue(runs);

    github.rest.actions.deleteWorkflowRun
      .mockRejectedValueOnce(new Error('Delete failed'))
      .mockResolvedValueOnce({});

    await actionsTask({ github, owner, repo, context, core });

    expect(github.rest.actions.deleteWorkflowRun).toHaveBeenCalledTimes(2);
    expect(core.error).toHaveBeenCalledWith('  ❌ Erro ao excluir execução 11111: Delete failed');
    expect(core.info).toHaveBeenCalledWith('  🗑️ Excluída execução: 22222 (Run 2)');
    expect(core.endGroup).toHaveBeenCalled();
  });

  it('should handle pagination failures', async () => {
    github.paginate.mockRejectedValue(new Error('Pagination failed'));

    await actionsTask({ github, owner, repo, context, core });

    expect(core.error).toHaveBeenCalledWith('⚠️ Falha ao processar workflow runs: Pagination failed');
    expect(github.rest.actions.deleteWorkflowRun).not.toHaveBeenCalled();
    expect(core.endGroup).toHaveBeenCalled();
  });
});
