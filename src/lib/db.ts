import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'localhost',  
  user: 'root', 
  password: 'Laurita12*',
  database: 'HealthyAppDB',
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
