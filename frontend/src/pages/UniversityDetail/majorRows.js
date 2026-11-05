const clean = value => typeof value === 'string' ? value.trim() : ''

// Keep admission groups intact: their scores do not describe individual majors.
export function buildMajorRows(data) {
  if (data.admissionGroups) {
    const groups = new Map()
    for (const score of data.admissionGroups) {
      if (!groups.has(score.examCode)) groups.set(score.examCode, {
        code: score.examCode, name: score.groupName, programs: [], scores: [], sources: [],
      })
      const group = groups.get(score.examCode)
      group.programs.push(clean(score.program))
      group.scores.push(score)
      if (score.sourceUrl) group.sources.push(score.sourceUrl)
    }
    return [...groups.values()].map(group => ({ ...group,
      programs: [...new Set(group.programs)], sources: [...new Set(group.sources)],
    }))
  }
  return data.majors.map(major => {
    const scores = data.admissions.filter(row => row.majorCode === major.code)
    const fees = data.tuition.filter(row => row.majorCode === major.code)
    const programs = [...new Set([...scores, ...fees].map(row => clean(row.program)))]
    return {
      code: major.code, name: major.name, programs: programs.length ? programs : [''], scores,
      sources: [...new Set([major.sourceUrl, ...[...scores, ...fees].map(row => row.sourceUrl)].filter(Boolean))],
    }
  })
}

export function paginateRows(rows, requestedPage, size) {
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const page = Math.max(1, Math.min(requestedPage, pages))
  const start = (page - 1) * size
  return { rows: rows.slice(start, start + size), page, pages, start: rows.length ? start + 1 : 0, end: Math.min(start + size, rows.length) }
}
