var noble = require('noble')
var net = require('net');

var perif;

var HOST = "localhost"
var PORT = 8000

var uart = '6e400001b5a3f393e0a9e50e24dcca9e'
var rx = '6e400003b5a3f393e0a9e50e24dcca9e'
var tx = '6e400002b5a3f393e0a9e50e24dcca9e'
var address

var chrRead
var chrWrite

var connections = []
var uids=[]

if(process.argv.indexOf("-a") != -1){ 
				    address = process.argv[process.argv.indexOf("-a") + 1]; 
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
    
}).listen(PORT, HOST);
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
				
				if (address == null || p.address === address) {
				console.log("found adafruit!")

				console.log("stopping scanning...")
				noble.stopScanning();

				console.log("connecting...")
				p.connect(function() {

					p.discoverAllServicesAndCharacteristics(function(error, services, characteristics){

								console.log("Error? " + error)
								console.log("Services: " + services)
								console.log("Characteristics: " + characteristics)

							  services.forEach(function(s, serviceId) {
									s.characteristics.forEach(function(ch, charId) {
								
										if (ch.uuid === rx) {
											chrRead = ch
										} else if (ch.uuid === tx) {
											chrWrite = ch
										}
									})
								})
					
							ready(chrRead, chrWrite)
					})

				})
				

				}
})

