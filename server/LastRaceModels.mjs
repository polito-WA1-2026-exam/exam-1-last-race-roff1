import dayjs from "dayjs";

function User(id, username, password = null){
    this.id = id
    this.username = username
    this.password = password
}

function Game(id, startStationId, destinationStationId, startTime, status, score = null){
    this.id = id
    this.startStationId = startStationId
    this.destinationStationId = destinationStationId
    this.startTime = startTime && dayjs(startTime);
    this.status = status
    this.score = score
}

function Line(id, name, color){
    this.id = id
    this.name = name
    this.color = color
}

function Station(id, name, positionX, positionY){
    this.id = id
    this.name = name
    this.positionX = positionX
    this.positionY = positionY
}

function Segment(id, stationA, stationB, lineId){
    this.id = id
    this.stationA = stationA
    this.stationB = stationB
    this.lineId = lineId
}

function Network(lines, stations, segments){
    this.lines = lines
    this.stations = stations
    this.segments = segments
}

function Event(id, description, effect){
    this.id = id
    this.description = description
    this.effect = effect
}

function RankingEntry(userId, bestScore){
    this.userId = userId
    this.bestScore = bestScore
}

export {User, Game, Line, Station, Segment, Network, Event, RankingEntry}