import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DB_URI}`);
    console.log(
      "MongoDB connected successfully: ", connectionInstance.connection.host);
  } catch (error) {
    console.log("Error connecting DB: ", error);
    process.exit(1);
  }
};
