import express from "express";

// Router import
import WebpageRouter from "./WebpageRouter/FrontpageRouter";
import ServiceApiRouter from "./ApiRouter/ApiRouter";

const router = express.Router();

router.use("/", WebpageRouter);
router.use("/api", ServiceApiRouter);

export = router;