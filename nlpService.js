const analyzeQuery = async (message, userId) => {
  // Basic response logic - can be enhanced later
  const responses = {
    'hello': 'Hello! How can I help you with your finances today?',
    'balance': 'Your current balance is $2,345.67',
    'budget': 'Here are your monthly budgets: \n- Food: $500\n- Rent: $1200',
    'default': 'I can help you with financial questions. Ask me about your balance, budgets, or transactions.'
  };

  const lowerMsg = message.toLowerCase();
  return responses[lowerMsg] || responses['default'];
};

module.exports = { analyzeQuery };