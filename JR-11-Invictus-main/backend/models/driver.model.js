import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true},
        password: { type: String, required: true },
        vehicleType: { type: String, required: true },
        vehicleName : { type: String, required: true },
        vehicleNumber: { type: String, required: true },
        licenceNumber : { type: Number, required: true },
        phoneNumber: {type:Number,required:true},
    },
    { timestamps: true } // Auto-creates createdAt & updatedAt
);

export default mongoose.model("Driver", DriverSchema);
