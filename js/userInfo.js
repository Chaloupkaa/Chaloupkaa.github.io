function loadData() {
  let firstLoad = localStorage.getItem("firstLoad");

  if (!firstLoad) {
    let username = promptUsername();
    if (!username) {
      return loadData(); // Prompt the username again if it is not provided
    }

    let balance = promptBalance();

    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
    localStorage.setItem("firstLoad", true);

    document.getElementById("username").textContent = username;
    document.getElementById("balanceAmount").textContent = balance.toFixed(3); // Round to 2 decimal positions
    if (window.location.pathname.includes("minigames.html")) {
      document.getElementById("userUsername").textContent = username;
    }

    // Store the balance in the global 'window' object
    window.balance = parseFloat(balance);
  } else {
    let username = localStorage.getItem("username");
    let balance = localStorage.getItem("balance");

    document.getElementById("username").textContent = username;
    document.getElementById("balanceAmount").textContent = parseFloat(balance).toFixed(3); // Round to 2 decimal positions
    if (window.location.pathname.includes("minigames.html")) {
      document.getElementById("userUsername").textContent = username;
    }

    // Store the balance in the global 'window' object
    window.balance = parseFloat(balance);
  }

  function isValidNumber(value) {
    return /^[0-9.]+$/.test(value);
  }

  function promptUsername() {
    let username = prompt("Enter your username");

    if (!username) {
      alert("Username is required. Please enter your username.");
      return promptUsername();
    }

    if (username.length > 32) {
      alert("Username should not exceed 32 characters. Please enter a shorter username.");
      return promptUsername();
    }

    return username;
  }

  function promptBalance() {
    let balance = prompt("Enter balance");

    if (!isValidNumber(balance)) {
      alert("Invalid amount entered. Please enter only numbers");
      return promptBalance();
    }

    let parsedBalance = parseFloat(balance);

    if (parsedBalance < 0.1 || parsedBalance > 10000) {
      alert("Invalid balance entered. Please enter a value between 0.1 and 10000");
      return promptBalance();
    }

    return parsedBalance;
  }
}

function resetData() {
  localStorage.clear();
  location.reload();
}

function updateBalance(newBalance) {
  // Update the balance in localStorage
  localStorage.setItem("balance", newBalance);

  // Update the balance in the global 'window' object
  window.balance = parseFloat(newBalance);

  // Update the balance displayed in the HTML element
  document.getElementById("balanceAmount").textContent = parseFloat(newBalance).toFixed(3); // Round to 2 decimal positions
}

// Call the function to load the data when the page loads
loadData();
