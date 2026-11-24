const mongoose = require('mongoose')

const { Schema } = mongoose

const pointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: undefined }, // [longitude, latitude]
  },
  { _id: false }
)

const majorSchema = new Schema(
  {
    code: { type: String, required: true }, // tham chiếu Major.code
    name: { type: String, required: true },
    durationYears: Number,
    description: String,
  },
  { _id: false }
)

const tuitionSchema = new Schema({
  academicYear: { type: String, required: true }, // "2025-2026"
  program: { type: String, default: 'Đại trà' },
  majorCode: String, // bỏ trống nếu áp dụng cho cả trường
  amountMin: { type: Number, required: true, min: 0 }, // VND
  amountMax: { type: Number, min: 0 },
  unit: { type: String, enum: ['year', 'semester', 'credit', 'program'], default: 'year' },
  note: String,
  sourceUrl: String,
})

const admissionSchema = new Schema({
  year: { type: Number, required: true },
  method: {
    type: String,
    enum: ['high_school_exam', 'competency_assessment', 'transcript', 'direct', 'other'],
    required: true,
  },
  majorCode: { type: String, required: true },
  program: String, // "Chất lượng cao", "Tiếng Anh"... bỏ trống = chương trình chuẩn
  combinations: [String], // ["A00", "A01"]
  score: { type: Number, required: true, min: 0 },
  scale: { type: Number, required: true }, // 30 (THPT, học bạ), 40 (một số trường nhân hệ số) hoặc 1200 (ĐGNL)
  quota: Number,
  sourceUrl: String,
  // Đã xác minh đúng phương thức / năm / thang điểm / chương trình chuẩn -> AI tư vấn được dùng để so điểm
  verifiedForAI: { type: Boolean, default: false },
  aiNote: String, // lưu ý hiện kèm khi AI dùng dòng này (vd điểm tổng hợp quy đổi)
})

const universitySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    shortName: String,
    aliases: [String],
    institutionType: {
      type: String,
      enum: ['public', 'private', 'international', 'other'],
      required: true,
    },
    belongsToUniversitySystem: { type: Boolean, default: false },
    universitySystem: String,
    foundedYear: Number,
    description: String,
    // 1 = thông tin cơ bản, 2 = có ngành/học phí/điểm chuẩn, 3 = đầy đủ để demo AI
    dataLevel: { type: Number, enum: [1, 2, 3], default: 1 },
    tags: [String], // "ky-tuc-xa", "hoc-bong", "quoc-te"... dùng cho AI tư vấn
    // Tên miền nguồn chính thức (vd "uit.edu.vn"): ngành / học phí có link thuộc các tên miền này mới được AI tin
    sourceDomains: [String],
    favoriteCount: { type: Number, default: 0, min: 0 },
    overview: {
      studentCount: Number,
      facultyCount: Number,
      campusCount: Number,
    },
    contact: {
      website: String,
      email: String,
      phone: String,
      admissionsUrl: String,
      admissionsEmail: String,
      admissionsPhone: String,
    },
    address: {
      full: String,
      street: String,
      ward: String,
      district: String,
      city: { type: String, default: 'TP. Hồ Chí Minh' },
      location: pointSchema,
    },
    campuses: [{ name: String, address: String, location: pointSchema }],
    media: {
      logoUrl: String,
      coverImageUrl: String,
      gallery: [String],
    },
    majors: [majorSchema],
    tuition: [tuitionSchema],
    admissions: [admissionSchema],
    facilities: [{ name: String, description: String, imageUrl: String }],
    scholarships: [{ name: String, description: String, eligibility: String, value: String }],
    dormitory: { available: Boolean, description: String },
    studentLife: [{ category: String, name: String, description: String }],
    careerOpportunities: [{ field: String, description: String }],
    // Dữ liệu duyệt riêng cho trang chi tiết (hiện chỉ Bách khoa): nhóm mã xét tuyển, nguồn, danh sách bản ghi đã duyệt.
    detailEvidence: { type: Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
)

universitySchema.index({ 'majors.code': 1 })
universitySchema.index({ institutionType: 1, 'address.district': 1 })
universitySchema.index({ name: 'text', shortName: 'text', aliases: 'text' })

module.exports = mongoose.model('University', universitySchema)
