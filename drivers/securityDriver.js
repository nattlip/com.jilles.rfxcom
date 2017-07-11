"use strict";
const util = require('util');
//const params = {
//    app: `Rfxcom`,
//    driver: `security`,
//    capabilities: [
//        "alarm_contact",
//        "alarm_battery",
//        "alarm_tamper",
//        "alarm_night"
//    ]
//}
const driverLib = require('../driverGenerator/driverLib.js');
const libClass = require('../../lib/libClass.js');
const helpFunctions = require('../lib/helpFunctions.js').jan;





class security extends driverLib {
    constructor() {

        let params = {};
        let appV = `Rfxcom`
        let driverV = `security`
        let typeV = 'visonic'
        let capabilitiesV = [
            "alarm_contact",
            "alarm_battery",
            "alarm_tamper",
            "alarm_motion",
            "alarm_night"
        ]



        params['app'] = appV;
        params['driver'] = driverV
        params['capabilities'] = capabilitiesV
        params['type'] = typeV


        //#region constructor

        super(params);


        //#region parameters to be send to driverLib

        // app




        //#endregion




        // this.lib = new libClass();
        this.debug = true;//  to set debug on or off  
        this.lib.log = this.lib.log.bind(this); // makes that this class is this in function and not base class
        this.lib.log(` ${this.constructor.name}  is this.         welkom to ${this.constructor.name}`);


        this.lib.log('params security ', params)

       




        //#endregion






    }






}
module.exports = new security();



