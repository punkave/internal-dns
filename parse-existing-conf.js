// We used this script to parse our existing, manually maintained
// dnsmasq.conf and turn it into a .json file suitable for use
// with internal-dns. Modify this for your use if it's helpful
// to you. It'll probably not match your practices exactly.

var _ = require('lodash');
var fs = require('fs');

var macByIp = {};
var nameByIp = {};
var lines = fs.readFileSync('dnsmasq.conf', 'utf8').split(/\n/);
_.each(lines, function(line) {
  var matches = line.match(/dhcp\-host=(.*?)\,(\S+)/);
  if (matches) {
    var mac = matches[1];
    var ip = matches[2];
    macByIp[ip] = mac;
  }
  matches = line.match(/address=\/(\w+)\.punk\/(\S+)/);
  if (matches) {
    var name = matches[1];
    var ip = matches[2];
    nameByIp[ip] = name;
  }
});

var data = {
  hosts: []
};

_.each(nameByIp, function(name, ip) {
  if (macByIp[ip]) {
    data.hosts.push({
      shortname: name,
      ip: ip,
      mac: macByIp[ip]
    });
  }
});

data.hosts.sort(function(h1, h2) {
  if (h1.shortname < h2.shortname) {
    return -1;
  }
  if (h1.shortname > h2.shortname) {
    return 1;
  }
  return 0;
});

fs.writeFileSync('data.json', JSON.stringify(data));


