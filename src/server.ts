import app from "./app";
import { AppDataSource } from "./config/data-source";
import "dotenv/config";



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  AppDataSource.initialize()
    .then(() => {
      console.log("✅ Data Source has been initialized successfully!");
    })
    .catch((error) => {
      console.error("❌ Error during Data Source initialization:", error);
    });

  console.log(`🚀 Server running on port ${PORT}`);
});
