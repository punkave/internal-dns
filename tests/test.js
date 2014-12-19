var fs = require('fs');

var shelljs = require('shelljs');

if (fs.existsSync('test.json')) {
  fs.unlinkSync('test.json');
}

shelljs.exec('node ../app.js -c test-settings.js add bob 1:0:0:0');
shelljs.exec('node ../app.js -c test-settings.js add jane 2:0:0:0');
shelljs.exec('node ../app.js -c test-settings.js add sarah 3:0:0:0');
shelljs.exec('node ../app.js -c test-settings.js add steve 4:0:0:0');
shelljs.exec('node ../app.js -c test-settings.js add jack 5:0:0:0');
shelljs.exec('node ../app.js -c test-settings.js add dick 6:0:0:0');
shelljs.exec('node ../app.js -c test-settings.js add jill 7:0:0:0');
shelljs.exec('node ../app.js -c test-settings.js remove jane');
shelljs.exec('node ../app.js -c test-settings.js remove bob');
shelljs.exec('node ../app.js -c test-settings.js add jill 8:0:0:0');
shelljs.exec('node ../app.js -c test-settings.js add jane 5:0:0:0');

var data = JSON.parse(fs.readFileSync('test.json', 'utf8'));

if (JSON.stringify(data) !== JSON.stringify({
  hosts: [
    { shortname: 'sarah', mac: '3:0:0:0', ip: '10.1.1.3' },
    { shortname: 'steve', mac: '4:0:0:0', ip: '10.1.1.4' },
    { shortname: 'jane', mac: '5:0:0:0', ip: '10.1.1.5' },
    { shortname: 'dick', mac: '6:0:0:0', ip: '10.1.1.6' },
    { shortname: 'jill', mac: '8:0:0:0', ip: '10.1.1.7' }
  ]
})) {
  console.error('Test failed, data is:');
  console.error(data);
  process.exit(1);
}
console.log('All tests passing.');

