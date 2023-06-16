//
// Betting
//
let betAmount = document.querySelector("#betAmount").value;
let balanceAmount = window.balance;
let outcome;
let betButton = document.getElementById("betButton");
let amountHalfButton = document.getElementById("amountHalf");
let amountDoubleButton = document.getElementById("amountDouble");
let payoutAmount;
let balanceAfter;
let continueBet;

//
// Inputs
//
const targetMultiplierInput = document.getElementById("targetMultiplierInput");
const winChanceInput = document.getElementById("winChanceInput");

//
// Results
//
const resultEl = document.getElementById("resultEl");
const multiplicationSignEl = document.getElementById("multiplicationSign");
let finalTargetMultiplier = 1.0;
let result;

//
// Settings
//
let targetMultiplier = 2;
let winChance = 49.5;

//
// Result array
//
let resultArray = [];
let numberOfDisplayedNumbers = 0;

//
// Steps animation
//
const initialStep = 1.0;
const totalSteps = 20;

//
// Audio
//
const stutterSFX = new Audio("audio/stutter.aac");
const stutterSFXClone = stutterSFX.cloneNode();
const betWinSFX = new Audio("audio/betWin.aac");
const betWinSFXClone = betWinSFX.cloneNode();

//
// Onload setting
//
document.addEventListener("DOMContentLoaded", () => {
  targetMultiplierInput.value = targetMultiplier.toFixed(2);
  winChanceInput.value = winChance.toFixed(8);
});

//
// Place bet function
//
function placeBet() {
  let betAmount = parseFloat(document.getElementById("betAmount").value);
  continueBet = true;
  //Check if betAmount is greater than 0
  if (betAmount <= 0) {
    continueBet = false;
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
    continueBet = false;
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
    balanceAmount -= betAmount;
    window.balance = balanceAmount; // Update the global 'window.balance' variable
    document.getElementById("balanceAmount").textContent = balanceAmount.toFixed(3); // Update the displayed balance in the HTML element
    // Save the updated balance to localStorage
    localStorage.setItem("balance", balanceAmount.toFixed(3));
  }
}

//
// Calculation of Win Chance (once for change and once for input just to be sure it works fine)
//
targetMultiplierInput.addEventListener("change", () => {
  if (targetMultiplierInput.value >= 1.01 && targetMultiplierInput.value <= 1000000) {
    winChance = 99 / targetMultiplierInput.value;
    winChanceInput.value = winChance.toFixed(8);
  }
  // Run one more check that the calculation is correct
  correctTargetMultiplierFunction();
  checkOfWinChance();
});

targetMultiplierInput.addEventListener("input", () => {
  // If user entered wrong values disable Bet button
  if (targetMultiplierInput.value < 1.01 || targetMultiplierInput.value === Infinity) {
    disableBetButton();
  }

  if (targetMultiplierInput.value >= 1.01 && targetMultiplierInput.value <= 1000000) {
    enableBetButton();
    // Calculate win chance
    winChance = 99 / targetMultiplierInput.value;
    winChanceInput.value = winChance.toFixed(8);
  }
});

//
// Calculation of Target Multiplier
//
winChanceInput.addEventListener("change", () => {
  targetMultiplier = 99 / winChanceInput.value;
  targetMultiplierInput.value = targetMultiplier.toFixed(2);
  // Run one more check that the calculation is correct
  checkOfWinChance();
});

winChanceInput.addEventListener("input", () => {
  targetMultiplier = 99 / winChanceInput.value;
  targetMultiplierInput.value = targetMultiplier.toFixed(2);
});

//
// Edit result array (it has 700ms delay so it won't spoil if current bet was winning or not)
//
function editResultArray() {
  setTimeout(() => {
    const resultsArray = document.getElementById("resultsArray");
    resultArray.push(finalTargetMultiplier);
    numberOfDisplayedNumbers += 1;
    const generatedResultArray = document.createElement("p");
    generatedResultArray.textContent = finalTargetMultiplier;

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
    }

    setTimeout(() => {
      generatedResultArray.classList.add("active");
    }, 300);
  }, 1000);
}

//
// Check functions
//
function correctTargetMultiplierFunction() {
  // Correct target multiplier if it has more than 2 decimal positions
  let correctTargetMultiplier = parseFloat(targetMultiplierInput.value);
  correctTargetMultiplier = correctTargetMultiplier.toFixed(2);
  targetMultiplierInput.value = correctTargetMultiplier;
}

function checkOfWinChance() {
  winChance = 99 / targetMultiplierInput.value;
  winChanceInput.value = winChance.toFixed(8);
}

function checkOfTargetMultiplier() {
  targetMultiplier = 99 / winChanceInput.value;
  targetMultiplierInput.value = targetMultiplier.toFixed(2);
}

function disableBetButton() {
  betButton.disabled = true;
}

function enableBetButton() {
  betButton.removeAttribute("disabled");
}

//
// Win or loss decider
//
function decideWinOrLoss() {
  if (parseFloat(result) >= parseFloat(targetMultiplierInput.value)) {
    outcome = "Win";
    payout();
  } else {
    outcome = "Loss";
  }
}

