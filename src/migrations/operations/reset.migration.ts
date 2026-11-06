import migration from '../index.migration';

(async () => {
    await migration.down();
    await migration.up();
    process.exit(0);
})();
