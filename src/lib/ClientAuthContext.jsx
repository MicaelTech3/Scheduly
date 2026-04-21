import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { saveClientProfile } from "./firestore";

const ClientAuthContext = createContext({});
const googleProvider = new GoogleAuthProvider();

export function ClientAuthProvider({ empresaId, children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && empresaId) {
        // Salva/Atualiza o perfil do cliente na base de clientes dessa empresa
        try {
          await saveClientProfile(empresaId, {
            email: u.email,
            nome: u.displayName || u.email.split("@")[0],
            telefone: u.phoneNumber || "",
          });
        } catch (e) {
          console.error("Erro ao salvar perfil do cliente", e);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, [empresaId]);

  const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const registerWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <ClientAuthContext.Provider value={{ user, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export const useClientAuth = () => useContext(ClientAuthContext);
