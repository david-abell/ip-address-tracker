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
app.use(cors());

app.get("/test", (req, resp) => {
  return resp.json(test);
});

setupRateLimit(app, ROUTES);
setupLogging(app);
setupProxies(app, ROUTES);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
