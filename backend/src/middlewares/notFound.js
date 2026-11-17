export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: 'Ruta no encontrada',
    statusCode: 404
  });
};
