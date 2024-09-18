// db.js
const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'eliabel',       // Nombre de usuario de PostgreSQL
  host: 'localhost',        // Dirección del servidor (si es local, usa 'localhost')
  database: 'InfraMap',  // Nombre de tu base de datos
  password: '', // Contraseña del usuario de PostgreSQL
  port: 5432,               // Puerto por defecto de PostgreSQL
});

// Exportar el pool de conexiones para usarlo en otros archivos
module.exports = pool;