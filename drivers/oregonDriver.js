"use strict";
const util = require('util');
const driverLib = require('../driverGenerator/driverLib.js');  // no new and () in module export drivergenerator 
const libClass = require('../../lib/libClass.js');
//const signal = require('../../signalx10.js');
const helpFunctions = require('../lib/helpFunctions.js').jan;





class Oregon extends driverLib {
    constructor() {

        let params = {};
        let appV = `Rfxcom`
        let driverV = `Oregon`
        let capabilitiesV = ['onoff', 'dim']



        params['app'] = appV;
        params['driver'] = driverV
        params['capabilities'] = capabilitiesV



        //#region constructor

        super(params);


        //#region parameters to be send to driverLib

        // app




        //#endregion




        // this.lib = new libClass();
        this.debug = true;//  to set debug on or off  
        this.lib.log = this.lib.log.bind(this); // makes that this class is this in function and not base class
        this.lib.log(` ${this.constructor.name}  is this.         welkom to ${this.constructor.name}`);


        this.lib.log('params dim ', params)

       




        //#endregion






    }






}
module.exports = new Oregon();



