const express = require('express');
const path = require('path');
const ejs = require('ejs');
const axios = require('axios'); // Ensure you have axios installed
const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for webhook URLs keyed by username
const userWebhookURLs = {};

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to input webhook URL
app.post('/inputyourwebhook', (req, res) => {
  const { username, webhookURL } = req.body;
  if (!username || !webhookURL) {
    return res.status(400).send({ error: 'Username and webhook URL are required' });
  }
  userWebhookURLs[username] = webhookURL;
  res.send({ status: 'Webhook URL stored successfully!' });
});

// Route to render user-specific page
app.get('/:username', (req, res) => {
  const { username } = req.params;
  const webhookURL = userWebhookURLs[username];

  if (!webhookURL) {
    return res.status(404).send({ error: 'User not found' });
  }

  // Render template with user-specific webhook URL
  res.render('user-page', { webhookURL });
});

// Route to handle sending messages
app.post('/send', (req, res) => {
  const { message, webhookURL } = req.body;

  if (!message || !webhookURL) {
    return res.status(400).send({ error: 'Message and webhook URL are required' });
  }

  // Send the message to the webhook URL
  axios.post(webhookURL, { content: message })
    .then(() => {
      res.send({ status: 'Message sent successfully!' });
    })
    .catch((error) => {
      res.status(500).send({ error: 'Failed to send message' });
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
