// Configuracion del linter. Este es nuestro QA Gate.
// Las reglas estan explicadas en la seccion 4.3 del Documento SQA.

module.exports = [
  {
    ignores: ['node_modules/**']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Cosas del navegador
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        // Cosas de Node, para las pruebas
        module: 'writable',
        require: 'readonly',
        console: 'readonly',
        // Funciones nuestras que se comparten entre archivos
        MONTO_MINIMO: 'readonly',
        PRODUCTOS: 'readonly',
        validarCantidad: 'readonly',
        validarDisponible: 'readonly',
        calcularTotal: 'readonly',
        puedeEnviarse: 'readonly',
        generarNumeroPedido: 'readonly',
        obtenerSesion: 'readonly',
        exigirSesion: 'readonly',
        cerrarSesion: 'readonly',
        obtenerPedido: 'readonly',
        guardarPedido: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      eqeqeq: 'error',
      'no-console': 'error',
      'no-var': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2]
    }
  }
];
