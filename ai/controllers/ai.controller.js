const { processUserMessage } = require('../services/copilot.service');

const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const response = await processUserMessage(message, history || []);

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI chat request',
      error: error.message
    });
  }
};

module.exports = {
  handleChat
};
