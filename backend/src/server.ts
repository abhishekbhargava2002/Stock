import { connectDB } from "./config/db";
import { env } from "./config/env";
import { app } from "./app";

async function bootstrap() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`🚀 Stockora API running on http://localhost:${env.port}`);
  });
}

bootstrap();