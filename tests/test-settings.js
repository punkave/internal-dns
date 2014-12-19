module.exports = {
  range: {
    low: '10.1.1.1',
    high: '10.1.1.255'
  },
  leases: 'test-leases',
  start: ':',
  stop: ':',
  json: 'test.json',
  conf: 'test-dnsmasq.conf',
  domain: 'test',
  dnsmasq: [
    'test-line-1',
    'test-line-2'
  ]
};
