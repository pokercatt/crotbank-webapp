"use strict";

import accounts from "./userData.js";
import * as dom from "./domElements.js";
import {
  calcBalance,
  calcDaysPassed,
  calcIncomes,
  calcInterest,
  calcSpending,
  createUsernames,
  formatCur,
} from "./utilities.js";

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (acc, sort = false) {
  dom.containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    dom.containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = calcBalance(acc.movements);
  dom.labelBalance.textContent = formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = calcIncomes(acc.movements);
  dom.labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = calcSpending(acc.movements);
  dom.labelSumOut.textContent = formatCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  const interest = calcInterest(acc);
  dom.labelSumInterest.textContent = formatCur(
    interest,
    acc.locale,
    acc.currency
  );
};

createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    dom.labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      dom.labelWelcome.textContent = "Log in to get started";
      dom.containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
//dom.containerApp.style.opacity = 100;

dom.btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === dom.inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +dom.inputLoginPin.value) {
    // Display UI and message
    dom.labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    dom.containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);

    dom.labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    dom.inputLoginUsername.value = dom.inputLoginPin.value = "";
    dom.inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

dom.btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +dom.inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === dom.inputTransferTo.value
  );
  dom.inputTransferAmount.value = dom.inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

dom.btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(dom.inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = "";
});

dom.btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    dom.inputCloseUsername.value === currentAccount.username &&
    +dom.inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    dom.containerApp.style.opacity = 0;
  }

  dom.inputCloseUsername.value = dom.inputClosePin.value = "";
});

let sorted = false;
dom.btnSort.addEventListener("click", function (e) {
  e.preventDefault();

  // FIX:
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

dom.modeToggler.addEventListener("change", () => {
  document.body.classList.toggle("light-mode");
});
