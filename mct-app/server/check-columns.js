const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'mct.db'));

// Get actual column names from the table
db.all("SELECT * FROM program_modules LIMIT 0", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    const columns = Object.keys(rows[0] || {});
    if (columns.length === 0) {
      // Try another way
      db.all("PRAGMA table_info(program_modules)", (err, info) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Actual columns in program_modules:');
          info.forEach(col => {
            console.log(`  - ${col.name}`);
          });
        }
        db.close();
      });
    } else {
      console.log('Columns:', columns);
      db.close();
    }
  }
});