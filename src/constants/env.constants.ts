import dotenv from 'dotenv';

dotenv.config();

const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DB,
    NODE_ENV,
    PORT,
    URL,
    API_URL,
    PRIVATE_KEY,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CONTRACT_ADDRESS,
    ACCOUNT_PRIVATE_KEY,
} = process.env;

export {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DB,
    NODE_ENV,
    PORT,
    URL,
    API_URL,
    PRIVATE_KEY,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CONTRACT_ADDRESS,
    ACCOUNT_PRIVATE_KEY,
};
