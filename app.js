var argv = require('yargs').argv;
var _ = require('lodash');
var fs = require('fs');
var shelljs = require('shelljs');
var resolve = require('path').resolve;

var settingsFile = argv.c ? resolve(process.cwd(), argv.c) : '/etc/internal-dns.js';
var settings = require(settingsFile);
var dataFile = settings.json || '/var/lib/internal-dns.json';
var data = require('prettiest')({ json: dataFile });

var command = argv._[0];
if (!command) {
  usage();
}

if (command === 'add') {
  add();
} else if (command === 'remove') {
  remove();
} else {
  usage();
}

function usage() {
  console.error('Usage:\n');
  console.error('internal-dns add shortname mac-address');
  console.error('internal-dns remove shortname');
  process.exit(1);
}

function add() {
  var shortname = argv._[1];
  var mac = argv._[2];
  if (argv._.length !== 3) {
    usage();
  }
  var pushed = false;
  var methods = [ sameShortname, sameMac, newKid ];

  // Stops early if one of them returns "false"
  _.each(methods, function(method) {
    return method();
  });

  if (!pushed) {
    console.error('Uh-oh, fresh out of IP addresses!');
    process.exit(2);
  }

  writeAndRestart({ forgetLease: mac });

  function sameShortname() {
    var existing = _.find(data.hosts, function(host) {
      return host.shortname === shortname;
    });
    if (existing) {
      existing.mac = mac;
      pushed = true;
      return false;
    }
  }

  function sameMac() {
    var existing = _.find(data.hosts, function(host) {
      return host.mac === mac;
    });
    if (existing) {
      existing.shortname = shortname;
      pushed = true;
      return false;
    }
  }

  function newKid() {
    iterateIps(settings.range.low, settings.range.high, function(ip) {
      if (!_.find(data.hosts, function(host) {
        return host.ip === ip;
      })) {
        data.hosts = (data.hosts || []).concat({
          shortname: argv._[1],
          mac: argv._[2],
          ip: ip
        });
        pushed = true;
        // Stop iterating, we found an open address
        return false;
      }
    });
    if (pushed) {
      return false;
    }
  }
}

function remove() {
  if (argv._.length !== 2) {
    usage();
  }
  var shortname = argv._[1];
  var found = false;
  var mac;
  data.hosts = _.filter(data.hosts, function(host) {
    if ((host.shortname === shortname) || (host.mac === shortname)) {
      found = true;
      mac = host.mac;
      return false;
    }
    return true;
  });
  if (!found) {
    // It's not fatal but it's warning-worthy
    console.error('Not found: ' + shortname);
    return;
  }
  writeAndRestart({ forgetLease: mac });
}

function writeAndRestart(options) {
  var lines = [
    "# Generated by internal-dns, do not edit manually",
    "domain=" + settings.domain,
    "dhcp-range=" + settings.range.low + ',' + settings.range.high + ',' + (settings.timeout || '2h'),
    "local=/" + settings.domain + "/"
  ];
  lines = lines.concat(settings.dnsmasq);
  _.each(data.hosts, function(host) {
    lines.push("address=/" + host.shortname + '.' + settings.domain + '/' + host.ip);
    lines.push("dhcp-host=" + host.mac + "," + host.ip);
  });
  fs.writeFileSync(settings.conf || '/etc/dnsmasq.conf', lines.join("\n"));

  if (settings.stop !== false) {
    var stop = settings.stop || 'service dnsmasq stop';
    if (shelljs.exec(stop).code !== 0) {
      // Probably wasn't running yet, that's OK
    }
  }

  // If we just altered our feelings about a mac address, make sure
  // we forget the current DHCP lease for it before restarting

  if (settings.leases !== false) {
    var leasesFile = settings.leases || '/var/lib/misc/dnsmasq.leases';
    var leases = [];
    if (fs.existsSync(leasesFile)) {
      leases = fs.readFileSync(leasesFile, 'utf8').split(/\n/);
    }
    leases = _.filter(leases, function(lease) {
      return lease.indexOf(options.forgetLease) === -1;
    });
    fs.writeFileSync(leasesFile, leases.join('\n'));
  }

  if (settings.start !== false) {
    var start = settings.start || 'service dnsmasq start';
    if (shelljs.exec(start).code !== 0) {
      console.error('ERROR: unable to start dnsmasq');
      process.exit(3);
    }
  }
}

// iterate over all IPs between and including the "low" and "high"
// dotted IP addresses. If "iterator" explicitly returns "false",
// stop iterating. TODO: support ipv6.

function iterateIps(low, high, iterator) {
  var ip = low;
  while (ip !== high) {
    if (iterator(ip) === false) {
      return;
    }
    var bytes = ip.split(/\./);
    bytes[3]++;
    for (place = 3; (place >= 0); place--) {
      // Avoid 0 and 255 in the last byte. This is not strictly necessary
      // in some network configurations, but let's just stay out of trouble
      if ((bytes[place] === 256) || ((place === 3) && bytes[place] === 255)) {
        bytes[place] = 0;
        bytes[place - 1]++;
      }
      if ((place === 3) && (bytes[place] === 0)) {
        bytes[place]++;
      }
    }
    ip = bytes.join('.');
  }
}