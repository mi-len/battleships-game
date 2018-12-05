
const sizeX = 10
const sizeY = 10
const emptyCell = { 'content': 'empty', 'state': '.', 'show': ' ' }
let totalHitPoints = 0
let message = document.getElementById('message')

function Ship (shipName, hitPoints) {
  this.shipName = shipName
  this._hitPoints = hitPoints

  this.getHitPoints = () => {
    return this._hitPoints
  }
  this.setDamage = () => {
    this._hitPoints--
  }
}

// setting grid mechanism
function initiateGrid (rows, cols, defaultValue) {
  let arr = []
  for (let i = 0; i < rows; i++) {
    arr.push([])
    arr[i].push(new Array(cols))
    for (let j = 0; j < cols; j++) {
      arr[i][j] = defaultValue
    }
  }
  return arr
}

let battle = (function () {
  let grid = initiateGrid(sizeX, sizeY, emptyCell) // set empty grid
  let _totalShots = 0
  let getTotalShots = function () {
    return _totalShots
  }
  let setTotalShots = function () {
    _totalShots++
  }
  let takeGrid = function () {
    return grid
  }
  let placeShip = function (ship) {
    let locationX
    let locationY
    let direction
    let shipSize = ship.getHitPoints()
    // generate random coordinates and direction, check for grid borders
    function generateCoordinates () {
      direction = Math.floor(Math.random() * 10) % 2 === 1 ? 'vertical' : 'horizontal'
      locationX = Math.floor(Math.random() * (sizeX - 1))
      locationY = Math.floor(Math.random() * (sizeY - 1))
      if (direction === 'horizontal') {
        if ((locationX + shipSize) >= sizeX) {
          generateCoordinates()
        }
      } else {
        if ((locationY + shipSize) >= sizeY) {
          generateCoordinates()
        }
      }
    }
    generateCoordinates()

    // check for overlapping and set ship on the grid
    let isOccupied = false
    if (direction === 'horizontal') {
      for (let i = locationX; i < shipSize + locationX; i++) {
        if (grid[i][locationY] !== emptyCell) {
          isOccupied = true
          generateCoordinates()
          this.placeShip(ship)
          return
        } else {
          isOccupied = false
        }
      }
      if (isOccupied === false) {
        totalHitPoints += shipSize

        for (let i = locationX; i < shipSize + locationX; i++) {
          grid[i][locationY] = { 'content': `${ship.shipName}`, 'state': '.', 'show': 'X' }
        }
      }
    } else {
      for (let i = locationY; i < shipSize + locationY; i++) {
        if (grid[locationX][i] !== emptyCell) {
          isOccupied = true
          generateCoordinates()
          this.placeShip(ship)
          return
        } else {
          isOccupied = false
        }
      }
      if (isOccupied === false) {
        totalHitPoints += shipSize

        for (let i = locationY; i < shipSize + locationY; i++) {
          grid[locationX][i] = { 'content': `${ship.shipName}`, 'state': '.', 'show': 'X' }
        }
      }
    }
  }
  return {
    takeGrid: takeGrid,
    placeShip: placeShip,
    getTotalShots: getTotalShots,
    increaseTotalShots: setTotalShots
  }
}())

// create and place ships
let battleship = new Ship('battleship', 5)
let destroyerA = new Ship('destroyerA', 4)
let destroyerB = new Ship('destroyerB', 4)

battle.placeShip(battleship)
battle.placeShip(destroyerA)
battle.placeShip(destroyerB)

// console output
function printGrid (viewMode) {
  let grid = battle.takeGrid()
  grid.forEach(line => {
    let res = []
    line.forEach(element => {
      if (viewMode === 'show') {
        res.push(element['show'])
      } else {
        res.push(element['state'])
      }
    })
    console.log(res.toString())
  })
}
printGrid()

