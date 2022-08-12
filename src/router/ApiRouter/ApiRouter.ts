import express from "express";

// Router import
import userApi from "./user/userApi";

const router = express.Router();

router.use("/user", userApi);

export = router;