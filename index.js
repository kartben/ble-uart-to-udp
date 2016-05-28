var noble = require('noble')
var net = require('net');

var perif;

var chrRead
var chrWrite

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

console.log("start...")

process.on('exit', function() {
				if (perif != null) {
								peripheral.once('disconnect');
				}
})	

var writeToBT = function(data) {
				console.log("> "+data)
				chrWrite.write(new Buffer(data))
}

var writeToSockets = function(data) {
			console.log("< "+data)
			connections.forEach(function (sck) {
							sck.write(data)
			})
}

function ready(chrRead, chrWrite) {

		console.log("connected and ready!")


		chrRead.on('data', writeToSockets)
		chrRead.notify(true)

		net.createServer(function(sock) {
    
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    sock.on('data', writeToBT)

		connections.push(sock)
    
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(settings.PORT, settings.HOST);
}

noble.on('stateChange', function(state) {

	console.log("State change: " + state)

	if(state==="poweredOn") {				
		noble.startScanning(uids, false,function(error) {
			console.log("scanning startet\nerror: ",error)
		})
	}
})

noble.on('discover', function(p) {

				perif = p
				console.log("Found "+ p.advertisement.localName + " " + p.address)
				
				if (settings.ADDRESS == "" || p.address === settings.ADDRESS) {
				console.log("found adafruit!")

				console.log("stopping scanning...")
				noble.stopScanning();

				console.log("connecting...")
				p.connect(function() {

					p.discoverAllServicesAndCharacteristics(function(error, services, characteristics){

								console.log("Error? " + error)
								console.log("Services: " + services)
								console.log("Characteristics: " + characteristics)

								var chrRead
								var chrWrite
							  services.forEach(function(s, serviceId) {
									if (serviceId == settings.UART) {
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
							
					})
				})
				}
})
