"use strict";
const util = require('util');
 const driverLib = require('../driverGenerator/driverLib.js');  // no new and () in module export driverLib
const libClass = require('../../lib/libClass.js');
const helpFunctions = require('../lib/helpFunctions.js').jan;


//util.log(` OnOff  is this.  ................before class `, util.inspect(driverLib));















class MS13E extends driverLib
{
    constructor()
    {

        let params = {};
        let appV = `Rfxcom`
        let typeV = 'X10'
        let driverV = `MS13E`
        let capabilitiesV = ["alarm_motion", "alarm_night"]



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


        this.lib.log('params MS13E ', params)
        

        // this.init = this.init.bind(this);
        //this.pair = this.pair.bind(this);

        //this.addDevice = this.addDevice.bind(this);
        //this.updateCapabilitiesHomeyDevice = this.updateCapabilitiesHomeyDevice.bind(this);

        //this.capabilities.MS13E.get = this.capabilities.MS13E.get.bind(MS13E);
        //this.capabilities.MS13E.set = this.capabilities.MS13E.set.bind(MS13E);

        //this.getDeviceById = this.getDeviceById.bind(this);



        //this.updateDeviceMS13E = this.updateDeviceMS13E.bind(this);




        //#endregion






    }






}
module.exports = new MS13E();