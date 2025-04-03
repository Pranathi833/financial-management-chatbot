// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const API_ENDPOINTS = {
  auth: '/auth/login',
  chat: '/chat',
  investments: '/investments',
  transactions: '/transactions',
  profile: '/profile'
};

// Global State
let appState = {
  user: null,
  token: null,
  currentChatId: null,
  portfolioData: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
  // Check for existing session
  await checkSession();
  
  // Initialize modules based on current page
  const currentPage = window.location.pathname.split('/').pop();
  
  switch(currentPage) {
    case 'index.html':
      initDashboard();
      break;
    case 'chatbot.html':
      initChat();
      break;
    case 'investments.html':
      initInvestments();
      break;
    case 'login.html':
      initLogin();
      break;
  }
});

// Authentication Module
async function checkSession() {
  const token = localStorage.getItem('finSmartToken');
  if (token) {
    try {
      const user = await fetchUserProfile(token);
      appState.user = user;
      appState.token = token;
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('finSmartToken');
      if (!window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
      }
    }
  } else if (!window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
  }
}

async function fetchUserProfile(token) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.profile}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  
  return await response.json();
}

function initLogin() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const { token, user } = await authenticateUser(email, password);
        
        // Update app state
        appState.token = token;
        appState.user = user;
        
        // Store token
        localStorage.setItem('finSmartToken', token);
        
        // Redirect to dashboard
        window.location.href = 'index.html';
      } catch (error) {
        showError('loginError', error.message);
      }
    });
  }
}

async function authenticateUser(email, password) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  
  return await response.json();
}

// Chat Module
function initChat() {
  const chatForm = document.getElementById('chatForm');
  const chatWindow = document.querySelector('.chat-window');
  
  if (chatForm) {
    chatForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const input = this.querySelector('input');
      const message = input.value.trim();
      
      if (message) {
        addMessage(message, 'user');
        input.value = '';
        
        // Show typing indicator
        document.getElementById('typingIndicator').classList.remove('hidden');
        chatWindow.scrollTop = chatWindow.scrollHeight;
        
        try {
          const response = await sendChatMessage(message);
          addMessage(response.message, 'ai');
        } catch (error) {
          addMessage("Sorry, I couldn't process your request. Please try again later.", 'ai');
          console.error('Chat error:', error);
        } finally {
          document.getElementById('typingIndicator').classList.add('hidden');
        }
      }
    });
  }
  
  // Load chat history if exists
  loadChatHistory();
}

