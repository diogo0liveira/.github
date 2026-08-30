module.exports = async ({ github, owner, repo, core }) => {
  core.startGroup('📦 Gerenciamento de Packages');
  const packageTypes = ['container', 'npm', 'maven', 'rubygems', 'nuget'];

  for (const ptype of packageTypes) {
    try {
      const packages = await github.paginate(github.rest.packages.listPackagesForUser, {
        username: owner,
        package_type: ptype,
        per_page: 100,
      });

      if (packages.length > 0) {
        core.info(`🔹 Tipo [${ptype.toUpperCase()}]: ${packages.length} packages encontrados`);
        for (const pkg of packages) {
          core.info(`  🗑️ Excluindo Package: ${pkg.name}`);
          try {
            await github.rest.packages.deletePackageForUser({
              username: owner,
              package_type: ptype,
              package_name: pkg.name,
            });
            core.info(`    ✅ Sucesso`);
          } catch (err) {
            core.error(`    ❌ Erro ao excluir package ${pkg.name}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      if (err.status && err.status !== 404) {
        core.warning(`⚠️ Falha ao processar packages ${ptype}: ${err.message}`);
      }
    }
  }
  core.endGroup();
};
