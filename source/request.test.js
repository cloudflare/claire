const Request = require('./request');

test('preprocesses headers', () => {
  let details = {
    responseHeaders: [
      {
        name: 'server',
        value: 'cloudflare'
      }
    ]
  };

  let r = new Request(details);

  expect(r.headers).toMatchObject({
    SERVER: 'cloudflare'
  });
});

describe('Railgun', () => {
  test('processes Railgun header v1', () => {
    let details = {
      responseHeaders: [
        {
          name: 'cf-railgun',
          value: 'normal 96 foobar 9001'
        }
      ]
    };

    let r = new Request(details);

    expect(r.railgunMetaData).toMatchObject({
      normal: true,
      id: 'normal',
      version: '9001',
      flags: 0x60,
      messages: [
        'Dictionary found in memcache',
        'Restarted broken origin connection'
      ]
    });
  });

  test('processes Railgun header v2', () => {
    let details = {
      responseHeaders: [
        {
          name: 'cf-railgun',
          value: 'foobar 46 700 96 9001'
        }
      ]
    };

    let r = new Request(details);

    expect(r.railgunMetaData).toMatchObject({
      normal: false,
      id: 'foobar',
      version: '9001',
      compression: '54%',
      time: '700sec',
      flags: 0x60,
      messages: [
        'Dictionary found in memcache',
        'Restarted broken origin connection'
      ]
    });
  });

  test('determines Railgun', () => {
    let detailsRG = {
      responseHeaders: [
        {
          name: 'cf-railgun',
          value: 'normal'
        }
      ]
    };
    let detailsNRG = {
      responseHeaders: []
    };

    let rRG = new Request(detailsRG);
    let rNRG = new Request(detailsNRG);

    expect(rRG.servedByRailgun()).toBe(true);
    expect(rNRG.servedByRailgun()).toBe(false);
  });
});

test('determines Cloudflare-ness', () => {
  let detailsCF = {
    responseHeaders: [
      {
        name: 'server',
        value: 'cloudflare-fl'
      }
    ]
  };
  let detailsNCF = {
    responseHeaders: [
      {
        name: 'server',
        value: 'nginx'
      }
    ]
  };

  let rCF = new Request(detailsCF);
  let rNCF = new Request(detailsNCF);

  expect(rCF.servedByCloudFlare()).toBe(true);
  expect(rNCF.servedByCloudFlare()).toBe(false);
});

test('IPv6', () => {
  let detailsV4 = {
    responseHeaders: [],
    ip: '8.8.8.8'
  };
  let detailsV6 = {
    responseHeaders: [],
    ip: '2001:4860:4860::8888'
  };

  let rV4 = new Request(detailsV4);
  let rV6 = new Request(detailsV6);

  expect(rV4.getServerIP()).toEqual('8.8.8.8');
  expect(rV4.isv6IP()).toBe(false);

  expect(rV6.getServerIP()).toEqual('2001:4860:4860::8888');
  expect(rV6.isv6IP()).toBe(true);
});

describe('Ray ID', () => {
  test('get Ray ID', () => {
    let detailsCF = {
      responseHeaders: [
        {
          name: 'CF-Ray',
          value: 'deadbeef-SFO'
        }
      ]
    };
    let detailsNCF = {
      responseHeaders: []
    };

    let rCF = new Request(detailsCF);
    let rNCF = new Request(detailsNCF);

    expect(rCF.getRayID()).toBe('deadbeef');
    expect(rNCF.getRayID()).toBeUndefined();
  });

  test('get location code', () => {
    let detailsCF = {
      responseHeaders: [
        {
          name: 'CF-Ray',
          value: 'deadbeef-SFO'
        }
      ]
    };
    let detailsNCF = {
      responseHeaders: []
    };

    let rCF = new Request(detailsCF);
    let rNCF = new Request(detailsNCF);

    expect(rCF.getCloudFlareLocationCode()).toBe('SFO');
    expect(rNCF.getCloudFlareLocationCode()).toBeUndefined();
  });

  test('location data', () => {
    let details = {
      responseHeaders: [
        {
          name: 'cf-ray',
          value: 'deadbeef-SFO'
        }
      ]
    };

    let r = new Request(details);

    expect(r.getCloudFlareLocationData()).toMatchObject({
      latitude: expect.any(String),
      longitude: expect.any(String),
      city: 'San Francisco',
      country: 'United States'
    });
  });

  test('location name', () => {
    let details = {
      responseHeaders: [
        {
          name: 'cf-ray',
          value: 'deadbeef-SFO'
        }
      ]
    };

    let r = new Request(details);

    expect(r.getCloudFlareLocationName()).toBe('San Francisco, United States');
  });
});
