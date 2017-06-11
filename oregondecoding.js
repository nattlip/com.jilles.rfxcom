"use strict";



const util = require('util');
const fs = require('fs');
var stream = require("stream");

const convert = require('./lib/baseConverter.js').jan.ConvertBase;
const helpFunctions = require('./lib/helpFunctions.js').jan;
const EventEmitter = require('events').EventEmitter;
const eol = ' \n'
const eolf = ' \n\r'



class oregondecoding extends EventEmitter  {

    constructor() {

        super()

    this.dataLayouts = {
        'TH1': {
            len: 2,
            data: {
                temperature: { tag : 'rfxcomtemp' },                
                humidity: { tag : 'rfxcomhumidity' },
                unknown: { start: 6, len: 1 }
            }
        },
        'T1': {
            len: 4,
            data: {
                temperature: { start: 0, len: 3, div: 10 },
                sign: { start: 3, len: 1 }
            }
        },
        'UV1': {
            len: 4,
            data: {
                uvindex: { start: 0, len: 2 },
                unknown: { start: 2, len: 2 }
            }
        },
        'UV2': {
            len: 5,
            data: {
                unknown: { start: 0, len: 3 },
                uvindex: { start: 3, len: 2 }
            }
        },
        'W1': {
            len: 9,
            data: {
                direction: { start: 0, len: 1, enc: 'bin' },
                unknown: { start: 1, len: 2 },
                currentspeed: { start: 3, len: 3, div: 10 },
                averagespeed: { start: 6, len: 3, div: 10 }
            }
        },
        'R1': {
            len: 10,
            data: {
                rainrate: { start: 0, len: 4, div: 100 },  // 0.01 inch/hr
                raintotal: { start: 4, len: 6, div: 1000 } // 0.001 inch
            }
        },
        'R2': {
            len: 8,
            data: {
                rainrate: { start: 0, len: 4, div: 10 },   // 0.1 mm/hr
                raintotal: { start: 4, len: 4, div: 10 }  // 0.1 mm
            }
        },
        'THB': {
            len: 9, // 11 ?
            data: {
                temperature: { start: 0, len: 3, div: 10 },
                sign: { start: 3, len: 1 },
                humidity: { start: 4, len: 2 },
                comfort: {
                    start: 6, len: 1, map:
                    { 0: 'Normal', 4: 'Comfortable', 8: 'Dry', c: 'Wet' }
                },
                pressure: { start: 7, len: 2, add: 856 }, // mbar
                forecast: {
                    start: 9, len: 1, map:
                    { 2: 'Cloudy', 3: 'Rainy', 6: 'Partly cloudy', c: 'Sunny' }
                }
            }
        }
    }

    this.knownSensors = {
        '1984': { name: 'WGR800', layout: 'W1' },
        '1994': { name: 'WGR800', layout: 'W1' },
        '1d20': { name: 'THGN123N/THGR122NX', layout: 'TH1' },
        '1a2d': { name: 'THGR228N/THGN132N/THGR918/THGR928/THGRN228/THGN500' },
        'e2cf': { name: 'THGR333/THGN228NX', layout: 'TH1' },   // deze is het // kleine in corona
        '1d30': { name: 'THGN500', layout: 'TH1' },
        '1a3d': { name: 'THGR918' },
        '2914': { name: 'PCR800', layout: 'R1' },
        '2a1d': { name: 'RGR918' },
        '2d10': { name: 'RGR968', layout: 'R2' },
        '3a0d': { name: 'STR918/WGR918' },
        '5a5d': { name: 'BTHR918' },
        '5d60': { name: 'BTHR968/BTHR 918N', layout: 'THB' },
        'c844': { name: 'THWR800', layout: 'T1' },
        'd874': { name: 'UVN800', layout: 'UV2' },
        'ec40': { name: 'THN132N/THR238NF', layout: 'T1' },
        'ea4c': { name: 'THWR288A' },
        'ec70': { name: 'UVR128', layout: 'UV1' },  //mijne in corona
        'f824': { name: 'THGN800/THGN801/THGR810', layout: 'TH1' },
        'f8b4': { name: 'THGR810', layout: 'TH1' }
    }

   let Sensors = {};


    this.parseRXData = (dataHex) => 
    //http://stackoverflow.com/questions/3756880/best-way-to-get-two-nibbles-out-of-a-byte-in-javascript

    {
        
      


        // v2.1 first make bitcount even then extract all uneven bits, they are inverted copy of  message
       

       


        

        


        //// to check nan from result  in decodedata
        //if (version == 2) {
        //    var baroNibble1 = datastring.slice(64, 68);
        //    var baroNibble2 = datastring.slice(68, 72);
        //    var baroNibble3 = datastring.slice(72, 76);



        //    //convert.bin2hex(baroNibble3) = always 0xC
        //    var baroHex = convert.bin2hex(baroNibble2) + convert.bin2hex(baroNibble1);  // 27-08 changed 3and 1 
        //    util.log('barohex  ', baroHex);
        //    var baroDec = convert.hex2dec(baroHex);
        //    util.log('baroDex  ', baroDec);
        //    var barometerdec = parseInt(baroDec) + 856;


        //    util.log('barometer JIIIIIIIIIIIIIIIIl  ', barometerdec);

      

        

        // Decode the data part
        this.result = this.decodeData(dataHex);
        util.log('  jilles this.result not atring     ', util.inspect(this.result, false, null));
        if (typeof this.result != 'string') {
            // Now we have all elements for the unique device ID
            // Note: from user perspective it is nicer not to include the
            //       rollingCode, as this changes when replacing batteries.
            var uniqueId = this.result.id + ':' + this.result.channel + ':' + this.result.rolling;

            if (Sensors[uniqueId] == null) {
                Sensors[uniqueId] = {};
                util.log('Found a new sensor. Total found is now', (Object.keys(Sensors).length));
            }
            // TODO: update only if needed and send an event
            // TODO: add comfort and forecast as custom capability
            var newdata = false;
            for (var r in this.result) {
                if (this.result[r] != Sensors[uniqueId][r]) {
                    newdata = true;
                }
            }
            util.log('Sensor value has changed:', newdata);

            // Add additional data
            this.result.lastupdate = new Date();
            this.result.count = (Sensors[uniqueId].count || 0) + 1;
            this.result.newdata = newdata;
            // Update the sensor log
            Sensors[uniqueId] = this.result;
           // util.log(Sensors);

            // jilles goto makeHomeyDriverCompatibleAandPasstoDriver(result)
           // makeHomeyDriverCompatibleAandPasstoDriver(this.result)
        }  // decodedatapart

		/*
		   Start Jilles code
		*/

        let frame = 'this is signal oregon '
        this.emit('signal', frame)

        




        


    }; //parserxdata
    // datahex is a string
    this.decodeData = (dataHex) => {

        // 5A6D 5d60  
    // 1A2D 1d20
    // FA24 f824
    // EA7C ec70

        let idHex = dataHex.slice(2, 6)
        let id = ''
        
        if (idHex == '1a2d')
            id = '1d20'
        if (idHex == '5a6d')
            id = '5d60' 
        if (idHex == '1a3d')
            id = '1d30' 
        if (idHex == 'fa28')
            id = 'e2cf' 
       


        //hex 1 bin      0001       hex   1       bin 0001
        //    a          1010       hex   d           1101  
        //    2          0010             2           0010
        //    d          1101             0           0000        
        //    1
        //    0
        //    5
      //   id = ('0000' + dataHex.slice(2, 6)).slice(-4);
        util.log('Device id hex rfxcom', id);  // 5d60  1d20
        var values = id;

        // unique id of snsor rollingcode
        let address = dataHex.slice(8, 10)

        util.log('Device address  hex rfxcom', address)

        // temp

        //if(recbuf(6) And & H8) = 0 Then
        //celsius = CSng(Hex(recbuf(5))) + CSng(Hex(recbuf(4) >> 4)) / 10
        //Else
        //celsius = 0 - (CSng(Hex(recbuf(5))) + CSng(Hex(recbuf(4) >> 4)) / 10)
        //End If
        // recbuf slice = 2*recbuf + 2 ,2*recbuf + 4
        let celsius
        if ((parseInt(dataHex.slice(14, 16), 16) & 8) == 0)
        { celsius = parseInt(dataHex.slice(12, 14), 10) +      (parseInt(dataHex.slice(10, 12),16)  >> 4) / 10  }
        else
        { celsius = 0 - (parseInt(dataHex.slice(12, 14), 10) + (parseInt(dataHex.slice(10, 12),16) >> 4),10) / 10 }

        util.log('temp rfxcom ', celsius);  

        let celsius2  = dataHex.slice(12,13) +  dataHex.slice(11,12)  +  dataHex.slice(10,11)

        util.log('temp2 dsimpel  rfxcom ', celsius2);  

      // " hum:" & VB.Right(      Hex(((recbuf(7) << 4) And &HF0) + ((recbuf(6) >> 4) And &HF))            , 2)

       let humidity = ''

       humidity = (((parseInt(dataHex.slice(16, 18), 16) << 4) & 0xf0) + ((parseInt(dataHex.slice(14, 16), 16) >> 4) & 0xF)).toString(16) // to string 6 makes 0x31 decimal 31

       util.log('humidity rfxcom  rfxcom ', humidity); 
       util.log('humidity glbsal rfxcom  rfxcom ', wrhum(parseInt(dataHex.slice(16, 18), 16)  & 0xc0  )); 
        
       //WriteMessage(" baro:" & CStr(recbuf(8) + 856) & "hPa", False)

       let baro 

       baro = Number(convert.hex2dec(dataHex.slice(18,20))) + 856 

       util.log('baro rfxcom  rfxcom ', baro)

       util.log('channel  rfxcom   ', wrchannel(dataHex))

        checksum8(dataHex)






        // util.log('sensor id layout ', util.inspect(knownSensors[id].layout, false, null));

         var layout = (this.knownSensors[id] != null ? this.knownSensors[id].layout : null);
        if (this.dataLayouts[layout] != null) {
            // Check the checksum before we start decoding
            var pos = 32 + 4 * this.dataLayouts[layout].len;
           let valid = calcChecksum(dataHex, pos);
          //  let valid = 2
            // Decode the values if the payload is valid
            // TODO valid is checked out
            if (valid || !valid) {                                           //first check if valid dataHex
                util.log('Sensor type:', this.knownSensors[id].name);

                // Nibble 5 is the channel
             
                util.log('Channel number:', wrchannel(dataHex));

                // Nibble 6 & 7 contain the rolling code
                
                util.log('Rolling code:', address);

                // Nibble 8 contains the flags
                // bit 2 (0x4) is the low battery indicator
                var flagnibble = dataHex.slice(28, 32);
                util.log('Flag nibble:', flagnibble);

                var lowbattery = flagnibble[1] == '1';
                util.log('Low battery:', lowbattery);

                // Store the results so far
                values = {
                    name: this.knownSensors[id].name,
                    layout: this.knownSensors[id].layout,
                    id: id,
                    channel: wrchannel(dataHex),
                    rolling: address,
                    lowbattery: lowbattery,
                    data: {}
                };

                
                for (var p in this.dataLayouts[layout].data) {
                    var value = 0;
                    var elem = this.dataLayouts[layout].data[p];

                    if (elem.tag == 'rfxcomtemp')
                    { value = celsius }
                    if (elem.tag == 'rfxcomhumidity')
                    { value = humidity }



                    
                    if (p == 'direction') {
                        value *= 22.5;
                    } else if (elem.map != null) {
                        value = elem.map[value] || 'Unknown';
                    } else if (p != 'unknown') {
                        value = Number(value);
                        if (elem.div != null) {
                            value /= elem.div;
                        }
                        if (elem.add != null) {
                            value += elem.add;
                        }
                    }
                    values.data[p] = value;
                    util.log('dataHex > ' + p + ':', value);
                }
                if (values.data.sign != null) {
                    if (Number(values.data.sign) > 0) {
                        values.data.temperature *= -1;
                    }
                    delete (values.data.sign);
                }
            } else {
                util.log('Checksum mismatch - ignoring message');
            }
        }  // datalayou = !null

        else {
            util.log('Unknown sensor ID ' + id + '; ignoring...');
        }

      //  util.log('values ', util.inspect(values, false, null));
        return values;

    }

    


    let wrchannel = (dataHex) => 
    {
        let channel 
        switch (  parseInt(dataHex.slice(6,8),16)  & 0x70 ) {
            case 0x10:
                channel = 1
                break
            case 0x20:
                channel = 2
                break
            case 0x40:
                channel = 3
                break
            default:
                channel = 4
        }

        return channel



    }

    
    let wrhum = (hum) =>
    {
        let wetness

        switch (hum) {
            case 0x0:
                wetness = `Normal`
                break
            case 0x40:
                wetness = `Comfort`
                break
            case 0x80:
                wetness = `Dry`
                break
            case 0x80:
                wetness = `Wet`
                
        }

        return wetness

    }

    //Sub checksum8()
    //Dim cs As Short
    //cs = cs8()
    //cs = (cs - recbuf(8)) And & HFF
    //If cs <> 0 Then
    //WriteMessage(" Checksum Error", False)
    //End If
    //End Sub

    let checksum8 = (dataHex) =>
    {
let cs
        cs = cs8(dataHex)
        cs = (cs - parseInt(dataHex.slice(18,20),16)) & 0xff
        if (cs != 0) {
            util.log(`checksum rfxcom    `, `Checksum Error`)
        }
        else {
            util.log(`checksum rfxcom    `, `Checksum correct`)

        }


    }

    //Function cs8() As Byte
    //Dim cs As Byte
    //cs = (recbuf(0) >> 4 And & HF)
    //cs += (recbuf(1) >> 4 And & HF) + (recbuf(1) And & HF)
    //cs += (recbuf(2) >> 4 And & HF) + (recbuf(2) And & HF)
    //cs += (recbuf(3) >> 4 And & HF) + (recbuf(3) And & HF)
    //cs += (recbuf(4) >> 4 And & HF) + (recbuf(4) And & HF)
    //cs += (recbuf(5) >> 4 And & HF) + (recbuf(5) And & HF)
    //cs += (recbuf(6) >> 4 And & HF) + (recbuf(6) And & HF)
    //cs += (recbuf(7) >> 4 And & HF) + (recbuf(7) And & HF)
    //Return cs
    //End Function


    let cs8 = (dataHex) => {

        let cs

        cs =   (parseInt(dataHex.slice(2, 4), 16) >> 4) 
        cs += ((parseInt(dataHex.slice(4, 6), 16) >> 4) & 0xf0) +   (parseInt(dataHex.slice(4, 6), 16) & 0xf0)
        cs += ((parseInt(dataHex.slice(6, 8), 16) >> 4) & 0xf0) +   (parseInt(dataHex.slice(6, 8), 16) & 0xf0)
        cs += ((parseInt(dataHex.slice(8, 10), 16) >> 4) & 0xf0) +  (parseInt(dataHex.slice(8, 10), 16) & 0xf0)
        cs += ((parseInt(dataHex.slice(10, 12), 16) >> 4) & 0xf0) + (parseInt(dataHex.slice(10, 12), 16) & 0xf0)
        cs += ((parseInt(dataHex.slice(12, 14), 16) >> 4) & 0xf0) + (parseInt(dataHex.slice(12, 14), 16) & 0xf0)
        cs += ((parseInt(dataHex.slice(14, 16), 16) >> 4) & 0xf0) + (parseInt(dataHex.slice(14, 16), 16) & 0xf0)
        cs += ((parseInt(dataHex.slice(16, 18), 16) >> 4) & 0xf0) + (parseInt(dataHex.slice(16, 18), 16) & 0xf0)

        return cs

    }





    function calcChecksum(data, end) {
        var slice = data.slice(end + 4, end + 8) + data.slice(end, end + 4);
        util.log(slice);
        var check = Number(convert.bin2dec(slice));
        util.log('Read checksum: ' + check);
        var checksum = 0;
        for (var i = 0; i < end / 4; i++) {
            var nibble = data.slice(i * 4, i * 4 + 4);
            checksum += Number(convert.bin2dec(nibble));
        }
        util.log('Calculated checksum: ' + checksum);
        return (checksum == check);
    }






} // end constructor







} // end class

module.exports = new oregondecoding()