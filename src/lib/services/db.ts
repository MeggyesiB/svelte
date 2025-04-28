import Database from 'better-sqlite3';
import { DATABASE_PATH } from '$env/static/private';

let dbInstance: Database.Database | null = null;

function initializeSchema(db: Database.Database) {
	console.log('Initializing database schema...');

	db.transaction(() => {
		db.exec(`
		    CREATE TABLE IF NOT EXISTS categories (
		        id INTEGER PRIMARY KEY AUTOINCREMENT,
		        name TEXT NOT NULL UNIQUE,
		        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		    );
		`);

		db.exec(`
		    CREATE TABLE IF NOT EXISTS transactions (
		        id INTEGER PRIMARY KEY AUTOINCREMENT,
		        description TEXT NOT NULL,
		        amount REAL NOT NULL,
		        date TEXT NOT NULL, 
		        category_id INTEGER,
		        currency TEXT DEFAULT 'HUF',
		        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
		    );
		`);

		console.log('Base tables created (if not existed).');

		try {
			const stmt = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
			stmt.run('Élelmiszer');
			stmt.run('Rezsi');
			stmt.run('Szórakozás');
			stmt.run('Utazás');
			stmt.run('Egyéb');
			console.log('Default categories inserted (if not exist).');
		} catch (error) {
			console.error("Error inserting default categories:", error);
		}

	})();

	console.log('Database schema initialized successfully.');
}

function getDb(): Database.Database {
	if (!dbInstance) {
		console.log(`Connecting to database at: ${DATABASE_PATH}`);
		try {
			dbInstance = new Database(DATABASE_PATH); 
			initializeSchema(dbInstance);
		} catch (error) {
			console.error("Failed to connect to the database:", error);
			throw new Error('Database connection failed');
		}
	}
	return dbInstance;
}


export const db = getDb(); 