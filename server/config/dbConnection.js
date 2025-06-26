// config/dbConnection.js - Universal Database Adapter
import mysqlPool from './databaseConfig.js';  // Your existing MySQL config
import dotenv from 'dotenv';
dotenv.config();

const DB_TYPE = process.env.DB_TYPE || 'mysql'; // 'mysql' or 'postgres'

// Create PostgreSQL pool
let postgresPool = null;
if (DB_TYPE === 'postgres') {
    const pkg = await import('pg');
    const { Pool } = pkg.default;
    
    const postgresConfig = {
        host: process.env.POSTGRES_HOST || process.env.DB_HOST,
        port: process.env.POSTGRES_PORT || 5432,
        user: process.env.POSTGRES_USER || process.env.DB_USER,
        password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD,
        database: process.env.POSTGRES_DB || process.env.DB_NAME,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };
    
    postgresPool = new Pool(postgresConfig);
    
    postgresPool.on('connect', () => {
        console.log('✅ Connected to PostgreSQL database');
    });
    
    postgresPool.on('error', (err) => {
        console.error('❌ PostgreSQL connection error:', err);
    });
}

class DatabaseAdapter {
    constructor(pool, type) {
        this.pool = pool;
        this.type = type;
    }

    // Convert MySQL SQL to PostgreSQL automatically
    convertSQL(sql) {
        if (this.type !== 'postgres') return sql;

        let convertedSQL = sql;
        let paramIndex = 1;

        // Convert ? to $1, $2, etc.
        while (convertedSQL.includes('?')) {
            convertedSQL = convertedSQL.replace('?', `$${paramIndex}`);
            paramIndex++;
        }

        // Convert MySQL-specific syntax to PostgreSQL
        convertedSQL = convertedSQL
            .replace(/LIKE/gi, 'ILIKE')  // Case-insensitive search
            .replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP')
            .replace(/DATETIME/gi, 'TIMESTAMP');

        return convertedSQL;
    }

    async query(sql, params = []) {
        try {
            if (this.type === 'mysql') {
                const [rows] = await this.pool.execute(sql, params);
                return { 
                    rows, 
                    type: 'mysql',
                    insertId: rows.insertId || null,
                    affectedRows: rows.affectedRows || 0
                };
            } else {
                const convertedSQL = this.convertSQL(sql);
                const result = await this.pool.query(convertedSQL, params);
                
                return { 
                    rows: result.rows, 
                    type: 'postgres',
                    insertId: null,
                    affectedRows: result.rowCount || 0
                };
            }
        } catch (error) {
            console.error(`${this.type.toUpperCase()} Query Error:`, error);
            console.error('Original SQL:', sql);
            if (this.type === 'postgres') {
                console.error('Converted SQL:', this.convertSQL(sql));
            }
            throw error;
        }
    }

    // Helper for INSERT operations that need the ID
    async insertAndGetId(sql, params = [], idColumn = 'id') {
        if (this.type === 'mysql') {
            const result = await this.query(sql, params);
            return result.insertId;
        } else {
            // Auto-add RETURNING clause for PostgreSQL
            let returningSQL = sql;
            if (!sql.toUpperCase().includes('RETURNING')) {
                returningSQL = `${sql} RETURNING ${idColumn}`;
            }
            
            const result = await this.query(returningSQL, params);
            return result.rows[0] ? result.rows[0][idColumn] : null;
        }
    }

    // Get connection (handles both database types)
    async getConnection() {
        if (this.type === 'postgres') {
            return await this.pool.connect();
        } else {
            return await this.pool.getConnection();
        }
    }

    // Release connection
    async releaseConnection(connection) {
        if (this.type === 'postgres') {
            connection.release();
        } else {
            connection.release();
        }
    }

    // Transaction support
    async transaction(callback) {
        const connection = await this.getConnection();
        
        try {
            if (this.type === 'mysql') {
                await connection.beginTransaction();
                const result = await callback(this.createConnectionAdapter(connection));
                await connection.commit();
                return result;
            } else {
                await connection.query('BEGIN');
                const result = await callback(this.createConnectionAdapter(connection));
                await connection.query('COMMIT');
                return result;
            }
        } catch (error) {
            if (this.type === 'mysql') {
                await connection.rollback();
            } else {
                await connection.query('ROLLBACK');
            }
            throw error;
        } finally {
            this.releaseConnection(connection);
        }
    }

    // Create adapter for individual connections (used in transactions)
    createConnectionAdapter(connection) {
        return {
            query: async (sql, params = []) => {
                if (this.type === 'mysql') {
                    const [rows] = await connection.execute(sql, params);
                    return { rows, insertId: rows.insertId };
                } else {
                    const convertedSQL = this.convertSQL(sql);
                    const result = await connection.query(convertedSQL, params);
                    return { rows: result.rows };
                }
            },
            insertAndGetId: async (sql, params = [], idColumn = 'id') => {
                if (this.type === 'mysql') {
                    const [rows] = await connection.execute(sql, params);
                    return rows.insertId;
                } else {
                    let returningSQL = sql;
                    if (!sql.toUpperCase().includes('RETURNING')) {
                        returningSQL = `${sql} RETURNING ${idColumn}`;
                    }
                    const convertedSQL = this.convertSQL(returningSQL);
                    const result = await connection.query(convertedSQL, params);
                    return result.rows[0] ? result.rows[0][idColumn] : null;
                }
            }
        };
    }
}

// Export the selected database connection
let db;
if (DB_TYPE === 'postgres') {
    db = new DatabaseAdapter(postgresPool, 'postgres');
    console.log('🐘 Using PostgreSQL database');
} else {
    db = new DatabaseAdapter(mysqlPool, 'mysql');
    console.log('🐬 Using MySQL database');
}

export default db;