"use strict";


const util = require('util');
const security = require('../securityDriver.js');
const libClass = require('../../lib/libClass.js')

let lib = new libClass();
this.debug = true;//  to set debug on or off  
let name = 'driver.js security::';
lib.log = lib.log.bind(this, name); // makes that this class is this in function and not base class
lib.log(` ${this.constructor.name}  is this.         welkom to ${this.constructor.name}`);




//lib.log('Security inits in driver.js ', util.inspect(security))
//lib.log('Visonic inits init driver.js ', util.inspect(security.init.toString(), { showHidden: true, depth: null, showProxy: true }))
module.exports = security;