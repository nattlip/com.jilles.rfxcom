"use strict";
const fs = require('fs');
const path = require('path');
const util = require('util');
const convert = require('..//baseConverter').jan.ConvertBase;
const helpFunctions = require('../helpFunctions.js').jan;
const libClass = require('../libClass.js');
const Transceiver = require('./RxTxRfxcom')













class RxTxManager {

    constructor() {

        this.filename = path.basename(__filename)
        this.lib = new libClass();
        this.lib.log = this.lib.log.bind(this);
        this.debug = true;//  to set debug on or off 
        this.RxLength

        //this.lib.log(` ${this.constructor.name}  is this. `, util.inspect(this));


        //{ types
        //    1: 'RxLan',
        //    2: 'RxTxLan',
        //    3: 'TxLan',
        //    4: 'RfxTrx'
        //}

        // template device  not used in code
        this.RxTx = {
            id: null,    // its id in app = data
            type: null, // lan  with or without transmitterer / trnasmitter or trx //
            tabIndex: null,  // tabindex onsettings page
            ip: null,
            rx: null,  // or trx
            tx: null,
        }


        this.RxTxDatas = [];   // like normal devices es meervoudv  contains RtTxData id: null
        this.RxTxData    //{id: null };

        this.RxTxDevices = [];// rfxtrx rfxlan  with or without transmitter  contains RtTxdatas devices
        this.RxTxRfxDevice = {}   // 

        // to hold the transceiver classes
        this.Transceivers = {}

        //Homey.manager('settings').unset('RxTxDatas');        //array of transceivers
        //Homey.manager('settings').unset('RxTxDevices')

        if (Homey.manager('settings').get('RxTxDatas')) {

            this.RxTxDatas = Homey.manager('settings').get('RxTxDatas')

            this.RxTxDevices = Homey.manager('settings').get('RxTxDevices')


        }



        this.lib.log('this.RxTxDatas  ', this.RxTxDatas)
        this.lib.log('this.RxTxDevices ', this.RxTxDevices)
        if (this.RtTxDatas == undefined) {
            //Homey.manager('settings').set('mySetting', 'myValue' /* Must be 'JSON.stringify'-able */)

            // Homey.manager('settings').set('RtTxDatas', this.RtTxDatas)

            //   Homey.manager('settings').set('RtTxDevice', this.RxTxDevices)
        }

        this.initTransceivers = () => {

            for (let RxTx of this.RxTxDevices) {

              


                    this.Transceivers[RxTx.ip] = new Transceiver(RxTx)

             



               

            }


            



        }


        this.initTransceivers(),













        //fired from api 
        this.saveTransceiver = (transceiver) => {
            this.lib.log('saveTransceiver', transceiver)
            //let transceiver = {
            //    "index": ind.toString(),
            //    "type": dev,
            //    "ip": ip,
            //    "rx": rx,
            //    "tx": tx
            //}

            this.RxLength = this.RxTxDatas.length // for id
            this.lib.log('this.RxTxDatas in save ', typeof this.RxTxDatas)
            this.lib.log('this.RxTxDatas type in save ', this.RxTxDatas)
            this.lib.log('this.RxTxData.length in save ', this.RxTxDatas.length)



            let index = this.RxLength + 1

            let RxTx = {
                id: index,
                type: transceiver.type,
                tabIndex: Number(transceiver.index),
                ip: transceiver.ip,
                rx: transceiver.rx,
                tx: transceiver.tx
            }
            this.lib.log('RxTx  ', RxTx)
            this.lib.log('index  ', index)
            this.RxTxDatas.push(index)
            this.RxTxDevices.push(RxTx)

            let datas = JSON.stringify(this.RxTxDatas)
            let devices = JSON.stringify(this.RxTxDevices)

            // save in settings
            Homey.manager('settings').set('RxTxDatas', this.RxTxDatas)           /* Must be 'JSON.stringify'-able */
            Homey.manager('settings').set('RxTxDevices', this.RxTxDevices)

            let value = Homey.manager('settings').get('RxTxDatas');
            this.lib.log('settings datas ', value)
            value = Homey.manager('settings').get('RxTxDevices');
            this.lib.log('settings devices ', value)

            this.Transceivers[RxTx.ip] = new Transceiver(RxTx)
        }



        this.deleteTransceiver = (transceiver) => {
            this.lib.log('deleteTransceiver', transceiver)

            //let transceiver =
            //    {
            //        "type": type,
            //        "index": index  // tab index

            //    }




            for (let RxTx of this.RxTxDevices) {

                if (transceiver.index == RxTx.tabIndex) {
                    this.RxTxDevices.splice(this.RxTxDevices.indexOf(RxTx), 1)
                    this.RxTxDatas.splice(this.RxTxDevices.indexOf(RxTx), 1)

                    this.lib.log('this.RxTxDatas after delete ', this.RxTxDatas)
                    this.lib.log('this.RxTxDevices  after delete  ', this.RxTxDevices)


                   delete  this.Transceivers[RxTx.ip]

                }






            }


            // save in settings
            Homey.manager('settings').set('RxTxDatas', this.RxTxDatas)           /* Must be 'JSON.stringify'-able */
            Homey.manager('settings').set('RxTxDevices', this.RxTxDevices)


        }




       




      


       

    }


}

module.exports = new RxTxManager()