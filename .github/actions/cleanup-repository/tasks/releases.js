module.exports = async ({ github, owner, repo, core }) => {
  core.startGroup('🎁 Gerenciamento de Releases');
  try {
    const releases = await github.paginate(github.rest.repos.listReleases, {
      owner,
      repo,
      per_page: 100,
    });
    core.info(`Encontradas ${releases.length} releases`);

    for (const r of releases) {
      core.info(`  🗑️ Excluindo Release: ${r.tag_name} (id: ${r.id})`);
      try {
        await github.rest.repos.deleteRelease({
          owner,
          repo,
          release_id: r.id,
        });
        core.info(`    ✅ Sucesso`);
      } catch (err) {
        core.error(`    ❌ Erro ao excluir release ${r.id}: ${err.message}`);
      }
    }
  } catch (err) {
    core.warning(`⚠️ Falha ao processar releases: ${err.message}`);
  }
  core.endGroup();
};
