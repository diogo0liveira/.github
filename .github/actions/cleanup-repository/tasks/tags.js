module.exports = async ({ github, owner, repo, core }) => {
  core.startGroup('🏷️ Gerenciamento de Tags (Git Refs)');
  try {
    const refs = await github.paginate(github.rest.git.listMatchingRefs, {
      owner,
      repo,
      ref: 'tags/',
      per_page: 100,
    });
    core.info(`Encontradas ${refs.length} refs de tags`);

    for (const ref of refs) {
      const tagRef = ref.ref.replace(/^refs\//, '');
      core.info(`  🗑️ Excluindo Ref: ${tagRef}`);
      try {
        await github.rest.git.deleteRef({
          owner,
          repo,
          ref: tagRef,
        });
        core.info(`    ✅ Sucesso`);
      } catch (err) {
        core.error(`    ❌ Erro ao excluir ref ${tagRef}: ${err.message}`);
      }
    }
  } catch (err) {
    if (err.status !== 404) {
      core.warning(`⚠️ Problema ao processar tags: ${err.message}`);
    } else {
      core.info('ℹ️ Nenhuma tag encontrada para este repositório.');
    }
  }
  core.endGroup();
};
