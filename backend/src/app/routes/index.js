import { chatRoute } from './chat.route.js';
import { audioRoute } from './audio.route.js';

function route(app) {
    app.use('/chat', chatRoute);
    app.use('/audio', audioRoute);

    app.get("/ping", (req, res) => {
        res.send("Hello! This is website: Laerning by AI.");
    });
}

// Thay vì module.exports, sử dụng export
export default route; 
