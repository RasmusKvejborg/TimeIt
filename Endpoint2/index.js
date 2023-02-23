const express = require("express");
const app = express();

app.get("/", function (req, res) {
  // com.studsk.TimeIt
  // com.studsk.TimeIt://authredirect?token=1234

  const token = req.query.token;
  const url = `app://deepLinkTimeit?token=${token}`;
  console.log(url);

  // const html = `
  //   <html>
  //     <body>
  //     <a href="${url}" >Back to TimeIt app</a>
  //     </body>
  //   </html>
  // `;

  // res.send(html);

  res.redirect(`${url}]`);
});

app.get("*", function (req, res) {});

const port = 5000;

app.listen(process.env.PORT || port, function () {
  console.log("Example app listening on port 5000!");
});

// netlify: https://magnificent-quokka-20ad94.netlify.app/
// res.redirect("https://magnificent-quokka-20ad94.netlify.app/");
