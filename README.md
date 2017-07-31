# RFXCOM



This app receives and transmits to a Rfxcom lan Receiver and or Transmitter with normal software.
Is is not suitable for devices with xpl firmware. 
use then the other rfxcom app from irritanterik
https://apps.athom.com/app/com.rfxcom.rfxlan

Makes Homey backward compatible with classic domotica , Rfxcom is known for its superb transmitters , receiver and transceivers 
and your receiving and transmitter range is much bigger ,recpetiom is morte accurate.  
Also 868 visonic Devices can be added which was the most important reason to write this app.
Homey doesnt receive the 869.95 visonic devices at this moment


What works:

You can connect to a rfxcom device with the correct firmware eg as is used for Homeseer
to connect type the correct settings. and restart  the app 
visonic motion sensors and door sensors can be added and the capabilities are correct.


What doesn't:

all other devices .

To be implemented soon:

all operating modes of the receiver and transmitter
oregon devices
x10 devices 
sending x10 signals


## changeLog


11-06-2017

first submission release to alpha channel

21-06-2017

adjusted settingspage , first setup communication with api.js , check on ip and port input 
added working oregon drivers for temp temphum temphumbar uv amd rain 

11-07-2017

a lot of work is done to make the settingspage and app ready for multiple receivers transmitters and RfxTrx Rfxcom Devices. That is working now.
As device the X10 MSE13 is added. RfxTrx devices must be connected to a serialtonet solution so the app can connect to it over the net node interface. 
here is the link for the node serial2net javascript file i use on a raspberry pi 3 to connect to a RfxTrx433e with Homey https://github.com/nattlip/pi.node.serial2net

The Rxtrx input can be read in the log it is not availble for drivers yet. It is a little modification of the node rftrx rfxcom node software available on github
https://github.com/rfxcom/node-rfxcom 
No commands can be send yet 

31-07-2017

TEMPHUMBAR TEMBAR TEMP (orgon) works now correct with lan and rfxtrx. oregon driver still available 
lan and rfxtrx reconnects now after network error 
No commands can be send yet


[![Paypal donate][pp-donate-image]][pp-donate-link]
[pp-donate-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=42UGL52J4KPZE
[pp-donate-image]: https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif






Copyright (c) 2017 Jilles Miedema

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
Contact GitHub API Training Shop Blog About
© 2016 GitHub, Inc. Terms Privacy Security Status Help



