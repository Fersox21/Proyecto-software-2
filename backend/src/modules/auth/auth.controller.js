import { pool } from '../../config/db.js';
import * as authService from './auth.service.js';

export const registrar = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const { rows } = await pool.query(
      `INSERT INTO roles (correo, contraseña)
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
    
    const token = await authService.login(correo, password);
    
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

export const usuario = (req, res) => {
  res.json(req.usuario);
};