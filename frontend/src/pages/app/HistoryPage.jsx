import React, { useEffect, useState } from "react"
import { getHistory } from "../../api/resume"

export default function HistoryPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getHistory()
        setItems(data)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [])

  return (
    <div className="page-card">
      <h1 className="page-title">History</h1>
      <div className="page-subtitle">
        Review recent dashboard activity and processed candidate actions.
      </div>

      <section className="list-card">
        {items.length === 0 ? (
          <div>No history found.</div>
        ) : (
          items.map((item) => (
            <div className="list-row" key={item.id}>
              <div>
                <div className="list-row-title">
                  {item.eventType} - {item.resume?.originalFileName || "Resume"}
                </div>
                <div className="list-row-subtitle">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="badge">{item.eventType}</div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
