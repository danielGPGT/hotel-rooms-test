import { seedDatabase } from './seedDatabase'

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('✅ Seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
