const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'mct.db'));

// Check table structure
db.all("PRAGMA table_info(program_modules)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('program_modules table structure:');
    rows.forEach(row => {
      console.log(`  ${row.name} (${row.type})`);
    });
  }

  // Also check if there's data
  db.get("SELECT COUNT(*) as count FROM program_modules", (err, row) => {
    if (err) {
      console.error('Error counting:', err);
    } else {
      console.log(`\nNumber of modules: ${row.count}`);
    }

    // Show first row
    db.get("SELECT * FROM program_modules LIMIT 1", (err, row) => {
      if (err) {
        console.error('Error fetching:', err);
      } else {
        console.log('\nFirst module:');
        console.log(row);
      }
      db.close();
    });
  });
});