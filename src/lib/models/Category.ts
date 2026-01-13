import mongoose, { Schema, models, model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // prevent duplicate category names
      maxlength: 50,
    },

    // optional: short description
    description: {
      type: String,
      default: "",
      maxlength: 200,
    },

    // optional: for ordering categories in UI
    order: {
      type: Number,
      default: 0,
    },

    // optional: status control
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Prevent model overwrite error in Next.js
const Category =
  models.Category || model("Category", CategorySchema);

export default Category;
