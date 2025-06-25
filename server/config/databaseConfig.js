// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';
// dotenv.config();
// const dbconfig = {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT || 3306,
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD  ,
//     database: process.env.DB_NAME || 'evangadi-db',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// }

// // Creating connection pool
// const pool = mysql.createPool(dbconfig);

// export default pool;

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let dbconfig;

// Railway provides MYSQL_URL
if (process.env.MYSQL_URL) {
    console.log('🚀 Using Railway MySQL URL');
    
    // Parse the MySQL URL
    const url = new URL(process.env.MYSQL_URL);
    
    dbconfig = {
        host: url.hostname,
        port: url.port || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading slash
        ssl: {
            rejectUnauthorized: false // Railway requires SSL
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    };
} else {
    // Fallback for local development
    console.log('🔧 Using individual database variables');
    dbconfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'evangadi-db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    };
}

console.log('🔧 Database config:', {
    host: dbconfig.host,
    port: dbconfig.port,
    user: dbconfig.user,
    database: dbconfig.database,
    ssl: !!dbconfig.ssl
});

// Creating connection pool
const pool = mysql.createPool(dbconfig);
export default pool;