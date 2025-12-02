/**
 * Script untuk update semua user yang statusnya 'pending' menjadi 'accepted'
 * Run: node scripts/update-pending-users.js
 */

const fs = require('fs').promises;
const path = require('path');

const customersPath = path.join(__dirname, '..', 'data', 'customers.json');
const petanisPath = path.join(__dirname, '..', 'data', 'petanis.json');

async function updatePendingUsers() {
  try {
    console.log('='.repeat(70));
    console.log('Updating pending users to accepted...');
    console.log('='.repeat(70));
    
    // Update customers
    const customers = JSON.parse(await fs.readFile(customersPath, 'utf8'));
    let customerUpdated = 0;
    
    customers.forEach(customer => {
      if (customer.status === 'pending') {
        customer.status = 'accepted';
        customerUpdated++;
        console.log(`✅ Updated customer: ${customer.email} (${customer.name})`);
      }
    });
    
    if (customerUpdated > 0) {
      await fs.writeFile(customersPath, JSON.stringify(customers, null, 2), 'utf8');
      console.log(`\n✅ Updated ${customerUpdated} customer(s)`);
    } else {
      console.log('\n✅ No pending customers to update');
    }
    
    // Update petanis
    const petanis = JSON.parse(await fs.readFile(petanisPath, 'utf8'));
    let petaniUpdated = 0;
    
    petanis.forEach(petani => {
      if (petani.status === 'pending') {
        petani.status = 'accepted';
        petaniUpdated++;
        console.log(`✅ Updated petani: ${petani.email} (${petani.name})`);
      }
    });
    
    if (petaniUpdated > 0) {
      await fs.writeFile(petanisPath, JSON.stringify(petanis, null, 2), 'utf8');
      console.log(`\n✅ Updated ${petaniUpdated} petani(s)`);
    } else {
      console.log('\n✅ No pending petanis to update');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`Total updated: ${customerUpdated + petaniUpdated} user(s)`);
    console.log('='.repeat(70));
    console.log('\n✅ All pending users have been updated to accepted!');
    console.log('⚠️  Please restart backend server for changes to take effect.');
    console.log('   Run: npm run dev:backend or npm run dev:all\n');
    
  } catch (error) {
    console.error('❌ Error updating users:', error);
    process.exit(1);
  }
}

updatePendingUsers();

