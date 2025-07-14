const cron = require('node-cron');
const RoomViewing = require('../app/models/RoomsViewing');

// Job tự động cập nhật trạng thái lịch hẹn
function updateViewingStatuses() {
    // Chạy mỗi 15 phút để kiểm tra và cập nhật trạng thái
    cron.schedule('*/15 * * * *', async () => {
        try {
            console.log('🔄 Đang kiểm tra và cập nhật trạng thái lịch hẹn...');
            
            const result = await RoomViewing.updateCompletedViewings();
            
            if (result.success && result.updatedCount > 0) {
                console.log(`✅ Đã cập nhật ${result.updatedCount} lịch hẹn thành trạng thái "completed"`);
            } else {
                console.log('ℹ️ Không có lịch hẹn nào cần cập nhật');
            }
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật trạng thái lịch hẹn:', error);
        }
    });
}

// Job dọn dẹp dữ liệu cũ (chạy hàng ngày lúc 2:00 AM)
function cleanupOldData() {
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log('🧹 Đang dọn dẹp dữ liệu cũ...');
            
            // Xóa các lịch hẹn đã bị hủy cũ hơn 30 ngày
            const result = await RoomViewing.cleanupCancelledViewings(30);
            
            if (result.success && result.deletedCount > 0) {
                console.log(`🗑️ Đã xóa ${result.deletedCount} lịch hẹn đã hủy cũ`);
            }
        } catch (error) {
            console.error('❌ Lỗi khi dọn dẹp dữ liệu:', error);
        }
    });
}

// Job thống kê hàng ngày (chạy lúc 6:00 AM)
function dailyStatsReport() {
    cron.schedule('0 6 * * *', async () => {
        try {
            console.log('📊 Tạo báo cáo thống kê hàng ngày...');
            
            const stats = await RoomViewing.getDailyStats();
            
            if (stats.success) {
                console.log('📈 Thống kê hôm qua:');
            }
        } catch (error) {
            console.error('❌ Lỗi khi tạo báo cáo thống kê:', error);
        }
    });
}

// Khởi tạo tất cả các scheduled jobs
function initializeScheduledJobs() {
    console.log('🚀 Khởi tạo các scheduled jobs...');
    
    updateViewingStatuses();
    cleanupOldData();
    dailyStatsReport();
}

module.exports = { initializeScheduledJobs };