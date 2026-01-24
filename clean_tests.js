const GreekNameCorrection = require('./index');

const result = GreekNameCorrection('ΜΑΡΙΑ', {
  addAccents: true
});

console.log(result);
