import pool from "../config/databaseConfig.js";
import { users, questions, answers, profiles, password_history } from '../schema/tables.js';

const createTableIfNotExists = async (tableName, createStatement) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
            [process.env.DB_NAME || 'evangadi-db', tableName]
        );
        
        if (rows.length === 0) {
            await connection.query(createStatement);
    
        } else {
            console.info(`✅ Table ${tableName} already exists, skipping creation.`);
        }
        
        connection.release();
    } catch (err) {
        console.error(`❌ Error checking/creating table ${tableName}:`, err.message);
        throw err;
    }
};

// Checking and add missing columns to existing users table
const updateUsersTableForPasswordReset = async () => {
    try {
        const connection = await pool.getConnection();
        
        // Check if reset columns exist
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
        `, [process.env.DB_NAME || 'evangadi-db']);
        
        const columnNames = columns.map(col => col.COLUMN_NAME);
        
        //missing columns
        if (!columnNames.includes('reset_token')) {
            await connection.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL');
            
        }
        
        if (!columnNames.includes('reset_token_expires')) {
            await connection.query('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME DEFAULT NULL');
           
        }
        
        if (!columnNames.includes('last_password_reset')) {
            await connection.query('ALTER TABLE users ADD COLUMN last_password_reset DATETIME DEFAULT NULL');
            
        }
        
        // Added indexes if they don't exist
        try {
            await connection.query('CREATE INDEX idx_reset_token ON users(reset_token)');
          
        } catch (err) {
            if (!err.message.includes('Duplicate key name')) {
                
            }
        }
        
        try {
            await connection.query('CREATE INDEX idx_reset_expires ON users(reset_token_expires)');
            
        } catch (err) {
            if (!err.message.includes('Duplicate key name')) {
                
            }
        }
        
        connection.release();
    } catch (err) {
        console.error('Error updating users table:', err.message);
        throw err;
    }
};

export const createAllTables = async () => {
    try {
        
        // Create tables in correct order (users first, then dependent tables)
        await createTableIfNotExists('users', users);
        await createTableIfNotExists('profiles', profiles);
        await createTableIfNotExists('questions', questions);
        await createTableIfNotExists('answers', answers);
        await createTableIfNotExists('password_history', password_history);
        
        // existing users table for password reset
        await updateUsersTableForPasswordReset();
    
        
    } catch (err) {
        console.error("❌ Error initializing tables:", err.message);
        throw err;
    }
};