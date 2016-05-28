# Bluefruit Bowl (bbowl)

This is a nodejs service which exposes the UART of a bluetooth low energy device via sockets.

It can be used to communicate with Adafruits Bluefruit module without having to fiddle arround with the bluetooth stack. Multiple clients can connect via the network socket.

Data from the clients will only be written to the UART module.

Data from the UART module will be broadcasted to all connected clients.

## Dependencies
It uses the noble library as the bluetooth stack.

## Installation
Run ```npm install``` to fetch the dependencies.

## Start

Simply run ```node index.js```

### Command Line Switches

#### Defaults

If no parameters are set, the following defaults are used:

```-a "" // connect to the first device discovered
-s 6e400001b5a3f393e0a9e50e24dcca9e // look for service of adafruits bluefruit UART
-RXChar 6e400003b5a3f393e0a9e50e24dcca9e // look for adafruits bluefruit RX characterstic
-TXChar 6e400002b5a3f393e0a9e50e24dcca9e // look for adafruits bluefruit TX characterstic
-b localhost // bind to localhost
-p 8000	//use port 8000```

#### Bind IP and Port
```-b localhost -p 8000```
Bind to the specified ip and port.

#### Address Filter
```-a aa:bb:cc:11:22:33```
Only connect to the specified mac address.

#### Filter Service UUID
```-s 6e400001b5a3f393e0a9e50e24dcca9e```
Use the specified bluetooth service of the device to discover the UART characteristics.

#### Filter RX Characteristic UUID
```-RXChar 6e400003b5a3f393e0a9e50e24dcca9e```
Use the specified characteristic of the service as RX.

#### Filter TX Characteristic UUID
```-TXChar 6e400002b5a3f393e0a9e50e24dcca9e```
Use the specified characteristic of the service as TX.
