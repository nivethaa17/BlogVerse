"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const Social_model_1 = require("../models/Social.model");
const getNotifications = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Social_model_1.Notification.find({ recipient: req.user._id })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit);
    const unreadCount = await Social_model_1.Notification.countDocuments({ recipient: req.user._id, isRead: false });
    const total = await Social_model_1.Notification.countDocuments({ recipient: req.user._id });
    res.json({ success: true, notifications, unreadCount, pagination: { page: +page, limit: +limit, total } });
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
        await Social_model_1.Notification.updateMany({ _id: { $in: ids }, recipient: req.user._id }, { isRead: true });
    }
    else {
        await Social_model_1.Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    }
    res.json({ success: true, message: 'Notifications marked as read' });
};
exports.markAsRead = markAsRead;
//# sourceMappingURL=notification.controller.js.map