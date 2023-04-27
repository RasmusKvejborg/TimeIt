import { initializeApp } from "firebase/app";

import "firebase/firestore";
import {
  collection,
  getFirestore,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuHqwGsFiKi1pstZLFt73cbXd9rsr5fCQ",
  authDomain: "timeit-40bce.firebaseapp.com",
  projectId: "timeit-40bce",
  storageBucket: "timeit-40bce.appspot.com",
  messagingSenderId: "143384481959",
  appId: "1:143384481959:web:4e68bd457e189d554e8b82",
};
const firebase_app = initializeApp(firebaseConfig);
const db = getFirestore(firebase_app);

let registrationsCollection = collection(db, "registrations");

export async function postFirebase(
  activityNumberString,
  activityName,
  date,
  note,
  projectNumber,
  projectName,
  totalHours,
  xAgreementGrantToken,
  employeeName,
  employeeNo
) {
  async function postFlextidToFirestore(registration) {
    const docRef = await addDoc(registrationsCollection, registration);
    console.log("sometghing gave");
  }

  let registration = {
    activityNumber: JSON.parse(activityNumberString),
    activityName: activityName,
    date: JSON.parse(date),
    note: note && note,
    projectNumber: projectNumber,
    projectName: projectName,
    totalHours: totalHours,
    companyToken: xAgreementGrantToken,
    employeeName: employeeName,
    employeeNo: employeeNo,
  };

  console.log("hey it worked: ", registration);

  postFlextidToFirestore(registration);
}

export async function getDataFromFirestore(xAgreementGrantToken, employeeNo) {
  console.log("gotcha", xAgreementGrantToken, "employeeNo", employeeNo);
  const QueryTotalFlexHoursEarned = query(
    collection(db, "registrations"),
    where("companyToken", "==", xAgreementGrantToken),
    where("employeeNo", "==", employeeNo),
    where("activityNumber", "==", 3)
  );
  const querySnapshot = await getDocs(QueryTotalFlexHoursEarned);
  let flexHoursEarned = 0;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    flexHoursEarned += data.totalHours;
  });

  const QueryTotalFlexHoursUsed = query(
    collection(db, "registrations"),
    where("companyToken", "==", xAgreementGrantToken),
    where("employeeNo", "==", employeeNo),
    where("activityNumber", "==", 4)
  );
  const querySnap = await getDocs(QueryTotalFlexHoursUsed);
  let flexHoursUsed = 0;
  querySnap.forEach((doc) => {
    const data = doc.data();
    flexHoursUsed += data.totalHours;
  });

  console.log("flexEarned ", flexHoursEarned);
  console.log("flexused ", flexHoursUsed);

  return flexHoursEarned - flexHoursUsed;
}
