class StatsController {
    // [GET] /api/stats/daily - Thống kê hàng ngày
    async getDailyStats(req, res) {
        try {
            res.json({ 
                success: true, 
                data: { 
                    date: req.query.date || new Date().toISOString().split('T')[0],
                    totalViewings: 0,
                    confirmedViewings: 0,
                    completedViewings: 0,
                    cancelledViewings: 0
                }
            });
        } catch (error) {
            console.error('Error getting daily stats:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // [GET] /api/stats/room/:roomID - Thống kê theo phòng
    async getRoomStats(req, res) {
        try {
            res.json({ 
                success: true, 
                data: { 
                    roomID: req.params.roomID,
                    totalViewings: 0,
                    confirmedViewings: 0,
                    completedViewings: 0,
                    cancelledViewings: 0
                }
            });
        } catch (error) {
            console.error('Error getting room stats:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new StatsController();