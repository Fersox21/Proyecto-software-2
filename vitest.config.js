import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const raiz = fileURLToPath(new URL('./node_modules', import.meta.url))

/**
 * Configuración de la suite adversarial de QA.
 *
 * - `environment: 'node'` por defecto: los tests de backend y del servicio
 *   de autenticación del frontend no necesitan DOM.
 * - Los tests de componentes React activan jsdom con el docblock
 *   `// @vitest-environment jsdom`.
 */
export default defineConfig({
  // Una sola copia de React para RTL, el componente y el JSX runtime.
  resolve: {
    alias: {
      react: `${raiz}/react`,
      'react-dom': `${raiz}/react-dom`,
    },
  },
  esbuild: { jsx: 'automatic' },
  test: {
    include: [
      'backend/tests/**/*.test.{js,jsx}',
      'frontend/tests/**/*.test.{js,jsx}',
    ],
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})
