import { pool } from '../../config/db.js';
import * as authService from './auth.service.js';

export const registrar = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    
    const rows = await authService.registro(correo, password);
    
    res.status(201).json(rows);
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