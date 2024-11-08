const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { connect } = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const logger = require("morgan");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Helmet for security
app.use(helmet());

// Routes
app.use("/", userRoutes);



// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(notFound);
app.use(errorHandler);

// Connect database and start server
connect(process.env.MONGO_URI)
  .then(app.listen(PORT, () => console.log(`Server is running on ${PORT}`)))
  .catch((error) => console.log(error));
