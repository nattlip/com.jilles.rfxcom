﻿// jilles433 app.js


"use strict";
const fs = require('fs');
const path = require('path');
const util = require('util');
const convert = require('./lib/baseConverter').jan.ConvertBase;
const helpFunctions = require('./lib/helpFunctions.js').jan;
const libClass = require('./lib/libClass.js');
const X10LanSignal = require('./lib/rfxcom/lan/X10decoding.js');
const Log = require('homey-log').Log;

const securityDriver  = require('./drivers/security/driver.js')
require('./lib/lib.js')();



class App {



    constructor() {
        
        this.filename = path.basename(__filename)
        this.dirname = path.basename(__dirname);
        this.lib = new libClass();
        this.lib.log = this.lib.log.bind(this);
        this.debug = true;//  to set debug on or off 

        this.lib.log(` ${this.constructor.name}  is this. `, util.inspect(this));
        this.homeyDevices = [];
        this.devicesData = [];
        this.heardList = [];
        this.app = ''
        this.jil = ""

        //this.rfxcomLan= require('./lib/rfxcom/lan/rfxcomLan.js')
        //this.rfxcomTrx = require('./lib/rfxcom/trx/rfxcomTrx.js')
        this.RxTxManager = require('./lib/rfxcom/RxTxManager.js')
        


       //Homey.manager('settings').unset('serverIp');
       //Homey.manager('settings').unset('serverReceiverPort');
       //Homey.manager('settings').unset('serverTransmitterPort');
       //Homey.manager('settings').unset('TrxIp');
       //Homey.manager('settings').unset('TrxPort');



        //this.send = { 'sendstyle': this.appsettings.style , 'sendhtml': this.appsettings.html, 'sendscript': this.appsettings.scriptfunctions }


        //this.sendsettingspage = () =>
        //{

        //    Homey.manager('api').realtime('setHtml', this.send);


        //}



       






        this.getSomething = () => {

            let message = `gotsomething`
            this.lib.log(message)
            return message

        }



        this.getSomethingTrx = () => {

            let message = `gotsomethingTrx`
            this.lib.log(message)
            return message

        }

        this.init = () => {

         




          //  this.rfxcom = require('./rfxcomLan.js');
            this.homeyDevices = [];
            this.devicesData = [];
            this.heardList = []; 

           
            this.lib.log('init homeyDevices ', util.inspect(this.homeyDevices, false, null))

            this.jil = 'this is a sentence in app iniit'
            this.app = 'Rfxcom'

           

            //this.sendsettingspage()

           // this.rfxcomLan.clientConnect()
            //this.rfxcomTrx.clientConnect()

            // receiver transmitter transceiver
            this.RxTx = {
                id: null,    // its id in app = data
                type: null, // lan  with or without transmitterer / trnasmitter or trx //
                tabIndex: null,  // tabindex onsettings page
                ip: null,
                rx: null,  // or trx
                tx: null,
            }

            this.RxTxTypes = {
                "1" :"RxLan",
                "2": "RxTxLan" ,
                "3": "TxLan",
                "4": "RfxTrx" 
            }


            this.X10DeviceMap =

                {

                    'MS': 'MS13E',
                    'On': 'OnOff',
                    'Di': 'Dim',
                    'Al': 'All'
                }

            this.signalTypes =  // eg from visonic decoding, x10decoding oregon decoding 
                {

                "v" :"visonic" ,
                "o"  : "oregon", 
                "X" :   "X10"
            }

            // as defined in x10 signal
            let X10Device = {
                data: {
                    id: null ,            //'X10' + "MS13E" + houseCode + unitCodeString,
                    houseCode: null,
                    unitCode: null ,//unitCodeString,
                    type: null,          //   driver 
                },
                name: null , //'X10' + "MS13E" + houseCode + unitCodeString,
                capabilities: [ ],
                capability: { }
            }

            // as defined in oregondecosding
            let OregonDevice =
                {
                    data: { id: null },  //id and rolling code
                    name: null ,  // id
                    capabilities: [],// ["measure_rain","measure_raintotal"],
                    capability: {} // stat dim = 0.5 onoff ids false
                };




            this.rfxcomDeviceTypes = {
                "generic":  // as template
                {
                    data: {
                        rxtx: {type : null , index: null },       //lan or trx type   1,2,3  tab index of rxtx  which transceiver 
                        driver: null,           
                        type: null,           // type of device eg visonicdoorsensor
                        id: null,             // homey id 
                        houseCode: null,
                        unitCode: null,
                    },
                    protocol : null , //  visonic , x10 , oregon , etc klika elro etc ndlers 
                    name: null,            //   rfxcom and old id 
                    capabilities: [],
                    capability: {}   // onoff dim temp etc as json  object of capabilities
                },

                "visonicMotionSensor": {
                    data: {
                        driver: `security`,
                        type: "visonicMotionSensor",
                        protocol: `visonic`,
                        id: null,
                        houseCode: null,
                        unitCode: null,
                    },   // eg security  ms14e visonic  address
                    name: null,
                    capabilities: ['alarm_motion', 'alarm_tamper', 'alarm_battery'],
                    capability: {
                        alarm_motion: false,
                        alarm_tamper: false,
                        alarm_battery: false}   // onoff dim temp etc as json

                },

                "visonicDoorSensor": {
                    data: {
                        driver: `security`,
                        type: `visonicDoorSensor`,
                        protocol: `visonic`,
                        id: null,
                        houseCode: null,
                        unitCode: null,
                    },   // eg security  ms14e visonic  address
                    name: null,
                    capabilities: ['alarm_contact', 'alarm_tamper','alarm_battery'],
                    capability: {
                        alarm_contact : false,
                        alarm_tamper: false,
                        alarm_battery: false
                    }   // onoff dim temp etc as json

                }




            }







            //this.OregonDeviceTypes =
            //    {
            //        data: { id: oregonBTHR968Device.id },
            //        name: oregonBTHR968Device.id,
            //        capabilities: ["measure_humidity", "measure_pressure", "measure_temperature", "alarm_battery"],
            //        measure_temperature: oregonBTHR968Device.temperature,
            //        measure_humidity: oregonBTHR968Device.humidity,
            //        measure_pressure: oregonBTHR968Device.pressure,
            //        alarm_battery: oregonBTHR968Device.battery,
            //    };

            

            // here it starts generating drivers from the properties of X10Device
            this.X10DeviceTypes = {

                "MS14E": {
                    data: {
                        id: null,
                        houseCode: null,
                        unitCode: null,
                        type: "MS14E",
                    },
                    name: null,
                    capabilities: ["alarm_motion", "alarm_night"],
                    capability: {
                        alarm_motion: false,
                        alarm_night: false
                    }
                },
                "OnOff": {
                    data: {
                        id: null,
                        houseCode: null,
                        unitCode: null,
                        type: "OnOff",
                    },
                    name: null,
                    capabilities: ["onoff"],
                    capability: { onoff: false }
                },
                "Dim": {
                    data: {
                        id: null,
                        houseCode: null,
                        unitCode: null,
                        type: "Dim",
                    },
                    name: null,
                    capabilities: ["onoff", "dim"],
                    capability: {
                        onoff: false,
                        dim: 0
                    }
                }
            }

            
            this.processX10LanResult = (result) => {
                let homeyDevice = {};

                this.lib.log('signal X10 Lan result arrived in app ', util.inspect(result, false, null));


              //  this.triggerflow(result);



                this.homeyDevices.forEach(d => {
                    if (d.data.houseCode === result.houseCode && d.data.unitCode === result.unitCode) {
                        homeyDevice = d
                        this.lib.log('homeyDevice found corresponding ', util.inspect(homeyDevice, false, null));
                        let app = this.app;
                        let driver = d.data.type;
                        let capabilities = d.capabilities;
                        let capability = "alarm_motion"


                        //(app, driver, capabilities, device, capability, boolean:value)
                        //driverMS13E.updateCapabilitiesHomeyDevice(app,driver,capabilities,homeyDevice,capability,result.command)
                        this.X10LanUpdate(app, driver, capabilities, homeyDevice, capability, result.command)
                    }
                    else if
                        (d.data.houseCode === result.houseCode && Number(d.data.unitCode) === (Number(result.unitCode) - 1)) {
                        homeyDevice = d;
                        this.lib.log('homeyDevice found corresponding MS14E alarm night  ', util.inspect(homeyDevice, false, null));
                        let app = this.app;
                        let driver = d.data.type;
                        let capabilities = d.capabilities;
                        let capability = "alarm_night"

                        //(app, driver, capabilities, device, capability, boolean:value)
                        this.X10LanUpdate(app, driver, capabilities, homeyDevice, capability, result.command)
                        //driverMS13E.updateCapabilitiesHomeyDevice(app,driver,capabilities,homeyDevice,capability,result.command)
                    }

                });


            };

            this.X10LanUpdate = (app, driver, capabilities, device, capability, value) => {
                this.lib.log('updateCapabilitiesHomeyDevice capabilities    ', util.inspect(capabilities, false, null));
                this.lib.log('updateCapabilitiesHomeyDevice capability    ', util.inspect(capability, false, null));
                this.lib.log('updateCapabilitiesHomeyDevice value    ', value);
                this.lib.log('device  ', device)
                this.lib.log('app  ', app)
                this.lib.log('driver  ', driver)

                //let drivers  = Homey.manager('drivers').getDrivers()
                //this.lib.log('drivers  314  ', util.inspect(drivers, false, null));


                let driverH = Homey.manager('drivers').getDriver('MS13E');
                this.lib.log('driverH    ', util.inspect(driverH, false, null));
                this.lib.log('driverH    ', 'app 190');









                //  this.lib.log('567 changeDesc homeyDevices before change  ', util.inspect(homeyDevices, false, null));

                if (app = 'Rfxcom') {
                  
                    if (capabilities.indexOf(capability) != -1)
                        this.lib.log(' capabilities.indexOf(capability) != -1 ', capabilities.indexOf(capability) != -1)

                    {
                        for (let i in this.homeyDevices) {
                            // this.lib.log('homeyDevices[i]  ', this.homeyDevices[i])

                            this.lib.log(' this.homeyDevices[i].type == driver ', this.homeyDevices[i].data.type == driver)
                            this.lib.log('driver  ', driver)
                            this.lib.log('his.homeyDevices[i].type  ', this.homeyDevices[i].data.type)
                            this.lib.log('homeyDevices[i].data.houseCode == device.data.houseCode ', this.homeyDevices[i].data.houseCode == device.data.houseCode)
                            this.lib.log(' this.homeyDevices[i].data.unitCode == device.data.unitCode ', this.homeyDevices[i].data.unitCode == device.data.unitCode)


                            this.lib.log('selector', this.homeyDevices[i].data.type == driver &&
                                this.homeyDevices[i].data.houseCode == device.data.houseCode &&
                                this.homeyDevices[i].data.unitCode == device.data.unitCode)

                            if (this.homeyDevices[i].data.type == driver &&
                                this.homeyDevices[i].data.houseCode == device.data.houseCode &&
                                this.homeyDevices[i].data.unitCode == device.data.unitCode) {
                                this.lib.log('selected homeyDevices[i]  ', this.homeyDevices[i])

                                //  this.lib.log('567 updateCapabilitiesHomeyDevice before change homeyDevices[i]  ', util.inspect(homeyDevices[i], false, null));
                                this.homeyDevices[i].capability[capability] = value;
                                // relatime params device_data , capability ,value


                                let realtimeparams = {
                                    'device_data': this.homeyDevices[i].data,
                                    'capability': capability,
                                    'value': value
                                }

                                // signal.emit('realtime',realtimeparams)
                                this.lib.log('devicedata  ', this.homeyDevices[i].data)
                                this.lib.log('capability  ', capability)
                                this.lib.log('makeBoolean(value)  ', makeBoolean(value))
                                this.lib.log('value  ', value)

                                driverH.realtime(this.homeyDevices[i].data, capability,value) //makeBoolean(value));
                                this.lib.log('driverH    ', 'app 244');


                                this.lib.log('updateCapabilitiesHomeyDevice this.homeyDevices[i].data   ', this.homeyDevices[i].data)

                                //     this.lib.log('567 updateCapabilitiesHomeyDevice after change homeyDevices[i]  ', util.inspect(this.homeyDevices[i], false, null))

                                break;  //stop this loop we found it
                            }
                            else if (this.homeyDevices[i].data.type == "MS13E" &&
                                this.homeyDevices[i].data.houseCode === device.data.houseCode &&
                                Number(this.homeyDevices[i].data.unitCode) === Number(device.data.unitCode - 1) &&
                                driver === "MS13E"
                            ) {
                                console.log('updateCapabilitiesHomeyDevice alarm night   ', device.capability.alarm_motion)

                                this.homeyDevices[i].capablity.alarm_night = value;


                                let realtimeparams = {
                                    'device_data': this.homeyDevices[i].data,
                                    'capability': capability,
                                    'value': value
                                }

                                driverH.realtime(this.homeyDevices[i].data, capability, value )// makeBoolean(value));
                                this.lib.log('driverH    ', 'app 271');

                                break
                            }
                        }
                    }
                }
            }











            // process receoved signals param result  houseCode unitCode: unitCodeString,c       command  : homeyCommand
            this.processVisonicResult = (result) => {

                this.lib.log(`this is app with result visonic received`, result)
                this.lib.log(`contains`, !helpFunctions.contains2(this.heardList, result))
                if (!helpFunctions.contains2(this.heardList, result)) {
                    //  this.heardList.push(result);
                    this.heardList[this.heardList.length] = result
                    //this.homeyDevices[this.homeyDevices.length] = result
                } else {

                  //  this.lib.log(`apps heardlist`, this.heardList)
                    this.lib.log(`apps heardlist length `, this.heardList.length)
                    this.lib.log(`apps homeydevices length`, this.homeyDevices.length)
                }


                let homeyDevice = {};
                let driver = result.data.driver
                this.lib.log(' app', this.app)
                this.lib.log('driver  ', driver)
                this.lib.log('result.data.driver  ', result.data.driver)



                if (this.app == 'Rfxcom' && driver == `security`) {

                    this.lib.log('    enterd if frfxcom and security  processvisonic        ')

                    this.homeyDevices.forEach(d => {
                        if (d.data.id === result.data.id) {
                            homeyDevice = d
                            this.lib.log('homeyDevice data found corresponding ', util.inspect(homeyDevice.data, false, null));
                            let app = this.app;
                            let driver = d.data.driver;
                            let capabilities = d.capabilities;
                            


                            //(app, driver, capabilities, device, capability, boolean:value)
                            //driverMS13E.updateCapabilitiesHomeyDevice(app,driver,capabilities,homeyDevice,capability,result.command)



                            //capabilities.forEach
                            for (let s of capabilities) {
                                // ... do something with s ...
                          
                                this.lib.log(' let s of capabilities         ',  s)
                                this.lib.log(' homeyDevice.capability[s]       ', homeyDevice.capability[s])
                                this.lib.log(' hresult.capability[s]       ', result.capability[s])
                                                                
                                this.update(app, driver, capabilities, homeyDevice, s, result.capability[s])


                            }
                        }
                     

                    });


                };
            };



                  

          




            this.update = (app, driver, capabilities, device, capability, value) => {
                this.lib.log('updateCapabilitiesHomeyDevice capabilities    ', util.inspect(capabilities, false, null));
                this.lib.log('updateCapabilitiesHomeyDevice capability    ', util.inspect(capability, false, null));
                this.lib.log('updateCapabilitiesHomeyDevice value    ', value);
                this.lib.log('device  data', device.data)
                this.lib.log('app  ', app)
                this.lib.log('driver  ', driver)

                                
                let driverH 
                //  this.lib.log('567 changeDesc homeyDevices before change  ', util.inspect(homeyDevices, false, null));

                if (app == 'X10')
                {
                     driverH = Homey.manager('drivers').getDriver('MS13E');

                    if (capabilities.indexOf(capability) != -1)
                        this.lib.log(' capabilities.indexOf(capability) != -1 ', capabilities.indexOf(capability) != -1)

                    {
                        for (let i in this.homeyDevices) {
                            // this.lib.log('homeyDevices[i]  ', this.homeyDevices[i])

                            this.lib.log(' this.homeyDevices[i].driver == driver ', this.homeyDevices[i].data.driver == driver)
                            this.lib.log('driver  ', driver)
                            this.lib.log('his.homeyDevices[i].type  ', this.homeyDevices[i].data.type)
                            this.lib.log('homeyDevices[i].data.houseCode == device.data.houseCode ', this.homeyDevices[i].data.houseCode == device.data.houseCode)
                            this.lib.log(' this.homeyDevices[i].data.unitCode == device.data.unitCode ', this.homeyDevices[i].data.unitCode == device.data.unitCode)


                            this.lib.log('selector', this.homeyDevices[i].data.type == driver &&
                                this.homeyDevices[i].data.houseCode == device.data.houseCode &&
                                this.homeyDevices[i].data.unitCode == device.data.unitCode)

                            if (this.homeyDevices[i].data.type == driver &&
                                this.homeyDevices[i].data.houseCode == device.data.houseCode &&
                                this.homeyDevices[i].data.unitCode == device.data.unitCode)
                            {
                                this.lib.log('selected homeyDevices[i]  ', this.homeyDevices[i])

                                //  this.lib.log('567 updateCapabilitiesHomeyDevice before change homeyDevices[i]  ', util.inspect(homeyDevices[i], false, null));
                                this.homeyDevices[i].capability[capability] = value;
                                // relatime params device_data , capability ,value


                                let realtimeparams = {
                                    'device_data': this.homeyDevices[i].data,
                                    'capability': capability,
                                    'value': value
                                }

                            
                                this.lib.log('devicedata  ', this.homeyDevices[i].data)
                                this.lib.log('capability  ', capability)
                                this.lib.log('makeBoolean(value)  ', makeBoolean(value))
                                this.lib.log('value  ', value)

                                driverH.realtime(this.homeyDevices[i].data, capability, makeBoolean(value));
                                this.lib.log('driverH    ', 'app 244');


                                this.lib.log('updateCapabilitiesHomeyDevice this.homeyDevices[i].data   ', this.homeyDevices[i].data)

                                //     this.lib.log('567 updateCapabilitiesHomeyDevice after change homeyDevices[i]  ', util.inspect(this.homeyDevices[i], false, null))

                                break;  //stop this loop we found it
                            }
                            else if (this.homeyDevices[i].data.type == "MS13E" &&
                                this.homeyDevices[i].data.houseCode === device.data.houseCode &&
                                Number(this.homeyDevices[i].data.unitCode) === Number(device.data.unitCode - 1) &&
                                driver === "MS13E"
                            ) {
                                console.log('updateCapabilitiesHomeyDevice alarm night   ', device.capability.alarm_motion)

                                this.homeyDevices[i].capablity.alarm_night = value;


                                let realtimeparams = {
                                    'device_data': this.homeyDevices[i].data,
                                    'capability': capability,
                                    'value': value
                                }

                                driverH.realtime(this.homeyDevices[i].data, capability, makeBoolean(value));
                                this.lib.log('driverH    ', 'app 271');

                                break
                            }
                        }
                    }
                } // if

                else if (app == 'Rfxcom' && driver == `security`) 
                    {
                    driverH = Homey.manager('drivers').getDriver(driver);

                   // this.lib.log('     driverH       ', util.inspect(driverH))
                 
                    //if (capabilities.indexOf(capability) != -1)
                    //    this.lib.log(' capabilities.indexOf(capability) != -1 ', capabilities.indexOf(capability) != -1)

                    //{
                        for (let i in this.homeyDevices) {
                            // this.lib.log('homeyDevices[i]  ', this.homeyDevices[i])

                            this.lib.log(' this.homeyDevices[i].driver == driver ', this.homeyDevices[i].data.driver == driver)
                           this.lib.log('his.homeyDevices[i].type  ', this.homeyDevices[i].data.type)
                            this.lib.log('homeyDevices[i].data.id == device.data.id ', this.homeyDevices[i].data.id == device.data.id)

                            this.lib.log('   this.homeyDevices[i].data.driver        ', this.homeyDevices[i].data.driver )
                            this.lib.log('    driver       ', driver)

                            this.lib.log('  this.homeyDevices[i].data.id         ', this.homeyDevices[i].data.id)
                            this.lib.log('     device.data.id      ',  device.data.id)                            
                            this.lib.log('selector', this.homeyDevices[i].data.driver == driver && this.homeyDevices[i].data.id == device.data.id)

                            if (this.homeyDevices[i].data.driver == driver &&
                                this.homeyDevices[i].data.id == device.data.id)
                            {
                                this.lib.log('selected homeyDevices[i] data ', this.homeyDevices[i].data)

                                //  this.lib.log('567 updateCapabilitiesHomeyDevice before change homeyDevices[i]  ', util.inspect(homeyDevices[i], false, null));
                             //   this.homeyDevices[i].capability[capability] = value;
                                // relatime params device_data , capability ,value


                                let realtimeparams = {
                                    'device_data': this.homeyDevices[i].data,
                                    'capability': capability,
                                    'value': value
                                }

                             
                                this.lib.log('devicedata homeydevice i ', this.homeyDevices[i].data)
                                

                                this.lib.log('capability  ', capability)
                               this.lib.log('value  ', value)





                                driverH.realtime(this.homeyDevices[i].data, capability, value);
                                this.lib.log('driverH realtime    ', capability, '', value);


                                this.lib.log('updateCapabilitiesHomeyDevice this.homeyDevices[i].data   ', this.homeyDevices[i].data)

                                //     this.lib.log('567 updateCapabilitiesHomeyDevice after change homeyDevices[i]  ', util.inspect(this.homeyDevices[i], false, null))

                                break;  //stop this loop we found it
                            }
                            
                        }
                   // }
                } // if

            } // this.update


                   

               


            











        } // end init





    } // end constructor  







    // create a generic driver 


}  // end class

module.exports = new App();

