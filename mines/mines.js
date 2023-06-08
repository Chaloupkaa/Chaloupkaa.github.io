//
// Betting
//
let betAmount = document.querySelector("#betAmount");
let balanceAmount = 100.0;
let outcome;
let betButton = document.getElementById("betButton");
let amountHalfButton = document.getElementById("amountHalf");
let amountDoubleButton = document.getElementById("amountDouble");
let currentMultiplier = 1;
let currentCashoutAmount = 0;
let firstRun = true;

//
// Tiles, mines arrays
//
const tiles = [
  document.getElementById("1"),
  document.getElementById("2"),
  document.getElementById("3"),
  document.getElementById("4"),
  document.getElementById("5"),
  document.getElementById("6"),
  document.getElementById("7"),
  document.getElementById("8"),
  document.getElementById("9"),
  document.getElementById("10"),
  document.getElementById("11"),
  document.getElementById("12"),
  document.getElementById("13"),
  document.getElementById("14"),
  document.getElementById("15"),
  document.getElementById("16"),
  document.getElementById("17"),
  document.getElementById("18"),
  document.getElementById("19"),
  document.getElementById("20"),
  document.getElementById("21"),
  document.getElementById("22"),
  document.getElementById("23"),
  document.getElementById("24"),
  document.getElementById("25"),
];
let minesArray = [];
let notClickedTiles = Array.from(tiles);
let clickedTiles = [];
let correctTiles = 0;

//
// Game state - true (running), false (ended)
//
let gameState = false;
let gameEnded = false;

//
// Let remaining asteroids and planets
//
const remainingWrapper = document.getElementById("remainingWrapper");
const remainingAsteroidsElement = document.getElementById("remainingAsteroids");
const remainingPlanetsElement = document.getElementById("remainingPlanets");
let remainingAsteroids = 0;
let remainingPlanets = 0;

//
// SFX
//
const asteroidHitSFX = new Audio("audio/asteroidHit.aac");
const planetHitSFX = new Audio("audio/planetHit.aac");
const cashoutSFX = new Audio("audio/cashoutSFX.aac");

//
// Cashout popup
//
const cashoutPopupWrapper = document.getElementById("cashoutPopupWrapper");
let finalMultiplier = document.getElementById("finalMultiplier");
let cashedOutAmount = document.getElementById("cashedOutAmount");

//
// Set mines by default to 3, calculate number of left tiles
//
const minesSelectElement = document.getElementById("numOfMines");
let numOfMines = 3;
let numOfLeftTiles = 25 - numOfMines;
document.addEventListener("DOMContentLoaded", function () {
  minesSelectElement.value = 3;
});

//
// Other elements
//
const asteroidSelectWrapper = document.getElementById("asteroidSelectWrapper");

//
// Bet / Cashout button handler
//
function betCashoutHandler() {
  if (!gameState) {
    gameState = true;
    placeBet();
  } else {
    cashout();
  }
}

//
// Place bet function
//
function placeBet() {
  let betAmount = parseFloat(document.getElementById("betAmount").value);
  // Check if betAmount is greater than 0
  if (betAmount <= 0) {
    gameState = false;
    stopAutobet();
    autobetRunning = false;
    // Display popup and disable user interaction with the site
    document.getElementById("incorrectBet").style.display = "block";
    document.body.classList.add("popup-visible");
    // After user clicks the close button hide popup and enable user interaction again
    document.getElementById("closeBtnBet").addEventListener("click", function () {
      document.getElementById("incorrectBet").style.display = "none";
      document.body.classList.remove("popup-visible");
    });
  }

  // Check if player has enough balance
  if (betAmount > balanceAmount) {
    gameState = false;
    stopAutobet();
    autobetRunning = false;
    // Display popup and disable user interaction with the site
    document.getElementById("balancePopup").style.display = "block";
    document.body.classList.add("popup-visible");
    // After user clicks the close button hide popup and enable user interaction again
    document.getElementById("closeBtnBalance").addEventListener("click", function () {
      document.getElementById("balancePopup").style.display = "none";
      document.body.classList.remove("popup-visible");
    });
  }

  if (betAmount <= balanceAmount) {
    // If game is running for the first time don't flip all tiles
    if (firstRun === true) {
      hideAllMines();
      firstRun = false;
    } else {
      turnBack();
    }

    prepareForNextGame();

    generateMines();
    disableCashoutButtonOnStart();
    showRemainingAndRandomPick();
    gameEnded = false;
    // Hide asteroids select input
    asteroidSelectWrapper.style.display = "none";
    console.log("generated mines");
    balanceAmount -= betAmount;
    document.getElementById("balanceAmount").textContent = balanceAmount.toFixed(3);
  }
}
//
// Generate mines
//
function generateMines() {
  // Set gameState = true on the start of the game
  gameState = true;

  // Disable all inputs and buttons that aren't necessary to play the game
  enableOrDisableInputs();

  // Get current numbers of mines that user selected
  numOfMines = minesSelectElement.value;
  numOfLeftTiles = 25 - numOfMines;

  // Display default cashout amount (base bet)
  betButton.innerText = "Cashout " + betAmount.value;

  // Generate mines
  while (minesArray.length < numOfMines) {
    const randomIndex = Math.floor(Math.random() * tiles.length);
    const randomTile = tiles[randomIndex];
    if (!minesArray.includes(randomTile)) {
      minesArray.push(randomTile);
    }
  }
  console.log("Mines:");
  console.log(minesArray);
}

