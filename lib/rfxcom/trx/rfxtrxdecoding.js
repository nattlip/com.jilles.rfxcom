﻿"use strict";



const util = require('util');
const fs = require('fs');
var stream = require("stream");
const path = require('path');
const EventEmitter = require('events').EventEmitter;

const convert = require('../../baseConverter.js').jan.ConvertBase;
const helpFunctions = require('../../helpFunctions.js').jan;
require('../..//lib.js')();
const libClass = require('../../libClass.js')
const rfxcom = require('./index.js')

const driverTEMPHUMBAR = require('../../../drivers/TEMPHUMBAR/driver.js');
const driverTEMP = require('../../../drivers/TEMP/driver.js');
const driverTEMPHUM = require('../../../drivers/TEMPHUM/driver.js');
const driverRAIN = require('../../../drivers/RAIN/driver.js');
const driverUV = require('../../../drivers/UV/driver.js');







const eol = ' \n'
const eolf = ' \n\r'



class rfxtrxdecoding extends EventEmitter {

    constructor() {

        super()


        this.filename = path.basename(__filename)
        this.dirname = path.basename(__dirname);
        this.lib = new libClass();
        this.lib.log = this.lib.log.bind(this);
        this.debug = true;//  to set debug on or off 




        this.origin = 'rfxtrxNet'


       
        this.handlers = {
            0x01: "statusHandler",
            0x02: "messageHandler",
            0x10: "lighting1Handler",
            0x11: "lighting2Handler",
            0x13: "lighting4Handler",
            0x14: "lighting5Handler",
            0x15: "lighting6Handler",
            0x16: "chime1Handler",
            0x19: "blinds1Handler",
            0x20: "security1handler",
            0x4e: "bbq1handler",
            0x4f: "temprain1handler",
            0x50: "temp19Handler",
            0x51: "humidity1Handler",
            0x52: "temphumidity19Handler",
            0x54: "temphumbaro12Handler",
            0x55: "rain16Handler",
            0x56: "wind16Handler",
            0x57: "uv13Handler",
            0x59: "elec1Handler",
            0x5a: "elec23Handler",
            0x5b: "elec4Handler",
            0x5c: "elec5Handler",
            0x5d: "weightHandler",
            0x70: "rfxsensorHandler",
            0x71: "rfxmeterHandler"
        };


        // dataUInt8Array
        this.receiveSerialData = (data) => {

            //let data = []
            //// transforms UInt8Array (typerarray) to array
            //data.push.apply(data, buffer);

            

            let sequencenumber

            this.lib.log('\n ')

            this.lib.log(data);

            if (data[3])
                sequencenumber = data[3]
            this.lib.log('sequencenumer', sequencenumber)

            let datalength = data[0].toString(10)

            this.lib.log('length ', datalength)



            let payLoadString = this.hexBuftostring(data);
            this.lib.log('string ', payLoadString)


            let packetType = data[1]
            let handler = this.handlers[packetType]
            this.lib.log('handler', handler)



            if (typeof handler !== "undefined" && (handler == "temphumidity19Handler" || handler == "temp19Handler"
                || handler == "messageHandler" || handler == "uv13Handler" || handler == "statusHandler" || handler == "lighting2Handler")) {
                // shift 2 times 
                let data2 = data.slice(2, data.length)
                this.lib.log('length data2 ', data2.length)

                this[handler](data2);
            }



            if (data[0].toString(16) == '7' && data.length == 8) {  // 

                if (data[1].toString(16) == '10' && data[3]) {

                    this.decodeX10(data)

                }
            }            
        } // end receiverserialdata

        this.decodeX10 = (dat) => {

            let commands = {
                0: "Off",
                1: "On",
                2: "Dim",
                3: "Bright",
                5: "All Off",
                6: "All On",
                7: "Chime"
            }

            let protocol = 'X10'
            let houseCode = String.fromCharCode(dat[4]).toUpperCase()
            let unitCode = dat[5]
            let command = commands[dat[6]]
            let sequencenumber = dat[3].toString(10)
            let message = {
                'origin': this.origin, 'sequnecenumer': sequencenumber, 'protocol': protocol, 'houseCode': houseCode, 'unitCode': unitCode, 'command': command
            }

            this.lib.log(message)


        }

        this.lighting2Handler = (data) => {

            var commands, idBytes, evt;
            commands = {
                0: "Off",
                1: "On",
                2: "Set Level",
                3: "Group Off",
                4: "Group On",
                5: "Set Group Level"
            };
            idBytes = data.slice(2, 6);
            idBytes[0] &= ~0xfc; // "id1 : 2"
            evt = {
                subtype: data[0],
                seqnbr: data[1],
                id: "0x" + this.dumpHex(idBytes, false).join(""),
                unitcode: data[6],
                commandNumber: data[7],
                command: commands[data[7]] || "Unknown",
                level: data[8],
                rssi: (data[9] >> 4) & 0xf
            };

            this.lib.log("lighting2", evt);
        };


        this.temphumidity19Handler = (data) => {

            let subtype = data[0]
            let seqnbr = data[1]
            let id = "0x" + this.dumpHex(data.slice(2, 4), false).join("")
            let temperature = ((data[4] & 0x7f) * 256 + data[5]) / 10
            let signbit = data[4] & 0x80
            let humidity = data[6]
            let humidityStatus = data[7]
            let batterySignalLevel = data[8]
            let evt = {
                subtype: subtype,
                id: id,
                seqnbr: seqnbr,
                temperature: temperature * (signbit ? -1 : 1),
                humidity: humidity,
                humidityStatus: humidityStatus,
                batteryLevel: batterySignalLevel & 0x0f,
                rssi: batterySignalLevel >> 4
            };

            this.lib.log("th" + subtype, evt);





            let homeyDevice =
                {
                    data: { id: id },
                    name: id,
                    capabilities: ["measure_temperature", "measure_humidity", "alarm_battery"],
                    measure_temperature: temperature,
                    measure_humidity: humidity,
                    alarm_battery: false  //batterySignalLevel & 0x0f    cheating must be flase or true this gives a number which is right ?
                };

            if (!contains(driverTEMPHUM.homeyDevices, homeyDevice)) {
                driverTEMPHUM.homeyDevices.push(homeyDevice);
            } else {

                driverTEMPHUM.updateCapabilitiesHomeyDevice(homeyDevice);
            }


        };


        this.temp19Handler = (data) => {

            let subtype = data[0]
            let seqnbr = data[1]
            let id = "0x" + this.dumpHex(data.slice(2, 4), false).join("")
            let temperature = ((data[4] & 0x7f) * 256 + data[5]) / 10
            let signbit = data[4] & 0x80
            let batterySignalLevel = data[6]
            let evt = {
                subtype: subtype,
                id: id,
                seqnbr: seqnbr,
                temperature: temperature * (signbit ? -1 : 1),
                batteryLevel: batterySignalLevel & 0x0f,

                rssi: batterySignalLevel >> 4
            }
            this.lib.log("temp" + subtype, evt);


            let homeyDevice =
                {
                    data: { id: id },
                    name: id,
                    capabilities: ["measure_temperature", "alarm_battery"],
                    measure_temperature: temperature,
                   alarm_battery: false  //batterySignalLevel & 0x0f    cheating must be flase or true this gives a number which is right ?
                };

            if (!contains(driverTEMP.homeyDevices, homeyDevice)) {
                driverTEMP.homeyDevices.push(homeyDevice);
            } else {

                driverTEMP.updateCapabilitiesHomeyDevice(homeyDevice);
            }

            

        };

        this.uv13Handler = (data) => {
            let self = this;
            let temperature, signbit, evt;
            temperature = ((data[5] & 0x7f) * 256 + data[6]) / 10;
            signbit = data[5] & 0x80;
            evt = {
                subtype: data[0],
                id: "0x" + this.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                temperature: temperature * (signbit ? -1 : 1),
                uv: data[4] / 10,
                batteryLevel: data[7] & 0x0f,
                rssi: (data[7] >> 4) & 0xf
            };
            this.lib.log("uv" + data[0], evt);
        };


        this.messageHandler = (data) => {
            let seqnbr = data[1]
            let responses = {
                0: "ACK - transmit OK",
                1: "ACK - transmit delayed",
                2: "NAK - transmitter did not lock onto frequency",
                3: "NAK - AC address not allowed"
            }

            let message = data[2];
            //if (this.acknowledge[seqnbr] !== undefined && typeof this.acknowledge[seqnbr] === "function") {
            //    this.acknowledge[seqnbr]();
            //    this.acknowledge[seqnbr] = null;
            //}
            this.lib.log("Response: Command message " + this.dumpHex([seqnbr]) + ", " + responses[message]);
            this.lib.log("response", responses[message], seqnbr, message);
        };


        this.statusHandler = (data) => {

            let receiverTypes = {
                0x50: "310MHz",
                0x51: "315MHz",
                0x52: "433.92MHz receiver only",
                0x53: "433.92MHz transceiver",
                0x55: "868.00MHz",
                0x56: "868.00MHz FSK",
                0x57: "868.30MHz",
                0x58: "868.30MHz FSK",
                0x59: "868.35MHz",
                0x5A: "868.35MHz FSK",
                0x5B: "868.95MHz"
            }
            let firmwareTypes = ["Type 1 RO", "Type 1", "Type 2", "Ext", "Ext 2"]
            let subtype = data[0]
            let seqnbr = data[1]
            let cmnd = data[2]
            let msg, receiverType, hardwareVersion, firmwareVersion, firmwareType, protocols,
                copyrightText;

            //if (subtype === 0xFF) {         // Message not understood!
            //    if (this.acknowledge[seqnbr] !== undefined && typeof this.acknowledge[seqnbr] === "function") {
            //        this.acknowledge[seqnbr]();
            //        this.acknowledge[seqnbr] = null;
            //    }
            //     Handle early firmware versions that don't understand command 0x07 - "start receiver"
            //    if (this.initialising) {
            //        this.initialising = false;
            //        this.TxQ.start();
            //        this.debugLog("Started command message queue");
            //    } else {
            //        this.debugLog("Response: Command message " + this.dumpHex([seqnbr]) +
            //            ", command unknown or not supported by this device");
            //        this.emit("response", "Command unknown or not supported by this device", seqnbr, rfxcom.responseCode.UNKNOWN_COMMAND);
            //    }
            //}
            if (subtype === 0x07) {  // Start receiver response (should return copyright message)
                copyrightText = String.fromCharCode.apply(String, data.slice(3, 19));
                if (copyrightText === "Copyright RFXCOM") {
                    //this.debugLog(copyrightText);
                    //this.initialising = false;
                    //this.TxQ.start();
                    //this.debugLog("Started command message queue");
                } else {
                    throw new Error("[rfxcom] on " + "not yet programmed " + " - Invalid response '" + copyrightText + "'");
                }
            } else if (subtype === 0x04 || subtype === 0x03) {  // Handle RFY/ASA list remotes status response
                let params = {
                    remoteNumber: data[3],
                    remoteType: subtype === 0x03 ? "RFY" : "ASA",
                    deviceId: "0x" + this.dumpHex(data.slice(4, 7)).join("") + "/" + data[7],
                    idBytes: [data[4], data[5], data[6]],
                    unitCode: data[7]
                };
                this.rfyRemotesList.push(params);
            } else if (subtype === 0x01) {  // Unknown RFY remote
                //if (this.acknowledge[seqnbr] !== undefined && typeof this.acknowledge[seqnbr] === "function") {
                //    this.acknowledge[seqnbr]();
                //    this.acknowledge[seqnbr] = null;
                // }
                this.lib.log("Response: Command message " + this.dumpHex([seqnbr]) + ", unknown RFY remote ID");
                this.emit("response", "Unknown RFY remote ID", seqnbr, rfxcom.responseCode.UNKNOWN_REMOTE_ID);

            } else if (subtype === 0x00) {  // Mode command response
                // Firmware version decoding supplied by Bert Weijenberg
                if (data.length > 12) {
                    msg = data.slice(2, 19);
                    firmwareVersion = msg[2] + 1000;
                    firmwareType = msg[10];
                } else {
                    msg = data.slice(2, 12);
                    firmwareVersion = msg[2];
                    if (msg[1] === 0x52 && firmwareVersion < 162) {
                        firmwareType = 0;
                    } else if (msg[1] === 0x53 && firmwareVersion < 162) {
                        firmwareType = 1;
                    } else if (msg[1] === 0x53 && firmwareVersion >= 162 && firmwareVersion < 225) {
                        firmwareType = 2;
                    } else {
                        firmwareType = 3;
                    }
                }
                receiverType = receiverTypes[msg[1]];
                hardwareVersion = msg[7] + "." + msg[8];
                // Check which protocols are enabled
                protocols = [];
                for (let key in rfxcom.protocols) {
                    if (rfxcom.protocols.hasOwnProperty(key)) {
                        let value = rfxcom.protocols[key];
                        if (msg[value.msg] & value.bit) {
                            protocols.push(key);
                        }
                    }
                }
                // Now we are ready to go
                this.lib.log("status", {
                    subtype: subtype,
                    seqnbr: seqnbr,
                    cmnd: cmnd,
                    receiverType: receiverType,
                    hardwareVersion: hardwareVersion,
                    firmwareVersion: firmwareVersion,
                    firmwareType: firmwareTypes[firmwareType],
                    enabledProtocols: protocols
                });
                // Send the start receiver command
                //this.startRx(function (err) {
                //    if (err) {
                //        this.close();
                //        this.emit("disconnect", err);
                //    } else {
                //        if (typeof this.readyCallback === "function") {
                //            this.readyCallback();
                //        }
                //    }
                //});
            }
        };

        this.dumpHex = function (buffer, prefix) {
            prefix = prefix || "";
            let val1 = buffer[0]
            let val2 = buffer[1]

            let arr = [val1, val2]
            function dec2hex(value) {
                let hexDigits = "0123456789ABCDEF";
                return prefix + (hexDigits[value >> 4] + hexDigits[value & 15]);
            }
            return arr.map(dec2hex);
        };


        this.hexBuftostring = (bits) => {
            let result = ''


            for (const value of bits) {
                result = result + this.pad(value.toString(16), 2)
            }
            //for (x in bits) {
            //    result = result + x.value.toString(16)



            //}

            return result
        };






        this.makeObjectJson = (key, value) => {
            let item = {};
            item[key] = value;

            let j = JSON.stringify(item);

            return j;
        }



        this.pad = (num, size) => {
            let s = "000000000" + num;
            return s.substr(s.length - size);
        }





    }
}

module.exports = new rfxtrxdecoding()