async function sendChatMessage(message) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.chat}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${appState.token}`
    },
    body: JSON.stringify({
      message,
      chatId: appState.currentChatId
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  const data = await response.json();
  appState.currentChatId = data.chatId;
  return data;
}

function loadChatHistory() {
  // In a real app, this would fetch from API
  // For now, we'll use localStorage
  const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  const chatWindow = document.querySelector('.chat-window');
  
  history.forEach(msg => {
    addMessage(msg.text, msg.sender, false);
  });
}

function addMessage(text, sender, saveToHistory = true) {
  const chatWindow = document.querySelector('.chat-window');
  const messageDiv = document.createElement('div');
  
  messageDiv.className = `flex justify-${sender === 'user' ? 'end' : 'start'} mb-4`;
  messageDiv.innerHTML = `
    <div class="flex flex-col ${sender === 'user' ? 'items-end' : ''} max-w-[85%]">
      <div class="${sender === 'user' ? 'bg-blue-600 rounded-tr-none' : 'bg-gray-700 rounded-tl-none'} p-3 rounded-lg">
        <p>${text}</p>
      </div>
      <div class="text-xs text-gray-400 mt-1">
        ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        ${sender === 'user' ? '<i class="fas fa-check-double text-blue-400 ml-1"></i>' : ''}
      </div>
    </div>
  `;
  
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  if (saveToHistory) {
    saveMessageToHistory(text, sender);
  }
}

function saveMessageToHistory(text, sender) {
  const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  history.push({ text, sender, timestamp: new Date().toISOString() });
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

// Investments Module
async function initInvestments() {
  try {
    const portfolioData = await fetchPortfolioData();
    appState.portfolioData = portfolioData;
    renderPortfolio(portfolioData);
    
    const recommendations = await fetchInvestmentRecommendations();
    renderRecommendations(recommendations);
    
    setupRiskSlider();
  } catch (error) {
    console.error('Failed to load investment data:', error);
    showError('investmentsError', 'Failed to load investment data. Please try again later.');
  }
}

async function fetchPortfolioData() {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.investments}/portfolio`, {
    headers: {
      'Authorization': `Bearer ${appState.token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio data');
  }
  
  return await response.json();
}

async function fetchInvestmentRecommendations() {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.investments}/recommendations`, {
    headers: {
      'Authorization': `Bearer ${appState.token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  return await response.json();
}

function renderPortfolio(data) {
  // Update portfolio chart
  updatePortfolioChart(data.allocations);
  
  // Update portfolio summary
  document.getElementById('totalInvested').textContent = `₹${data.summary.totalInvested.toLocaleString()}`;
  document.getElementById('currentValue').textContent = `₹${data.summary.currentValue.toLocaleString()}`;
  document.getElementById('totalReturn').textContent = `${data.summary.totalReturn > 0 ? '+' : ''}${data.summary.totalReturn.toFixed(2)}%`;
  document.getElementById('annualizedReturn').textContent = `${data.summary.annualizedReturn > 0 ? '+' : ''}${data.summary.annualizedReturn.toFixed(2)}%`;
  
  // Render holdings table
  renderHoldingsTable(data.holdings);
}

function renderRecommendations(recommendations) {
  const container = document.querySelector('.recommendations-container');
  if (!container) return;
  
  container.innerHTML = recommendations.map(rec => `
    <div class="investment-card glass-card rounded-xl overflow-hidden transition-all duration-300">
      <div class="p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 ${getAssetClassColor(rec.assetClass)} rounded-lg flex items-center justify-center mr-4">
            <i class="${getAssetClassIcon(rec.assetClass)} text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold">${rec.name}</h3>
            <p class="text-sm text-gray-400">${rec.type}</p>
          </div>
        </div>
        <div class="mb-4 sparkline">
          <canvas class="sparkline" id="${rec.id}-sparkline"></canvas>
        </div>
        <div class="flex justify-between items-center mb-4">
          <div>
            <p class="text-sm text-gray-400">1Y Return</p>
            <p class="font-bold ${rec.return > 0 ? 'text-green-400' : 'text-red-400'}">${rec.return > 0 ? '+' : ''}${rec.return}%</p>
          </div>
          <div>
            <p class="text-sm text-gray-400">Risk</p>
            <p class="font-bold ${getRiskColor(rec.risk)}">${rec.risk}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400">Min. Invest</p>
            <p class="font-bold">₹${rec.minInvestment.toLocaleString()}</p>
          </div>
        </div>
        <button class="w-full btn-primary invest-btn" data-id="${rec.id}">
          Invest Now
        </button>
      </div>
    </div>
  `).join('');
  
  // Initialize sparklines
  recommendations.forEach(rec => {
    createSparkline(`${rec.id}-sparkline`, rec.performance, getAssetClassColor(rec.assetClass, false));
  });
  
  // Add event listeners to invest buttons
  document.querySelectorAll('.invest-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const investmentId = this.getAttribute('data-id');
      initiateInvestment(investmentId);
    });
  });
}

// Dashboard Module
function initDashboard() {
  loadFinancialSummary();
  setupEventListeners();
}

async function loadFinancialSummary() {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.transactions}/summary`, {
      headers: {
        'Authorization': `Bearer ${appState.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load financial summary');
    }
    
    const data = await response.json();
    renderFinancialSummary(data);
  } catch (error) {
    console.error('Error loading financial summary:', error);
  }
}

function renderFinancialSummary(data) {
  document.getElementById('totalBalance').textContent = `₹${data.totalBalance.toLocaleString()}`;
  document.getElementById('monthlyIncome').textContent = `₹${data.monthlyIncome.toLocaleString()}`;
  document.getElementById('monthlyExpenses').textContent = `₹${data.monthlyExpenses.toLocaleString()}`;
  document.getElementById('monthlySavings').textContent = `₹${data.monthlySavings.toLocaleString()}`;
  
  // Update charts
  updateSpendingChart(data.spendingByCategory);
  updateIncomeVsExpensesChart(data.incomeVsExpenses);
}

// Utility Functions
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.remove('hidden');
    setTimeout(() => {
      element.classList.add('hidden');
    }, 5000);
  }
}

function getAssetClassColor(assetClass, bg = true) {
  const colors = {
    equity: bg ? 'bg-blue-600/20' : '#3b82f6',
    debt: bg ? 'bg-purple-600/20' : '#8b5cf6',
    hybrid: bg ? 'bg-yellow-600/20' : '#f59e0b',
    others: bg ? 'bg-gray-600/20' : '#64748b'
  };
  return colors[assetClass.toLowerCase()] || colors.others;
}

function getAssetClassIcon(assetClass) {
  const icons = {
    equity: 'fas fa-chart-line',
    debt: 'fas fa-shield-alt',
    hybrid: 'fas fa-balance-scale',
    others: 'fas fa-piggy-bank'
  };
  return icons[assetClass.toLowerCase()] || icons.others;
}

function getRiskColor(risk) {
  risk = risk.toLowerCase();
  if (risk.includes('high')) return 'text-red-400';
  if (risk.includes('medium')) return 'text-yellow-400';
  return 'text-green-400';
}

function createSparkline(elementId, dataPoints, color) {
  const ctx = document.getElementById(elementId).getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(dataPoints.length).fill(''),
      datasets: [{
        data: dataPoints,
        borderColor: color,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          display: false
        }
      }
    }
  });
}

// Initialize charts when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  if (typeof Chart !== 'undefined') {
    // Initialize any global charts here
  }
});