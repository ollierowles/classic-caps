# API-Football Reference

This document provides quick reference for the API-Football endpoints used in Classic Caps.

## Base URL
```
https://v3.football.api-sports.io
```

## Authentication
All requests require the following headers:
```
x-rapidapi-host: v3.football.api-sports.io
x-rapidapi-key: YOUR_API_KEY
```

## User Flow

The application follows this navigation flow:
1. **League Selection** → Select a major league (Premier League, La Liga, etc.)
2. **Season Selection** → Choose a season from that league
3. **Team Selection** → Pick a team that participated in that season
4. **Fixture Selection** → Select a specific match
5. **Game** → Guess the starting XI

## Endpoints

### 1. Get All Leagues
**Endpoint**: `GET /leagues`

**Parameters**: None (or optionally filter by country, type, etc.)

**Example Request**:
```
GET /leagues
```

**Example Response** (truncated):
```json
{
  "get": "leagues",
  "parameters": {},
  "errors": [],
  "results": 900,
  "paging": { "current": 1, "total": 1 },
  "response": [
    {
      "league": {
        "id": 39,
        "name": "Premier League",
        "type": "League",
        "logo": "https://media.api-sports.io/football/leagues/39.png"
      },
      "country": {
        "name": "England",
        "code": "GB",
        "flag": "https://media.api-sports.io/flags/gb.svg"
      },
      "seasons": [
        {
          "year": 2023,
          "start": "2023-08-11",
          "end": "2024-05-19",
          "current": true,
          "coverage": {
            "fixtures": {
              "events": true,
              "lineups": true,
              "statistics_fixtures": true,
              "statistics_players": true
            }
          }
        }
      ]
    },
    {
      "league": {
        "id": 140,
        "name": "La Liga",
        "type": "League",
        "logo": "https://media.api-sports.io/football/leagues/140.png"
      },
      "country": {
        "name": "Spain",
        "code": "ES",
        "flag": "https://media.api-sports.io/flags/es.svg"
      },
      "seasons": [ /* ... */ ]
    }
  ]
}
```

**Important**: 
- Filter to show only major leagues (id: 39=Premier League, 140=La Liga, 135=Serie A, 78=Bundesliga, 61=Ligue 1)
- Each league includes a `seasons` array with coverage information

### 2. Get League Seasons
**Endpoint**: `GET /leagues?id={leagueId}`

**Parameters**:
- `id` (number, required): League ID

**Example Request**:
```
GET /leagues?id=39
```

**Example Response**:
```json
{
  "get": "leagues",
  "parameters": { "id": "39" },
  "errors": [],
  "results": 1,
  "paging": { "current": 1, "total": 1 },
  "response": [
    {
      "league": {
        "id": 39,
        "name": "Premier League",
        "type": "League",
        "logo": "https://media.api-sports.io/football/leagues/39.png"
      },
      "country": {
        "name": "England",
        "code": "GB",
        "flag": "https://media.api-sports.io/flags/gb.svg"
      },
      "seasons": [
        {
          "year": 2023,
          "start": "2023-08-11",
          "end": "2024-05-19",
          "current": true,
          "coverage": {
            "fixtures": {
              "events": true,
              "lineups": true,
              "statistics_fixtures": true,
              "statistics_players": true
            },
            "standings": true,
            "players": true,
            "top_scorers": true,
            "top_assists": true,
            "top_cards": true,
            "injuries": true,
            "predictions": true,
            "odds": true
          }
        },
        {
          "year": 2022,
          "start": "2022-08-05",
          "end": "2023-05-28",
          "current": false,
          "coverage": {
            "fixtures": {
              "events": true,
              "lineups": true,
              "statistics_fixtures": true,
              "statistics_players": true
            }
          }
        }
      ]
    }
  ]
}
```

**Important**: Check `coverage.fixtures.lineups` to ensure lineup data is available for that season.

### 3. Get Teams by League & Season
**Endpoint**: `GET /teams?league={leagueId}&season={year}`

**Parameters**:
- `league` (number, required): League ID
- `season` (number, required): Season year (e.g., 2023)

**Example Request**:
```
GET /teams?league=39&season=2023
```

