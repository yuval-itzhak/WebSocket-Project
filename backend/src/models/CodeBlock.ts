import mongoose from 'mongoose';

const codeBlockSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  initialCode: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
  currentCode: {
    type: String,
    required: true,
  }
});


// Tell Mongoose: use the exact collection name 'codeBlock'
const CodeBlock = mongoose.model('CodeBlock', codeBlockSchema, 'codeBlock');

export default CodeBlock;