//
// Algorithm for multiplier calculation
//
async function getResult(gameHash, salt) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const hmacKey = await crypto.subtle.importKey("raw", encoder.encode(gameHash), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const hmacBuffer = encoder.encode(salt);
  const hmacResult = await crypto.subtle.sign("HMAC", hmacKey, hmacBuffer);
  const h = Array.from(new Uint8Array(hmacResult))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const hBigInt = BigInt("0x" + h);
  if (hBigInt % 100n === 0n) {
    // Change the condition to % 100n === 0n for a higher likelihood of hitting 1.00
    return "1.00";
  }

  const truncatedH = BigInt("0x" + h.slice(0, 13));
  const e = 2n ** 52n;
  const multiplier = Number((BigInt(100) * e - truncatedH) / (e - truncatedH) / BigInt(100));

  // Generate a random number between 0 and 99 to add decimal places
  const decimalPlaces = Math.floor(Math.random() * 100);
  const multiplierString = (multiplier + decimalPlaces / 100).toFixed(2);

  return multiplierString;
}

//
// Listen for clicks on the bet button. Then start betting process
//
document.getElementById("betButton").addEventListener("click", async () => {
  // If users bet is incorrect don't allow him to continue the game and show popup
  placeBet();
  if (!continueBet) {
    return;
  }

  // Disable bet button while the game is running
  betButton.disabled = true;
  setTimeout(() => {
    betButton.removeAttribute("disabled");
  }, 1700);

  resultEl.textContent = 1.0;
  try {
    const previousGameHash = "db6dcb8b56c97cdcd1aa5c2a52f9eca98642130cddd5423c91e5da5e58402c79";
    const salt = crypto.getRandomValues(new Uint8Array(16)).toString("hex");

    const gameHash = await getPreviousGameHash(previousGameHash);
    result = await getResult(gameHash, salt);
    // Decide whether the bet outcome is win or loss
    decideWinOrLoss();

    // Print result to the result span
    resultEl.textContent = result;
    const multiplier = result;

    // Change result and multiplicaton back to default
    resultEl.style.color = "#d9d7e9";
    multiplicationSignEl.style.color = "#d9d7e9";

    runStepsAnimation(initialStep, multiplier, totalSteps);
    finalTargetMultiplier = result;

    editResultArray();

    // Change color after 800ms so the animation looks better
    setTimeout(() => {
      changeColorOfResult();
    }, 800);
  } catch (error) {
    console.error(error);
  }
});

async function getPreviousGameHash(hashCode) {
  const encoder = new TextEncoder();
  const data = encoder.encode(hashCode);
  const buffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

//
// If result was greater or same as target multiplier payout user his bet * user's targeted multiplier
//
function payout() {
  payoutAmount = document.querySelector("#betAmount").value * parseFloat(targetMultiplierInput.value);
  balanceAmount += payoutAmount;
  window.balance = balanceAmount; // Update the global 'window.balance' variable
  setTimeout(() => {
    document.getElementById("balanceAmount").textContent = balanceAmount.toFixed(3); // Update the displayed balance in the HTML element
    // Save the updated balance to localStorage
    localStorage.setItem("balance", balanceAmount.toFixed(3));
  }, 1000);
}

//
// Calculate steps for the multiplier and then animate them
//
function runStepsAnimation(initialStep, multiplier, totalSteps) {
  function calculateSteps(initialStep, multiplier, totalSteps) {
    const steps = [initialStep];

    for (let i = 1; i < totalSteps; i++) {
      const newStep = initialStep + (multiplier - initialStep) * (i / (totalSteps - 1));
      steps.push(newStep);
    }

    steps.push(multiplier);
    return steps;
  }

  const steps = calculateSteps(initialStep, multiplier, totalSteps);

  let currentStep = 0;
  const animationDuration = 400;
  const stepDuration = 45;
  const totalIterations = Math.ceil(animationDuration / stepDuration);

  // Display the initial step of 1.00 for 500ms
  resultEl.textContent = "1.00";
  setTimeout(() => {
    const animateSteps = setInterval(() => {
      //Play stutter sound (sound for increasing animation)
      let stutterSFXClone = stutterSFX.cloneNode();
      stutterSFXClone.play();
      if (currentStep >= totalIterations) {
        clearInterval(animateSteps);
        return;
      }

      setTimeout(() => {
        if (outcome === "Win") {
          betWinSFXClone.play();
        }
      }, 250);

      const index = Math.floor((currentStep * (totalSteps - 1)) / (totalIterations - 1));
      const currentResult = steps[index];
      resultEl.textContent = currentResult.toFixed(2);
      currentStep++;
    }, stepDuration);
  }, 500);
}

//
// On win change color of result and "x" to --win-element-background (#fcd704)
//
function changeColorOfResult() {
  if (outcome === "Win") {
    resultEl.style.color = "#fcd704";
    multiplicationSignEl.style.color = "#fcd704";
  } else {
    resultEl.style.color = "#d9d7e9";
    multiplicationSignEl.style.color = "#d9d7e9";
  }
}
