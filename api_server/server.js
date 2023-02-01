const express = require("express");

const cors = require("cors");

const test = require("./ipresponse.json");

const { setupLogging } = require("./logging");

const { ROUTES } = require("./routes");

const { setupProxies } = require("./proxy");
const { setupRateLimit } = require("./ratelimit");

const app = express();

// Configuration
const PORT = 4000;

app.get("/hello", (req, resp) => {
  console.log(req);
  return resp.json(test);
});

app.use(cors());

setupRateLimit(app, ROUTES);
setupLogging(app);
setupProxies(app, ROUTES);

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
