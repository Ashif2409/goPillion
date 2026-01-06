const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const otpRoute = path.join(__dirname, '..', 'auth-service', 'src', 'routes', 'otp.route.ts');
const swaggerFile = path.join(__dirname, '..', 'auth-service', 'src', 'swagger', 'swagger.ts');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' },
  },
  apis: [otpRoute, swaggerFile],
};

const spec = swaggerJsdoc(options);
console.log('Paths found:', Object.keys(spec.paths || {}).length);
console.log(JSON.stringify(spec.paths, null, 2));
