import { connection } from "../database.js";
import bcrypt from "bcrypt";

export async function createUrl(req, res) {
  const { user } = res.locals;
  const urlToShorten = req.body.url;

  const shortenedUrl = bcrypt
    .hashSync(urlToShorten, 1)
    .slice(-10)
    .replace(/\.|\//, "");

  try {
    const urlAlreadyExists = await connection.query(
      `
        SELECT * FROM urls u WHERE u."userId"=$1 AND u."completeUrl"=$2
      `,
      [user.id, urlToShorten]
    );
    if (urlAlreadyExists.rows.length !== 0) {
      res.sendStatus(409);
      return;
    }

    connection.query(
      `
      INSERT INTO
        urls("completeUrl", "shortenedUrl", "userId")
      VALUES($1, $2, $3)
    `,
      [urlToShorten, shortenedUrl, user.id]
    );
    res.status(201).send({ shortUrl: shortenedUrl });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}
