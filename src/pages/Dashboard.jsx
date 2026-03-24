import { useState, useEffect, useMemo } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

function Dashboard({ user }) {
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ targetRole now persists
  const [targetRole, setTargetRole] = useState("Frontend Developer");

  // 🔹 Role → Required Skills
  const ROLE_REQUIREMENTS = useMemo(
    () => ({
      "Frontend Developer": ["HTML", "CSS", "JavaScript", "React"],
      "Backend Developer": ["Node.js", "Express", "MongoDB", "SQL"],
      "Full Stack Developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "Express",
        "MongoDB"
      ]
    }),
    []
  );

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ✅ Load saved target role from Firestore
  useEffect(() => {
    if (!user) return;

    const loadUserPrefs = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          const data = snap.data();
          if (data?.targetRole) setTargetRole(data.targetRole);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };

    loadUserPrefs();
  }, [user]);

  // 🔹 Add Skill
  const addSkill = async (e) => {
    e.preventDefault();
    if (!skill.trim() || !level) return alert("Please fill all fields.");

    try {
      await addDoc(collection(db, "users", user.uid, "skills"), {
        skillName: skill.trim(),
        level,
        createdAt: serverTimestamp()
      });

      setSkill("");
      setLevel("");
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  // 🔹 Delete Skill
  const deleteSkill = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "skills", id));
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  // 🔹 Real-time Listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "skills"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const skillList = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        setSkills(skillList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching skills:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ✅ AI Logic: readiness + missing
  const analysis = useMemo(() => {
    const required = ROLE_REQUIREMENTS[targetRole] || [];

    const userSkillsSet = new Set(
      skills.map((s) => s.skillName.trim().toLowerCase())
    );

    const matched = required.filter((req) =>
      userSkillsSet.has(req.toLowerCase())
    );

    const missing = required.filter(
      (req) => !userSkillsSet.has(req.toLowerCase())
    );

    const readiness =
      required.length === 0
        ? 0
        : Math.round((matched.length / required.length) * 100);

    return { required, matched, missing, readiness };
  }, [skills, targetRole, ROLE_REQUIREMENTS]);

  // ✅ Save targetRole + AI analysis to Firestore whenever it changes
  useEffect(() => {
    if (!user) return;

    const saveAnalysis = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);

        await setDoc(
          userDocRef,
          {
            targetRole,
            readinessScore: analysis.readiness,
            missingSkills: analysis.missing,
            lastAnalyzedAt: serverTimestamp()
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Error saving analysis:", err);
      }
    };

    saveAnalysis();
  }, [user, targetRole, analysis.readiness, analysis.missing]);

  return (
    <div style={{ padding: "30px" }}>
      <h2>Dashboard</h2>

      {/* ✅ Target Role Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Target Role: </strong>
        </label>
        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        >
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
          <option>Full Stack Developer</option>
        </select>
      </div>

      {/* ✅ AI Output */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          marginBottom: "20px"
        }}
      >
        <h3>Career Readiness Analysis</h3>
        <p>
          <strong>Readiness Score:</strong> {analysis.readiness}%
        </p>
        <p>
          <strong>Matched Skills:</strong>{" "}
          {analysis.matched.length ? analysis.matched.join(", ") : "None"}
        </p>
        <p>
          <strong>Missing Skills:</strong>{" "}
          {analysis.missing.length ? analysis.missing.join(", ") : "None"}
        </p>
      </div>

      {/* 🔹 Add Skill */}
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

      {/* 🔹 Skills */}
      <h3>Your Skills</h3>
      {loading ? (
        <p>Loading skills...</p>
      ) : skills.length === 0 ? (
        <p>No skills added yet.</p>
      ) : (
        <ul>
          {skills.map((item) => (
            <li key={item.id}>
              <strong>{item.skillName}</strong> — {item.level}
              <button
                onClick={() => deleteSkill(item.id)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
