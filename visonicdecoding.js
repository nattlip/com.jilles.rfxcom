"use strict";



const util = require('util');
const fs = require('fs');
const libClass = require('../lib/libClass.js')
const convert = require('./lib/baseConverter.js').jan.ConvertBase;
const helpFunctions = require('./lib/helpFunctions.js').jan;
const path = require('path');

const eol = ' \n'
const eolf = ' \n\r'




class visonicdecoding  {

    constructor() {

        this.lib = new libClass();
        this.debug = true;//  to set debug on or off  
        this.filename = path.basename(__filename)
        this.dirname = path.basename(__dirname);
        this.lib.log = this.lib.log.bind(this);
        this.lib.log(` ${this.constructor.name}  is this.         welkom to ${this.constructor.name}`);
        this.lib.log(` ${this.constructor.name}  is this.`, util.inspect(this))


        let VisonicSensors = {}

        let knownVisonicSensorsMap = {

            "a9": { name: "DWSvisonic", layout: "DWS" },
            "05": { name: "DWSsecurityX10", layout: "DWS" }

        }

        let dataLayouts = {

            "DWSvisonic": {
                len: 7,
                startAddress: 2,    // nibble  number address starts  nibble is one of 2 of bte FF F and F
                addressLength: 6,   //   nibble lenght  
                skipAtEnd: 1

            }



        }











        this.decodeDataVisonic = hexStr => {

            // if (hexStr > 2) {
            let dataBin = convert.hex2bin(hexStr)
            util.log(`BIN  ` + dataBin)
            util.log(`hexStr length`, hexStr.length)
            util.log(`dataBin length`, dataBin.length)




            let identifier = (hexStr.slice(0, 2))
            util.log(`identifier  `, identifier)
            let devicetype = lookDeviceUp(identifier)
            util.log(`devicetype `, devicetype)
            util.log(`dataLayouts[devicetype]  `, dataLayouts[devicetype])
            let address = hexStr.slice(2, 6) + hexStr.slice(10, 12)
            util.log(`address `, address)
            let info = hexStr.slice(dataLayouts[devicetype].startAddress + dataLayouts[devicetype].addressLength, hexStr.length - dataLayouts[devicetype].skipAtEnd)
            util.log(`info `, info)
            let infoBin = convert.hex2bin(info)
            util.log(`infobin `, infoBin)
            //let infoByte = hexStr.slice(dataLayouts[devicetype].startAddress + dataLayouts[devicetype].addressLength, dataLayouts[devicetype].startAddress + dataLayouts[devicetype].addressLength + 2)
            let infoByte = hexStr.slice(dataLayouts[devicetype].addressLength, dataLayouts[devicetype].addressLength + 2)
            util.log(`infobyte `, infoByte)

            //   (byte 3, bit3) 0 is motion sensor
            //first inibble of infobyte
            let typeHex = hexStr.slice(dataLayouts[devicetype].addressLength, dataLayouts[devicetype].addressLength + 2)
            util.log(' typehex  ', typeHex);
            let typeNibble = pad(convert.hex2bin(typeHex), 4)
            util.log(' typenibble  ', typeNibble);
            let typeBit = typeNibble.slice(0, 1)
            util.log(' typenibble  ', typeBit);

            let type

            if (typeBit == 0)
                type = 'visonicDoorSensor'
            else
                type = 'visonicMotionSensor'


            let state
            let tamper
            let battery
            // state alert = true state normal false battery high = flase low = true
            switch (infoByte) {
                case '44':
                    util.log(`DWS[ ${address}  Visonic door sensor  Alert + Tamper  `)
                    state = true
                    tamper = true
                    battery = false
                    break;
                case 'c4':
                    util.log(`DWS[ ${address}  Visonic door sensor  Normal + Tamper  `)
                    state = false
                    tamper = true
                    battery = false
                    break;
                case '04':
                    util.log(`DWS[ ${address}  Visonic door sensor  Alert  `)
                    state = true
                    tamper = false
                    battery = false
                    break;
                case '05':
                    util.log(`DWS[ ${address}  Visonic door sensor  Alert (battery low  `)
                    state = true
                    tamper = false
                    battery = true
                    break;
                case '84':
                    util.log(`DWS[ ${address}  Visonic door sensor   Normal  `)
                    state = false
                    tamper = false
                    battery = false
                    break;
                case '85':
                    util.log(`DWS[ ${address}  Visonic door sensor   Normal (battery low)  `)
                    state = false
                    tamper = false
                    battery = true
                    break;
                case '4c':
                    util.log(`MOTION[ ${address}  Visonic motion sensor  Alert + Tamper `)
                    state = true
                    tamper = true
                    battery = false
                    break;
                case 'cc':
                    util.log(`MOTION[ ${address}  Visonic motion sensor  Normal + Tamper `)
                    state = false
                    tamper = true
                    battery = false
                    break;
                case '0c':
                    util.log(`MOTION[ ${address}  Visonic motion sensor  Alert `)
                    state = true
                    tamper = false
                    battery = false
                    break;
                case '0d':
                    util.log(`MOTION[ ${address}  Visonic motion sensor  Alert (battery low)`)
                    state = true
                    tamper = false
                    battery = true
                    break;
                case '8c':
                    util.log(`MOTION[ ${address}  Visonic motion sensor  Normal`)
                    state = false
                    tamper = false
                    battery = false
                    break;
                case '8d':
                    util.log(`MOTION[ ${address}  Visonic motion sensor  Normal (battery low) `)
                    state = false
                    tamper = false
                    battery = true
                  

            }

          

           
            let appV = `Rfxcom`
            let driverV = `security`
            let capabilitiesV = [
                "alarm_contact",
                "alarm_battery",
                "alarm_tamper",
                "alarm_motion",
                "alarm_night"
            ]

           







            let deviceParams  = ''
                
            let hDevice = libClass.computeHomeyDevice( deviceParams,appV, driverV, capabilitiesV,type,address,state,battery,tamper)               
                util.log(`hdevice if entered `, hDevice)
                this.transports(hDevice)
           
           
                     

        }

        this.transports = (hDevice) => {



            Homey.app.processVisonicResult(hDevice)



        }

     let lookProtocolUp = identifier => knownVisonicSensorsMap[identifier]

     let lookDeviceUp = identifier => knownVisonicSensorsMap[identifier].name

     let pad = (num, size) => {
         var s = "000000000" + num;
         return s.substr(s.length - size);
     }

     


    } // end constructor







} // end class

