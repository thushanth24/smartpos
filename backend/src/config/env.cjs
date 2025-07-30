require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const Joi = require('joi');

// Define environment variables schema
const envVarsSchema = Joi.object()
  .keys({
    // Server Configuration
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
    PORT: Joi.number().default(5000),
    HOST: Joi.string().default('0.0.0.0'),

    // Database Configuration
    DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] })
      .when('DB_HOST', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().default(5432),
    DB_NAME: Joi.string().default('smartpos'),
    DB_USER: Joi.string().default('postgres'),
    DB_PASSWORD: Joi.string().default('postgres'),
    DB_SSL: Joi.boolean().default(false),
  })
  .unknown();

// Validate environment variables
const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env, { allowUnknown: true, stripUnknown: true });

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export configuration
const config = {
  env: envVars.NODE_ENV,
  port: parseInt(envVars.PORT, 10),
  host: envVars.HOST,
  db: {
    url: envVars.DATABASE_URL || null,
    host: envVars.DB_HOST,
    port: parseInt(envVars.DB_PORT, 10),
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    ssl: envVars.DB_SSL,
  },
};

module.exports = config;
