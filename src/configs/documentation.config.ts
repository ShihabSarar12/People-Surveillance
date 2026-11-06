import { URL } from '../constants/env.constants';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express API with TypeScript',
            version: '1.0.0',
            description:
                'A simple API documentation for Express and TypeScript',
        },
        servers: [
            {
                url: URL,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/controllers/*.ts'],
};

export default swaggerOptions;
