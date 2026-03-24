import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  limit
} from "firebase/firestore";

function PublicPortfolio() {
  const { username } = useParams();
  const [userDoc, setUserDoc] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPublicData = async () => {
      setLoading(true);

      // 1) Find user by username
      const userQuery = query(
        collection(db, "users"),
        where("username", "==", username),
        limit(1)
      );

      const userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        setUserDoc(null);
        setLoading(false);
        return;
      }

      const u = userSnap.docs[0];
      setUserDoc({ id: u.id, ...u.data() });

      // 2) Load subcollections
      const uid = u.id;

      const [skillsSnap, projectsSnap, achievementsSnap] = await Promise.all([
        getDocs(collection(db, "users", uid, "skills")),
        getDocs(collection(db, "users", uid, "projects")),
        getDocs(collection(db, "users", uid, "achievements"))
      ]);

      setSkills(skillsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setProjects(projectsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setAchievements(achievementsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      setLoading(false);
    };

    loadPublicData();
  }, [username]);

  if (loading) return <p>Loading portfolio...</p>;

  if (!userDoc) return <h2>Portfolio not found</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{userDoc.name || "SkillTrackr User"}</h1>
      <p><strong>Target Role:</strong> {userDoc.targetRole || "Not set"}</p>
      <p><strong>Readiness Score:</strong> {userDoc.readinessScore ?? "N/A"}%</p>

      <hr />

      <h2>Skills</h2>
      {skills.length === 0 ? (
        <p>No skills listed.</p>
      ) : (
        <ul>
          {skills.map((s) => (
            <li key={s.id}>
              {s.skillName} — {s.level}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h2>Projects</h2>
      {projects.length === 0 ? (
        <p>No projects listed.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {projects.map((p) => (
            <div key={p.id} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 10 }}>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              {p.techStack?.length > 0 && (
                <p><strong>Tech:</strong> {p.techStack.join(", ")}</p>
              )}
              {p.repoLink && (
                <a href={p.repoLink} target="_blank" rel="noreferrer">Repo</a>
              )}
              {" "}
              {p.liveLink && (
                <a href={p.liveLink} target="_blank" rel="noreferrer">Live</a>
              )}
            </div>
          ))}
        </div>
      )}

      <hr />

      <h2>Achievements</h2>
      {achievements.length === 0 ? (
        <p>No achievements listed.</p>
      ) : (
        <ul>
          {achievements.map((a) => (
            <li key={a.id}>
              {a.title} ({a.type})
              {a.link && (
                <>
                  {" "}—{" "}
                  <a href={a.link} target="_blank" rel="noreferrer">Proof</a>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PublicPortfolio;
