import {initializeApp} from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from 'firebase/auth';
import {getDatabase, ref, onValue, off, push, set, query, update, orderByChild, equalTo} from 'firebase/database';
import {getStorage} from "firebase/storage";
import * as MyUtils from "../common/myUtils";
import * as MyDataPath from "../common/dataPath";
const firebaseConfig = {
    apiKey: "AIzaSyBoH7raX5ayEf_CQkRVMlqAP48Tqe6RJ7U",
    authDomain: "workflow-student-app.firebaseapp.com",
    databaseURL: "https://workflow-student-app-default-rtdb.firebaseio.com",
    projectId: "workflow-student-app",
    storageBucket: "workflow-student-app.appspot.com",
    messagingSenderId: "755187458569",
    appId: "1:755187458569:web:7ad2799bbf99a004f0ced8",
    measurementId: "G-2HYZE3VV1Y"
};


// Initialize Firebase
class Firebase {
    constructor() {
        const app = initializeApp(firebaseConfig);
        this.auth = getAuth();
        this.db = getDatabase(app);
        this.storage = getStorage(app);
    }

    onValue = onValue;

    doCreateUserWithEmailAndPassword = (email, password) =>
        createUserWithEmailAndPassword(this.auth, email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        signInWithEmailAndPassword(this.auth, email, password);

    doSignOut = () => signOut(this.auth);

    doPasswordReset = email => sendPasswordResetEmail(this.auth, email);

    doPasswordUpdate = password =>
        this.auth.auth.currentUser.updatePassword(password);

    user = (uid, username, email) => set(ref(this.db, `users/${uid}`), {
        username: username,
        email: email
    });

    /**
     * insert data to firebase by path.
     * @param data
     * @param path
     * @returns {Promise<any>|Promise<void>}
     */
    insert = (authUser, data, path) => {
        MyUtils.setAuthInfo(data, authUser);
        if (!path) {
            return new Promise((resolve, reject)=>{
                reject("insert path missing...");
            });
        }
        return set(push(ref(this.db, path)), data)
    };

    /**
     * Get data by root name
     * @param uid
     * @param rootName
     * @returns {Query}
     */
    getListByRootName = (uid, rootName) => {
        return (query(ref(this.db, rootName), orderByChild("create_id"), equalTo(uid)))
    };
    offGetListByRootName = (uid, rootName) => off(query(ref(this.db, rootName), orderByChild("create_id"), equalTo(uid)));

    /**
     * update by id
     * @param path
     * @param id
     * @param updateData
     * @returns {Promise<void>}
     */
    updateById = (path, id, updateData) => {
        if (!path || !id) {
            return new Promise((resolve, reject)=>{
                reject("path or id missing...");
            });
        }
        const updates = {};
        updates[path + id] = updateData;
        return update(ref(this.db), updates);
    };

    /**
     * delete sub items by subject id
     * @param subjectId
     * @param academicYear
     */
    delSubItemsBySubjectId = (subjectId, academicYear) => {
        if (!subjectId || !academicYear) {
            alert("parameter missing...");
            return;
        }
        // delete assignments
        onValue(query(ref(this.db, MyDataPath.ASSIGNMENTS(academicYear)), orderByChild("subject_id"), equalTo(subjectId)), (snapshot) => {
            const result = snapshot.val();
            let dataList = MyUtils.keyObjToArray(result);
            dataList.map((item) => {
                this.updateById(MyDataPath.ASSIGNMENTS(academicYear), item.id, null);
            })
        });
        // delete exams
        onValue(query(ref(this.db, MyDataPath.EXAMS(academicYear)), orderByChild("subject_id"), equalTo(subjectId)), (snapshot) => {
            const result = snapshot.val();
            let dataList = MyUtils.keyObjToArray(result);
            dataList.map((item) => {
                this.updateById(MyDataPath.EXAMS(academicYear), item.id, null);
            })
        });
    };
}

export default Firebase;