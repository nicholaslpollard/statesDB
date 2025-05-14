# US State Info API

This is a RESTful API built with **Node.js**, **Express**, and **MongoDB** that serves information about U.S. states. It supports retrieving static data (like capitals, nicknames, and population) and managing dynamic fun facts stored in a MongoDB collection.

## Project Structure
INF653Final/
├── config/
│   ├── allowedOrigins.js
│   ├── corsOptions.js
│   ├── dbConn.js
├── controllers/
│   └── statesController.js
├── data/
│   └── statesData.json
├── logs/
│   └── reqLog.txt
├── middleware/
│   ├── errorHandler.js
│   └── logEvents.js
├── model/
│   └── states.js
├── node_modules/
│   └── ...
├── public/
│   ├── css/
│   │   └── style.css
│   ├── img/
│   └── text/
├── routes/
│   ├── api/
│   │   └── states.js
│   └── root.js
├── views/
│   ├── 404.html
│   ├── index.html
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js


---

## API Endpoints

### `GET /states`
Returns all U.S. states. Optional query params:
- `?contig=true` – Contiguous states only (excludes AK & HI)
- `?contig=false` – Only Alaska and Hawaii

### `GET /states/:state`
Get data for a specific state by its 2-letter code (e.g. `/states/CO`).

### `GET /states/:state/funfact`
Returns a random fun fact from the selected state.

### `GET` endpoints for specific fields:
- `/states/:state/capital`
- `/states/:state/nickname`
- `/states/:state/population`
- `/states/:state/admission`

---
