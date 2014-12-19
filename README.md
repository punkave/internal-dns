## Purpose

Everyone in your office tests out sites on their own computer.

Maybe you've tried visiting a site on a coworker's computer, by IP address.

Maybe you've even figured out how to use DHCP client IDs to give them a hostname on the local network. But that doesn't help you reach the right virtual host on their computer.

What if everyone could have their own subdomain, so that `jane.punk`, `site1.jane.punk` and `site2.jane.punk` all resolved to the same laptop?

That's what `internal-dns` gives you.

## Install

**Step One:** install the `dnsmasq` service on your Linux server.

Under Ubuntu Linux that would be:

```
apt-get install dnsmasq
```

Make sure your system is set to start it on every boot.

Now install `internal-dns`:

```
npm install -g internal-dns
```

**Step Two:** create `/etc/internal-dns.js` and populate it with your settings. Here's a typical configuration:

```javascript
module.exports = {
  // Include these custom lines in /etc/dnsmasq.conf. These two
  // are recommended, see the dnsmasq manpage
  dnsmasq: [
    'domain-needed',
    'bogus-priv'
  ],
  // Specify the range of IP addresses you want to assign.
  // Supports only IPv4 so far
  range: {
    low: '10.1.10.100',
    high: '10.1.10.199'
  },

  // This way "jane.mycompany" or "site.jane.mycompany" both
  // will point to Jane's computer. DON'T add .com, this is
  // meant for internal use on your LAN.
  domain: 'mycompany'
};
```

*If /etc/internal-dns.js is an unacceptable location for you*, you can use the `-c` option to specify an alternate configuration file every time you launch `internal-dns`.

**Step Three:** start adding your coworkers' computers by name. These should be valid hostnames (letters, digits and dashes; TODO: support unicode) and should not contain periods.

NOTE: once you begin doing this, `dnsmasq` will be up and running, if it wasn't already.

```
internal-dns add jane janes.mac.address.here
internal-dns add joe joes.mac.address.here
```

You can also remove a user:

```
internal-dns remove joe
```

You can remove an entry by mac address as well, just use the mac address instead of the name.

**To update a user**, just use the `add` command again. Any existing entry for that name or mac address will be updated rather than duplicated.

**Step Four:** shut off the DHCP service on your router.

## Testing

`dnsmasq` is now your DHCP and forwarding DNS server, handing out IP addresses to computers based on their hardware address (mac address) and answering questions about local names like `site.jane.mycompany` directly.

You will want to try renewing your DHCP release manually to see if you are assigned an IP in the range you configured.

After that, if you added your computer with `internal-dns add jane mac-address`, you should be able to visit `site.jane.mycompany` and talk to the website you're testing on your computer.

## Other options

By default, `internal-dns` stores information in `/var/lib/internal-dns.json`. You can change that with the `json` option. A lockfile with a `.lock` extension is always created in the same folder.

By default, `internal-dns` writes a valid configuration to `/etc/dnsmasq.conf`. You can change this location with the `conf` option, if you have set up `dnsmasq` differently.

By default, the timeout for DHCP leases is 2 hours. You can change that with the `timeout` option, which defaults to `2h`.

By default, dnsmasq is stopped with the command `service dnsmasq stop`, and started with the command `service dnsmasq start`. You can change that with the `start` and `stop` options.

By default, `internal-dns` scans `/var/lib/misc/dnsmasq.leases` and removes any existing lease for a mac address that has just been added or removed. This is the right location at least in Ubuntu Linux. However, you can set the `leases` option to `false` to completely block this behavior, or set it to a filename if your copy of `dnsmasq` keeps leases in a different place.

## Credits

`internal-dns` was created to facilitate our work at [P'unk Avenue](http://punkave.com).

