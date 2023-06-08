const options = [
  document.getElementById("1"),
  document.getElementById("3"),
  document.getElementById("7"),
  document.getElementById("14"),
  document.getElementById("21"),
  document.getElementById("30"),
  document.getElementById("60"),
  document.getElementById("90"),
  document.getElementById("180"),
  document.getElementById("365"),
];

let lastClicked;

options.forEach((option) => {
  option.addEventListener("click", () => {
    deleteClass();
    option.classList.add("option-selected");
  });
});

function deleteClass() {
  options.forEach((option) => {
    option.classList.remove("option-selected");
  });
}
