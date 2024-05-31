const express = require('express');
const bodyParser = require('body-parser');

// const journeyRoutes = require('../routes/journeyRoutes');
// const eventRoutes = require('../routes/eventRoutes');

const journeyRoutes = require('./routes/journeyRoutes');
const eventRoutes = require('./routes/eventRoutes')

const app = express();
app.use(bodyParser.json());

app.use('/api', journeyRoutes);
app.use('/api', eventRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});