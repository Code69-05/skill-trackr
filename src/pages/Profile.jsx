import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Profile({ user }) {
  const [username, setUsername] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);

  // Load existing username
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().username) {
        setSaved(snap.data().username);
        setUsername(snap.data().username);
      }
      setLoading(false);
    };

    load();
  }, [user]);

  const saveUsername = async () => {
    const clean = username.trim().toLowerCase();
    if (!clean) return alert("Username cannot be empty.");
    if (clean.includes(" ")) return alert("Username must not contain spaces.");

    await setDoc(
      doc(db, "users", user.uid),
      { username: clean },
      { merge: true }
    );

    setSaved(clean);
    alert("Username saved!");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Choose a public username for your portfolio link.</p>

      <input
        type="text"
        placeholder="e.g. wilson123"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={saveUsername} style={{ marginLeft: 10 }}>
        Save
      </button>

      {saved && (
        <p style={{ marginTop: 12 }}>
          ✅ Your public portfolio link:{" "}
          <strong>/u/{saved}</strong>
        </p>
      )}
    </div>
  );
}

export default Profile;
