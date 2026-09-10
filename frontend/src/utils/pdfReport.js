const encoder = new TextEncoder()

function asNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number) : 0
}

function asList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function printable(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7e]/g, "?")
}

function wrapLine(value, maxLength = 88) {
  const text = String(value ?? "")
  if (!text) return [""]

  const words = text.split(/\s+/)
  const lines = []
  let current = ""

  for (const word of words) {
    if (!word) continue
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxLength && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }

  if (current) lines.push(current)
  return lines.length ? lines : [""]
}

function normalizeReport(report = {}) {
  const skills = asList(report.skills).map((skill) => {
    if (typeof skill === "string") return `- ${skill}`
    return `- ${skill.name || skill.skill || "Skill"} (${asNumber(skill.score)}%)`
  })

  const jobMatch = report.jobMatch && typeof report.jobMatch === "object" ? report.jobMatch : {}
  const matchScore = jobMatch.matchScore ?? report.jobMatchScore ?? report.matchScore
  const matchedSkills = asList(jobMatch.matchedSkills || report.matchedSkills)
  const missingSkills = asList(jobMatch.missingSkills || report.missingSkills)
  const jobTips = asList(jobMatch.improvementTips || report.improvementTips)

  const lines = [
    report.title || "Resume Analysis Report",
    `File: ${report.fileName || report.originalFileName || "Resume"}`,
    `Generated: ${report.generatedAt ? new Date(report.generatedAt).toLocaleString() : new Date().toLocaleString()}`,
    "",
    "Scores",
    `ATS Score: ${asNumber(report.atsScore)}%`,
    `Keyword Match: ${asNumber(report.keywordMatch)}%`,
    `Readability: ${asNumber(report.readabilityScore)}%`,
    "",
    "Skills",
    ...(skills.length ? skills : ["- No skills detected"]),
  ]

  if (matchScore != null || matchedSkills.length || missingSkills.length) {
    lines.push(
      "",
      "Job Description Match",
      `Match Score: ${asNumber(matchScore)}%`,
      `Matched Keywords: ${matchedSkills.length ? matchedSkills.join(", ") : "None"}`,
      `Missing Keywords: ${missingSkills.length ? missingSkills.join(", ") : "None"}`,
      ...jobTips.map((tip) => `Tip: ${tip}`),
    )
  }

  for (const [label, values] of [
    ["Strengths", asList(report.strengths)],
    ["Areas to Improve", asList(report.weaknesses)],
    ["Suggestions", asList(report.suggestions)],
  ]) {
    lines.push("", label, ...(values.length ? values.map((value) => `- ${value}`) : ["- None recorded"]))
  }

  return lines.flatMap((line) => wrapLine(line))
}

/**
 * Build a small, dependency-free PDF. Keeping the builder pure makes it
 * usable in browser code and straightforward to test in Node/Jest.
 */
export function buildPdfDocument(report) {
  const lines = normalizeReport(report)
  const linesPerPage = 43
  const pages = []

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage))
  }

  if (!pages.length) pages.push(["Resume Analysis Report"])

  const fontId = 3
  const pageIds = pages.map((_, index) => 4 + index * 2)
  const contentIds = pages.map((_, index) => 5 + index * 2)
  const objects = new Map()

  objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>")
  objects.set(
    2,
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
  )
  objects.set(fontId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

  pages.forEach((pageLines, pageIndex) => {
    const commands = ["BT", "/F1 11 Tf", "50 742 Td"]
    pageLines.forEach((line, lineIndex) => {
      if (lineIndex === 0 && pageIndex === 0) commands.push("/F1 16 Tf")
      if (lineIndex > 0 || (lineIndex === 0 && pageIndex > 0)) commands.push("0 -16 Td")
      commands.push(`(${printable(line)}) Tj`)
      if (lineIndex === 0 && pageIndex === 0) commands.push("/F1 11 Tf")
    })
    commands.push("ET")
    const stream = commands.join("\n")

    objects.set(
      pageIds[pageIndex],
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[pageIndex]} 0 R >>`,
    )
    objects.set(contentIds[pageIndex], `<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}\nendstream`)
  })

  const maxObjectId = Math.max(...objects.keys())
  const chunks = ["%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"]
  const offsets = new Array(maxObjectId + 1).fill(0)
  let byteOffset = encoder.encode(chunks[0]).length

  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    const objectBody = objects.get(objectId) || "<< >>"
    const chunk = `${objectId} 0 obj\n${objectBody}\nendobj\n`
    offsets[objectId] = byteOffset
    chunks.push(chunk)
    byteOffset += encoder.encode(chunk).length
  }

  const xrefOffset = byteOffset
  chunks.push(`xref\n0 ${maxObjectId + 1}\n`)
  chunks.push("0000000000 65535 f \n")
  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    chunks.push(`${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`)
  }
  chunks.push(`trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)

  const encodedChunks = chunks.map((chunk) => encoder.encode(chunk))
  const totalLength = encodedChunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const output = new Uint8Array(totalLength)
  let cursor = 0
  for (const chunk of encodedChunks) {
    output.set(chunk, cursor)
    cursor += chunk.length
  }
  return output
}

export function downloadAnalysisPdf(report, fileName = "resume-analysis-report.pdf") {
  const blob = new Blob([buildPdfDocument(report)], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
