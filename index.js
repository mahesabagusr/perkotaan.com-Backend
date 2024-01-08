import express from "express";
import fileUpload from "express-fileupload";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer"
import router from "./src/routes/routes.js"
import supabase from "./src/config/supabaseConfig.js";


config({ path: '.env' })


const app = express();

app.use(fileUpload())
app.use(cookieParser())
app.use(express.json());
app.use(cors())

app.use(router);


const port = process.env.EXPRESS_PORT;

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});


