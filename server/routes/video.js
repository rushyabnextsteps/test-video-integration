var AccessToken = require("twilio").jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
const { connect } = require("twilio-video");

const express = require("express");

const router = express.Router();

// Max. period that a Participant is allowed to be in a Room (currently 14400 seconds or 4 hours)
const MAX_ALLOWED_SESSION_DURATION = 14400;

const getAccessToken = () => {
  var token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { ttl: MAX_ALLOWED_SESSION_DURATION }
  );

  // Assign the generated identity to the token.
  const identity = "rushyab";
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  var grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.
  return token.toJwt();
};

// router.get("/connect", (req, res) => {
connect(`${getAccessToken()}`, {
  name: "room212",
  audio: false,
  video: false,
  tracks: []
}).then(
  room => {
    console.log(`Successfully joined a Room: ${room}`);
    room.on("participantConnected", participant => {
      console.log(`A remote Participant connected: ${participant}`);
    });

    // Handle Connected participants

    // Log your Client's LocalParticipant in the Room
    const localParticipant = room.localParticipant;
    console.log(
      `Connected to the Room as LocalParticipant "${localParticipant.identity}"`
    );

    // Log any Participants already connected to the Room
    room.participants.forEach(participant => {
      console.log(
        `Participant "${participant.identity}" is connected to the Room`
      );
    });

    // Log new Participants as they connect to the Room
    room.once("participantConnected", participant => {
      console.log(
        `Participant "${participant.identity}" has connected to the Room`
      );
    });

    // Log Participants as they disconnect from the Room
    room.once("participantDisconnected", participant => {
      console.log(
        `Participant "${participant.identity}" has disconnected from the Room`
      );
    });
  },
  error => {
    console.error(`Unable to connect to Room: ${error.message}`);
  }
);
// });

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

client.video.rooms
  .create({ uniqueName: "DailyStandup2" })
  .then(room => console.log(room.sid))
  .catch(error => console.log(error));

module.exports = router;
