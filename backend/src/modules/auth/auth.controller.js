import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export const registrar = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const { rows } = await pool.query(
      `INSERT INTO roles (correo, password)
       VALUES ($1, $2)
       RETURNING id, correo`,
      [correo, passwordHash]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const correo = req.body.correo || req.body.email;
    const { password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

  
    const { rows } = await pool.query('SELECT * FROM roles WHERE correo = $1', [correo]);
    const usuario = rows[0];

    const passwordOk = usuario && (await bcrypt.compare(password, usuario.password));


    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }


    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo }, // payload
      env.JWT_SECRET, // clave secreta del servidor
      { expiresIn: env.JWT_EXPIRES_IN } // vencimiento
    );

 
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

export const usuario = (req, res) => {
  res.json(req.usuario);
};