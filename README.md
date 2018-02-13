# Simple battleship api
  a simple backend for battleship game. a ship has 4 type with total of 10 ship.
  This is a single player game. A ship will generate from server-side and you will play as Attacker by guessing a cell on the   map.
  
  A map contain 10x10 square grid. each grid has a unique coordinate. (x[1:10],y[1:10])
  
  ![Screenshot](https://i.imgur.com/JENwwDl.png)
  
# Type of ship
  
  1x Battleship
  2x cruisers
  3x Destroyers
  4x submarines


## Running Locally
```sh
$ git clone https://github.com/numchiew/battleship.git
$ cd battleship
$ npm install
$ mongo start
$ node server.js
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

# API

## GET /newgame 
Generate a new game and close lastest game.
## GET /play/:username 
Continue play a current game. if the game was close it will create a new game instead.
## GET /shoot/:coordinates 
Firing a missile on the map. [x,y]
example. /shoot/2,3
## GET /history/:username
Get a history match of this user. 
## GET /highestscore/:username
return a highest score match of user.
## GET /leaderboard
return top 10 match that contain a highest score in server.

# Test
   1. for test all api. run mocha in directory.
   2. for simulate the game from start to end. run node simulate.js


