const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression');
const historyList = document.getElementById('historyList');
const body = document.body;

const STORAGE_KEY = 'calculator-history';
const THEME_KEY = 'calculator-theme';

let currentInput = '0';
let firstValue = null;
let operator = null;
let waitingForSecondValue = false;
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function setTheme(theme) {
  body.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  setTheme(savedTheme);
}

function isErrorValue(value) {
  return value === 'Error' || value === 'NaN';
}

function updateDisplay() {
  if (operator && firstValue !== null) {
    if (waitingForSecondValue) {
      expressionDisplay.textContent = `${firstValue} ${operator}`;
    } else {
      expressionDisplay.textContent = `${firstValue} ${operator} ${currentInput}`;
    }
  } else if (currentInput === 'Error') {
    expressionDisplay.textContent = 'Error';
  } else {
    expressionDisplay.textContent = currentInput;
  }

  display.textContent = currentInput;
}

function renderHistory() {
  historyList.innerHTML = '';

  history.slice(0, 8).forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = entry;
    historyList.appendChild(item);
  });
}

function addHistoryEntry(expression, result) {
  const entry = `${expression} = ${result}`;
  history.unshift(entry);
  history = history.slice(0, 8);
  saveHistory();
  renderHistory();
}

function clearHistory() {
  history = [];
  saveHistory();
  renderHistory();
}

function clearCalculator() {
  currentInput = '0';
  firstValue = null;
  operator = null;
  waitingForSecondValue = false;
  updateDisplay();
}

function inputNumber(value) {
  if (isErrorValue(currentInput)) {
    currentInput = value;
    updateDisplay();
    return;
  }

  if (waitingForSecondValue) {
    currentInput = value;
    waitingForSecondValue = false;
  } else {
    currentInput = currentInput === '0' ? value : currentInput + value;
  }

  updateDisplay();
}

function inputDecimal() {
  if (isErrorValue(currentInput)) {
    currentInput = '0.';
    updateDisplay();
    return;
  }

  if (waitingForSecondValue) {
    currentInput = '0.';
    waitingForSecondValue = false;
    updateDisplay();
    return;
  }

  if (!currentInput.includes('.')) {
    currentInput += '.';
    updateDisplay();
  }
}

function deleteLast() {
  if (waitingForSecondValue || isErrorValue(currentInput)) return;

  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
  updateDisplay();
}

function applyUnaryOperation(operation) {
  const value = Number(currentInput);
  let result;

  if (Number.isNaN(value)) {
    currentInput = 'Error';
    updateDisplay();
    return;
  }

  switch (operation) {
    case 'sqrt':
      result = value < 0 ? 'Error' : Math.sqrt(value);
      break;
    case 'square':
      result = value * value;
      break;
    case 'reciprocal':
      result = value === 0 ? 'Error' : 1 / value;
      break;
    case 'toggle-sign':
      result = -value;
      break;
    default:
      result = value;
  }

  currentInput = String(result);
  updateDisplay();
}

function performPercent() {
  const value = Number(currentInput) / 100;
  currentInput = String(value);
  updateDisplay();
}

function chooseOperator(nextOperator) {
  const inputValue = Number(currentInput);

  if (isErrorValue(currentInput)) {
    return;
  }

  if (firstValue === null) {
    firstValue = inputValue;
  } else if (operator) {
    const result = calculate(firstValue, inputValue, operator);

    if (result === 'Error') {
      currentInput = 'Error';
      firstValue = null;
      operator = null;
      waitingForSecondValue = false;
      updateDisplay();
      return;
    }

    currentInput = String(result);
    firstValue = result;
  }

  operator = nextOperator;
  waitingForSecondValue = true;
  updateDisplay();
}

function calculate(first, second, op) {
  switch (op) {
    case '+':
      return first + second;
    case '-':
      return first - second;
    case '*':
      return first * second;
    case '/':
      return second === 0 ? 'Error' : first / second;
    case '^':
      return first ** second;
    default:
      return second;
  }
}

function evaluate() {
  if (operator === null || waitingForSecondValue || isErrorValue(currentInput)) return;

  const expression = `${firstValue} ${operator} ${currentInput}`;
  const result = calculate(firstValue, Number(currentInput), operator);

  if (result === 'Error') {
    currentInput = 'Error';
    firstValue = null;
    operator = null;
    waitingForSecondValue = false;
    updateDisplay();
    return;
  }

  currentInput = String(result);
  addHistoryEntry(expression, currentInput);
  firstValue = null;
  operator = null;
  waitingForSecondValue = false;
  updateDisplay();
}

function toggleTheme() {
  const currentTheme = body.getAttribute('data-theme') || 'dark';
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

const buttons = document.querySelectorAll('.btn');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const { action, value } = button.dataset;

    if (action === 'number') {
      inputNumber(value);
      return;
    }

    if (action === 'decimal') {
      inputDecimal();
      return;
    }

    if (action === 'clear') {
      clearCalculator();
      return;
    }

    if (action === 'delete') {
      deleteLast();
      return;
    }

    if (action === 'toggle-sign') {
      applyUnaryOperation('toggle-sign');
      return;
    }

    if (action === 'percent') {
      performPercent();
      return;
    }

    if (action === 'sqrt') {
      applyUnaryOperation('sqrt');
      return;
    }

    if (action === 'square') {
      applyUnaryOperation('square');
      return;
    }

    if (action === 'reciprocal') {
      applyUnaryOperation('reciprocal');
      return;
    }

    if (action === 'clear-history') {
      clearHistory();
      return;
    }

    if (action === 'theme') {
      toggleTheme();
      return;
    }

    if (action === 'operator') {
      chooseOperator(value);
      return;
    }

    if (action === 'equals') {
      evaluate();
    }
  });
});

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/\d/.test(key)) {
    inputNumber(key);
  } else if (key === '.') {
    inputDecimal();
  } else if (key === 'Escape') {
    clearCalculator();
  } else if (key === 'Backspace') {
    deleteLast();
  } else if (key === 'p' || key === 'P') {
    applyUnaryOperation('toggle-sign');
  } else if (['+', '-', '*', '/', '^'].includes(key)) {
    chooseOperator(key);
  } else if (key === 'Enter' || key === '=') {
    evaluate();
  }
});

applySavedTheme();
renderHistory();
updateDisplay();
