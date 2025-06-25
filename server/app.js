import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import pool from './config/databaseConfig.js';
import { createAllTables } from './controllers/createAllTables.js';
import userRoute from './Routes/userRoute.js';
import questionRoute from './Routes/questionRoute.js';
import answerRoute from './Routes/answerRoute.js';
// import profileRoute from './Routes/profileRoute.js';
import passwordResetRoutes from './Routes/passwordResetRoutes.js';   //password reset routes
// import { cleanupRateLimit } from './utils/passwordResetUtils.js';  //cleanup functions
import { testEmailSetup } from './services/emailService.js';
import { cleanupExpiredTokens } from './controllers/passwordResetController.js';

const app = express();
const port = process.env.PORT || 5500;

// ✅ Middlewares
app.use(cors({
    origin: [
        'https://amanuelwubneh.com',
    'https://forum.amanuelwubneh.com',
    'http://localhost:5000'
    ],
    credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', userRoute); 
app.use('/api/questions', questionRoute);
app.use('/api/answers', answerRoute);
// app.use('/api/profiles', profileRoute);
app.use('/api/auth', passwordResetRoutes);   //route for password reset

// Global 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// ✅ Test DB Connection 
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        
        connection.release(); 
        return true;
    } catch (err) {
        console.error("❌ MySQL error:", err);
        return false;
    }
};

//Test email configuration
const testEmailConfig  = async () => {
    try {
        const result = await testEmailSetup();
        if (result.success) {
            console.info('✅ Email service is configured correctly');
        } else {
            console.warn(' Email service configuration issue:', result.error);
            console.warn(' Password reset emails will not work until this is fixed');
            console.warn(' Check your .env file for EMAIL_* variables');
        }
    } catch (err) {
        console.warn('Email service not configured. Password reset will not work.');
    }
};

// ✅ Start the server
const startServer = async () => {
    
    const isConnected = await testConnection();
    
    if (!isConnected) {
        console.error("❌ Failed to connect to database. Exiting...");
        process.exit(1);
    }

    // Testing email configuration on startup
    await testEmailConfig();

    if (process.env.INIT_DB === 'true') {
        try {
            await createAllTables();
        } catch (err) {
            console.error("❌ Failed to initialize tables. Exiting...");
            process.exit(1);
        }
    }

    //Setting up periodic cleanup (every hour)
    setInterval(() => {
       
        cleanupExpiredTokens();
        // cleanupRateLimit();
    }, 60 * 60 * 1000); // Every hour

    // Start listening 
    const server = app.listen(port, () => {
        console.info(`✨ Server listening on port ${port}`);
        console.info(`✨ API available at: http://localhost:${port}/api`);
    });

    // Handle server startup errors
    server.on('error', (err) => {
        console.error('❌ Server startup error:', err.message);
        process.exit(1);
    });
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.info('\n🔄 Shutting down gracefully...');
    await pool.end();
    console.info('✅ Database connections closed');
    process.exit(0);
});

// Start everything
startServer();