module.exports = new visonicdecoding()





            // code in no visonic info

            //if (!((parseInt(infoByte, 16) & parseInt("40", 16)) == 0))
            //    util.log(` alarm message   `, `ALERT`)
            //else
            //    util.log(` alarm message   `, `CLOSE`)

            //if (!((parseInt(infoByte, 16) & parseInt(80, 16)) == 0))
            //    util.log(` tamper message   `, `TAMPER`)
            //else
            //    util.log(` tamper message   `, `NO TAMPER`)

            //if (!((parseInt(infoByte, 16) & parseInt(20, 16)) == 0))
            //    util.log(` battery message   `, `Battery low`)
            //else
            //    util.log(` battery message   `, `Battery ok`)

            //if (!((parseInt(infoByte, 16) & parseInt(10, 16)) == 0))
            //    util.log(` alive message   `, `alive `)
            //else
            //    util.log(` event message   `, `event`)

            //if ((parseInt(infoByte, 16) & parseInt(8, 16)) == 0)
            //    util.log(` restore message   `, `restore reported `)
            //else
            //    util.log(` restore message   `, `restore not reported`)

            //if (!((parseInt(infoByte, 16) & parseInt(8, 16)) == 0))
            //    util.log(` contact message   `, `primary contact `)
            //else
            //    util.log(` contact message   `, `secondary contact`)






            //succes = writableStream.write(`BIN  ` + infoBin + eolf);
