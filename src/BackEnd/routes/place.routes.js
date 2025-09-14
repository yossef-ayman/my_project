const express = require("express");
const router = express.Router();
const Place = require("../models/place.model");

router.get("/", async (req, res) => {
  const places = await Place.find();
  res.json(places);
});

router.post("/", async (req, res) => {
  const place = new Place(req.body);
  await place.save();
  res.status(201).json(place);
});

router.put("/:id", async (req, res) => {
  const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(place);
});

router.delete("/:id", async (req, res) => {
  await Place.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;