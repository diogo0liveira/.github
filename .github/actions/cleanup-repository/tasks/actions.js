module.exports = async ({ github, owner, repo, context, core }) => {
  core.startGroup('🔄 Gerenciamento de Actions');
  try {
    const runs = await github.paginate(github.rest.actions.listWorkflowRunsForRepo, {
      owner,
      repo,
      per_page: 100,
    });

    const currentRunId = context.runId;
    const toDelete = runs.filter(run => run.id !== currentRunId);

    if (toDelete.length === 0) {
      core.info('✨ Nenhuma execução de workflow encontrada para excluir (além da atual).');
    } else {
      core.info(`🔹 Encontradas ${toDelete.length} execuções de workflow para remover.`);
      for (const run of toDelete) {
        try {
          await github.rest.actions.deleteWorkflowRun({
            owner,
            repo,
            run_id: run.id,
          });
          core.info(`  🗑️ Excluída execução: ${run.id} (${run.name || 'N/A'})`);
        } catch (err) {
          core.error(`  ❌ Erro ao excluir execução ${run.id}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    core.error(`⚠️ Falha ao processar workflow runs: ${err.message}`);
  }
  core.endGroup();
};