**Example Response**:
```json
{
  "get": "teams",
  "parameters": { "league": "39", "season": "2023" },
  "errors": [],
  "results": 20,
  "paging": { "current": 1, "total": 1 },
  "response": [
    {
      "team": {
        "id": 33,
        "name": "Manchester United",
        "code": "MUN",
        "country": "England",
        "founded": 1878,
        "national": false,
        "logo": "https://media.api-sports.io/football/teams/33.png"
      },
      "venue": {
        "id": 556,
        "name": "Old Trafford",
        "address": "Sir Matt Busby Way",
        "city": "Manchester",
        "capacity": 76212,
        "surface": "grass",
        "image": "https://media.api-sports.io/football/venues/556.png"
      }
    },
    {
      "team": {
        "id": 42,
        "name": "Arsenal",
        "code": "ARS",
        "country": "England",
        "founded": 1886,
        "national": false,
        "logo": "https://media.api-sports.io/football/teams/42.png"
      },
      "venue": {
        "id": 494,
        "name": "Emirates Stadium",
        "address": "Queensland Road",
        "city": "London",
        "capacity": 60383,
        "surface": "grass",
        "image": "https://media.api-sports.io/football/venues/494.png"
      }
    }
  ]
}
```

**Important**: Returns all teams that participated in that league season.

### 4. Get Fixtures by Team & Season
### 4. Get Fixtures by Team & Season
**Endpoint**: `GET /fixtures?team={teamId}&season={year}`

**Parameters**:
- `team` (number, required): Team ID
- `season` (number, required): Season year (e.g., 2023)

**Example Request**:
```
GET /fixtures?team=33&season=2023
```

**Example Response**:
```json
{
  "get": "fixtures",
  "parameters": { "team": "33", "season": "2023" },
  "errors": [],
  "results": 38,
  "paging": { "current": 1, "total": 1 },
  "response": [
    {
      "fixture": {
        "id": 1035086,
        "referee": "Anthony Taylor",
        "timezone": "UTC",
        "date": "2023-08-14T19:00:00+00:00",
        "timestamp": 1692039600,
        "periods": {
          "first": 1692039600,
          "second": 1692043200
        },
        "venue": {
          "id": 556,
          "name": "Old Trafford",
          "city": "Manchester"
        },
        "status": {
          "long": "Match Finished",
          "short": "FT",
          "elapsed": 90
        }
      },
      "league": {
        "id": 39,
        "name": "Premier League",
        "country": "England",
        "logo": "https://media.api-sports.io/football/leagues/39.png",
        "flag": "https://media.api-sports.io/flags/gb.svg",
        "season": 2023,
        "round": "Regular Season - 1"
      },
      "teams": {
        "home": {
          "id": 33,
          "name": "Manchester United",
          "logo": "https://media.api-sports.io/football/teams/33.png",
          "winner": true
        },
        "away": {
          "id": 39,
          "name": "Wolves",
          "logo": "https://media.api-sports.io/football/teams/39.png",
          "winner": false
        }
      },
      "goals": {
        "home": 1,
        "away": 0
      },
      "score": {
        "halftime": {
          "home": 1,
          "away": 0
        },
        "fulltime": {
          "home": 1,
          "away": 0
        },
        "extratime": {
          "home": null,
          "away": null
        },
        "penalty": {
          "home": null,
          "away": null
        }
      }
    }
  ]
}
```

**Important**: Only show fixtures with `status.short === "FT"` (finished matches) as lineups are only available for completed matches.

### 5. Get Lineups by Fixture
**Endpoint**: `GET /fixtures/lineups?fixture={fixtureId}`

**Parameters**:
- `fixture` (number, required): Fixture ID

**Example Request**:
```
GET /fixtures/lineups?fixture=1035086
```

