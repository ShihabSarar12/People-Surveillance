import migration from '../index.migration';

(async () => {
    await migration.down();
    process.exit(0);
})();
