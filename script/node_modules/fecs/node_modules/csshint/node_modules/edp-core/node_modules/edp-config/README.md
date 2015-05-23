# edp-config

[![Build Status](https://travis-ci.org/ecomfe/edp-config.png?branch=1.0.0-dev)](https://travis-ci.org/ecomfe/edp-config) [![Dependencies Status](https://david-dm.org/ecomfe/edp-config.png)](https://david-dm.org/ecomfe/edp-config)

Package for edp configuration.

## Usage

```javascript
var edpConfig = require( 'edp-config' );
edpConfig.set( 'user.name', yourname );
edpConfig.get( 'user.name' );
```

## API


### all()

Get all configuration items.

### get( name )

Get configuration item.

- `name` {string}

### set( name, value )

Set configuration item.

- `name` {string}
- `value` {JSON}
