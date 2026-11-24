const clean = value => typeof value === 'string' ? value.trim() : ''
const normalized = value => clean(value).normalize('NFC').toLocaleLowerCase('vi-VN').replace(/\s+/g, ' ')

function groupIdentity(value) {
  const full = clean(value).replace(/\\n/g, '\n').replace(/^\(Ngành mới\)\s*/iu, '')
  const name = full.split(/\r?\n/).map(clean).find(Boolean) || ''
  const joint = /^nhóm ngành\b/iu.test(name)
  // Matching headings can describe different sets of jointly admitted majors.
  // Keep the membership in the identity instead of assigning group scores to a major.
  const key = normalized(joint ? full.split(/Đại học đối tác/iu)[0] : name)
  return { key, name, description: joint ? full.slice(name.length).trim() : '' }
}

// Group presentation rows without altering the program/code attached to each score.
export function buildMajorRows(data) {
  if (data.admissionGroups) {
    const groups = new Map()
    for (const score of data.admissionGroups) {
      const identity = groupIdentity(score.groupName)
      const key = identity.key || `code:${score.examCode}`
      if (!groups.has(key)) groups.set(key, {
        id: key, code: score.examCode, codes: [], name: identity.name || score.examCode,
        description: identity.description, programs: [], scores: [], sources: [],
      })
      const group = groups.get(key)
      group.codes.push(score.examCode)
      group.programs.push(clean(score.program))
      group.scores.push(score)
      if (score.sourceUrl) group.sources.push(score.sourceUrl)
    }
    return [...groups.values()].map(group => ({ ...group,
      codes: [...new Set(group.codes)], programs: [...new Set(group.programs)], sources: [...new Set(group.sources)],
    }))
  }
  const majors = new Map()
  for (const major of data.majors) {
    if (majors.has(major.code)) {
      if (major.sourceUrl) majors.get(major.code).sources.push(major.sourceUrl)
      continue
    }
    const scores = data.admissions.filter(row => row.majorCode === major.code)
    const fees = data.tuition.filter(row => row.majorCode === major.code)
    const programs = [...new Set([...scores, ...fees].map(row => clean(row.program)))]
    majors.set(major.code, {
      id: major.code, code: major.code, codes: [major.code], name: major.name, programs: programs.length ? programs : [''], scores,
      sources: [...new Set([major.sourceUrl, ...[...scores, ...fees].map(row => row.sourceUrl)].filter(Boolean))],
    })
  }
  return [...majors.values()].map(major => ({ ...major, sources: [...new Set(major.sources)] }))
}

export function paginateRows(rows, requestedPage, size) {
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const page = Math.max(1, Math.min(requestedPage, pages))
  const start = (page - 1) * size
  return { rows: rows.slice(start, start + size), page, pages, start: rows.length ? start + 1 : 0, end: Math.min(start + size, rows.length) }
}
