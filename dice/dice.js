const slider = document.getElementById("slider");
const overUnder = document.getElementById("overUnder");
const multiplierInput = document.getElementById("multiplier");
const winChanceInput = document.getElementById("winChance");
const overUnderChange = document.getElementById("overUnderChange");
let overUnderState = document.getElementById("overUnderSpan");

//Audio
const sliderMoveAudio = new Audio("audio/slider-move.mp3");
const diceWinSFX = new Audio("audio/dice-win.mp3");
const diceLossSFX = new Audio("audio/dice-throw.mp3");

//Betting
let betAmount = document.querySelector("#betAmount");
let balanceAmount = 100.0;
let outcome;
let betButton = document.getElementById("betButton");
let amountHalfButton = document.getElementById("amountHalf");
let amountDoubleButton = document.getElementById("amountDouble");
const profitOnWin = document.getElementById("profitOnWin");

//Results array
let resultArray = [];
let numberOfDisplayedNumbers = 0;

// Timer
let timer = null;

// Load code when the page is opened
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("resultPopup").style.opacity = "0";
  document.getElementById("resultPopup").style.left = 0;
  document.getElementById("profitOnWin").disabled = true;
  slider.value = 50;
  let winChanceValue = winChance();
  multiplier(winChanceValue);
  rollOverUnder();
  profitOnWinCalculation();
});

//Switch under/over
overUnderChange.addEventListener("click", overUnderChangeFunction);

function overUnderChangeFunction() {
  invertSlider();
}

// Player uses slider to change value
slider.addEventListener("input", () => {
  if (overUnderState.textContent === "Over") {
    sliderStopOver();
  }
  if (overUnderState.textContent === "Under") {
    sliderStopUnder();
  }
  sliderMove();
  let winChanceValue = winChance();
  multiplier(winChanceValue);
  rollOverUnder();
});

// User types multiplier value
multiplierInput.addEventListener("input", () => {
  if (overUnderState.textContent === "Over") {
    if (multiplierInput.value === Infinity || multiplierInput.value === null || multiplierInput.value === undefined) {
      multiplierInput.value = 1.98;
    }
    if (multiplierInput.value <= 1.0103) {
      betButton.disabled = true;
    }
    if (multiplierInput.value >= 9900) {
      multiplierInput.value = 9900;
    }

    if (multiplierInput.value >= 1.0103 && multiplierInput.value <= 4950) {
      betButton.disabled = false;
      let winChanceValue = 99 / multiplierInput.value;
      slider.value = 100 - winChanceValue;
      let overUnderValue = slider.value;
      overUnder.value = overUnderValue;
      winChanceInput.value = (100 - slider.value).toFixed(2);
      profitOnWinCalculation();
      moveColorsOnInput();
    }
  }
  if (overUnderState.textContent === "Under") {
    if (multiplierInput.value === Infinity || multiplierInput.value === null || multiplierInput.value === undefined) {
      multiplierInput.value = 1.98;
    }
    if (multiplierInput.value <= 1.01) {
      betButton.disabled = true;
    }
    if (multiplierInput.value >= 9900) {
      multiplierInput.value = 9900;
    }

    if (multiplierInput.value >= 1.01 && multiplierInput.value <= 9900) {
      betButton.disabled = false;
      let winChanceValue = 99 / multiplierInput.value;
      slider.value = winChanceValue;
      let overUnderValue = slider.value;
      overUnder.value = overUnderValue;
      winChanceInput.value = slider.value;
      profitOnWinCalculation();
      moveColorsOnInput();
    }
  }
});

// User enters win chance
winChanceInput.addEventListener("input", () => {
  if (overUnderState.textContent === "Over") {
    if (winChanceInput.value === Infinity || winChanceInput.value === null || winChanceInput.value === undefined) {
      winChanceInput.value = 50;
    }
    if (winChanceInput.value < 0.01) {
      betButton.disabled = true;
    }
    if (winChanceInput.value >= 97.99) {
      winChanceInput.value = 97.99;
    }

    if (winChanceInput.value >= 0.01 && winChanceInput.value <= 97.99) {
      betButton.disabled = false;
      let winChanceValue = winChanceInput.value;
      let multiplierValue = 99 / winChanceValue;
      multiplierInput.value = multiplierValue.toFixed(2);
      let overUnderValue = 100 - winChanceValue;
      slider.value = overUnderValue;
      overUnder.value = overUnderValue.toFixed(2);
      profitOnWinCalculation();
      moveColorsOnInput();
    }
  }

  if (overUnderState.textContent === "Under") {
    if (winChanceInput.value === Infinity || winChanceInput.value === null || winChanceInput.value === undefined) {
      winChanceInput.value = 50;
    }
    if (winChanceInput.value < 0.01) {
      betButton.disabled = true;
    }
    if (winChanceInput.value >= 97.99) {
      winChanceInput.value = 97.99;
    }

    if (winChanceInput.value >= 0.01 && winChanceInput.value <= 97.99) {
      betButton.disabled = false;
      let winChanceValue = winChanceInput.value;
      let multiplierValue = 99 / winChanceValue;
      multiplierInput.value = multiplierValue.toFixed(2);
      let overUnderValue = winChanceValue;
      slider.value = overUnderValue;
      overUnder.value = overUnderValue;
      profitOnWinCalculation();
      moveColorsOnInput();
    }
  }
});

