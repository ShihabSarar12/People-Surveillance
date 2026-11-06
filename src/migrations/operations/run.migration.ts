import migration from '../index.migration';

(async () => {
    await migration.up();
    process.exit(0);
})();
