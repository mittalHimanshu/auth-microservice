const router = require("express").Router();
var pdfreader = require("pdfreader");

router.get("/extract-text", async (req, res) => {
  // const vision = require("@google-cloud/vision");
  // const client = new vision.ImageAnnotatorClient();
  // const [result] = await client.textDetection("./images/invoice.png");
  // const detections = result.textAnnotations;
  // res.status(200).json({ detections });

  var rows = {};

  new pdfreader.PdfReader().parseFileItems("./images/invoice.pdf", function(
    err,
    item
  ) {
    if (!item) {
      Object.keys(rows)
        .sort((y1, y2) => parseFloat(y1) - parseFloat(y2))
        .forEach(y => console.log((rows[y] || []).join("")));
      rows = {};
    } else if (item.text) {
      (rows[item.y] = rows[item.y] || []).push(item.text);
    }
  });
});

router.get("/speech", async (req, res) => {
  console.log("hello");
  const record = require("node-record-lpcm16");
  const speech = require("@google-cloud/speech");
  const client = new speech.SpeechClient();

  const encoding = "LINEAR16";
  const sampleRateHertz = 16000;
  const languageCode = "en-US";

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
      alternativeLanguageCodes: [`hi-IN`, `ta-IN`]
    },
    single_utterance: true,
    interimResults: false
  };

  const recognizeStream = client
    .streamingRecognize(request)
    .on("error", console.error)
    .on("data", data => {
      process.stdout.write(
        data.results[0] && data.results[0].alternatives[0]
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : `\n\nReached transcription time limit, press Ctrl+C\n`
      );
    });

  record
    .start({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      verbose: false,
      recordProgram: "rec",
      silence: "10.0"
    })
    .on("error", console.error)
    .pipe(recognizeStream);

  console.log("Listening, press Ctrl+C to stop.");
});

module.exports = router;
