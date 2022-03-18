import { Router } from "express";
import { createUrl, readUrl } from "../controllers/urlController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import urlSchema from "../schemas/urlSchema.js";

const urlRouter = Router();
urlRouter.post(
  "/urls/shorten",
  validateTokenMiddleware,
  validateSchemaMiddleware(urlSchema),
  createUrl
);
urlRouter.get("/urls/:shortUrl", readUrl);

export default urlRouter;
