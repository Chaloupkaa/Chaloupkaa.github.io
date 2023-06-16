//
// Buttons
//
const buttonManual = document.getElementById("manual");
const buttonAuto = document.getElementById("auto");
const resetOnWinButton = document.getElementById("resetOnWin");
const resetOnLossButton = document.getElementById("resetOnLoss");
const increaseOnWinButton = document.getElementById("increaseOnWinButton");
const increaseOnLossButton = document.getElementById("increaseOnLossButton");
const startAutobetButton = document.getElementById("startAutobet");
let lastIncreaseOnWinButtonState = false;
let lastIncreaseOnLossButtonState = false;

//
// Inputs
//
const numberOfBets = document.getElementById("numberOfBets");
const increaseOnWinInput = document.getElementById("increaseOnWinInput");
const increaseOnLossInput = document.getElementById("increaseOnLossInput");
const stopOnProfitInput = document.getElementById("stopOnProfitInput");
const stopOnLossInput = document.getElementById("stopOnLossInput");

//
// Auto / Manual div, wrappers
//
const manualBet = document.getElementById("manualBet");
const autoBet = document.getElementById("autoBet");
const bettingSettingsAutoWrapper = document.getElementById("bettingSettingsAuto");
const bettingSettingsManualWrapper = document.getElementById("bettingSettingsManual");

//
// Icons
//
const littleDice = document.getElementById("littleDice");

//
// Betting
//
let stopOnProfitValue;
let stopOnLossValue;
let targetWinBalance = 0;
let targetLossBalance = 0;

//
// Onload settings
//
document.addEventListener("DOMContentLoaded", () => {
  autoBet.style.display = "none";
  buttonAuto.classList.remove("buttonActive");
  buttonManual.classList.add("buttonActive");
  resetOnWinButton.classList.add("auto-betting-button-active");
  resetOnLossButton.classList.add("auto-betting-button-active");

  disableAutoBettingSettingsInput();
});

//
// If manual button clicked remove active state from auto button
//
buttonManual.addEventListener("click", () => {
  buttonAuto.classList.remove("buttonActive");
  buttonManual.classList.add("buttonActive");

  // Hide auto betting settings, show manual betting settings and enable bet button
  document.getElementById("betButton").disabled = false;

  // Disable all inputs in autobet tab
  disableAutoBettingSettingsInput();
  autoBet.style.display = "none";
  manualBet.style.display = "block";
});

// If auto button clicked remove active state from manual button
buttonAuto.addEventListener("click", () => {
  buttonManual.classList.remove("buttonActive");
  buttonAuto.classList.add("buttonActive");
  // Hide manual betting settings, show auto betting settings and disable bet button
  manualBet.style.display = "none";
  document.getElementById("betButton").disabled = true;
  // Enable all inputs except increase on win/loss
  enableAutoBettingSettingsInput();
  autoBet.style.display = "block";
});

increaseOnWinButton.addEventListener("click", () => {
  resetOnWinButton.classList.remove("auto-betting-button-active");
  increaseOnWinButton.classList.add("auto-betting-button-active");
  increaseOnWinInput.disabled = false;
  lastIncreaseOnWinButtonState = true;
});

resetOnWinButton.addEventListener("click", () => {
  increaseOnWinButton.classList.remove("auto-betting-button-active");
  resetOnWinButton.classList.add("auto-betting-button-active");
  increaseOnWinInput.disabled = true;
  lastIncreaseOnWinButtonState = false;
});

increaseOnLossButton.addEventListener("click", () => {
  resetOnLossButton.classList.remove("auto-betting-button-active");
  increaseOnLossButton.classList.add("auto-betting-button-active");
  increaseOnLossInput.disabled = false;
  lastIncreaseOnLossButtonState = true;
});

resetOnLossButton.addEventListener("click", () => {
  increaseOnLossButton.classList.remove("auto-betting-button-active");
  resetOnLossButton.classList.add("auto-betting-button-active");
  increaseOnLossInput.disabled = true;
  lastIncreaseOnLossButtonState = false;
});

function disableAutoBettingSettingsInput() {
  numberOfBets.disabled = true;
  increaseOnWinInput.disabled = true;
  increaseOnLossInput.disabled = true;
  stopOnProfitInput.disabled = true;
  stopOnLossInput.disabled = true;
  startAutobetButton.disabled = true;
}

