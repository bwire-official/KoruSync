const fs = require('fs');
const path = require('path');

// Paths to the schema files
const sourceSchemaPath = path.join(__dirname, '../backend/KoruSync_dB_Schema.sql');
const migrationsDir = path.join(__dirname, '../supabase/migrations');

// Function to get the latest migration file
function getLatestMigration() {
    const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort()
        .reverse();
    
    return files[0] ? path.join(migrationsDir, files[0]) : null;
}

// Function to update the source schema
function updateSourceSchema() {
    const latestMigration = getLatestMigration();
    if (!latestMigration) {
        console.error('No migration files found!');
        process.exit(1);
    }

    const migrationContent = fs.readFileSync(latestMigration, 'utf8');
    fs.writeFileSync(sourceSchemaPath, migrationContent);
    console.log('Source schema updated successfully!');
}

// Function to create a new migration
function createNewMigration(description) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const filename = `${timestamp}_${description.toLowerCase().replace(/\s+/g, '_')}.sql`;
    const filepath = path.join(migrationsDir, filename);

    // Copy the current source schema as the base
    const sourceContent = fs.readFileSync(sourceSchemaPath, 'utf8');
    fs.writeFileSync(filepath, sourceContent);
    console.log(`New migration file created: ${filename}`);
}

// Main function
function main() {
    const command = process.argv[2];
    const description = process.argv[3];

    switch (command) {
        case 'update-source':
            updateSourceSchema();
            break;
        case 'new-migration':
            if (!description) {
                console.error('Please provide a description for the new migration');
                process.exit(1);
            }
            createNewMigration(description);
            break;
        default:
            console.log(`
Usage:
  node sync-schema.js update-source    - Update the source schema from latest migration
  node sync-schema.js new-migration "description" - Create a new migration file
            `);
    }
}

main(); 