//
// Listen for every click on each tile and decide whether user clicked correct tile or mine
//
tiles.forEach((tile) => {
  tile.addEventListener("click", () => {
    // Don't listen for clicks on tiles if game is not running
    if (gameState === false) {
      return;
    }

    // Check if user clicked current tile again. If yes return, else add currently clicked tile to array of clicked tiles
    if (clickedTiles.includes(tile)) {
      return;
    }
    clickedTiles.push(tile);

    // If user selects tile which contains mine end game and display losing mine
    if (minesArray.includes(tile)) {
      betButton.textContent = "Bet";
      gameState = false;
      gameEnded = true;
      // Hide remaining numbers of asteroids, planets and random pick button and show asteroid selector again
      hideRemainingAndRandomPick();
      asteroidSelectWrapper.style.display = "block";

      // Play asteroid hit audio
      let asteroidHitSFXClone = asteroidHitSFX.cloneNode();
      asteroidHitSFXClone.play();

      // Set proper background to the tile
      tile.classList.add("turn-animation");
      tile.classList.add("mine-selected");
      setTimeout(() => {
        tile.style.backgroundImage = "url(img/asteroid.png)";
      }, 250);

      enableOrDisableInputs();
      notClickedTiles = notClickedTiles.filter((t) => t !== tile);
      setTimeout(() => {
        revealAllMines();
      }, 350);
    }
    // If user selects tile which doesn't contain mine continue the game
    else {
      // Set proper background to the tile
      tile.classList.add("turn-animation");
      tile.classList.add("mine-selected");

      setTimeout(() => {
        tile.style.backgroundImage = "url(img/planet.png)";
      }, 250);

      // Play correct tile SFX (planet hit) it has to be clonned so it will be able to be played multiple times at once
      let planetHitSFXClone = planetHitSFX.cloneNode();
      planetHitSFXClone.play();

      // Remove current tile from array of all tiles, so they can be disabled later
      notClickedTiles = notClickedTiles.filter((t) => t !== tile);

      // Calculate multiplier after win with current number of correct tiles
      correctTiles += 1;
      calculateMultiplier();

      // Edit number of remaining planets
      updateRemainingPlanetsNumber();
      document.getElementById("betButton").innerText = "Cashout " + currentCashoutAmount;
    }

    // Listen for first clicked mine so cashout button can be enabled again
    disableCashoutButtonOnStart();

    // Number of left tiles - 1
    numOfLeftTiles--;
    console.log(numOfLeftTiles);

    if (numOfLeftTiles === 0) {
      if (minesArray.includes(tile)) {
        revealAllMines();
      } else {
        cashout();
      }

      return;
    }
  });
});

//
// Reveal all tiles after the game ends
//
function revealAllMines() {
  tiles.forEach((tile) => {
    if (minesArray.includes(tile)) {
      tile.classList.add("turn-animation");
      setTimeout(() => {
        tile.style.backgroundImage = "url(img/asteroid.png)";
      }, 250);
    } else {
      tile.classList.add("turn-animation");
      setTimeout(() => {
        tile.style.backgroundImage = "url(img/planet.png)";
      }, 250);
    }
    notClickedTiles.forEach((tile) => {
      tile.disabled = true;
    });
  });
}

//
// Iterate through all mines and set them base color
//
function hideAllMines() {
  tiles.forEach((tile) => {
    tile.classList.remove("turn-animation");
    tile.classList.remove("mine-selected");
    tile.style.backgroundImage = "";
  });
}

//
// Turn mines back on the back side after finishing game
//
function turnBack() {
  tiles.forEach((tile) => {
    tile.classList.add("turn-back");

    tile.style.backgroundImage = "";

    setTimeout(() => {
      tile.classList.remove("turn-back");
      tile.classList.remove("turn-animation");
      tile.classList.remove("mine-selected");
    }, 500);
  });
}

//
// Prepare all elements for the next game
//
function prepareForNextGame() {
  // Clear the mines and clicked tiles array
  minesArray = [];
  clickedTiles = [];

  // Set gameEnded to false on the start of the game
  gameEnded = false;

  // Reset currentCashoutAmount
  currentCashoutAmount = 0;
  correctTiles = 0;

  // Hide cashout popup
  hideCashoutPopup();

  // Enable all tiles again
  notClickedTiles.forEach((tile) => {
    tile.removeAttribute("disabled");
  });
  // Renew the notClickedTiles array
  notClickedTiles = Array.from(tiles);
}

