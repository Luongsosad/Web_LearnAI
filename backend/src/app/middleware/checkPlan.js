export const checkPlan = (requiredPlanIds) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.plan_id) {
      return res.status(403).json({ success: false, message: 'Chưa xác định gói dịch vụ' });
    }

    if (!requiredPlanIds.includes(user.plan_id)) {
      return res
        .status(403)
        .json({ success: false, message: 'Gói của bạn không đủ quyền truy cập tính năng này' });
    }

    next();
  };
};
