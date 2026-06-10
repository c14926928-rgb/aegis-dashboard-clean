import { useEffect, useState } from "react";
import { useRef } from "react";

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
  const [authorized, setAuthorized] = useState(null);
  const [serverId, setServerId] = useState(null);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("disconnected");
  
  const fetchData = async () => {
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
  fetch(`https://aegis-backend-gwu4.onrender.com/logs?serverId=${serverId}`),
  fetch(`https://aegis-backend-gwu4.onrender.com/detections?serverId=${serverId}`),
  fetch(`https://aegis-backend-gwu4.onrender.com/players?serverId=${serverId}`),
  fetch(`https://aegis-backend-gwu4.onrender.com/alerts?serverId=${serverId}`),
  fetch(`https://aegis-backend-gwu4.onrender.com/bans?serverId=${serverId}`),
  fetch(`https://aegis-backend-gwu4.onrender.com/movement?serverId=${serverId}`),
  fetch(`https://aegis-backend-gwu4.onrender.com/status?id=${serverId}`)
]);

      setLogs(await logsRes.json());
      setDetections(await detectionsRes.json());
      setPlayers(await playersRes.json());
      setAlerts(await alertsRes.json());
      setBans(await bansRes.json());
      setMovement(await movementRes.json());
      setStatus((await statusRes.json()).status);

    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

 const fetchStatus = async () => {
  try {
    const res = await fetch(
      `https://aegis-backend-gwu4.onrender.com/status?id=${serverId}`
    );

    const data = await res.json();

    setStatus(data.status);

  } catch (err) {
    console.error("STATUS ERROR:", err);
    console.log("ServerID:", serverId);
  }
};

 useEffect(() => {
  if (!serverId) return; 

  fetchData();
  fetchStatus();

  const i = setInterval(() => {
    fetchData();
    fetchStatus();
  }, 3000);

  return () => clearInterval(i);
}, [serverId]);

  const sendAction = async (type, player) => {
    await fetch("https://aegis-backend-gwu4.onrender.com/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type, player })
    });
  };

 useEffect(() => {

  if (tab !== "spectate") return;

  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let lastImage = null;
  let currentImage = null;

  function loadFrame() {
    const img = new Image();

    img.onload = () => {
      lastImage = currentImage;
      currentImage = img;
    };

    img.onerror = () => {
      console.log("❌ ERROR CARGANDO FRAME");
    };

    img.src = `https://aegis-backend-gwu4.onrender.com/frame?t=${Date.now()}`;
  }
  
  loadFrame();

  const interval = setInterval(loadFrame, 1000);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentImage) {
      ctx.globalAlpha = 1;
      ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    }

    if (lastImage) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(lastImage, 0, 0, canvas.width, canvas.height);
    }

    ctx.globalAlpha = 1;

    requestAnimationFrame(render);
  }
  
if (authorized === null) {
  return <div>🔐 Checking access...</div>;
}