// build html view
function buildView (viewMode) {
  let grid = battle.takeGrid()
  let myTableDiv = document.getElementById('myDynamicTable')
  myTableDiv.innerHTML = ''
  let table = document.createElement('TABLE')
  let tableBody = document.createElement('TBODY')
  let lettersRow = document.createElement('TR')
  tableBody.appendChild(lettersRow)
  for (let y = 0; y <= sizeY; y++) {
    let td = document.createElement('TD')
    if (y === 0) {
      td.innerText = ' '
    } else {
      td.innerText = 0 + y
    }
    lettersRow.appendChild(td)
  }
  table.appendChild(tableBody)

  for (let x = 0; x < sizeX; x++) {
    let tr = document.createElement('TR')
    tableBody.appendChild(tr)
    let span = document.createElement('span')
    span.className = 'char_index'
    span.innerHTML = String.fromCharCode('A'.charCodeAt() + x)
    tr.appendChild(span)

    for (let y = 0; y < sizeY; y++) {
      let td = document.createElement('TD')
      if (viewMode === 'show') {
        td.appendChild(document.createTextNode((grid[x][y])['show']))
      } else {
        td.appendChild(document.createTextNode((grid[x][y])['state']))
      }
      tr.appendChild(td)
    }
  }
  myTableDiv.appendChild(table)
}
buildView()

// add 'send' to input on press Enter
document.getElementById('player_input').addEventListener('keypress', function (event) {
  if (event.keyCode === 13) {
    fire()
    event.preventDefault()
  }
})

// implement 'fire' action - takes user input, check and mark if hit/miss/error
function fire () {
  let grid = battle.takeGrid()
  message.innerHTML = ''
  let playerInput = document.getElementById('player_input').value

  if (playerInput === 'show') {
    buildView('show')
    printGrid('show')
    return
  }
  battle.increaseTotalShots()
  let targetY = playerInput.slice(0, 1).toLowerCase()
  if (/[^a-zA-Z]/.test(targetY)) {
    message.innerText = '*** Error ***'
    return
  }
  targetY = targetY.charCodeAt(0) - 97
  let targetX = playerInput.slice(1, 3) - 1
  if (targetY > 10 || targetX > 9 || targetX < 0 || /\D/.test(targetX)) {
    message.innerText = '*** Error ***'
    return
  }

  let targetCell = grid[targetY][targetX]

  if (targetCell !== emptyCell) {
    if (targetCell['state'] === 'X' || targetCell['state'] === '-') {
      message.innerHTML = '*** Error ***'
      console.log('*** Error ***')
    } else {
      message.innerText = '*** Hit ***'
      totalHitPoints--
      checkForShipIntegrity((targetCell)['content'])
      console.log('*** Hit ***')

      if (totalHitPoints === 0) {
        document.getElementsByClassName('content')[0].style.display = 'none'
        document.getElementById('end_game')
          .innerHTML = `Well done! You completed the game in ${battle.getTotalShots()} shots <br/><a href="./index.html">Play Again?</a>`
        return
      }

      targetCell = { 'content': 'empty', 'state': 'X', 'show': 'X' }
      buildView()
    }
  } else {
    message.innerText = '*** Miss ***'
    targetCell = { 'content': 'empty', 'state': '-', 'show': ' ' }
    buildView()
    console.log('*** Miss ***')
  }

  printGrid()
}

// check for current ship hitPoints left and display 'Sunk' if none
function checkForShipIntegrity (shipName) { // TODO - remake
  if (shipName === 'battleship') {
    battleship.setDamage()
    if (battleship.getHitPoints() === 0) {
      message.innerText = '*** Sunk ***'
    }
  } else if (shipName === 'destroyerA') {
    destroyerA.setDamage()
    if (destroyerA.getHitPoints() === 0) {
      message.innerText = '*** Sunk ***'
    }
  } else {
    destroyerB.setDamage()
    if (destroyerB.getHitPoints() === 0) {
      message.innerText = '*** Sunk ***'
    }
  }
}
