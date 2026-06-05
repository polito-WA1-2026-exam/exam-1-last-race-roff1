import dayjs from "dayjs";

function User({id, username, password}){
    this.id = id
    this.username = username
    this.password = password
}

function Game({startStationId, destinationStationId, startTime, score = 20, events = [], active = true}){
    this.startStationId = startStationId
    this.destinationStationId = destinationStationId
    this.startTime = startTime && dayjs(startTime)
    this.events = events
    this.score = score
    this.active = active
}

function Line({id, name, color}){
    this.id = id
    this.name = name
    this.color = color
}

function Station({id, name, positionX, positionY}){
    this.id = id
    this.name = name
    this.positionX = positionX
    this.positionY = positionY
}

function Segment({id, firstStationId, secondStationId, lineId}){
    this.id = id
    this.stationIds = [firstStationId, secondStationId]
    this.lineId = lineId
}

function Network({lines, stations, segments}){
    this.lines = lines
    this.stations = stations
    this.segments = segments
}

function Event({description, effect}){
    this.description = description
    this.effect = effect
}

function RankingEntry({username, bestScore}){
    this.username = username
    this.bestScore = bestScore
}

export {User, Game, Line, Station, Segment, Network, Event, RankingEntry}