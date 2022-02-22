export const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

export const calcDaysPassed = (date1, date2) =>
Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

export const formatCur = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(value);
  };

export const calcInterest = function (acc) {
  return acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      console.log("everything wors fine");
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
};

export const calcBalance = function (movements) {
  return movements.reduce((acc, mov) => acc + mov, 0);
};

export const calcIncomes = function (movements) {
  return movements.filter((mov) => mov > 0).reduce((acc, mov) => acc + mov, 0);
};

export const calcSpending = function (movements) {
  return movements.filter((mov) => mov < 0).reduce((acc, mov) => acc + mov, 0);
};
