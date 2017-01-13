A nodejs service that bridges a BLE UART to an UDP socket. 

The bridge maintains one UDP socket per BLE devices. A message received from the UART is written to the UDP socket (a new socket is created if the device is communicating for the first time) ; a datagram received later on on this socket will be written to the corresponding BLE device's UART. 

Useful to e.g create a transparent bridge to an MQTT-SN gateway.

Note: while the bridge typically doesn't care about the actual packets that it forwards, the current implementation actually tries to parse MQTT-SN packets for debugger purposes, hence a dependency that you may want to remove if you use other protocols.

Adapted from https://github.com/echox/bbowl.
