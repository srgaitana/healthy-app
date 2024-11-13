import mysql from 'mysql2';

// Usar variables de entorno para la conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,  
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error en la conexión a la base de datos:', err);
  } else {
    console.log('Conexión a la base de datos exitosa');
    connection.release();  // Liberar la conexión una vez que haya sido probada
  }
});

export default pool;
