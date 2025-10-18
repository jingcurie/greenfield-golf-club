/**
 * 根据时间和存储状态计算显示状态
 * 
 * 设计理念：
 * - 数据库只存储两种状态：active（正常活动）和 cancelled（管理员取消）
 * - 显示状态完全基于时间计算：未开始/进行中/已完成
 * - 只有 cancelled 状态是管理员手动控制的
 * 
 * @param event 活动对象
 * @returns 显示状态
 */
export function getEventStatus(event: any): 'upcoming' | 'active' | 'completed' | 'cancelled' {
  // 先判断数据库存储状态
  if (event.status === 'cancelled') {
    return 'cancelled'  // 活动取消
  }
  
  // 如果是 active 状态，则根据时间计算显示状态
  if (event.status === 'active') {
    const now = new Date()
    const startTime = new Date(event.start_time)
    const endTime = new Date(event.end_time)

    // 活动还未开始
    if (now < startTime) {
      return 'upcoming'  // 未开始
    }

    // 活动已结束
    if (now > endTime) {
      return 'completed'  // 活动结束
    }

    // 活动进行中
    return 'active'  // 进行中
  }

  // 默认情况（兼容旧数据）
  return 'upcoming'
}

/**
 * 获取活动状态的中文显示文本
 * @param status 活动状态
 * @returns 中文状态文本
 */
export function getEventStatusText(status: 'upcoming' | 'active' | 'completed' | 'cancelled'): string {
  const statusMap = {
    upcoming: '未开始',
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status]
}

/**
 * 获取活动状态的样式类名
 * @param status 活动状态
 * @returns 样式类名
 */
export function getEventStatusStyles(status: 'upcoming' | 'active' | 'completed' | 'cancelled'): string {
  const styleMap = {
    upcoming: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  return styleMap[status]
}

/**
 * 检查活动是否可以录入成绩
 * @param event 活动对象
 * @returns 是否可以录入成绩
 */
export function canEnterScores(event: any): boolean {
  const status = getEventStatus(event)
  return status === 'active' || status === 'completed'
}

/**
 * 检查活动是否可以报名
 * @param event 活动对象
 * @returns 是否可以报名
 */
export function canRegister(event: any): boolean {
  const status = getEventStatus(event)
  const now = new Date()
  const registrationDeadline = new Date(event.registration_deadline)
  
  return status === 'upcoming' && now < registrationDeadline
}



