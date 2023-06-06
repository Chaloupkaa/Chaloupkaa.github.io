const diceGame = document.getElementById("diceGame");
const minesGame = document.getElementById("minesGame");

diceGame.addEventListener("click", () => {
  window.location.href = "dice/dice.html";
});

minesGame.addEventListener("click", () => {
  window.location.href = "mines/mines.html";
});
