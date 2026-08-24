const { pool, runMigrationAndSeed } = require('./migrate_seed');

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  runMigrationAndSeed
};
