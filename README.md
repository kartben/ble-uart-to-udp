# Bluefruit Bowl (bbowl)

This is a nodejs service which exposes the UART of a bluetooth low energy device via sockets.

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
