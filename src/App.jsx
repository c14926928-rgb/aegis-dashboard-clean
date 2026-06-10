import { useEffect, useState, useRef } from "react";

const API = "https://aegis-backend-gwu4.onrender.com";

function App() {

  const [tab, setTab] = useState("dashboard");
  const [serverId, setServerId] = useState(null);

  const [status, setStatus] = useState("disconnected");
  const [players, setPlayers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [detections, setDetections] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [bans, setBans] = useState([]);
  const [movement, setMovement] = useState({});

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const canvasRef = useRef(null);

  // ================= GET ID =================

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id) return;
    setServerId(id);
  }, []);

  // ================= FETCH =================

  const fetchAll = async () => {
    if (!serverId) return;

    try {
      const [
        logsRes,
        detectionsRes,
        playersRes,
        alertsRes,
        bansRes,
        movementRes,
        statusRes
      ] = await Promise.all([
        fetch(`${API}/logs?serverId=${serverId}`),
        fetch(`${API}/detections?serverId=${serverId}`),
        fetch(`${API}/players?serverId=${serverId}`),
        fetch(`${API}/alerts?serverId=${serverId}`),
        fetch(`${API}/bans?serverId=${serverId}`),
        fetch(`${API}/movement?serverId=${serverId}`),
        fetch(`${API}/status?id=${serverId}`)
      ]);

      setLogs(await logsRes.json());
      setDetections(await detectionsRes.json());
      setPlayers(await playersRes.json());
      setAlerts(await alertsRes.json());
      setBans(await bansRes.json());
      setMovement(await movementRes.json());

      const statusData = await statusRes.json();
      setStatus(statusData.status);

    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    if (!serverId) return;

    fetchAll();
    const interval = setInterval(fetchAll, 3000);

    return () => clearInterval(interval);
  }, [serverId]);

  // ================= ACTION =================

  const sendAction = async (type, player) => {
    await fetch(`${API}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, player })
    });
  };

  // ================= UI =================

  return (
    <div style={styles.app}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>Conclave AC</div>

        {["dashboard","players","detections","alerts","bans","logs"].map((t) => (
          <div
            key={t}
            onClick={() => setTab(t)}
            style={tab === t ? styles.active : styles.item}
          >
            {t}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        <div style={styles.header}>
          🗝️ Conclave AegisAC

          <div style={{
            color: status === "connected" ? "#4CAF50" : "#F44336"
          }}>
            {status === "connected" ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
        </div>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div style={styles.panel}>
            <h2>Dashboard</h2>

            <div style={styles.cards}>
              <Card title="Online" value={players.length} />
              <Card title="Bans" value={bans.length} />
              <Card title="Alerts" value={alerts.length} />
            </div>
          </div>
        )}

        {/* PLAYERS */}
        {tab === "players" && (
          <div style={styles.panel}>
            <h2>Players</h2>

            {players.length === 0 && <div>No players</div>}

            {players.map((p, i) => (
              <div key={i} style={styles.player}>
                {p.name}

                <div>
                  <button onClick={() => sendAction("kick", p.name)}>Kick</button>
                  <button onClick={() => sendAction("ban", p.name)}>Ban</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOGS */}
        {tab === "logs" && (
          <div style={styles.panel}>
            <h2>Logs</h2>

            {logs.length === 0 && <div>No logs</div>}

            {logs.map((l, i) => (
              <div key={i}>{l.message}</div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ================= CARD COMPONENT =================

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

// ================= STYLES =================

const styles = {
  app: { display: "flex", background: "#0a0a0a", color: "white", height: "100vh" },
  sidebar: { width: "200px", background: "#111", padding: "20px" },
  logo: { marginBottom: "20px", fontWeight: "bold" },
  item: { padding: "10px", cursor: "pointer" },
  active: { padding: "10px", background: "#6c5ce7" },
  main: { flex: 1, padding: "20px" },
  header: { display: "flex", justifyContent: "space-between" },
  panel: { marginTop: "20px" },
  cards: { display: "flex", gap: "10px" },
  card: { background: "#1a1a1a", padding: "20px", borderRadius: "10px" },
  player: { marginTop: "10px", padding: "10px", background: "#111" }
};

export default App;