import pkg from 'pg';
const { Pool } = pkg;

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'eliabel',       // Nombre de usuario de PostgreSQL
    host: 'localhost',        // Dirección del servidor (si es local, usa 'localhost')
    database: 'InfraMap',  // Nombre de tu base de datos
    password: '', // Contraseña del usuario de PostgreSQL
    port: 5432,               // Puerto por defecto de PostgreSQL
});

// Ruta para obtener los problemas de un edificio específico
app.get('/api/edificios/:letra', async (req, res) => {
  const letraEdificio = req.params.letra;
  console.log(`Consultando problemas para el edificio: ${letraEdificio}`);

  try {
    const result = await pool.query(`
      SELECT nivel, tipoEspacio, nombreEspacio, tipoProblema 
      FROM reportes 
      WHERE edificio = $1
    `, [letraEdificio]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al realizar la consulta a la base de datos:', err);
    res.status(500).send('Error en la consulta a la base de datos');
  }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});