//User edits bet amount
betAmount.addEventListener("input", () => {
  profitOnWinCalculation();
});

//Background of slider change
slider.oninput = function () {
  //Calculate current position
  let value = Math.min(Math.max(this.value, 2.01), 99.99);
  let percent = value;
  //Edit profit on win input
  profitOnWinCalculation();
  //Move the colors
  if (overUnderState.textContent === "Over") {
    let color = "linear-gradient(to right, #e60000 0%, #e60000 " + percent + "%, #fcd704 " + percent + "%, #fcd704 100%)";
    this.style.background = color;
    this.value = value;
  }
  if (overUnderState.textContent === "Under") {
    let color = "linear-gradient(to right, #fcd704 0%, #fcd704 " + percent + "%, #e60000 " + percent + "%, #e60000 100%)";
    this.style.background = color;
    slider.style.background = color;
  }
};

function winChance() {
  if (overUnderState.textContent === "Over") {
    let winChanceValue = 100 - slider.value;
    winChanceInput.value = winChanceValue.toFixed(2);
    return winChanceValue;
  }

  if (overUnderState.textContent === "Under") {
    let winChanceValue = slider.value;
    winChanceInput.value = slider.value;
    return winChanceValue;
  }
}

function multiplier(winChanceValue) {
  if (overUnderState.textContent === "Over") {
    let multiplierValue = 99 / winChanceValue;
    multiplierInput.value = multiplierValue.toFixed(2);
  } else {
    let multiplierValue = 99 / winChanceValue;
    multiplierInput.value = multiplierValue.toFixed(2);
  }
}

function rollOverUnder() {
  let overValue = slider.value;
  overUnder.value = overValue;
}

function sliderMove() {
  const newSliderMoveAudio = sliderMoveAudio.cloneNode();
  newSliderMoveAudio.volume = 0.2;
  newSliderMoveAudio.play();
}

function diceWin() {
  const newDiceWinSFX = diceWinSFX.cloneNode();
  newDiceWinSFX.play();
}

function diceLoss() {
  const newDiceLossSFX = diceLossSFX.cloneNode();
  newDiceLossSFX.play();
}

function invertSlider() {
  //Invert and edit roll over/under value
  let currentSliderValue = slider.value;
  let newSliderValue = 100 - currentSliderValue;
  slider.value = newSliderValue;
  overUnder.value = newSliderValue.toFixed(2);

  //Edit background colors of slider
  if (overUnderState.textContent === "Under") {
    let percent = newSliderValue;
    let color = "linear-gradient(to right, #e60000 0%, #e60000 " + percent + "%, #fcd704 " + percent + "%, #fcd704 100%)";
    slider.style.background = color;
    overUnderState.innerHTML = "Over";
  } else {
    let percent = newSliderValue;
    let color = "linear-gradient(to right, #fcd704 0%, #fcd704 " + percent + "%, #e60000 " + percent + "%, #e60000 100%)";
    slider.style.background = color;
    overUnderState.innerHTML = "Under";
  }
}

function placeBet() {
  let betAmount = parseFloat(document.getElementById("betAmount").value);
  //Check if betAmount is greater than 0
  if (betAmount <= 0) {
    stopAutobet();
    autobetRunning = false;
    //Display popup and disable user interaction with the site
    document.getElementById("incorrectBet").style.display = "block";
    document.body.classList.add("popup-visible");
    //After user clicks the close button hide popup and enable user interaction again
    document.getElementById("closeBtnBet").addEventListener("click", function () {
      document.getElementById("incorrectBet").style.display = "none";
      document.body.classList.remove("popup-visible");
    });
    return;
  }

  //Check if player has enough balance
  if (betAmount > balanceAmount) {
    stopAutobet();
    autobetRunning = false;
    //Display popup and disable user interaction with the site
    document.getElementById("balancePopup").style.display = "block";
    document.body.classList.add("popup-visible");
    //After user clicks the close button hide popup and enable user interaction again
    document.getElementById("closeBtnBalance").addEventListener("click", function () {
      document.getElementById("balancePopup").style.display = "none";
      document.body.classList.remove("popup-visible");
    });
    return;
  }

  if (betAmount <= balanceAmount) {
    // Show current balance after betting
    document.getElementById("balanceAmount").textContent = (balanceAmount - betAmount).toFixed(2);
    checkWinOrLoss();
    clearTimeout(timer);
    displayResultPopup();
    betButton.disabled = true;
    setTimeout(() => {
      betButton.disabled = false;
    }, 500);
  }
}

