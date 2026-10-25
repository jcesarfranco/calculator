const display = document.getElementById('display');

let currentInput = '0';
let previousInput = null;
let operator = null;
let waitingForSecondValue = false;

function updateDisplay() {
  display.textContent = currentInput;
}

function clearCalculator() {
  currentInput = '0';
  previousInput = null;
  operator = null;
  waitingForSecondValue = false;
  updateDisplay();
}

function inputNumber(value) {
  if (waitingForSecondValue) {
    currentInput = value;
    waitingForSecondValue = false;
  } else {
    currentInput = currentInput === '0' ? value : currentInput + value;
  }

  updateDisplay();
}

function inputDecimal() {
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
  if (waitingForSecondValue) return;

  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
  updateDisplay();
}

function performPercent() {
  const value = Number(currentInput) / 100;
  currentInput = String(value);
  updateDisplay();
}

function chooseOperator(nextOperator) {
  const inputValue = Number(currentInput);

  if (previousInput === null) {
    previousInput = inputValue;
  } else if (operator) {
    const result = calculate(previousInput, inputValue, operator);
    currentInput = String(result);
    previousInput = result;
  }

  waitingForSecondValue = true;
  operator = nextOperator;
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
    default:
      return second;
  }
}

function evaluate() {
  if (operator === null || waitingForSecondValue) return;

  const result = calculate(previousInput, Number(currentInput), operator);
  currentInput = String(result);
  previousInput = null;
  operator = null;
  waitingForSecondValue = false;
  updateDisplay();
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

    if (action === 'percent') {
      performPercent();
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
  } else if (['+', '-', '*', '/'].includes(key)) {
    chooseOperator(key);
  } else if (key === 'Enter' || key === '=') {
    evaluate();
  }
});

updateDisplay();
