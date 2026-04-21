import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const OwnerAuthContext = createContext({});

export function OwnerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const q = query(collection(db, "empresas"), where("propEmail", "==", u.email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const doc = snap.docs[0];
            setEmpresa({ id: doc.id, ...doc.data() });
          } else {
            setEmpresa(null);
          }
        } catch (e) {
          console.error(e);
          setEmpresa(null);
        }
      } else {
        setEmpresa(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <OwnerAuthContext.Provider value={{ user, empresa, loading, login, logout, resetPassword }}>
      {children}
    </OwnerAuthContext.Provider>
  );
}

export const useOwnerAuth = () => useContext(OwnerAuthContext);
