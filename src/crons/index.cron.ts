import cron from 'node-cron';
import test from '../jobs/index.job';

const initializeCrons = () => {
    cron.schedule('*/10 * * * *', test);
};

export default initializeCrons;