function enableAutoBettingSettingsInput() {
  numberOfBets.disabled = false;
  stopOnProfitInput.disabled = false;
  stopOnLossInput.disabled = false;
  startAutobetButton.disabled = false;
}

//
// Infinity bets if user didn't enter Number of Bets
//
function displayInfinityIcon() {
  if (numberOfBets.value <= 0) {
    document.getElementById("infinityIcon").style.display = "block";
  }

  if (numberOfBets.value > 0) {
    document.getElementById("infinityIcon").style.display = "none";
  }
}

numberOfBets.addEventListener("input", () => {
  displayInfinityIcon();
});

//
// Decide whether to start or stop autobet
//
let autobetRunning = false;

function handleAutobetButton() {
  if (!autobetRunning) {
    autobetRunning = true;
    startAutobet();
  } else {
    autobetRunning = false;
    startAutobetButton.disabled = "true";
    stopAutobet();
  }
}

//
// Start Autobet
//
function startAutobet() {
  //Disable all controls
  disableAllControls();
  // Change text in autobet button to "Stop Autobet", apply autobet running styles and show little dice icon
  littleDice.style.display = "block";
  startAutobetButton.innerHTML = "Stop Autobet " + littleDice.outerHTML;
  startAutobetButton.classList.add("auto-bet-button-active");

  setTimeout(() => {
    if (numberOfBets.value > 0) {
      limitedBets();
    } else {
      unlimitedBets();
    }
  }, 500);
}

//
// Stop Autobet
//
function stopAutobet() {
  // If autobet is running and user clicks autobet button again, the autobet will be stopped
  littleDice.style.display = "none";
  startAutobetButton.innerHTML = "Start Autobet";
  startAutobetButton.classList.remove("auto-bet-button-active");

  // Set all auto setting to default
  numberOfBets.value = 0;
  increaseOnWinInput.value = 0;
  increaseOnLossInput.value = 0;
  stopOnProfitInput.value = 0;
  stopOnLossInput.value = 0;
  displayInfinityIcon();

  setTimeout(() => {
    enableAllControls();
  }, 1000);
}

