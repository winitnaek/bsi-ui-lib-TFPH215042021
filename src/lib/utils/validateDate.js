import moment from "moment";
function daysInMonth(m, y) {
  // m is 0 indexed: 0-11
  switch (m) {
    case 1:
      return (y % 4 == 0 && y % 100) || y % 400 == 0 ? 29 : 28;
    case 8:
    case 3:
    case 5:
    case 10:
      return 30;
    default:
      return 31;
  }
}

function isValid(d, m, y) {
  return m >= 0 && m < 12 && d > 0 && d <= daysInMonth(m, y) && y <= 9999;
}

export default function validateDate(value) {
  var check = moment(value, "YYYY-MM-DD");
  var month = check.format("M");
  var day = check.format("D");
  var year = check.format("YYYY");
  let dateIsValid = isValid(day, month, year);
  return dateIsValid;
}
