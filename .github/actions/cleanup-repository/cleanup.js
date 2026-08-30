const cleanPackages = require('./tasks/packages');
const cleanReleases = require('./tasks/releases');
const cleanBranches = require('./tasks/branches');
const cleanActions = require('./tasks/actions');
const cleanTags = require('./tasks/tags');

module.exports = async ({ github, context, core, flags = {} }) => {
  const owner = context.repo.owner;
  const repo = context.repo.repo;

  core.info(`🚀 Iniciando limpeza: ${owner}/${repo}`);
  core.info(`🛠️  Modo: EXECUTAR (excluindo)\n`);

  const tools = { github, owner, repo, context, core };

  // Execução condicional das tarefas de limpeza
  const isEnabled = (flag) => flag !== false && flag !== 'false';

  if (isEnabled(flags.actions)) await cleanActions(tools);
  if (isEnabled(flags.packages)) await cleanPackages(tools);
  if (isEnabled(flags.releases)) await cleanReleases(tools);
  if (isEnabled(flags.branches)) await cleanBranches(tools);
  if (isEnabled(flags.tags)) await cleanTags(tools);

  core.info('\n✨ Processo de limpeza concluído com sucesso.');
};
