"use strict";

const path = require('path');
const net = require("net")
const util = require('util');
const fs = require('fs');
var stream = require("stream");

const convert = require('./lib/baseConverter.js').jan.ConvertBase;
const helpFunctions = require('./lib/helpFunctions.js').jan;
const libClass = require('./lib/libClass.js');

const oregon = require('./oregondecoding.js')
const visonic = require('./visonicdecoding.js')
const X10 = require('./X10decoding.js')

//const oregon = new oregonrequire()

class rfxcom  {

    constructor() {
        this.filename = path.basename(__filename)
        this.dirname = path.basename(__dirname);
        this.lib = new libClass();
        this.lib.log = this.lib.log.bind(this);
        this.debug = true;//  to set debug on or off 
        this.rfxcomconnected = false



        this.serverIp = Homey.manager('settings').get('serverIp');
        this.serverReceiverPort = Homey.manager('settings').get('serverReceiverPort');
        this.serverTransmitterPort = Homey.manager('settings').get('serverTransmitterPort');

        this.serverSet = false;
        this.serverConnected = false;
        this.serverTesting = true; // testing at start and if servervariables are set, have to test first
        this.serverTested = false; //Homey.m
        Homey.manager('settings').set('testing', this.serverTesting);





        this.lib.log('this.serverIp', this.serverIp)
        this.lib.log('this.serverReceiverPort', this.serverReceiverPort)
        this.lib.log('this.serverTransmitterPort', this.serverTransmitterPort)


        const eol = ' \n'
        const eolf = ' \n\r'


        let previousDataStr = ``
        
       // util.log(` Homey.settings `, util.inspect(Homey ,true,8)    )
        let knownVisonicSensorsMap = {

            "a4": { name: "DWSvisonic", layout: "DWS" },
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


        console.log('Hello world');

        // fires when one of the settings changed
        Homey.manager('settings').on('set', () => {
             //check which setting changed

            let oldip
            let oldRecieverPort
            let oldTransmitterport
            let oldTesting
            
                      

            

            // first check if there is a device with that ip and then check if it is a rfxcomlan. 

         //  this.serverTesting = Homey.manager('settings').get('testing') 77 sets it false value of setting in homey.settings must change to get0n.set activated
          //  this.lib.log('cleint destryed in set ', this.client)
            //this.client.destroy()

          //  this.lib.log('cleint destryed in set 2 ',this.client)
            this.lib.log('client in set setting', this.client)
          
            this.client.end();
            this.client.destroy()
            //this.client.destroy();





            this.serverIp = Homey.manager('settings').get('serverIp');
            this.serverReceiverPort = Homey.manager('settings').get('serverReceiverPort');
            this.serverTransmitterPort = Homey.manager('settings').get('serverTransmitterPort');









           setTimeout(() => { this.clientConnect() }, 1000 )
          //  this.clientConnect()

            


            this.serverSet = false;
            console.log('181 settings on set with serverTesting ', this.serverTesting);
            console.log('181 settings on set with serverip ', this.serverIp);
            console.log('181 settings on set with serverReceiverPort ', this.serverReceiverPort);
            console.log('181 settings on set with this.serverTransmitterPort ', this.serverTransmitterPort);

            Homey.manager('settings').set('testing', true);



        });


        this.testServer = (input) => {

            Homey.manager('api').realtime('testing', input);
        }







        // let server = net.createServer(function (socket) {
        //    socket.write('Echo server\r\n');
        //    socket.pipe(socket);
        //});

        //server.listen(1337, '127.0.0.1');

        this.client = new net.Socket();
        this.client.setEncoding('HEX')


        this.clientConnect = () => {


            if (typeof this.client == "undefined") {
                util.log('client connect client undefined')
                { Homey.manager('api').realtime('errormessage', 'new client client was undefined'); }
                this.client = new net.Socket()
                this.client.setEncoding('HEX')
            }
           // this.client.connect(Homey.settings.serverReceiverPort, Homey.settings.serverIp, () => {
           
            this.client.connect( this.serverReceiverPort,this.serverIp, () => {

                this.lib.log('checkport', this.checkPort(this.serverReceiverPort))
                this.lib.log('checkip', this.checkIp(this.serverIp))

                if (this.checkPort(this.serverReceiverPort) && this.checkIp(this.serverIp)) {


                    console.log('Connected');

                    setTimeout(() => {
                        let firstbyte = 0xF0
                        let secondbyte = 0x2a//0x45 //no visonic
                        //let secondbyte = 0x2A //0x2C //0X2A   2a receiveallpossible 2c rfxcom receiving

                        //let buffer = Buffer.from([0xF0, 0x40])  // visonic mode
                        // let buffer = Buffer.from([ 0xF040])  // visonic mode
                        let buffer = Buffer.from([firstbyte, secondbyte])   // all possible receiving modes
                        //  let buffer = Buffer.from([0x02, 0xA])   //

                        this.client.write(buffer);
                        this.lib.log(`${firstbyte.toString(16)}  ${secondbyte.toString(16)}   written`)
                        this.lib.log(`${firstbyte}  ${secondbyte}   written`)

                    }, 1000)


                }
                else if (!this.checkPort(this.serverReceiverPort))
                { Homey.manager('api').realtime('errormessage', 'portrange > 0 and port < 65536'); }
                else if (this.checkIp(this.serverIp))
                 { Homey.manager('api').realtime('errormessage', 'ip address not correct'); }
            }) // client connect

        } // this client connect    
            
                   




        this.client.on('data',  (dataStr) => {
           
            this.lib.log('Received: ' + dataStr);

            this.lib.log(`HEX  ` + dataStr + eolf);

        
            if (dataStr == `40` || dataStr == `2c`)
            {
                util.log(`Server connected !! ip ${this.serverIp} response  ${dataStr} `)
                setTimeout(() => {
                    Homey.manager('api').realtime('serverconnected','connected');
                    Homey.manager('api').realtime('errormessage', 'no error');
                },5000)
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
            
            //client.destroy(); // kill client after server's response
        });  // client on data



        this.client.on('error', (err) => {
            this.client.end()
            this.lib.log("Error: " + err.message);
            this.serverSet = false

            this.client.end()
            Homey.manager('api').realtime('errormessage', err.message);
            Homey.manager('api').realtime('serverconnected', 'not connected');
        })


       



        this.client.on('close', () => {
            console.log('Connection closed');

            this.lib.log('client close triggered')
            this.client.end()
               
                util.log('client  on close     if (typeof client != "undefined")         ' , typeof this.client)
        });


        this.checkIp = input => net.isIPv4(input)

        this.checkPort = input => {
            
            if (input > 0 && input < 65536)
               return  true
            else return false

           
        }




        // first shift x10security mode from visonic mode
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
            else if (firstbyte == 'a9' )
            { visonic.decodeDataVisonic(hexStr) }
            else if (firstbyte == '20')
            { X10.parseRXData(hexStr) }
          //  { decodeDataX10h(hexStr) }


        }

        let decodeDataVisonic = hexStr => {

            let dataBin = convert.hex2bin(hexStr)
            util.log(`BIN  ` + dataBin)
            util.log(`hexStr length`, hexStr.length)
            util.log(`dataBin length`, dataBin.length)
           

             //   (byte 3, bit3) 0 is motion sensor

            let identifier = (hexStr.slice(0, 2))
            util.log(`identifier  `, identifier)
            let devicetype = lookDeviceUp(identifier)
            util.log(`devicetype `, devicetype)
            util.log(`dataLayouts[devicetype]  `, dataLayouts[devicetype])
            let address = hexStr.slice(dataLayouts[devicetype].startAddress, dataLayouts[devicetype].startAddress + dataLayouts[devicetype].addressLength)
            util.log(`address `, address)
            let info = hexStr.slice(dataLayouts[devicetype].startAddress + dataLayouts[devicetype].addressLength, hexStr.length - dataLayouts[devicetype].skipAtEnd)
            util.log(`info `, info)
            let infoBin = convert.hex2bin(info)
            util.log(`infobin `, infoBin)
            let infoByte = hexStr.slice(dataLayouts[devicetype].startAddress + dataLayouts[devicetype].addressLength, dataLayouts[devicetype].startAddress + dataLayouts[devicetype].addressLength + 2)
            util.log(`infobyte `, infoByte)


            if (!((parseInt(infoByte, 16) & parseInt("40", 16)) == 0))
                util.log(` alarm message   `, `ALERT`)
            else
                util.log(` alarm message   `, `CLOSE`)

            if (!((parseInt(infoByte, 16) & parseInt(80, 16)) == 0))
                util.log(` tamper message   `, `TAMPER`)
            else
                util.log(` tamper message   `, `NO TAMPER`)

            if (!((parseInt(infoByte, 16) & parseInt(20, 16)) == 0))
                util.log(` battery message   `, `Battery low`)
            else
                util.log(` battery message   `, `Battery ok`)

            if (!((parseInt(infoByte, 16) & parseInt(10, 16)) == 0))
                util.log(` alive message   `, `alive `)
            else
                util.log(` event message   `, `event`)

            if ((parseInt(infoByte, 16) & parseInt(8, 16)) == 0)
                util.log(` restore message   `, `restore reported `)
            else
                util.log(` restore message   `, `restore not reported`)

            if (!((parseInt(infoByte, 16) & parseInt(8, 16)) == 0))
                util.log(` contact message   `, `primary contact `)
            else
                util.log(` contact message   `, `secondary contact`)






        




        }







        let lookProtocolUp = identifier => knownVisonicSensorsMap[identifier]

        let lookDeviceUp = identifier => knownVisonicSensorsMap[identifier].name




        Homey.on('unload', () => {
            this.lib.log('unloading app')

            this.client.destroy() // save some last settings, say goodbye to your remote connected devices, etc.
        });

        let pad = (num, size) => {
            var s = "000000000" + num;
            return s.substr(s.length - size);

        }




    }
}

module.exports =  new rfxcom();
