import { chatRoute } from './chat.route.js';
import { audioRoute } from './audio.route.js';
import { dataRoute } from './data.route.js';
import { authRoute } from './auth.route.js';
import { accountRoute } from './account.route.js';

import { authenticateToken } from '../middleware/authMiddleware.js';

function route(app) {
    app.use('/auth', authRoute);

    app.use('/chat', authenticateToken, chatRoute);
    app.use('/a', authenticateToken, accountRoute);
    app.use('/data', authenticateToken, dataRoute);
    app.use('/audio', authenticateToken, audioRoute);

    app.get("/ping", (req, res) => {
        res.send("Hello! This is website: Learning by AI.");
    });
}

// Thay vì module.exports, sử dụng export
export default route; 
