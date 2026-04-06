const sql = require('mssql');

// Database configuration
const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Inshaf22.',
    server: process.env.DB_SERVER || 'DESKTOP-86QTNGL',
    database: process.env.DB_NAME || 'LuxeLanka',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

let pool = null;

// Get database connection
async function getConnection() {
    try {
        if (pool && pool.connected) {
            return pool;
        }
        
        console.log(`📡 Connecting to SQL Server at ${config.server}...`);
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server successfully');
        console.log(`📊 Using database: ${config.database}`);
        return pool;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        throw error;
    }
}

// Test connection
async function testConnection() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT @@VERSION as version');
        console.log('✅ Connection test successful');
        return true;
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
}

module.exports = { getConnection, sql, testConnection };