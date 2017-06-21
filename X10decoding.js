"use strict";



const util = require('util');
const fs = require('fs');
var stream = require("stream");
const path = require('path');
const EventEmitter = require('events').EventEmitter;

const convert = require('./lib/baseConverter.js').jan.ConvertBase;
const helpFunctions = require('./lib/helpFunctions.js').jan;
require('./lib/lib.js')();
const libClass = require('./lib/libClass.js')


const eol = ' \n'
const eolf = ' \n\r'



class X10decoding extends EventEmitter {

    constructor() {

        super()

        this.filename = path.basename(__filename)
        this.dirname = path.basename(__dirname);
        let lib = new libClass();
        this.debug = true;//  to set debug on or off  
        lib.log = lib.log.bind(this); // makes that this class is this in function and not base class
        lib.log('welcome to appSignal');

        this.lastCommandSend = { houseCode: '', unitCode: '', command: '' }  // needed for all on off and bright and dim
        this.commandSend = { houseCode: '', unitCode: '', command: '' }
        this.lastCommandReceived = { houseCode: '', unitCode: '', command: '' }



        //   Byte 1 bit 7 6 5 4 3 2 1 0  lfsb byte also

        let houseCodes = {

            '0110': { houseCode: 'A' },
            '0111': { houseCode: 'B' },
            '0100': { houseCode: 'C' },
            '0101': { houseCode: 'D' },
            '1000': { houseCode: 'E' },
            '1001': { houseCode: 'F' },
            '1010': { houseCode: 'G' },
            '1011': { houseCode: 'H' },
            '1110': { houseCode: 'I' },
            '1111': { houseCode: 'J' },
            '1100': { houseCode: 'K' },
            '1101': { houseCode: 'L' },
            '0000': { houseCode: 'M' },
            '0001': { houseCode: 'N' },
            '0010': { houseCode: 'O' },
            '0011': { houseCode: 'P' }

        }


        this.parseRXData = (hexStr) => {
            util.log('this is x10 decoding  ');

            // strip first byte which is lenthbyte rfxcom

            let hexStrPure = hexStr.slice(2, 10)


            let binStrPure = convert.hex2bin(hexStrPure)
            util.log(`BIN  ` + binStrPure)
            util.log(`hexStrPure length`, hexStrPure.length)
            util.log(`binStrPure length`, binStrPure.length)


            let hexStrPureL = binStrPure.length


            // conversion to x10 homey code
            let payLoadString = binStrPure
            let payLoadArray = helpFunctions.bitStringToBitArray(payLoadString)

            this.parseRXData2(payLoadArray)

        }

        // load is bin array 
        this.parseRXData2 = (load) => {

            let houseCode = "";
            let unitCode;
            let unitCodeString = "";
            let address = "";
            let command = "";

            lib.log(' load', load + '\x1b[0G');

            let data = load;

            //NOTE: in 32 bits, standard X10 mode the bytes are transmitted as:   x10 rfxcom pdf in drive rfxcom vb.net
            //Received order Byte 1 Byte 2 Byte 3 Byte 4
            //Bytes changed of position Byte 3 Byte 4 Byte 1 Byte 2
            //Bits are changed 7 - 0 to 0 - 7 for all 4 bytes 

            let datalength = data.length;
            let bytelength = datalength / 8;
            // modules of length diveded by 8
            let extra = data.length % 8;

            //extract bytes in received order
            let byte1 = data.slice(0, 8);
            let byte2 = data.slice(8, 16);
            let byte3 = data.slice(16, 24);
            let byte4 = data.slice(24, 32);

            lib.log('Byte1    ', byte1);
            lib.log('Byte2    ', byte2);
            lib.log('Byte3    ', byte3);
            lib.log('Byte4    ', byte4);

            // check if there are equal number of 1 and 0 in array

            // [1, 3, 4, 2].find(x => x > 3) // 4


            let valid = checkZerosAndOnes(byte1, byte2, byte3, byte4);

            lib.log('checkZerosAndOnes    ', valid);

            if (valid) {
                // check if secenod and forth are complemet of array
                let complementbytescorrect = checkvalidcomplement(byte1, byte2, byte3, byte4);
                lib.log('complementbytescorrect    ', complementbytescorrect);

                if (complementbytescorrect) {

                    // http://stackoverflow.com/questions/29802787/how-do-i-reverse-an-array-in-javascript-while-preserving-the-original-value-of-t?noredirect=1&lq=1
                    let lfsbByte1 = byte1.slice().reverse();  // reverses also byte 1 without slice
                    let lfsbByte2 = byte2.slice().reverse();
                    let lfsbByte3 = byte3.slice().reverse();
                    let lfsbByte4 = byte4.slice().reverse();

                    //lib.log('lfsbByte1    ', lfsbByte1);
                    //lib.log('lfsbByte2    ', lfsbByte2);
                    //lib.log('lfsbByte3    ', lfsbByte3);
                    //lib.log('lfsbByte4    ', lfsbByte4);


                    //retrieve housecode
                    //bitarray

                    let houseCodeNibble = byte1.slice(0, 4);
                    lib.log(' hc nibble ', houseCodeNibble);
                    let houseCodeNibbleString = helpFunctions.bitArrayToString(houseCodeNibble);
                    houseCode = (houseCodes[houseCodeNibbleString] != null ? houseCodes[houseCodeNibbleString].houseCode : null);
                    lib.log('housecode   ', houseCode)



                    //With a Dim, Bright, All Units On or All Units Off command (bit7 = 1), the unit numbers are not used.
                    //The last On or Off command indicates which unit will dim or bright  .

                    //    Dim = 0x98               bin   1001 1000
                    //    Bright = 0x88                  1000 1000
                    //    All Lights On = 0x90           1001 0000
                    //    All Lights Off= 0x80           1000 0000
                    //    unitnumber bits                 2 0 1 
                    // bit 7 is =1 then bright or all command

                    // first see if it isnt a dim or all command
                    if (byte3[0] == 1) {

                        if (byte3[4] == 1)  // dim or bright
                        {

                            if (byte3[3] == 1) {
                                command = "dim"
                                lib.log(' dim housecode lastreceived command ', this.lastCommandReceived.houseCode);
                                lib.log("command  ", command);
                            }
                            else if (byte3[3] == 0) {
                                command = "bright"
                                lib.log(' bright housecode lastreceived command ', this.lastCommandReceived.houseCode);
                                lib.log("command  ", command);
                            }
                        }
                        // with all the housecode this command is used
                        else if (byte3[4] == 0) // all
                        {
                            if (byte3[3] == 1) {
                                lib.log(' all on housecode lastreceived command ', this.lastCommandReceived.houseCode);
                                command = "allon"
                                lib.log("command  ", command);
                            }
                            else if (byte3[3] == 0) {
                                lib.log(' all off housecode  lastreceived command', this.lastCommandReceived.houseCode);
                                command = "alloff"
                                lib.log("command  ", command);
                            }
                        }
                    }
                    //TODO: process bright all on commands
                    //end     startnormal command
                    else if (byte3[0] == 0) {
                        // retrieveunitcode let unitCode =  (Byte 1 bit 2, Byte 3 bit 6, bit 3, bit 4) + 1
                        let unitCodeBitArray = [];

                        let byte1bit2 = lfsbByte1[2]; // bit 3 of unitnumber and off course the idiots used lfsb again 
                        let bitUnit3 = byte1bit2;
                        unitCodeBitArray.push(byte1bit2);


                        let byte3bit6 = lfsbByte3[6]; //bit 2 of unitnumber
                        let bitUnit2 = byte3bit6;
                        unitCodeBitArray.push(byte3bit6);


                        let byte3bit3 = lfsbByte3[3]; // bit 1 of unitnumber
                        let bitUnit1 = byte3bit3;
                        unitCodeBitArray.push(byte3bit3);


                        let byte3bit4 = lfsbByte3[4];  // bit 0 of unitnumber
                        let bitUnit0 = byte3bit4;
                        unitCodeBitArray.push(byte3bit4);

                        let unitCodeBitString = helpFunctions.bitArrayToString(unitCodeBitArray);
                        lib.log('unitCodebitstring = unicode -1  ', unitCodeBitString);
                        unitCodeString = convert.bin2dec(unitCodeBitString);
                        lib.log('unitCode -1   ', unitCodeString);
                        unitCode = parseInt(unitCodeString);
                        unitCode += 1;
                        unitCodeString = unitCode.toString();

                        lib.log('unitCode  ', unitCodeString);

                        address = houseCode + unitCodeString;

                        //retrieve command 
                        let commandBit = lfsbByte3[5];

                        if (commandBit == 1) {
                            command = "off"
                            lib.log("command  ", command);
                        }
                        else if (commandBit == 0) {
                            command = "on"
                            lib.log("command  ", command);
                        }


                        //TODO: check nummer of zeros and ones in byte 1,2 and 3,4 must be the same 
                        //TODO: number of commands send not process six times the same 
                        //TODO: define last send command for bright and dim
                        //TODO: bright and all commands off



                        //bitstring payload is decoded now. now finde the device with ths address and uodatecapabilities

                    } // else if normal command




                    lib.log(' all on housecode  ', this.lastCommandReceived.houseCode);

                    this.processX10Data(houseCode, unitCodeString, address, command);
                }; // complementcheck
            }// valid
        }; // end parsepayload


        this.processX10Data = (houseCode, unitCodeString, address, command) => {

            let homeyCommand = false;

            if (unitCodeString !== '') {
                this.lastCommandReceived.houseCode = houseCode;
                this.lastCommandReceived.unitCode = unitCodeString;
                this.lastCommandReceived.command = command;
            }
            lib.log(' this.lastCommandReceived    ', this.lastCommandReceived);


            //on motion = motrion true . on night = night true
            if (command == "on") { homeyCommand = true }
            else if (command == "off") { homeyCommand = false }





            let result = {

                houseCode: houseCode,
                unitCode: unitCodeString,
                command: homeyCommand
            }


            let homeyDevice = {
                data: {
                    id: 'X10' + "MS13E" + houseCode + unitCodeString,
                    houseCode: houseCode,
                    unitCode: unitCodeString,
                    type: "MS13E",
                },
                name: 'X10' + "MS13E" + houseCode + unitCodeString,
                capabilities: ["alarm_motion", "alarm_night"],
                capability: {
                    alarm_motion: command,
                    alarm_night: false
                }
            }





            lib.log('typeof result ', typeof result)
            //TODO:  check if device exists
            if (typeof result !== "undefined") {
                // driverMS13E.updateCapabilitiesHomeyDevice('X10','MS13E',homeyDevice.capabilities, homeyDevice,"alarm_motion",command);
                //appReference.processResult(result)
                let frame = 'this is signal'


                lib.log(' result decoding received X10 signal  ', result);


            };







        };  // endprocessdata
        //#endregion





    }
}

module.exports = new X10decoding()