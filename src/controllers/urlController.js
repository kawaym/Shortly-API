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
        SELECT * FROM urls u WHERE u."userId"=$1 AND u.url=$2
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
        urls(url, "shortUrl", "userId")
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
export async function readUrl(req, res) {
  const url = req.params.shortUrl;
  try {
    const urls = (
      await connection.query(
        `
      SELECT u.id, u.url, u."shortUrl"
      FROM urls u
      WHERE u."shortUrl"=$1 
    `,
        [url]
      )
    ).rows;
    if (urls.length === 0) {
      res.sendStatus(404);
      return;
    } else {
      res.status(200).send(urls[0]);
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}
