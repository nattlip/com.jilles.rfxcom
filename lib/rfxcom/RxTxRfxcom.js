"use strict";

const path = require('path');
const net = require("net")
const util = require('util');
const fs = require('fs');
var stream = require("stream");

const convert = require('../baseConverter.js').jan.ConvertBase;
const helpFunctions = require('../helpFunctions.js').jan;
const libClass = require('../libClass.js');

const oregon = require('./lan/oregondecoding.js')
const visonic = require('./lan/visonicdecoding.js')
const X10 = require('./lan/X10decoding.js')

const rfxtrxdecoding = require('./trx/rfxtrxdecoding.js')  // rfxtrx
// for rfxtrx and lan 

class RfxcomRxTx {


    // constructed from manager
    constructor(RxTx) {



        this.filename = path.basename(__filename)
        this.dirname = path.basename(__dirname);
        this.lib = new libClass();
        this.lib.log = this.lib.log.bind(this);
        this.debug = true;//  to set debug on or off 


        this.id = RxTx.id
        this.type = RxTx.type
        this.tabIndex = RxTx.tabIndex
        this.ip = RxTx.ip
        this.rx = RxTx.rx
        this.tx = RxTx.tx


        this.rfxcomconnected = false
        this.serverSet = false;
        this.serverConnected = false;
        this.serverTesting = true; // testing at start and if servervariables are set, have to test first
        this.serverTested = false; //Homey.m
        //Homey.manager('settings').set('testing', this.serverTesting);


        // connected and testing is not a setting but a property
        // only settings are Rxport and Txport ,better rfxcom trnasceivers so they can be build form scratch at start 
        // settings has to be done in app to get te settingings for all transceivers




        this.RxTxTypeMap =
            {
                1: 'RxLan',
                2: 'RxTxLan',
                3: 'TxLan',
                4: 'RfxTrx'
            }










        this.lib.log('this.type ', this.type)
        this.lib.log('this.Ip ', this.ip)
        this.lib.log('this.RxPort ', this.rx)
        this.lib.log('this.TxPort ', this.tx)


        const eol = ' \n'
        const eolf = ' \n\r'


        let previousDataStr = ``




        console.log('Hello world');


        this.testServer = (input) => {

            Homey.manager('api').realtime('testing', input);
        }

        this.lib.log('before splitting devicetype ', this.ip, '  ', this.rx, '  ', this.type);

        if (this.type == 'RxLan' || this.type == 'RxTxLan' || this.type == 'RfxTrx')
        {  // if rx

            this.RxClient = new net.Socket();
            this.lib.log('socket created ', this.ip, '  ', this.rx, '  ', this.type);
            // makes hexstring otherwise uint8array which has to be made buffer
            if (this.type == 'RxLan' || this.type == 'RxTxLan' ) {
                this.RxClient.setEncoding('HEX')
            }


            if (typeof this.RxClient == "undefined") {
                this.lib.log('client connect client undefined')
                this.RxClient = new net.Socket()
                //   this.Rxclient.setEncoding('HEX')
            }


            this.RxClient.connect(this.rx, this.ip, () => {




                
                this.lib.log('client connect enterd ', this.ip, '  ', this.rx);

               

               

               
             
            }) // Rxclient connect


            this.RxClient.on('connect', () => {

                this.lib.log(this.ip, '   Connected   on connect');


                if (this.type == 'RxLan' || this.type == 'RxTxLan') {
                    this.SendModeCommandRxLan()
                }
                else if (this.type == 'RfxTrx') {
                    this.sendStartSequenceTrx()
                }



            }) // on client connect


            this.RxClient.on('data', (dataStr) => {

                this.lib.log('Received: ' + dataStr);
                this.lib.log(`HEX  ` + dataStr + eolf);


                if (this.type == 'RxLan' || this.type == 'RxTxLan') {

                    if (dataStr == `40` || dataStr == `2c`) {
                        util.log(`Server connected !! ip ${this.ip} response  ${dataStr} `)
                        setTimeout(() => {
                            Homey.manager('api').realtime('serverconnected', 'connected');
                            Homey.manager('api').realtime('errormessage', 'no error');
                        }, 5000)
                    }
                    else {

                        // extract firstbyte added by rfxcom 

                        if (dataStr.length == 2)
                        { previousDataStr = dataStr }

                        else if (dataStr.length > 2) {

                            let newDataString = previousDataStr + dataStr

                            while (newDataString.length > 0) {

                                let firstbyte = newDataString.slice(0, 2)
                                util.log('firstbyte ', firstbyte)
                                let firstByteBin = pad(convert.hex2bin(firstbyte), 8)
                                let msbit = firstByteBin.slice(firstByteBin.length - 1)   // 0 Master Receiver 433   Slave Receiver 868
                                util.log(`most significant bit firstbyte `, msbit)
                                if (msbit == `0`)
                                { util.log(`message from Master`) }
                                else if (msbit == '1')
                                { util.log('message from Slave') }




                                let firstByteLengthBin = firstByteBin.slice(2, 8)   // 6 to 0 bit according to rfxcom    
                                util.log('lengthbyte rfxcom bin', firstByteLengthBin)
                                let lengthbytehex = convert.bin2hex(firstByteLengthBin)  // length in hex = 2 characters FF 9A 
                                //util.log('lengthbyte rfxcom hex ', lengthbytehex)


                                let length = lengthbytehex

                                if (Number.isInteger(parseInt(length))) {
                                    let message = newDataString.slice(0, 2 * parseInt(length) + 2)


                                    newDataString = newDataString.slice(2 * parseInt(length) + 2)

                                    decodeData(message)

                                    let jil = 5
                                }
                                else {
                                    util.log('break')
                                    break
                                }
                            } // end while





                            previousDataStr = ``
                            let jil = 5

                        }


                    }
                } // if lan
                else if (this.type == 'RfxTrx') {

                    let dataUInt8Array = dataStr
                    let data = []

                    // Buffer.from(arrayBuffer[, byteOffset[, length]])

                    let buf = Buffer.from(dataUInt8Array)

                    this.lib.log('received Buffer from   ', buf)

                    data.push.apply(data, dataUInt8Array);

                    this.lib.log('Received array   ' + data);







                    this.lib.log("socket.bytesRead      ", this.RxClient.bytesRead)
                    this.lib.log('Received: ' + data);

                    this.lib.log(`HEX  ` + data + eolf);

                    rfxtrxdecoding.receiveSerialData(dataUInt8Array)







                }

               
            });  // client on data



            this.RxClient.on('error', (err) => {
                this.RxClient.end()
                this.lib.log("Error: " + err.message);
                this.serverSet = false

                Homey.manager('api').realtime('errormessage', err.message);
                Homey.manager('api').realtime('serverconnected', 'not connected');
            })


            this.RxClient.on('close', () => {
                console.log('Connection closed');

                this.lib.log('client close triggered')
                this.RxClient.end()

                util.log('client  on close     if (typeof client != "undefined")         ', typeof this.RxClient)
            });



            

            //reconnectTimer = setInterval(function () {
            //    debug('Re-connecting to ' + ip_addr + ':' + ip_port);
            //    self.openComm(ip_addr, ip_port);
            //}, 30000);

            



          






            



        } // if type

   
        this.SendModeCommandRxLan = () => {
            setTimeout(() => {
                let firstbyte = 0xF0
                let secondbyte = 0x2a//0x45 //no visonic
                //let secondbyte = 0x2A //0x2C //0X2A   2a receiveallpossible 2c rfxcom receiving

                //let buffer = Buffer.from([0xF0, 0x40])  // visonic mode
                // let buffer = Buffer.from([ 0xF040])  // visonic mode
                let buffer = Buffer.from([firstbyte, secondbyte])   // all possible receiving modes
                //  let buffer = Buffer.from([0x02, 0xA])   //

                this.RxClient.write(buffer);
                this.lib.log(`${firstbyte.toString(16)}  ${secondbyte.toString(16)}   written`)
                this.lib.log(`${firstbyte}  ${secondbyte}   written`)

            }, 1000)

        }

        this.sendStartSequenceTrx = () => {

            // this works with serial port
            let arrayB = [0x0D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
            // this is for net port
            let bufferB = Buffer.from(arrayB)



            setTimeout(() => {


                this.RxClient.write(bufferB, function (err, results) {

                    console.log('error write ', err)
                    console.log('error result write ', results)

                })

               let bufferB2 = Buffer.from([0x0D, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])



                setTimeout(() => {


                    this.RxClient.write(bufferB2, function (err, results) {

                        console.log('error write ', err)
                        console.log('error result write ', results)

                    })

                }, 1000);



            }, 500);



        }

        // for lan first shift x10security mode from visonic mode
        let decodeData = (hexStr) => {



            let dataBin = convert.hex2bin(hexStr)
            util.log(`BIN  ` + dataBin)
            util.log(`hexStr length`, hexStr.length)
            util.log(`dataBin length`, dataBin.length)

            let hexStrmin = hexStr.slice(2)
            let dataBinmin = convert.hex2bin(hexStrmin)
            let hexStrminL = dataBinmin.length




            // second two bytes are address 2hex chars are 1 byte


            // 5A6D 5d60  
            // 1A2D 1d20
            // FA24 f824
            // EA7C ec70

            let firstbyte = hexStr.slice(0, 2)



            if (firstbyte == `50` || firstbyte == `60` || firstbyte == '78')
            { oregon.parseRXData(hexStr) }
            else if (firstbyte == 'a9')
            { visonic.decodeDataVisonic(hexStr) }
            else if (firstbyte == '20')
            { X10.parseRXData(hexStr) }
            //  { decodeDataX10h(hexStr) }


        }













        let lookProtocolUp = identifier => knownVisonicSensorsMap[identifier]

        let lookDeviceUp = identifier => knownVisonicSensorsMap[identifier].name




        Homey.on('unload', () => {
            this.lib.log('unloading app')

            this.RxClient.destroy() // save some last settings, say goodbye to your remote connected devices, etc.
        });

        let pad = (num, size) => {
            var s = "000000000" + num;
            return s.substr(s.length - size);

        }


   

    } // constructor
}     // class

module.exports =  RfxcomRxTx ;
