import app from "./app";
import { AppDataSource } from "./config/data-source";
import "dotenv/config";
import { createAdminUser } from "./utils/createAdminUser";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  AppDataSource.initialize()
    .then(async () => {
      console.log("✅ Data Source has been initialized successfully!");
      await createAdminUser();
    })
    .catch((error) => {
      console.error("❌ Error during Data Source initialization:", error);
    });

  console.log(`🚀 Server running on port ${PORT}`);
});
