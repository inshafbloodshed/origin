const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: false,
        connectTimeout: 30000,
        requestTimeout: 30000
    },
    pool: {
        max: 1,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

async function getConnection() {
    try {
        if (pool && pool.connected) {
            return pool;
        }
        
        pool = await sql.connect(dbConfig);
        console.log('✅ Database connected successfully');
        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
}

async function testConnection() {
    try {
        const connection = await getConnection();
        const result = await connection.request().query('SELECT 1 as test');
        return result.recordset.length > 0;
    } catch (error) {
        console.error('Database test failed:', error.message);
        return false;
    }
}

module.exports = {
    getConnection,
    testConnection,
    sql
};