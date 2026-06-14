require("dotenv").config();
const app = require("./src/app.js");
const connectToDB = require("./src/config/database.js");
const PORT = process.env.PORT || 3000;

connectToDB()
  .then(() => {
    console.log("Connected to DB successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to DB : ", err);
  });
