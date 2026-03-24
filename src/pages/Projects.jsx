import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";

function Projects({ user }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState(""); // comma-separated
  const [repoLink, setRepoLink] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [status, setStatus] = useState("In Progress");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Add Project
  const addProject = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return alert("Please enter title and description.");
    }

    // Convert "React, Firebase, Tailwind" → ["React","Firebase","Tailwind"]
    const techArray = techStack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await addDoc(collection(db, "users", user.uid, "projects"), {
        title: title.trim(),
        description: description.trim(),
        techStack: techArray,
        repoLink: repoLink.trim(),
        liveLink: liveLink.trim(),
        status,
        createdAt: serverTimestamp()
      });

      // reset form
      setTitle("");
      setDescription("");
      setTechStack("");
      setRepoLink("");
      setLiveLink("");
      setStatus("In Progress");
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project. Check console.");
    }
  };

  // ✅ Delete Project
  const deleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "projects", id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // ✅ Real-time listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "projects"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setProjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  return (
    <div>
      <h2>Projects</h2>

      {/* Add Project Form */}
      <form onSubmit={addProject} style={{ maxWidth: 700 }}>
        <input
          type="text"
          placeholder="Project Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <textarea
          placeholder="Project Description *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <input
          type="text"
          placeholder="Tech Stack (comma separated) e.g. React, Firebase"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <input
          type="url"
          placeholder="GitHub Repo Link (optional)"
          value={repoLink}
          onChange={(e) => setRepoLink(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <input
          type="url"
          placeholder="Live Demo Link (optional)"
          value={liveLink}
          onChange={(e) => setLiveLink(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        >
          <option>In Progress</option>
          <option>Completed</option>
          <option>On Hold</option>
        </select>

        <button type="submit">Add Project</button>
      </form>

      <hr />

      {/* Projects List */}
      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects added yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {projects.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12
              }}
            >
              <h3 style={{ margin: "0 0 6px" }}>{p.title}</h3>
              <p style={{ margin: "0 0 8px" }}>{p.description}</p>

              <p style={{ margin: "0 0 8px" }}>
                <strong>Status:</strong> {p.status}
              </p>

              {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                <p style={{ margin: "0 0 8px" }}>
                  <strong>Tech:</strong> {p.techStack.join(", ")}
                </p>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {p.repoLink && (
                  <a href={p.repoLink} target="_blank" rel="noreferrer">
                    Repo
                  </a>
                )}
                {p.liveLink && (
                  <a href={p.liveLink} target="_blank" rel="noreferrer">
                    Live Demo
                  </a>
                )}
                <button onClick={() => deleteProject(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
