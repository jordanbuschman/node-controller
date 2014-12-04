# node-controller

This program is the server for my collaborative music queueing app. It is built with node.js, and uses SocketIO to receive and send messages. It works on all Unix systems.

## Installing
Make sure you have node.js installed, then go to terminal, and type:
```
git pull https://github.com/jordanbuschman/node-controller.git
cd node-controller
sudo npm install
node start
```
# Messages
Controllers (iOS devices) and players (music output points, or computers pointed to <ip-address>:<port>/play) can receive and send certain messages:
* __Message:__ _'player info'_, __Parameters:__ _{}_
    Upon connecting to either the controller or player namespace, clients receive this message, which contains all current information about the state of the server (volume, now playing, queued up songs, etc.).
* __Message:__ _'song ended'_, __Parameters:__ _{}_
    Upon receiving this message, all clients will try to load up the next song to play.

