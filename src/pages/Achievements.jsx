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

function Achievements({ user }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Certificate");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [link, setLink] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Add achievement
  const addAchievement = async (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("Title is required.");

    try {
      await addDoc(collection(db, "users", user.uid, "achievements"), {
        title: title.trim(),
        type,
        issuer: issuer.trim(),
        issueDate: issueDate || null, // store as string for now
        link: link.trim(),
        createdAt: serverTimestamp()
      });

      setTitle("");
      setType("Certificate");
      setIssuer("");
      setIssueDate("");
      setLink("");
    } catch (error) {
      console.error("Error adding achievement:", error);
      alert("Failed to add achievement. Check console.");
    }
  };

  // ✅ Delete achievement
  const deleteAchievement = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "achievements", id));
    } catch (error) {
      console.error("Error deleting achievement:", error);
    }
  };

  // ✅ Real-time listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "achievements"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching achievements:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  return (
    <div>
      <h2>Achievements</h2>

      <form onSubmit={addAchievement} style={{ maxWidth: 700 }}>
        <input
          type="text"
          placeholder="Title * (e.g., Google Cloud Certificate)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        >
          <option>Certificate</option>
          <option>Award</option>
          <option>Internship</option>
          <option>Competition</option>
          <option>Other</option>
        </select>

        <input
          type="text"
          placeholder="Issuer (e.g., Coursera, Google, College)"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <input
          type="url"
          placeholder="Certificate/Proof Link (Google Drive / PDF link) (optional)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <button type="submit">Add Achievement</button>
      </form>

      <hr />

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No achievements added yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((a) => (
            <div
              key={a.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12
              }}
            >
              <h3 style={{ margin: "0 0 6px" }}>{a.title}</h3>

              <p style={{ margin: "0 0 6px" }}>
                <strong>Type:</strong> {a.type}
              </p>

              {a.issuer && (
                <p style={{ margin: "0 0 6px" }}>
                  <strong>Issuer:</strong> {a.issuer}
                </p>
              )}

              {a.issueDate && (
                <p style={{ margin: "0 0 6px" }}>
                  <strong>Issue Date:</strong> {a.issueDate}
                </p>
              )}

              {a.link && (
                <p style={{ margin: "0 0 6px" }}>
                  <a href={a.link} target="_blank" rel="noreferrer">
                    View Proof
                  </a>
                </p>
              )}

              <button onClick={() => deleteAchievement(a.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Achievements;
