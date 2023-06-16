const diceGame = document.getElementById("diceGame");
const minesGame = document.getElementById("minesGame");
const limboGame = document.getElementById("limboGame");

diceGame.addEventListener("click", () => {
  window.location.href = "dice/dice.html";
});

minesGame.addEventListener("click", () => {
  window.location.href = "mines/mines.html";
});

limboGame.addEventListener("click", () => {
  window.location.href = "limbo/limbo.html";
});
