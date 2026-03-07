
const Example = require('../models/Example');


exports.getExamples = async (req, res) => {
  try {
    const examples = await Example.find();
    res.json(examples);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.createExample = async (req, res) => {
  try {
    const example = new Example(req.body);
    const saved = await example.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
