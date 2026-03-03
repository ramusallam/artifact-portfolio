import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

export interface Artifact {
  title: string;
  type: 'pdf' | 'link';
  url: string;
  aiDescription: string;
}

export interface ReportCard {
  id?: string;
  teacherId: string;
  studentName: string;
  grade: string;
  className: string;
  gradeLevel: string;
  semester: string;
  schoolYear: string;
  artifacts: Artifact[];
  teacherComment: string;
  createdAt: unknown;
}

export interface PortfolioLink {
  id?: string;
  studentName: string;
  passwordHash: string;
  createdBy: string;
  createdAt: unknown;
}

export interface SeniorSpeech {
  scriptUrl: string;
  videoUrl: string;
}

export const saveReportCard = async (
  data: Omit<ReportCard, 'id' | 'createdAt'>
) => {
  return addDoc(collection(db, 'reportCards'), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getReportCardsForStudent = async (
  studentName: string
): Promise<ReportCard[]> => {
  const q = query(
    collection(db, 'reportCards'),
    where('studentName', '==', studentName),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReportCard));
};

export const getPortfolioForStudent = async (
  studentName: string
): Promise<ReportCard[]> => {
  const q = query(
    collection(db, 'reportCards'),
    where('studentName', '==', studentName)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReportCard));
};

export const createPortfolioLink = async (
  data: Omit<PortfolioLink, 'id' | 'createdAt'>
) => {
  return addDoc(collection(db, 'portfolioLinks'), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getPortfolioLink = async (
  linkId: string
): Promise<PortfolioLink | null> => {
  const snap = await getDoc(doc(db, 'portfolioLinks', linkId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PortfolioLink;
};

export const saveSeniorSpeech = async (
  studentName: string,
  data: SeniorSpeech
) => {
  const docRef = doc(db, 'seniorSpeeches', studentName);
  return setDoc(docRef, { ...data, studentName }, { merge: true });
};

export const getSeniorSpeech = async (
  studentName: string
): Promise<SeniorSpeech | null> => {
  const docRef = doc(db, 'seniorSpeeches', studentName);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as SeniorSpeech;
};
