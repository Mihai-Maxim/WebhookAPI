import app from "./app.js";

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  return console.log(`Express is listening at http://localhost:${PORT}`);
});