//
// Multiplier calculation algorithm
//
function nCr(n, r) {
  const f = (num) => {
    if (num === 0 || num === 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    return result;
  };
  return f(n) / (f(r) * f(n - r));
}

function calculateMultiplier() {
  const houseEdge = 0.01;
  currentMultiplier = ((1 - houseEdge) * nCr(25, correctTiles)) / nCr(25 - numOfMines, correctTiles);
  currentCashoutAmount = (betAmount.value * currentMultiplier).toFixed(3);
}

//
// Cashout function
//
function cashout() {
  // The game ended and set game state to false
  gameState = false;

  // Game ended set to true
  gameEnded = true;

  // Reveal all mines
  revealAllMines();

  // Enable buttons and inputs again
  enableOrDisableInputs();
  disableBetButtonEndGame();

  // Play cashout SFX
  let cashoutSFXClone = cashoutSFX.cloneNode();
  cashoutSFXClone.play();

  // Hide remaining numbers of asteroids, planets and random pick button and show asteroid selector again
  hideRemainingAndRandomPick();
  asteroidSelectWrapper.style.display = "block";

  // Set button state again to "Bet"
  betButton.innerText = "Bet";

  // Display popup with multiplier and amount of money that user cashed out
  displayCashoutPopup();

  // Add currentCashoutAmount to the balance
  let balanceAfterCashout = parseFloat(balanceAmount) + parseFloat(currentCashoutAmount);
  balanceAmount = balanceAfterCashout;
  document.getElementById("balanceAmount").textContent = balanceAfterCashout.toFixed(3);
}

//
// Decide whether the bet / cashout button will be disabled or enabled
//
function disableCashoutButtonOnStart() {
  // If number of correct tiles is equal to 0 disable cashout button
  if (correctTiles !== 0 || !gameState) {
    betButton.disabled = false;
  } else {
    betButton.disabled = true;
  }

  if (gameEnded) {
    disableBetButtonEndGame();
    gameEnded = false;
  } else {
    return;
  }
}

//
// All controls disable / enable (difference is in 500ms timeout if game has ended)
//
function enableOrDisableInputs() {
  if (gameEnded === false) {
    if (gameState) {
      document.getElementById("manual").disabled = true;
      document.getElementById("auto").disabled = true;
      betAmount.disabled = true;
      amountDoubleButton.disabled = true;
      amountHalfButton.disabled = true;
      document.getElementById("numOfMines").disabled = true;
    } else {
      document.getElementById("manual").removeAttribute("disabled");
      document.getElementById("auto").removeAttribute("disabled");
      betAmount.removeAttribute("disabled");
      amountDoubleButton.removeAttribute("disabled");
      amountHalfButton.removeAttribute("disabled");
      document.getElementById("numOfMines").removeAttribute("disabled");
    }
  }

  if (gameEnded === true) {
    setTimeout(() => {
      if (gameState) {
        document.getElementById("manual").disabled = true;
        document.getElementById("auto").disabled = true;
        betAmount.disabled = true;
        amountDoubleButton.disabled = true;
        amountHalfButton.disabled = true;
        document.getElementById("numOfMines").disabled = true;
      } else {
        document.getElementById("manual").removeAttribute("disabled");
        document.getElementById("auto").removeAttribute("disabled");
        betAmount.removeAttribute("disabled");
        amountDoubleButton.removeAttribute("disabled");
        amountHalfButton.removeAttribute("disabled");
        document.getElementById("numOfMines").removeAttribute("disabled");
      }
    }, 500);
  }
}

//
// Display cashout popup (function called when user cashes out in the middle of the game)
//
function displayCashoutPopup() {
  finalMultiplier.innerHTML = currentMultiplier.toFixed(3);
  cashedOutAmount.innerHTML = currentCashoutAmount;
  cashoutPopupWrapper.style.display = "block";
}

//
// Hide cashout popup (function called on start of every game)
//
function hideCashoutPopup() {
  cashoutPopupWrapper.style.display = "none";
}

function updateRemainingPlanetsNumber() {
  remainingPlanets -= 1;
  remainingPlanetsElement.value = remainingPlanets;
}

function showRemainingAndRandomPick() {
  remainingAsteroids = numOfMines;
  remainingPlanets = 25 - remainingAsteroids;

  remainingWrapper.style.display = "grid";

  remainingAsteroidsElement.value = remainingAsteroids;
  remainingPlanetsElement.value = remainingPlanets;
}

function hideRemainingAndRandomPick() {
  remainingWrapper.style.display = "none";
}

async function disableBetButtonEndGame() {
  betButton.disabled = true;
  await new Promise((resolve) => setTimeout(resolve, 750));
  betButton.disabled = false;
}
