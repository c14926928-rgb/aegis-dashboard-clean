import { useEffect, useState, useRef } from "react";

function App() {

  const [tab, setTab] = useState("dashboard");
  const [logs, setLogs] = useState([]);
  const [detections, setDetections] = useState([]);
  const [bans, setBans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [movement, setMovement] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const canvasRef = useRef(null);
  const [serverId, setServerId] = useState(null);
  const [status, setStatus] = useState("disconnected");

  // ================= FETCH DATA =================
  const fetchData = async () => {
    if (!serverId) return;

    try {
      const [
        logsRes,
        detectionsRes,
        playersRes,
        alertsRes,
        bansRes,
        movementRes
      ] = await Promise.all([
        fetch(`https://aegis-backend-gwu4.onrender.com/logs?serverId=${serverId}`),
        fetch(`https://aegis-backend-gwu4.onrender.com/detections?serverId=${serverId}`),
        fetch(`https://aegis-backend-gwu4.onrender.com/players?serverId=${serverId}`),
        fetch(`https://aegis-backend-gwu4.onrender.com/alerts?serverId=${serverId}`),
        fetch(`https://aegis-backend-gwu4.onrender.com/bans?serverId=${serverId}`),
        fetch(`https://aegis-backend-gwu4.onrender.com/movement?serverId=${serverId}`)
      ]);

      setLogs(await logsRes.json());
      setDetections(await detectionsRes.json());
      setPlayers(await playersRes.json());
      setAlerts(await alertsRes.json());
      setBans(await bansRes.json());
      setMovement(await movementRes.json());

    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  // ================= STATUS =================
  const fetchStatus = async () => {
    if (!serverId) return;

    try {
      const res = await fetch(
        `https://aegis-backend-gwu4.onrender.com/status?id=${serverId}`
      );

      const data = await res.json();

      setStatus(data.status);

    } catch (err) {
      console.error("STATUS ERROR:", err);
      console.log("SERVER ID:", serverId);
    }
  };

  // ================= LOAD SERVER ID =================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      console.log("❌ No ID in URL");
      return;
    }

    console.log("🆔 Server ID:", id);
    setServerId(id);
  }, []);

  // ================= MAIN LOOP =================
  useEffect(() => {
    if (!serverId) return;

    fetchData();
    fetchStatus();

    const interval = setInterval(() => {
      fetchData();
      fetchStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [serverId]);

  // ================= ACTION =================
  const sendAction = async (type, player) => {
    await fetch("https://aegis-backend-gwu4.onrender.com/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId, // 🔥 IMPORTANTE
        type,
        player
      })
    });
  };

  // ================= STREAM =================
  useEffect(() => {
    if (tab !== "spectate") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let currentImage = null;

    function loadFrame() {
      const img = new Image();

      img.onload = () => {
        currentImage = img;
      };

      img.src = `https://aegis-backend-gwu4.onrender.com/frame?t=${Date.now()}`;
    }

    const interval = setInterval(loadFrame, 500);

    function render() {
      if (currentImage) {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(render);
    }

    render();

    return () => clearInterval(interval);
  }, [tab]);

  // ================= UI =================
  return (
    <div style={styles.app}>

      <div style={styles.sidebar}>
        <div style={styles.logo}>Conclave Project's AC</div>

        {["dashboard","players","monitoring","detections","alerts","bans","logs"].map((t) => (
          <div
            key={t}
            onClick={() => setTab(t)}
            style={tab === t ? styles.menuItemActive : styles.menuItem}
          >
            {t}
          </div>
        ))}
      </div>

      <div style={styles.main}>

        <div style={styles.header}>
          🗝️ Conclave AegisAC

          <div style={{
            position: "absolute",
            right: "30px",
            top: "25px",
            color: status === "connected" ? "#4CAF50" : "#F44336"
          }}>
            {status === "connected" ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
        </div>

        {tab === "dashboard" && (
          <div style={styles.panel}>
            <h2>Dashboard</h2>

            <div style={{ display: "flex", gap: "15px" }}>
              <div style={styles.card}>
                <div>Online</div>
                <div>{players.length}</div>
              </div>

              <div style={styles.card}>
                <div>Bans</div>
                <div>{bans.length}</div>
              </div>

              <div style={styles.card}>
                <div>Alerts</div>
                <div>{alerts.length}</div>
              </div>
            </div>
          </div>
        )}

        {tab === "players" && (
          <div style={styles.panel}>
            <h2>Players</h2>

            {players.map((p, i) => (
              <div key={i}>
                {p.name}
                <button onClick={() => sendAction("kick", p.name)}>Kick</button>
                <button onClick={() => sendAction("ban", p.name)}>Ban</button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  app: { display: "flex", height: "100vh", background: "#05050d", color: "white" },
  sidebar: { width: "200px", background: "#0a0a1a", padding: "20px" },
  logo: { marginBottom: "20px" },
  menuItem: { padding: "10px", cursor: "pointer" },
  menuItemActive: { padding: "10px", background: "#a855f7" },
  main: { flex: 1, padding: "20px" },
  header: { fontSize: "24px", marginBottom: "20px" },
  panel: { background: "#111122", padding: "15px" },
  card: { background: "#1a1a2e", padding: "10px", flex: 1 }
};

export default App;