import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./src/routes/routes.js"
import supabase from "./src/config/supabaseClient.js";
config({ path: '.env' })

const app = express();

app.use(cookieParser())
app.use(express.json());

app.use(cors())

app.use(router);

// sequelize.authenticate()
//   .then(() => {
//     console.log('Successfully Connect to Dev Database')

//   })
//   .catch((err) => { console.error('Failed to connect to the database:', err); })

const port = process.env.EXPRESS_PORT;

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});


