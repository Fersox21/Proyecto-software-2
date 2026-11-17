import * as authService from './auth.service.js';

export const crearAuthController = (service = authService) => {
  const registrar = async (req, res, next) => {
    try {
      const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
      const { correo, password, rol } = body;

      const nuevoUsuario = await service.registro(correo, password, rol);
      res.status(201).json(nuevoUsuario);
    } catch (err) {
      next(err);
    }
  };

  const login = async (req, res, next) => {
    try {
      const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
      const correo = body.correo !== undefined ? body.correo : body.email;
      const { password } = body;

      const resultado = await service.login(correo, password);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  };

  const usuario = (req, res) => {
    res.json(req.usuario);
  };

  return { registrar, login, usuario };
};

const defaultController = crearAuthController();

export const registrar = defaultController.registrar;
export const login = defaultController.login;
export const usuario = defaultController.usuario;