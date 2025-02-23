import React, { useState } from "react";
import './App.css';  // Ensure this import is present

const cellStyle = {
  backgroundColor: "#d4f7d1",
  padding: "12px 20px",
  border: "1px solid black",
  overflow: "hidden", // Prevent overflow
  textOverflow: "ellipsis", // Show ellipsis for overflow text
  whiteSpace: "nowrap", // Prevent text wrapping
};


export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Backend response:", result);
      if (response.ok && result.data.length > 0) {
        setData(result.data);
      } else {
        alert("No data received!");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed!");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Spotify Data Viewer 🎵</h2>
      <input type="file" onChange={handleUpload} />
      {loading && <p className="loading">Uploading & processing...</p>}
      {data.length > 0 && (
        <div className="table-container">
          <SortableTable data={data} />
        </div>
      )}
    </div>
  );
}

function SortableTable({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    if (typeof valA === "string") return sortConfig.direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    return sortConfig.direction === "asc" ? valA - valB : valB - valA;
  });

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      const newDirection = prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc";
      // Set the initial direction to 'desc' if no previous sorting exists for this column
      if (prevConfig.key !== key) {
        return { key, direction: "desc" }; // Start with descending sort
      }
      return { key, direction: newDirection };
    });
  };
  

  return (
    <div className="table-wrapper">
      <table className="styled-table">
        <thead>
          <tr>
            {["track_name", "artist_name", "album_name", "play_count", "total_ms_played"].map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className={sortConfig.key === col ? "sort-active" : ""}
                style={{
                  backgroundColor: sortConfig.key === col ? "#1DB954" : "#1ed760",
                  color: "white",
                  cursor: "pointer",
                  padding: "12px 20px",
                  textAlign: "left",
                  border: "1px solid black",
                }}
              >
                {col.replace("_", " ").toUpperCase()} {sortConfig.key === col ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index}>
              <td style={cellStyle}>{row.track_name}</td>
              <td style={cellStyle}>{row.artist_name}</td>
              <td style={cellStyle}>{row.album_name}</td>
              <td style={cellStyle}>{row.play_count}</td>
              <td style={cellStyle}>{(row.total_ms_played / 60000).toFixed(2)} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
