import { setupDatabase } from './setup-database.js';

setupDatabase()
  .then(() => {
    console.log('\n🎉 Setup complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Setup failed:', err);
    process.exit(1);
  });
