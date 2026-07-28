const joi = require('joi');

const envSchema = joi.object({
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  PORT: joi.number().default(8080),
  
  DATABASE_URL: joi.string().optional().description('PostgreSQL connection string'),
  DB_USER: joi.string().when('DATABASE_URL', { is: joi.exist(), then: joi.optional(), otherwise: joi.required() }),
  DB_PASSWORD: joi.string().allow('').when('DATABASE_URL', { is: joi.exist(), then: joi.optional(), otherwise: joi.required() }),
  DB_HOST: joi.string().when('DATABASE_URL', { is: joi.exist(), then: joi.optional(), otherwise: joi.required() }),
  DB_PORT: joi.number().default(5432),
  DB_NAME: joi.string().when('DATABASE_URL', { is: joi.exist(), then: joi.optional(), otherwise: joi.required() }),

  JWT_SECRET: joi.string().required().description('JWT Secret Key'),
  JWT_EXPIRES_IN: joi.string().default('1d'),
  'GEMINI-API': joi.string().optional(),
}).unknown(true);

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    url: envVars.DATABASE_URL,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  geminiApiKey: envVars['GEMINI-API'],
};
