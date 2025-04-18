import { seedDatabase } from '../lib/seed-data';

// Execute the seeding function
console.log('Starting database seeding script...');
seedDatabase()
  .then(() => {
    console.log('Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }); 