# Exam #1: "Last Race"
## Student: s349557 Roffinella Andrea 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...
- Route `/home`: welcome page presenting the game platform and the main parts of the website and their links:
  - brief description.
  - instructions page link.
  - login button which displays a pop-up form.
  - game page and ranking page links for registred users.
- Route `/instructions`: contains the rules of the game. It is useful to make the game experience more easy and cover specific aspects to start as a new user.
- Route `/game`: it contains the interactive network map. It is used to start a new game, interact with segments and compute the final score.
- Route `/ranking`: it is dedicated to the best score of the platform games. Useful to introduce competition between different users.
- Route `/logout`: used to delete the login session and avoid future automatic login.
- Route `/page-not-found`: the content alerts about an unexpected URL, it is used to redirect any invalid URL.


## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
  - status codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`
- ...

- POST `/api/sessions`
  - request body content
    ```json
    {
      'username': ..,
      'password': ..
    }
    ```
  - response body content
    ```json
    {
      'id': ..,
      'username': ..
    }
    ```
  - Status codes: `201 Created`, `422 Unprocessable Entity`, `500 Internal Server Error`
  - Authentication required: false
- DELETE `/api/sessions/current`
  - no request/response body content and parameters
  - Status codes: `200 OK`
  - Authentication required: false
- GET `/api/sessions/current`
  - no request body content and parameters
  - response body content
    ```json
    {
      'id': ..,
      'username': ..
    }
    ```
  - Status codes: `200 OK`, `401 Unauthorized`
  - Authentication required: true
- GET `/api/ranking`
  - no request body content and parameters
  - response body content 
    ```json
    {
      'ranking': [
        {
          'username': ..,
          'bestScore': ..
        },
        {...}
      ]
    }
    ```
  - Status codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`
  - Authentication required: true
- GET `/api/network`
  - no request body content and parameters
  - response body content 
    ```json 
    {
      'lines': [
        {
          'id': ..,
          'name': ..,
          'color': ..
        },
        {...}
      ],
      'stations': [
        {
          'id': ..,
          'name': ..,
          'positionX': ..,
          'positionY: ..
        },
        {...}
      ],
      'segments': [
        {
          'stationA': ..,
          'stationB': ..,
          'lineId: ..
        },
        {...}
      ]
    }
    ``` 
  - Status codes: `200 OK`, `401 Unauthorized`
  - Authentication required: true
- GET `/api/games/current`
  - no request body content and parameters
  - response body content 
    ```json 
    {
      'active': true,
      'startStationId': ...,
      'destinationStationId': ...,
      'startTime': ...
    }
    ```  
    or
    ``` json
    {
      'active': false
    } 
    ``` 
  - Status codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error` 
  - Authentication required: true
- POST `/api/games`
  - no request body content and parameters
  - response body content 
    ```json 
    {
      'active': true,
      'startStationId': ...,
      'destinationStationId': ...,
      'startTime': ...,
    }
    ``` 
  - Status codes: `201 Created`, `401 Unauthorized`, `409 Conflict`, `500 Internal Server Error` 
  - Authentication required: true
- POST `/api/games/route`
  - request body content 
    ```json 
    {
      'route': [firstSegmentId, ..., lastSegmentId],
    }
    ```
  - response body content
    ```json
    {
      'events': [{
        'description': ..,
        'effect': ..
      }],
      'score': ..,
      'status': ..,
      'validationErrors': {
        'route': ..
      }
    }
    ```
    or
    ```json
    {
      error: ..
    }
    ```
  - Status codes: `200 OK`, `400 Bad Request` for invalid route, `401 Unauthorized`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity` for a game that has already finished, `500 Internal Server Error`
  - Authentication required: true


## Database Tables

- Table `users` - id, username, hashedPassword, salt
- Table `stations` - id, name, positionX, positionY
- Table `lines` - id, name, color
- Table `segments` - id, firstStationId, secondStationId, lineId
- Table `events` - id, description, effect
- Table `games` - id, userId, startStationId, destinationStationId, startTime, score, status

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- Finn, password1
- Jake, password2
- BMO, password3

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.

During development, I used ChatGPT mainly for debugging, resolving doubts, and getting feedback on my development ideas.