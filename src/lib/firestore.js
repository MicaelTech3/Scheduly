import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "./firebase";

// =====================================================================
// 1. ADMINISTRAÇÃO GERAL (SaaS)
// =====================================================================

const COL_EMPRESAS = "empresas";

export async function getEmpresas() {
  const q = query(collection(db, COL_EMPRESAS), orderBy("criadaEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getEmpresa(id) {
  const snap = await getDoc(doc(db, COL_EMPRESAS, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getEmpresaBySlug(slug) {
  const q = query(collection(db, COL_EMPRESAS), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function createEmpresa(data) {
  return addDoc(collection(db, COL_EMPRESAS), {
    ...data,
    clientes: 0,
    status: "trial",
    propAtivo: false,
    criadaEm: serverTimestamp(),
  });
}

export async function updateEmpresa(id, data) {
  return updateDoc(doc(db, COL_EMPRESAS, id), data);
}

export async function deleteEmpresa(id) {
  return deleteDoc(doc(db, COL_EMPRESAS, id));
}

// Logs de Acesso
export async function logLogin(data) {
  return addDoc(collection(db, "logins"), {
    ...data,
    timestamp: serverTimestamp(),
  });
}

export async function getLogins() {
  const q = query(collection(db, "logins"), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// =====================================================================
// 2. MÉTODOS DO PROPRIETÁRIO (Owner)
// =====================================================================

// --- Serviços ---
export async function getServicos(empresaId) {
  const q = query(collection(db, `empresas/${empresaId}/servicos`));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createServico(empresaId, data) {
  return addDoc(collection(db, `empresas/${empresaId}/servicos`), data);
}

export async function updateServico(empresaId, servicoId, data) {
  return updateDoc(doc(db, `empresas/${empresaId}/servicos`, servicoId), data);
}

export async function deleteServico(empresaId, servicoId) {
  return deleteDoc(doc(db, `empresas/${empresaId}/servicos`, servicoId));
}

// --- Pacotes ---
export async function getPacotes(empresaId) {
  const snap = await getDocs(collection(db, "empresas", empresaId, "pacotes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createPacote(empresaId, data) {
  return addDoc(collection(db, "empresas", empresaId, "pacotes"), {
    ...data,
    criadoEm: serverTimestamp(),
  });
}

export async function updatePacote(empresaId, pacoteId, data) {
  return updateDoc(doc(db, "empresas", empresaId, "pacotes", pacoteId), data);
}

export async function deletePacote(empresaId, pacoteId) {
  return deleteDoc(doc(db, "empresas", empresaId, "pacotes", pacoteId));
}

// --- Stories ---
export async function getStories(empresaId) {
  const snap = await getDocs(query(collection(db, "empresas", empresaId, "stories"), orderBy("criadoEm", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createStory(empresaId, data) {
  return addDoc(collection(db, "empresas", empresaId, "stories"), {
    ...data,
    views: 0,
    criadoEm: serverTimestamp(),
  });
}

export async function deleteStory(empresaId, storyId) {
  return deleteDoc(doc(db, "empresas", empresaId, "stories", storyId));
}

// Increment view count via transaction/update (using simply update for now, or fieldValue.increment)
export async function viewStory(empresaId, storyId) {
  return updateDoc(doc(db, "empresas", empresaId, "stories", storyId), {
    views: increment(1)
  });
}

// --- Colaboradores ---
export async function getColaboradores(empresaId) {
  const q = query(collection(db, `empresas/${empresaId}/colaboradores`));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createColaborador(empresaId, data) {
  return addDoc(collection(db, `empresas/${empresaId}/colaboradores`), data);
}

export async function deleteColaborador(empresaId, colabId) {
  return deleteDoc(doc(db, `empresas/${empresaId}/colaboradores`, colabId));
}

// --- Configurações de Horário ---
export async function getHorarios(empresaId) {
  const docSnap = await getDoc(doc(db, `empresas/${empresaId}/config`, "horarios"));
  return docSnap.exists() ? docSnap.data() : null;
}

export async function setHorarios(empresaId, data) {
  return setDoc(doc(db, `empresas/${empresaId}/config`, "horarios"), data, { merge: true });
}

// =====================================================================
// 3. AGENDAMENTOS E SOLICITAÇÕES
// =====================================================================

export async function getAgendamentos(empresaId) {
  const q = query(collection(db, `empresas/${empresaId}/agendamentos`));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Atualiza status de agendamentos (confirmar, cancelar, etc)
export async function updateAgendamento(empresaId, agendamentoId, data) {
  return updateDoc(doc(db, "empresas", empresaId, "agendamentos", agendamentoId), data);
}

// Solicitações de Pacotes
export async function getSolicitacoesPacotes(empresaId) {
  const snap = await getDocs(collection(db, "empresas", empresaId, "solicitacoesPacotes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateSolicitacaoPacote(empresaId, solId, data) {
  return updateDoc(doc(db, "empresas", empresaId, "solicitacoesPacotes", solId), data);
}

// =====================================================================
// 4. MÉTODOS DO CLIENTE (App Público)
// =====================================================================

export async function getClientes(empresaId) {
  const q = query(collection(db, `empresas/${empresaId}/clientes`));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveClientProfile(empresaId, clientData) {
  const q = query(collection(db, `empresas/${empresaId}/clientes`), where("email", "==", clientData.email));
  const snap = await getDocs(q);
  if (snap.empty) {
    return addDoc(collection(db, `empresas/${empresaId}/clientes`), {
      ...clientData,
      criadoEm: serverTimestamp(),
      totalAgendamentos: 0
    });
  } else {
    return updateDoc(doc(db, `empresas/${empresaId}/clientes`, snap.docs[0].id), {
      ultimoLogin: serverTimestamp()
    });
  }
}

export async function getClientAgendamentos(empresaId, clientEmail) {
  const q = query(
    collection(db, `empresas/${empresaId}/agendamentos`),
    where("clienteEmail", "==", clientEmail)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Cria um agendamento vindo do cliente.
 * Importante: O status inicial é "pendente" para aprovação do profissional.
 */
export async function createClientAgendamento(empresaId, data) {
  return addDoc(collection(db, `empresas/${empresaId}/agendamentos`), {
    ...data,
    status: "pendente",
    criadoEm: serverTimestamp(),
  });
}

export async function createSolicitacaoPacote(empresaId, data) {
  return addDoc(collection(db, "empresas", empresaId, "solicitacoesPacotes"), {
    ...data,
    status: "pendente",
    criadoEm: serverTimestamp(),
  });
}