function autobet() {
  document.getElementById("balanceAmount").textContent = (balanceAmount - betAmount).toFixed(2);
  checkWinOrLoss();
  displayResultPopup();
}

function sliderStopOver() {
  let minRange = 2.01;
  let maxRange = 99.99;

  if (slider.value < minRange) {
    slider.value = minRange;
  }

  if (slider.value > maxRange) {
    slider.value = maxRange;
  }
}

function sliderStopUnder() {
  let minRange = 0.01;
  let maxRange = 97.99;

  if (slider.value < minRange) {
    slider.value = minRange;
  }

  if (slider.value > maxRange) {
    slider.value = maxRange;
  }
}

function profitOnWinCalculation() {
  let calcProfitOnWin = (betAmount.value * multiplierInput.value).toFixed(2);
  profitOnWin.value = calcProfitOnWin;
}

function moveColorsOnInput() {
  if (overUnderState.textContent === "Over") {
    let percent = slider.value;
    let color = "linear-gradient(to right, #e60000 0%, #e60000 " + percent + "%, #fcd704 " + percent + "%, #fcd704 100%)";
    slider.style.background = color;
  }

  if (overUnderState.textContent === "Under") {
    let percent = slider.value;
    let color = "linear-gradient(to right, #fcd704 0%, #fcd704 " + percent + "%, #e60000 " + percent + "%, #e60000 100%)";
    slider.style.background = color;
  }
}

function checkWinOrLoss() {
  let profitOnWinElement = document.getElementById("profitOnWin");
  let currentProfitOnWin = parseInt(profitOnWinElement.value);
  currentProfitOnWin = profitOnWinElement.value - betAmount.value;

  let sliderValue = parseFloat(document.getElementById("slider").value);
  let calcProfitOnWin = (betAmount.value * multiplierInput.value).toFixed(2);

  //Calculate random number
  let randomNumber = Math.random() * 99.98 + 0.01;
  randomNumber = randomNumber.toFixed(2);

  if (overUnderState.textContent === "Over") {
    if (randomNumber > sliderValue) {
      diceLoss();
      setTimeout(() => {
        diceWin();
      }, 300);
      outcome = "Win";
    } else {
      diceLoss();
      outcome = "Loss";
    }
  } else {
    if (randomNumber < sliderValue) {
      diceLoss();
      setTimeout(() => {
        diceWin();
      }, 300);
      outcome = "Win";
    } else {
      diceLoss();
      outcome = "Loss";
    }
  }

  //Display result popup over the slider
  document.getElementById("resultPopup").textContent = randomNumber;
  let percentage = (randomNumber - 0.01) / (99.99 - 0.01);
  let popup = document.getElementById("resultPopup");

  if (outcome === "Win") {
    popup.classList.remove("result-popup-loss");
    popup.classList.add("result-popup-win");
  }
  if (outcome === "Loss") {
    popup.classList.remove("result-popup-win");
    popup.classList.add("result-popup-loss");
  }

  popup.style.left = `${percentage * 97.5}%`;

  clearTimeout(timer);

  if (outcome === "Win") {
    balanceAmount += currentProfitOnWin;
    console.log(currentProfitOnWin);
  }
  if (outcome === "Loss") {
    balanceAmount -= betAmount.value;
  }
  document.getElementById("balanceAmount").textContent = balanceAmount.toFixed(2);

  //Edit result array
  const resultsArray = document.getElementById("resultsArray");
  resultArray.push(randomNumber);
  numberOfDisplayedNumbers += 1;
  const generatedResultArray = document.createElement("p");
  generatedResultArray.textContent = randomNumber;

  if (outcome === "Win") {
    generatedResultArray.classList.add("win");
  }

  generatedResultArray.classList.add("fade-in");
  resultsArray.insertBefore(generatedResultArray, resultsArray.firstChild);

  if (numberOfDisplayedNumbers > 5) {
    // Select the last element and add transition class to it
    const lastElement = resultsArray.lastChild;
    lastElement.classList.remove("fade-in");
    lastElement.classList.add("fade-out");
    // Remove the last element after the fade-out effect finishes
    setTimeout(() => {
      resultsArray.removeChild(lastElement);
    }, 500);
    if (outcome === "Win") {
      increaseOnWin();
    }
    if (outcome === "Loss") {
      increaseOnLoss();
    }
  }

  setTimeout(() => {
    generatedResultArray.classList.add("active");
  }, 300);
}

function displayResultPopup() {
  document.getElementById("resultPopup").style.opacity = "1";
  timer = setTimeout(hideResultPopup, 5000);
}

function hideResultPopup() {
  document.getElementById("resultPopup").style.opacity = "0";
  timer = null;
}
