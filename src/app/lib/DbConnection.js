import mysql from 'mysql2/promise'

export async function querys({ query, values = [] }) {

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: 1000,
    });

    try {
        const [results] = await pool.execute(query, values);
        pool.end();
        return results;
    } catch (error) {
        console.log('Error in querys function :', error);
        throw error
    }
}