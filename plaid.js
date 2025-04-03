const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const dotenv = require('dotenv');
dotenv.config();

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    }
  }
});

const plaidClient = new PlaidApi(configuration);

// Map Plaid categories to our internal categories
const categoryMap = {
  'Food and Drink': 'Food',
  'Transportation': 'Transport',
  'Recreation': 'Entertainment',
  'Payment': 'Bills',
  'Shops': 'Shopping'
};

const getInternalCategory = (plaidCategory) => {
  return categoryMap[plaidCategory] || 'Other';
};

module.exports = {
  plaidClient,
  getInternalCategory
};