const express = require("express");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const expressValidator = require("express-validator");
require("dotenv").config();

// const corsOptions = {
//     origin: "*",
//     credentials: true, //access-control-allow-credentials:true
//     optionSuccessStatus: 200,
// };

// import routes
const canvasRoute = require("./router");

// app
const app = express();
// const publicPath = path.join(__dirname, ".", "build");
// app.use(express.static(publicPath));

// middlewares
app.use(morgan("dev"));
// app.use(bodyParser.json());

app.use(bodyParser.json({ limit: "15mb" }));
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true }));
// app.use(bodyParser.urlencoded({ limit: "1mb", extended: true, parameterLimit: 50000 }));

// app.use(bodyParser.text({ limit: '200mb' }));
// app.use(express.json({ limit: '200mb' }));

app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

// routes middleware
app.use("/api", canvasRoute); // '/api' is just convention, not mandatory

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     next();
// });

const port = process.env.PORT || 8000;

// app.get("*", (req, res) => {
//     res.sendFile(path.join(publicPath, "index.html"));
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
