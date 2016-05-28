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

#### Address Filter

```-a aa:bb:cc:11:22:33```
Only connect to the specified mac address.
