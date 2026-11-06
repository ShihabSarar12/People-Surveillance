import migration from '../index.migration';

(async () => {
    await migration.status();
    process.exit(0);
})();
