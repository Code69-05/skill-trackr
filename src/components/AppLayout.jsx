import { Link } from "react-router-dom";

function AppLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          padding: "20px",
          borderRight: "1px solid #ddd"
        }}
      >
        <h3>SkillTrackr</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/skills">Skills</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/achievements">Achievements</Link>
          <Link to="/recommendations">AI Recommendations</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px" }}>{children}</div>
    </div>
  );
}

export default AppLayout;
