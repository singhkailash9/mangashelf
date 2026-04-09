const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./routes/authRoutes");
const listRoutes = require('./routes/listRoutes');

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials:  true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use('/api/list', listRoutes);

mongoose.connect(process.env.MONGO_URI).then(console.log("MongoDB connected")).catch((err)=>console.error(`MongoDB error: ${err}`));

app.get("/", (req, res) =>{
    res.json({message: "MangaShelf API is running"});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server running on PORT ${PORT}`));
