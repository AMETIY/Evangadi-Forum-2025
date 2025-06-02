import express from 'express';
import cors from 'cors';
import pool from './config/databaseConfig.js';
import { createAllTables } from './controllers/createAllTables.js';
import userRoute from './Routes/userRoute.js';
import questionRoute from './Routes/questionRoute.js';
import answerRoute from './Routes/answerRoute.js'
import profileRoute from './Routes/profileRoute.js'
const app = express();
const port = process.env.PORT || 5500;

// ✅ Middlewares
app.use(cors());
app.use(express.json());


//Route: Test endpoint
app.get('/', (req, res) => {
    res.send('Hey homie Welcom');
})



//API Routes
app.use('/api/auth', userRoute);
app.use('/api/questions', questionRoute);
app.use('/api/answers', answerRoute);
app.use('/api/profiles', profileRoute);


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
    console.log("✅ MySQL connected via pool!");
    connection.release(); 
    return true;
  } catch (err) {
    console.error("❌ MySQL error:", err);  //Logging the Whole Error object for debugging 
    return false;
  }
}


// ✅ Start the server
const startServer = async () => {
    console.log("🔄 Testing database connection...");
    const isConnected = await testConnection();
    
    if (!isConnected) {
        console.error("Failed to connect to database. Exiting...");
        process.exit(1); //Kills the app if database fails
    }

    if (process.env.INIT_DB === 'true') {
    try {
      await createAllTables();
    } catch (err) {
      console.error("Failed to initialize tables. Exiting...");
      process.exit(1);
    }
}

       //Start Listening 
    const server = app.listen(port, () => {
        console.log(`listening on ${port}`);
    });

    // Handle server startup errors
    server.on('error', (err) => {
        console.error('Server startup error:', err.message);
        process.exit(1);
    });
}



//ADDED: Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await pool.end();
    console.log('✅ Database connections closed');
    process.exit(0);
});

// Start everything
startServer();