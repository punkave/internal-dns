module.exports = {
  staticRange: {
    low: '10.1.1.1',
    high: '10.1.1.100'
  },
  dynamicRange: {
    low: '10.1.1.101',
    high: '10.1.1.254'
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
