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
- Route `/logout`: used to delete the login session and avoid future automatic login.
- Route `/page-not-found`: the content alerts about an unexpected URL, it is used to redirect any invalid URL.
- Route `/game`: it contains the interactive network map. It is used to start a new game, interact with segments and compute the final score.
- Route `/ranking`: it is dedicated to the best score of the platform games. Useful to introduce competition between different users.


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
- ...
- POST `/api/game`
  - request body content {
      'userId': ...,
      '
    }
  - response body content { 
      'stationDeparture': ...,
      'stationDestination': ...
    }

## Database Tables

- Table `users` - contains xx yy zz
- Table `something` - contains ww qq ss
- ...

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username, password (plus any other requested info)
- username, password (plus any other requested info)

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
