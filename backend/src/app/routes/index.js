import { chatRoute } from './chat.route.js';
import { audioRoute } from './audio.route.js';
import { dataRoute } from './data.route.js';
import { authRoute } from './auth.route.js';
import { accountRoute } from './account.route.js';
import { communicateRoute } from './communicate.route.js';
import { wordRoute } from './word.route.js';
import { orderRoute } from './order.route.js';
import { bilingualStoryRoute } from './bilingualStory.route.js';

import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkPlan } from '../middleware/checkPlan.js';

function route(app) {
  app.use('/auth', authRoute);

  app.use('/order', authenticateToken, orderRoute);
  app.use('/chat', authenticateToken, checkPlan([1, 2, 3]), chatRoute); // Free, Basic và Pro
  app.use('/w', authenticateToken, checkPlan([1, 2, 3]), wordRoute); // Free, Basic và Pro
  app.use('/a', authenticateToken, accountRoute); // Account
  app.use('/data', authenticateToken, checkPlan([1, 2, 3]), dataRoute); // Free, Basic và Pro
  app.use('/audio', authenticateToken, checkPlan([1, 2, 3]), audioRoute); // Free, Basic và Pro
  app.use('/communicate', authenticateToken, checkPlan([2, 3]), communicateRoute); // Basic và Pro
  app.use('/bilingual-story', bilingualStoryRoute);

  app.get('/ping', (req, res) => {
    res.send('Hello guy! This is website: Learning by AI.');
  });
}

export default route;
