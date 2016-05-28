var noble = require('noble')
var net = require('net')

var perif

var uart = {
	tx : null,
	rx : null
}

var connections = []
var uids=[]

var settings = {

	HOST :"localhost",
	PORT : 8000,

	UART : '6e400001b5a3f393e0a9e50e24dcca9e',
	RX : '6e400003b5a3f393e0a9e50e24dcca9e',
	TX : '6e400002b5a3f393e0a9e50e24dcca9e',
	ADDRESS : ""
}

if(process.argv.indexOf("-a") != -1){ 
				    settings.ADDRESS = process.argv[process.argv.indexOf("-a") + 1]; 
}

if(process.argv.indexOf("-s") != -1){ 
				    settings.UART = process.argv[process.argv.indexOf("-s") + 1]; 
}

if(process.argv.indexOf("-RXChar") != -1){ 
				    settings.RX = process.argv[process.argv.indexOf("-RXChar") + 1]; 
}

if(process.argv.indexOf("-TXChar") != -1){ 
				    settings.TX = process.argv[process.argv.indexOf("-TXChar") + 1]; 
}

if(process.argv.indexOf("-b") != -1){ 
				    settings.HOST = process.argv[process.argv.indexOf("-b") + 1]; 
}

if(process.argv.indexOf("-p") != -1){ 
				    settings.PORT = process.argv[process.argv.indexOf("-p") + 1]; 
}

console.log("bbowl started")
console.log("settings: " + JSON.stringify(settings,null,2))

process.on('exit', function() {
				if (perif != null) {
					console.log("goodbye, disconnecting...")
					peripheral.once('disconnect');
				}
})	

var writeToBT = function(data) {
				console.log("->\n"+data.slice(0,-1))
				uart.tx.write(new Buffer(data))
}

var writeToSockets = function(data) {
			console.log("<-\n" + data.slice(0,-1))
			connections.forEach(function (sck) {
							sck.write(data)
			})
}

function ready(chrRead, chrWrite) {

		console.log("connected to bluetooth le UART device")

		uart.rx = chrRead
		uart.tx = chrWrite

		uart.rx.on('data', writeToSockets)
		uart.rx.notify(true)

		console.log("RX is setup")

		net.createServer(function(sock) {
    
    	console.log("connected [" + sock.remoteAddress + ":" + sock.remotePort + "]");

    	sock.on('data', writeToBT)
			connections.push(sock)

			sock.on('close', function(data) {
        console.log("closed [" + sock.remoteAddress + ":" + sock.remotePort + "]");
    	});
    
		}).listen(settings.PORT, settings.HOST);
}

noble.on('stateChange', function(state) {

	console.log("bluetooth state: [" + state + "]")

	if(state==="poweredOn") {				
		noble.startScanning(uids, false,function(error) {
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
				console.log("found "+ p.advertisement.localName + " " + p.address)
				
				if (settings.ADDRESS == "" || p.address === settings.ADDRESS) {

				console.log("stopping scanning...")
				noble.stopScanning();

				console.log("trying to connect to " + p.advertisement.localName + "["+p.address+"]")
				p.connect(function() {

					p.discoverAllServicesAndCharacteristics(function(error, services, characteristics){

						if (!error) {
								console.log("[---") 
								console.log("Services: \n" + "["+services+"]")
								console.log("Characteristics: \n" + "[" + characteristics + "]")
								console.log("---]")

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
				}
})
