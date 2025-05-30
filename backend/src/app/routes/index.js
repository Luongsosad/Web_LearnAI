import { chatRoute } from './chat.route.js';
import { audioRoute } from './audio.route.js';
import { dataRoute } from './data.route.js';

function route(app) {
    app.use('/chat', chatRoute);
    app.use('/data', dataRoute);
    app.use('/audio', audioRoute);

    app.get("/ping", (req, res) => {
        res.send("Hello! This is website: Laerning by AI.");
    });
}

// Thay vì module.exports, sử dụng export
export default route; 
