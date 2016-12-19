#!/usr/bin/env node

var noble = require('noble')

var prettyjson = require('prettyjson');

var mqttsn = require('mqttsn-packet');

var createMqttForwarder = function(udpClient) {
    var parser = mqttsn.parser();

    parser.on('packet', function(packet) {
        console.log(prettyjson.render(packet));
        var buffer = mqttsn.generate(packet) ;
        udpClient.send(buffer, 0, buffer.length, settings.PORT, settings.HOST, function(err, bytes) {
        });

    });
    return parser;
}

var dgram = require('dgram');

var perif

var uids = []

var settings = {

    HOST: "127.0.0.1",
    PORT: 1884,

    UART: '6e400001b5a3f393e0a9e50e24dcca9e',
    RX:  '6e400002b5a3f393e0a9e50e24dcca9e',
    TX: '6e400003b5a3f393e0a9e50e24dcca9e'
}

process.on('exit', function() {
    if (perif != null) {
        console.log("goodbye, disconnecting...")
        peripheral.once('disconnect');
    }
})

var writeToUdp = function(client) {
    var mqttForwarder = createMqttForwarder(client);
    return function(data) {
        console.log('Received from UART: ', data.slice(0, -1));
        mqttForwarder.parse(data); // use this method to reconstitute full MQTT-SN packet

    }
}

function ready(chrRead, chrWrite) {
    console.log("connected to bluetooth le UART device")

    var uart = {}

    uart.rx = chrRead
    uart.tx = chrWrite

    // create a UDP connection to the MQTT-SN broker for this newly connected micro:bit
    var client = dgram.createSocket('udp4');

    client.on('message', function(data, remote) {
        console.log('Received from UDP: ', data.slice(0, -1));
        uart.tx.write(data, true); // write without response
    });

    uart.rx.notify(true);
    uart.rx.on('data', writeToUdp(client))
}

noble.on('stateChange', function(state) {

    console.log("bluetooth state: [" + state + "]")

    if (state === "poweredOn") {
        noble.startScanning(uids, true, function(error) {
            if (!error) {
                console.log("scanning for bluetooth le devices...")
            } else {
                console.log("problems during scanning for bluetooth le devices: " + error)
            }
        })
    }
})

noble.on('discover', function(p) {

    perif = p
    console.log("found " + p.advertisement.localName + " " + p.address)

    // console.log("stopping scanning...")
    // noble.stopScanning();

    console.log("trying to connect to " + p.advertisement.localName + "[" + p.address + "]")
    p.connect(function() {

        p.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {

            if (!error) {
                // console.log("[---")
                // console.log("Services: \n" + "[" + services + "]")
                // console.log("Characteristics: \n" + "[" + characteristics + "]")
                // console.log("---]")

                var chrRead
                var chrWrite
                services.forEach(function(s, serviceId) {
                    if (s.uuid == settings.UART) {
                        s.characteristics.forEach(function(ch, charId) {

                            if (ch.uuid === settings.RX) {
                                chrRead = ch
                            } else if (ch.uuid === settings.TX) {
                                chrWrite = ch
                            }
                        })
                    }
                })

                if (chrRead != null && chrWrite != null) {
                    ready(chrRead, chrWrite)
                } else {
                    console.log("no UART service/charactersitics found...")
                }
            } else {
                console.log(error)
            }

        })
    })

})