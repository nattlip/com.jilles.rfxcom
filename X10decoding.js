"use strict";



const util = require('util');
const fs = require('fs');
var stream = require("stream");

const convert = require('./lib/baseConverter.js').jan.ConvertBase;
const helpFunctions = require('./lib/helpFunctions.js').jan;
const EventEmitter = require('events').EventEmitter;
const eol = ' \n'
const eolf = ' \n\r'



class X10decoding extends EventEmitter {

    constructor() {

        super()





    }
}

module.exports = new X10decoding()