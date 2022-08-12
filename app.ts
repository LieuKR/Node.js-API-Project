import express from "express";
import cookieParser from "cookie-parser";

// Router
import router from "@src/router/index";

// Custom middlewares
import NoFavicon from "@src/middleware/favicon";
import checkLoginToken from "@src/middleware/LoginUserAuth";
import logger from "@src/middleware/logger";
import errorHandler from "@src/middleware/ErrorHandler";

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/favicon.ico', NoFavicon);
app.use('/frontside', express.static(__dirname + '/src/Frontside/Page'));

app.use(checkLoginToken);

app.use("/", router);

app.use(errorHandler);
app.use(logger);

console.log("Server Start!!");

app.listen(4000);