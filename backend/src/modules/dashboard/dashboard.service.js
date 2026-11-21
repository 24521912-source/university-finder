const University = require('../../models/University')
const Major = require('../../models/Major')
const User = require('../../models/User')
const Consultation = require('../../models/Consultation')
const ChangeLog = require('../../models/ChangeLog')

const DAY = 24 * 60 * 60 * 1000
const TREND_DAYS = 14
const TYPES = ['public', 'private', 'international', 'other']
const ROLES = ['user', 'admin', 'superadmin']

const countBy = (list, keys, pick) => Object.fromEntries(keys.map((k) => [k, list.filter((x) => pick(x) === k).length]))
const hasPoint = (location) => {
  const [lng, lat] = location?.coordinates || []
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)
}
// Ngày theo giờ Việt Nam (UTC+7) dạng YYYY-MM-DD, để biểu đồ không lệch ngày lúc 0h–7h sáng.
const vnDay = (date) => new Date(new Date(date).getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)

// Tính số liệu tổng quan từ dữ liệu thô. Tách riêng khỏi truy vấn để test không cần MongoDB.
function summarize({ universities, majorCount, users, consultationTotal, recentConsultations, recentChanges, now = new Date() }) {
  const activeUsers = users.filter((u) => !u.deletedAt)
  const since30 = now.getTime() - 30 * DAY
  const since7 = now.getTime() - 7 * DAY

  const trend = Array.from({ length: TREND_DAYS }, (_, i) => ({ date: vnDay(now.getTime() - (TREND_DAYS - 1 - i) * DAY), count: 0 }))
  const byDate = new Map(trend.map((d) => [d.date, d]))
  for (const c of recentConsultations) {
    const bucket = byDate.get(vnDay(c.createdAt))
    if (bucket) bucket.count++
  }

  return {
    universities: {
      total: universities.length,
      byType: countBy(universities, TYPES, (u) => u.institutionType),
      byDataLevel: countBy(universities, [1, 2, 3], (u) => u.dataLevel || 1),
      vnuhcm: universities.filter((u) => u.belongsToUniversitySystem).length,
    },
    // Độ đầy đủ dữ liệu: số trường đã có từng loại thông tin -> admin biết cần bổ sung gì.
    coverage: {
      majors: universities.filter((u) => u.majors?.length).length,
      tuition: universities.filter((u) => u.tuition?.length).length,
      admissions: universities.filter((u) => u.admissions?.length).length,
      verifiedForAI: universities.filter((u) => u.admissions?.some((a) => a.verifiedForAI)).length,
      coordinates: universities.filter((u) => hasPoint(u.address?.location)).length,
      logo: universities.filter((u) => u.media?.logoUrl).length,
    },
    majorCount,
    users: {
      total: activeUsers.length,
      byRole: countBy(activeUsers, ROLES, (u) => u.role || 'user'),
      locked: activeUsers.filter((u) => u.status === 'locked').length,
      newLast30Days: activeUsers.filter((u) => new Date(u.createdAt).getTime() >= since30).length,
    },
    consultations: {
      total: consultationTotal,
      last7Days: recentConsultations.filter((c) => new Date(c.createdAt).getTime() >= since7).length,
      trend,
    },
    topFavorites: [...universities]
      .filter((u) => u.favoriteCount > 0)
      .sort((a, b) => b.favoriteCount - a.favoriteCount || a.name.localeCompare(b.name, 'vi'))
      .slice(0, 5)
      .map((u) => ({ slug: u.slug, name: u.name, shortName: u.shortName ?? null, favoriteCount: u.favoriteCount })),
    recentChanges: recentChanges.map((c) => ({
      id: String(c._id), action: c.action, entity: c.entity, entityLabel: c.entityLabel ?? null,
      actor: c.actor?.fullName || c.actor?.email || null, createdAt: c.createdAt,
    })),
    generatedAt: now.toISOString(),
  }
}

async function overview() {
  const now = new Date()
  const [universities, majorCount, users, consultationTotal, recentConsultations, recentChanges] = await Promise.all([
    University.find()
      .select('slug name shortName institutionType belongsToUniversitySystem dataLevel favoriteCount media.logoUrl address.location majors.code tuition._id admissions.verifiedForAI')
      .lean(),
    Major.countDocuments(),
    User.find().select('role status deletedAt createdAt').lean(),
    Consultation.countDocuments(),
    Consultation.find({ createdAt: { $gte: new Date(now.getTime() - TREND_DAYS * DAY) } }).select('createdAt').lean(),
    ChangeLog.find().select('action entity entityLabel actor.email actor.fullName createdAt').sort({ createdAt: -1 }).limit(5).lean(),
  ])
  return summarize({ universities, majorCount, users, consultationTotal, recentConsultations, recentChanges, now })
}

module.exports = { overview, summarize, TREND_DAYS }
