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

function Skills({ user }) {
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add skill
  const addSkill = async (e) => {
    e.preventDefault();
    if (!skill.trim() || !level) return alert("Please fill all fields.");

    await addDoc(collection(db, "users", user.uid, "skills"), {
      skillName: skill.trim(),
      level,
      createdAt: serverTimestamp()
    });

    setSkill("");
    setLevel("");
  };

  // Delete skill
  const deleteSkill = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "skills", id));
  };

  // Realtime fetch
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "skills"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setSkills(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return (
    <div>
      <h2>Skills</h2>

      <form onSubmit={addSkill}>
        <input
          type="text"
          placeholder="Skill Name"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />

        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Select Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <button type="submit">Add Skill</button>
      </form>

      <hr />

      {loading ? (
        <p>Loading...</p>
      ) : skills.length === 0 ? (
        <p>No skills added yet.</p>
      ) : (
        <ul>
          {skills.map((s) => (
            <li key={s.id}>
              <strong>{s.skillName}</strong> — {s.level}
              <button onClick={() => deleteSkill(s.id)} style={{ marginLeft: 10 }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Skills;
