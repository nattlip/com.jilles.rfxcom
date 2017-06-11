"use strict";


const util = require('util');
const Oregon = require('../oregonDriver.js');
const libClass = require('../../lib/libClass.js')

let lib = new libClass();
this.debug = true;//  to set debug on or off  
let name = 'driver.js oregon::';
lib.log = lib.log.bind(this, name); // makes that this class is this in function and not base class
lib.log(` ${this.constructor.name}  is this.         welkom to ${this.constructor.name}`);




//lib.log('Oregon inits in driver.js ', util.inspect(Oregon))
//lib.log('Oregon inits init driver.js ', util.inspect(Oregon.init.toString(), { showHidden: true, depth: null, showProxy: true }))
module.exports = Oregon;