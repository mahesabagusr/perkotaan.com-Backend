
import jwt from "jsonwebtoken";
import { createToken } from "../middlewares/jwt.js";
import supabase from "../config/supabaseConfig.js";

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401);

    const { data: token, error } = await supabase
      .from('users')
      .select('*')
      .eq('refresh_token', refreshToken)

    if (!token[0]) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.sendStatus(403);

      const { accessToken } = createToken({ id: token[0].id, name: token[0].name, email: token[0].email, signature: token[0].signature });

      res.json(accessToken);
    })

  } catch (err) {
    console.error(err);
  }
};