//
// Limited bets funciton
//
async function limitedBets() {
  for (let i = 1; numberOfBets.value > 0; i++) {
    if (!autobetRunning) {
      stopAutobet();
      break;
    }

    // Check for stopOnProfit
    if (stopOnProfit() === true) {
      break;
    }

    // Check for stopOnLoss
    if (stopOnLoss() === true) {
      break;
    }

    placeBet();
    // Current remaining bets
    numberOfBets.value -= 1;
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
  autobetRunning = false;
  stopAutobet();
}

//
// Unlimited bets function
//
async function unlimitedBets() {
  while (autobetRunning) {
    // Check for stopOnProfit
    if (stopOnProfit() === true) {
      break;
    }

    // Check for stopOnLoss
    if (stopOnLoss() === true) {
      break;
    }

    placeBet();
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
}

//
// Disable all controls
//
function disableAllControls() {
  buttonManual.disabled = true;
  buttonAuto.disabled = true;
  resetOnWinButton.disabled = true;
  resetOnLossButton.disabled = true;
  increaseOnWinButton.disabled = true;
  increaseOnLossButton.disabled = true;
  numberOfBets.disabled = true;
  increaseOnWinInput.disabled = true;
  increaseOnLossInput.disabled = true;
  stopOnProfitInput.disabled = true;
  stopOnLossInput.disabled = true;
  multiplierInput.disabled = true;
  winChanceInput.disabled = true;
  amountDoubleButton.disabled = true;
  amountHalfButton.disabled = true;
  betAmount.disabled = true;
  slider.disabled = true;
  overUnderChange.removeEventListener("click", overUnderChangeFunction);
  overUnder.style.opacity = "0.5";
  overUnder.style.cursor = "not-allowed";
}

//
// Enable all controls
//
function enableAllControls() {
  startAutobetButton.removeAttribute("disabled");
  buttonManual.removeAttribute("disabled");
  buttonAuto.removeAttribute("disabled");
  resetOnWinButton.removeAttribute("disabled");
  resetOnLossButton.removeAttribute("disabled");
  increaseOnWinButton.removeAttribute("disabled");
  increaseOnLossButton.removeAttribute("disabled");
  numberOfBets.removeAttribute("disabled");

  if (lastIncreaseOnWinButtonState === true) {
    increaseOnWinInput.removeAttribute("disabled");
  }

  if (lastIncreaseOnLossButtonState === true) {
    increaseOnLossInput.removeAttribute("disabled");
  }

  stopOnProfitInput.removeAttribute("disabled");
  stopOnLossInput.removeAttribute("disabled");
  multiplierInput.removeAttribute("disabled");
  winChanceInput.removeAttribute("disabled");
  amountDoubleButton.removeAttribute("disabled");
  amountHalfButton.removeAttribute("disabled");
  betAmount.removeAttribute("disabled");
  slider.removeAttribute("disabled");
  overUnderChange.addEventListener("click", overUnderChangeFunction);
  overUnder.style.opacity = "1";
  overUnder.style.cursor = "pointer";
}

//
// Increase on win
//
function increaseOnWin() {
  if (resetOnWinButton.disabled === true && outcome === "Win" && increaseOnWinInput.value > 0) {
    increasePercentage = 1 + increaseOnWinInput.value / 100;
    let newBetAmount = (betAmount.value *= increasePercentage).toFixed(2);
    betAmount.value = newBetAmount;
  }
}

//
// Increase on loss
//
function increaseOnLoss() {
  if (resetOnLossButton.disabled === true && outcome === "Loss" && increaseOnLossInput.value > 0) {
    increasePercentage = 1 + increaseOnLossInput.value / 100;
    let newBetAmount = (betAmount.value *= increasePercentage).toFixed(2);
    betAmount.value = newBetAmount;
  }
}

//
// Listen for every change of stopOnProfitInput
//
stopOnProfitInput.addEventListener("input", function () {
  stopOnProfitValue = stopOnProfitInput.value;
  calculateStopOnProfitThreshold();
});

//
// Calculate stopOnProfitThreshold
//
function calculateStopOnProfitThreshold() {
  if (stopOnProfitInput.value <= 0) {
    return;
  } else {
    targetWinBalance = balanceAmount + parseFloat(stopOnProfitValue);
  }
}

//
// Stop on profit
//
function stopOnProfit() {
  if (stopOnProfitInput.value <= 0) {
    return false;
  } else {
    if (balanceAmount >= targetWinBalance) {
      autobetRunning = false;
      stopAutobet();
      stopOnProfitInput.value = 0;
      return true;
    }
  }
}

//
// Listen for every change of stopOnLossInput
//
stopOnLossInput.addEventListener("input", function () {
  stopOnLossValue = stopOnLossInput.value;
  calculateStopOnLossThreshold();
});

//
// Calculate stopOnLossThreshold
//
function calculateStopOnLossThreshold() {
  if (stopOnLossInput.value <= 0) {
    return;
  } else {
    targetLossBalance = balanceAmount - parseFloat(stopOnLossValue);
  }
}

//
// Stop on loss
//
function stopOnLoss() {
  if (stopOnLossInput.value <= 0) {
    return false;
  }
  if (balanceAmount <= targetLossBalance) {
    autobetRunning = false;
    stopAutobet();
    stopOnLossInput.value = 0;
    return true;
  }
}

//
// Amount half
//
function amountHalf() {
  const currentValue = parseFloat(betAmount.value);
  const checkValue = currentValue / 2.0;

  //Check if the value wouldn't be smaller than 0.1 (minimal possible bet). If it would be smaller, automatically set value to 0.1
  if (checkValue > 0.1) {
    const newValue = currentValue / 2.0;
    betAmount.value = newValue.toFixed(2);
    profitOnWinCalculation();
  } else {
    betAmount.value = (0.1).toFixed(1);
    profitOnWinCalculation();
  }
}

//
// Amount double
//
function amountDouble() {
  const currentValue = parseFloat(betAmount.value);
  const checkValue = currentValue * 2.0;

  //Check if the value wouldn't be greater than 9999999 (maximal possible bet). If it would be greater, automatically set value to 9999999
  if (checkValue > 9999999) {
    betAmount.value = 9999999.0;
    profitOnWinCalculation();
  } else {
    const newValue = currentValue * 2.0;
    betAmount.value = newValue.toFixed(2);
    profitOnWinCalculation();
  }
}
