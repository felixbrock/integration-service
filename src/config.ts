const privateKey = process.env.GITHUB_PRIVATE_KEY;
if(!privateKey) throw new Error('Private key not available');

const appId = process.env.GITHUB_APP_IDENTIFIER ? (process.env.GITHUB_APP_IDENTIFIER, 10): '';
if(!appId) throw new Error('App id not available');

const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
if(!webhookSecret) throw new Error('Webhook secret not available');

const clientId = process.env.GITHUB_APP_CLIENT_ID;
if(!clientId) throw new Error('Client id not available');

const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
if(!clientSecret) throw new Error('Client secret not available');

export const nodeEnv = process.env.NODE_ENV || 'development';
export const defaultPort = 3002;
export const port = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : defaultPort;
export const apiRoot = process.env.API_ROOT || 'api';

const getServiceDiscoveryNamespace = (): string => {
  let namespace = '';

  switch (nodeEnv) {
    case 'test':
      namespace = 'integration-staging';
      break;
    case 'production':
      namespace = 'integration';
      break;
    default:
      break;
  }

  return namespace;
};

export const serviceDiscoveryNamespace = getServiceDiscoveryNamespace();

export interface MongoDbConfig {
  url: string;
  dbName: string;
}

const getMongodbConfig = (): MongoDbConfig => {  
  switch (nodeEnv) {
    case 'development':
      return {
        url: process.env.DATABASE_DEV_URL || '',
        dbName: process.env.DATABASE_DEV_NAME || '',
      };
    case 'test':
      return {
        url: process.env.DATABASE_TEST_URL || '',
        dbName: process.env.DATABASE_TEST_NAME || '',
      };
    case 'production':
      return {
        url: process.env.DATABASE_URL || '',
        dbName: process.env.DATABASE_NAME || '',
      };
    default:
      return {
        url: process.env.DATABASE_DEV_URL || '',
        dbName: process.env.DATABASE_DEV_URL || '',
      };
  }
};

export const appConfig = {
  express: {
    port,
    mode: nodeEnv,
  },
  mongodb: {
    ...getMongodbConfig(),
  },
  snowflake: {
    applicationName: process.env.SNOWFLAKE_APPLICATION_NAME || 'snowflake-connector'
  },
  github: {
    privateKey,
    appId,
    webhookSecret,
    clientId,
    clientSecret
  }
};
