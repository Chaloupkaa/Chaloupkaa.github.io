window.addEventListener("DOMContentLoaded", () => {
  let loaderWrapper = document.getElementById("loaderWrapper");
  let loader = document.getElementById("loader");
  setTimeout(() => {
    document.querySelector("body #loaderWrapper")?.remove();
  }, 500);
});