**Example Response**:
```json
{
  "get": "fixtures/lineups",
  "parameters": { "fixture": "1035086" },
  "errors": [],
  "results": 2,
  "paging": { "current": 1, "total": 1 },
  "response": [
    {
      "team": {
        "id": 33,
        "name": "Manchester United",
        "logo": "https://media.api-sports.io/football/teams/33.png",
        "colors": {
          "player": {
            "primary": "ff0000",
            "number": "ffffff",
            "border": "ff0000"
          },
          "goalkeeper": {
            "primary": "1e1e1e",
            "number": "ffffff",
            "border": "1e1e1e"
          }
        }
      },
      "formation": "4-2-3-1",
      "startXI": [
        {
          "player": {
            "id": 882,
            "name": "André Onana",
            "number": 24,
            "pos": "G",
            "grid": "1:1"
          }
        },
        {
          "player": {
            "id": 2935,
            "name": "Diogo Dalot",
            "number": 20,
            "pos": "D",
            "grid": "2:4"
          }
        },
        {
          "player": {
            "id": 1456,
            "name": "Raphaël Varane",
            "number": 19,
            "pos": "D",
            "grid": "2:3"
          }
        },
        {
          "player": {
            "id": 1100,
            "name": "Lisandro Martínez",
            "number": 6,
            "pos": "D",
            "grid": "2:2"
          }
        },
        {
          "player": {
            "id": 18,
            "name": "Luke Shaw",
            "number": 23,
            "pos": "D",
            "grid": "2:1"
          }
        },
        {
          "player": {
            "id": 640,
            "name": "Casemiro",
            "number": 18,
            "pos": "M",
            "grid": "3:2"
          }
        },
        {
          "player": {
            "id": 1484,
            "name": "Mason Mount",
            "number": 7,
            "pos": "M",
            "grid": "3:3"
          }
        },
        {
          "player": {
            "id": 1503,
            "name": "Bruno Fernandes",
            "number": 8,
            "pos": "M",
            "grid": "3:4"
          }
        },
        {
          "player": {
            "id": 889,
            "name": "Marcus Rashford",
            "number": 10,
            "pos": "M",
            "grid": "3:1"
          }
        },
        {
          "player": {
            "id": 1461,
            "name": "Antony",
            "number": 21,
            "pos": "F",
            "grid": "4:1"
          }
        },
        {
          "player": {
            "id": 18846,
            "name": "Rasmus Højlund",
            "number": 11,
            "pos": "F",
            "grid": "4:2"
          }
        }
      ],
      "substitutes": [
        {
          "player": {
            "id": 2935,
            "name": "Tom Heaton",
            "number": 22,
            "pos": "G",
            "grid": null
          }
        }
      ],
      "coach": {
        "id": 4,
        "name": "Erik ten Hag",
        "photo": "https://media.api-sports.io/football/coachs/4.png"
      }
    },
    {
      "team": {
        "id": 39,
        "name": "Wolves",
        "logo": "https://media.api-sports.io/football/teams/39.png",
        "colors": null
      },
      "formation": "4-4-2",
      "startXI": [
        /* ... away team lineup ... */
      ],
      "substitutes": [],
      "coach": {
        "id": 2687,
        "name": "Gary O'Neil",
        "photo": "https://media.api-sports.io/football/coachs/2687.png"
      }
    }
  ]
}
```

**Important Notes**:
- Response contains 2 items (one for each team)
- `grid` format is "row:column" (e.g., "1:1" for goalkeeper, "2:1" to "2:4" for defenders in 4-4-2)
- Need to identify which team is the selected team (match by team.id)
- For Classic Caps, we should filter fixtures to only show those with 4-4-2 formation, or implement formation conversion logic

## Grid Position Mapping

API-Football uses a grid string format (e.g., "2:3") to indicate player positions:
- Row 1: Goalkeeper
- Row 2: Defenders
- Row 3: Midfielders
- Row 4: Forwards

For a 4-4-2 formation:
```
Row 4: Forwards (2 players) - "4:1", "4:2"
Row 3: Midfielders (4 players) - "3:1", "3:2", "3:3", "3:4"
Row 2: Defenders (4 players) - "2:1", "2:2", "2:3", "2:4"
Row 1: Goalkeeper (1 player) - "1:1"
```

## Rate Limits

Free tier: 100 requests per day

**Optimization strategies**:
1. Cache all responses aggressively
2. Teams search: Cache 7 days
3. Leagues/seasons: Cache 30 days
4. Fixtures: Cache 30 days
5. Lineups: Cache indefinitely (historical data)
6. Batch requests where possible
7. Only fetch lineups for fixtures user selects to play

## Error Handling

Common error responses:
- `429`: Rate limit exceeded - implement exponential backoff
- `404`: Resource not found - handle gracefully
- `500`: Server error - retry with backoff

Always check the `errors` array in the response wrapper.
