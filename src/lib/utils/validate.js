export function validateRoutingNumber(routingNumber) {
  if (routingNumber) {
    var Weight = [3, 7, 1, 3, 7, 1, 3, 7];
    var AcctDigit = 0;
    var Sum = 0;
    Weight.map((w, i) => {
      AcctDigit = parseInt(routingNumber.substring(i, i + 1));
      Sum += w * AcctDigit;
    });
    return (10 - (Sum % 10)) % 10 == parseInt(routingNumber.substring(8, 9));
  } else return true;
}
