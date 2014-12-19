module.exports = {
  json: 'test.json',
  conf: 'test.conf',
  dnsmasq: [
    'domain-needed',
    'bogus-priv'
  ],
  range: {
    low: '10.1.10.254',
    high: '10.1.10.199'
  },
  domain: 'punk',
  timeout: '2h',
  start: 'echo starting dnsmasq',
  stop: 'echo stopping dnsmasq',
  leases: 'test-leases'
};