if (authorized === false) {
  return <div>❌ No access</div>;
}

  render();

  return () => clearInterval(interval);

}, [tab]);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.log("❌ No ID");
    return;
  }

  console.log("🆔 Server ID:", id);

  setServerId(id);
}, []);

  return (

    <div style={styles.app}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>Conclave Project's AC</div>

        {["dashboard","players","monitoring","detections","alerts","bans","logs"].map((t) => (
          <div
            key={t}
            onClick={() => setTab(t)}
            style={tab === t ? styles.menuItemActive : styles.menuItem}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={styles.main}>

<div style={styles.header}>
  
  🗝️ Conclave AegisAC

  <div style={{
    position: "absolute",
    right: "30px",
    top: "25px",
    fontSize: "14px",
    fontWeight: "bold",
    color: status === "connected" ? "#4CAF50" : "#F44336"
  }}>
    {status === "connected" ? "🟢 Connected" : "🔴 Disconnected"}
  </div>

</div>

        {/* DASHBOARD */}
       {tab === "dashboard" && (
  <div style={styles.panel}>

    <h2>Dashboard</h2>

    <div style={{
      display: "flex",
      gap: "15px",
      marginTop: "15px"
      
    }}>

      {/* ONLINE */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Online</div>
        <div style={styles.cardValue}>
          {players.length}
        </div>
      </div>

      {/* BANS */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Bans</div>
        <div style={styles.cardValue}>
          {bans.length}
        </div>
      </div>

      {/* ALERTS */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Alerts</div>
        <div style={styles.cardValue}>
          {alerts.length}
        </div>
      </div>

    </div>

  </div>
)}
        {/* PLAYERS */}
        {tab === "players" && (
          <div style={styles.panel}>
            <h2>Players</h2>

            {players.length > 0 ? (
              players.map((p, i) => (
                <div key={i} style={styles.player}>
                  {p.name} - {p.ping}ms - {p.status}

                  <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                    <button style={styles.btn} onClick={() => sendAction("kick", p.name)}>Kick</button>
                    <button style={styles.btn} onClick={() => sendAction("ban", p.name)}>Ban</button>
                    <button style={styles.btn} onClick={() => sendAction("unban", p.name)}>Unban</button>
                  </div>
                </div>
              ))
            ) : (
              <div>No players online</div>
            )}
          </div>
        )}

        {/* MONITORING */}
{tab === "monitoring" && (
  <div style={styles.panel}>
    <h2>Monitoring</h2>

    {players.map((p, i) => (
      <div
        key={i}
        style={styles.player}
        onClick={() => {
  setSelectedPlayer(p);
  setTab("spectate");
}}
      >
        🎮 {p.name}
      </div>
    ))}
  </div>
)}

{/* SPECTATE */}
   {tab === "spectate" && selectedPlayer && (
  <div style={styles.spectatePanel}>

    <h2>🎥 Spectating: {selectedPlayer.name}</h2>

    {/* STREAM */}
    <canvas
  ref={canvasRef}
  width={640}
  height={360}
  style={{
    width: "100%",
    borderRadius: "10px",
    border: "1px solid #333",
    marginTop: "10px"
  }}
/>

    <div style={{ marginTop: "10px" }}>
  <div><b>UUID:</b> {selectedPlayer.uuid}</div>

  <div><b>IP:</b> {selectedPlayer.ip || "Unknown"}</div>

  <div><b>Discord:</b> {selectedPlayer.discord || "Not linked"}</div>

  <div><b>License:</b> {selectedPlayer.license || "N/A"}</div>
</div>

    <div>
      Pos: {(movement[selectedPlayer.name]?.x ?? 0).toFixed(2)},
           {(movement[selectedPlayer.name]?.y ?? 0).toFixed(2)},
           {(movement[selectedPlayer.name]?.z ?? 0).toFixed(2)}
    </div>

    <div>
      Rot: {(movement[selectedPlayer.name]?.yaw ?? 0).toFixed(1)} /
           {(movement[selectedPlayer.name]?.pitch ?? 0).toFixed(1)}
    </div>

    <button
      onClick={() => setTab("monitoring")}
      style={{ marginTop: "15px" }}
    >
      ← Back
    </button>

  </div>
)}

    {/* DETECTIONS */}
    {tab === "detections" && (
  <div style={styles.panel}>
    <h2>Detections</h2>

    {detections.length === 0 ? (
      <div>No detections</div>
    ) : (
      detections.slice(-50).map((d, i) => (
        <div key={i}>
          {d.player} → {d.check} (VL: {d.vl})
        </div>
      ))
    )}
  </div>
)}
    
        {/* ALERTS */}
        {tab === "alerts" && (
          <div style={styles.panel}>
            <h3>Alerts</h3>

            {alerts.map((a, i) => (
              <div key={i}>
                ⚠ {a.player} → {a.type} (VL {a.vl}) [{a.severity}]
              </div>
            ))}
          </div>
        )}

        {/* BANS */}
        {tab === "bans" && (
          <div style={styles.panel}>
            <h3>Bans</h3>

            {bans.length > 0 ? (
              bans.map((b, i) => (
                <div key={i}>
                  {b.name} - {b.uuid}
                </div>
              ))
            ) : (
              <div>No bans</div>
            )}
          </div>
        )}

        {/* LOGS */}
        {tab === "logs" && (
          <div style={styles.panel}>
            <h3>Logs</h3>

            {logs.map((l, i) => (
              <div key={i}>{l.message}</div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// STYLES
const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: "#05050d",
    color: "white"
  },

  sidebar: {
    width: "220px",
    background: "#0a0a1a",
    padding: "20px",
    borderRight: "1px solid #6d28d9"
  },

  logo: {
    marginBottom: "20px",
    color: "#a855f7"
  },

  menuItem: {
    padding: "10px",
    cursor: "pointer"
  },

  menuItemActive: {
    padding: "10px",
    background: "#a855f7"
  },

  main: {
    flex: 1,
    padding: "20px"
  },

  header: {
    fontSize: "26px",
    color: "#a855f7",
    marginBottom: "20px"
  },

  stats: {
    display: "flex",
    gap: "10px"
  },

  card: {
    flex: 1,
    background: "#111122",
    padding: "15px",
    borderRadius: "10px"
  },

  panel: {
    background: "#111122",
    padding: "15px",
    borderRadius: "10px"
  },

  player: {
    marginTop: "10px",
    padding: "10px",
    background: "#1a1a2e"
  },

  monitorCard: {
    background: "#0a0a1a",
    border: "1px solid #222",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "10px"
  },

  spectatePanel: {
  position: "fixed",
  right: "20px",
  top: "80px",
  width: "300px",
  background: "#0a0a1a",
  border: "1px solid #333",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 0 20px rgba(168,85,247,0.3)",
  zIndex: 999
},

card: {
  flex: 1,
  background: "#0a0a1a",
  border: "1px solid #222",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center"
},

cardTitle: {
  fontSize: "14px",
  color: "#aaa"
},

cardValue: {
  fontSize: "28px",
  color: "#a855f7",
  marginTop: "5px"
},

  btn: {
    padding: "6px",
    border: "1px solid #a855f7",
    background: "transparent",
    color: "white",
    cursor: "pointer"
  }
};

export default App;