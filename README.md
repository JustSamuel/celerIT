# Website for the SNiC: SingularIT 2018 congress

## Setup
Install [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/).

### Running for development
Run the following to build the development image:
```bash
./docker-compose-prod.sh build
```

And run it with:
```bash
./docker-compose-prod.sh up
```

This container has the `singularIT` directory mounted as a volume, so you don't have
to rebuild the container on every change. It will also automatically reload
when files have changed using `nodemon`.

### Running in production
Build the image with:

```bash
docker-compose build
```

And run it (detached) with
```
docker-compose up -d
```

## Credits
This framework was started by [Arian van Putten](https://github.com/arianvp), extended and improved upon by [Dennis Collaris](https://github.com/iamDecode). It however does not show up as a fork due to the need temporarily have the repository private.

## Config

Configuration files are not included in this repository. You will need to add a file named `config.json` to the root folder with the following structure:
```javascript
{
  "mongodb": {
    // When using the provided docker-compose file, this is fine. Otherwise change address. Port is optional
    // You can optionally set username and pass using URI: mongodb://user:password@localhost/SNiC
    "url": "mongodb://mongodb/SNiC"
  },

  "mailchimp": {
    "id": "id of the list can be found on the page of defaults of the list. Lists > DisruptIT > Settings > List name and campaign defaults > ListID on page (don't take form URL",
    "key": "Generate this yourself at your account page"
  },
  "mailgun":{
      "domain": "Domain you provided or the sandbox url",
      "api_key": "Mention on the information page of the domain"
  },

  "email": {
    // Not unified because this allows for easier use when implementing mailchimp
    "auth": {
      "user": "default SMTP login on the domain page",
      "pass": "default password on the domain page"
    }
  },
  "session": {
    // Session secret. Should be better when running in production.
    "secret": "abc123"
  },
  // Used to create the very first ticket.
  "starthelper": {
      "active": false,
      "url": "url"
  },
  // List of associations that take part.
  // List used to create the dropdown options when registering, therefore partner
  // bus indicates whether or not that association gets a bus
  "associations": [
    {
      "name": "Cover",
      "bus": true
    },
    {
      "name": "A-eskwadraat",
      "bus": true
    },
    {
      "name": "CognAC",
      "bus": true
    },
    {
      "name": "De Leidsche Flesch",
      "bus": true
    },
    {
      "name": "GEWIS",
      "bus": true
    },
    {
      "name": "Inter-Actief",
      "bus": true
    },
    {
      "name": "Sticky",
      "bus": true
    },
    {
      "name": "Thalia",
      "bus": true
    },
    {
      "name": "via",
      "bus": true
    },
    {
      "name": "Partner",
      "bus": false
    }
  ],
  "studyProgrammes": [
    "BSc Computer Science",
    "BSc Artificial Intelligence",
    "BSc Information Sciences",
    "BSc Mathematics"
  ],
  "ticketSaleStarts": "2015-08-01T00:00:00.001Z", // From when to register
  "providePreferences": false,     // If people can signup for sessions.
  "hideMenu": false,               // Not used in disruptIT
  // Used for matching
  // Choices are automatically generated based on order of this list.
  // Works although the order is not guaranteed by JSON standard.
  "matchingterms": [
    "Programmer",
    "Code witcher"
  ]
}
```

The speaker.json is used to generate the speaker page and for the enrollment tool. It is is structered in the following way

```javascript
{
  // list of ids of speakers per session. Used to generate the speakers page
  "speakerids": {
    "session1": ["ses1.1", "ses1.2"], // for parallel sessions
    "closing": "closing" // for single sessions
  },
  // List of all data needed to display a session
  "speakers": [
    {
      "name" : "Name of speaker",
      "id": "closing",  // ID listed in speakerids
      "limit": 9001     // Limit of a session, used for enroll tool. Can be set to null (or left out) to ignore
      "company" : "",   // if you want to mention the company in the session piece
      "image": "/link/to/speaker.jpg", // preferably the speakre
      "subject": "Subject of the talk",
      "talk" : [
        "list of various paragraphs",
        "that can be used to describe the session"
      ],
      "bio": [
        "list of various paragraphs",
        "to give some background on the speakers"
      ],
      "hidden": false   // whether or not you want to display this speaker
    }
    ...
  ],
  "presenters": [
    // list of the same type of object as speakers
  ]
}


```

The timetable.json is used to create the timetable and is used in both the website and the app. 
```javascript
{
  "date":"2019-11-26T",
  "startTime": "10:00:00.000Z",
  "endTime": "17:15:00.000Z",
  "timeInterval": 15,
  "tracks": [
    {
      "name": "track 1",
      "location": "first location",
      "talks": [
        {
          "startTime": "12:00:00.001Z",
          "endTime": "14:00:00.001Z",
          "capacity": 5,
          "enabled": true,
          "title": "Talk 1",
          "subTitle": "First talk"
        },
        {
          "startTime": "15:00:00.001Z",
          "endTime": "16:00:00.001Z",
          "capacity": 20,
          "enabled": true,
          "location": "Override location 1",
          "title": "Talk 2",
          "subTitle": "Second talk"
        }
      ]
    },
    {
      "name": "track 2",
      "location": "second location",
      "talks": [
        {
          "startTime": "11:00:00.001Z",
          "endTime": "14:00:00.001Z",
          "capacity": 35,
          "enabled": true,
          "title": "Talk 1.1",
          "subTitle": "First talk of second track"
        },
        {
          "startTime": "14:00:00.001Z",
          "endTime": "16:00:00.001Z",
          "capacity": 25,
          "enabled": true,
          "title": "Talk 2.1",
          "subTitle": "Second talk of second track"
        }
      ]
    },
    {
      "name": "track 3",
      "location": "third location",
      "talks": [
        {
          "startTime": "11:00:00.001Z",
          "endTime": "12:00:00.001Z",
          "capacity": 9,
          "enabled": true,
          "location": "Room 3",
          "title": "Talk 1.2",
          "subTitle": "First talk of third track"
        },
        {
          "startTime": "12:00:00.001Z",
          "endTime": "13:00:00.001Z",
          "capacity": 45,
          "enabled": true,
          "location": "Override location 3",
          "title": "Talk 2.2",
          "subTitle": "Second talk of third track"
        }
      ]
    }
  ]
}


```

# Reload
After editing or replacing the .json files, run `/reload` to reload all of them. If you only changed 1 of the files, use `/reload/filename`, E.G `/reload/timetable` or `/reload/speakers`.

# Creating an admin user
The easiest way is to log in to mongo-express and change the boolean of a user to true

# Generating tickets

To generate tickets run `node generate-tickets.js <number-of-tickets>'`. To produce tickets non-default types, run `node generate-tickets.js <number-of-tickets> partner', where partner is the type of the ticket.
