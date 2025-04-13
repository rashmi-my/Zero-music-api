import { exec } from "child_process";

export default async function handler(req, res) {
  const name = req.query.name;

  if (!name) {
    res.setHeader("Content-Type", "application/json");
    res.status(400).end(JSON.stringify({
      status: "error",
      message: "Please provide a music name using ?name="
    }, null, 2));
    return;
  }

  const searchQuery = `yt-dlp --default-search ytsearch1:"${name}" --get-title --get-id --get-thumbnail`;

  exec(searchQuery, (err, stdout, stderr) => {
    if (err || stderr) {
      res.setHeader("Content-Type", "application/json");
      res.status(500).end(JSON.stringify({
        status: "error",
        message: "Failed to fetch music",
        error: stderr || err.toString()
      }, null, 2));
      return;
    }

    const [title, videoId, thumbnail] = stdout.trim().split("\n");

    const mp3Url = `https://api.vevioz.com/@api/button/mp3/${videoId}`;

    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({
      status: "success",
      result: {
        title,
        thumbnail,
        videoId,
        mp3: `https://dl.musiczero.vercel.app/mp3/${videoId}.mp3`,
        stream_direct: mp3Url
      }
    }, null, 2));
    res.end();
  });
}
