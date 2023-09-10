import { useState, useEffect } from "react";
// import { nanoid } from "nanoid";
import { addDoc, deleteDoc, doc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db, notesCollection } from "./Firebase/firebase";
import { signOut } from "firebase/auth";

import "./index.css";
import SideBar from "./components/SideBar";
import NoteEditor from "./components/NoteEditor";
import LightThemeIcon from "./icons/LightThemeIcon";
import DarkThemeIcon from "./icons/DarkThemeIcon";
import SideBarIcon from "./icons/SideBarIcon";
import Login from "./screens/Login";
import EmbeddedFrame from "./spotify_thing/Top10Today";

function App() {
  const [notes, setNotes] = useState([]);
  const [sideBar, setSideBar] = useState(
    JSON.parse(localStorage.getItem("sidebar")) || false
  );
  const [spotifyEmebed, setSpotifyEmebed] = useState(
    JSON.parse(localStorage.getItem("spotifyembed")) || false
  );
  const [currentNoteId, setCurrentNoteId] = useState("");
  const [userID, setUserID] = useState(auth.currentUser || null);
  const [theme, setTheme] = useState(
    JSON.parse(localStorage.getItem("theme")) || "light"
  );
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  const toggleSideBar = () => {
    setSideBar((prevSideBar) => !prevSideBar);
  };
  const toggleSpotifyEmbed = () => {
    setSpotifyEmebed((prevSpotifyEmebed) => !prevSpotifyEmebed);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
      // Sync up our local notes array with the snapshot data
      const notesArr = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setNotes(notesArr);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentNoteId) {
      setCurrentNoteId(notes[0]?.id);
    }
  }, [notes, currentNoteId]);
  useEffect(() => {
    // localStorage.setItem(`notes`, JSON.stringify(notes));
    localStorage.setItem("sidebar", JSON.stringify(sideBar));
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme, sideBar]);
  // Function to create a new note for the authenticated user
  const createNewNote = async () => {
    const newNote = {
      body: `# Title`,
    };
    // const docRef = doc(db, `${userID.uid}`, currentNoteId);
    // const newNoteRef = await addDoc();
    const newNoteRef = await addDoc(notesCollection, newNote);
    setCurrentNoteId(newNoteRef.id);
  };
  async function updateNote(text) {
    const docRef = doc(db, `notes`, currentNoteId);
    await setDoc(docRef, { body: text }, { merge: true });
  }
  async function deleteNote(noteId) {
    const docRef = doc(db, `notes`, noteId);
    await deleteDoc(docRef);
  }

  const Logout = () => {
    try {
      signOut(auth);
      setUserID(null);
      console.log("Logged out");
    } catch (error) {
      setUserID(error.message);
    }
  };
  /* TODO:
  - Fix: notes merge conflict for all users
  */
  const currentNote =
    notes.find((note) => note.id === currentNoteId) || notes[0];
  return !userID ? (
    <Login theme={theme} toggleTheme={toggleTheme} setUserID={setUserID} />
  ) : notes.length > 0 ? (
    <div
      className={`flex flex-col specialfont items-center w-full h-full min-h-screen min-w-screen
        ${
          theme === "light"
            ? "text-slate-600 bg-slate-200"
            : "text-slate-200 bg-slate-600"
        }`}>
      <div className="flex specialfont flex-row mx-10 ">
        <h1 className="lg:text-6xl md:text-6xl sm:text-5xl text-4xl font-bold my-10">
          RightNote
        </h1>
        {userID && (
          <div
            className={`flex flex-col right-[10%] top-[5%] absolute justify-evenly`}>
            <p
              className={`text-center rounded-lg px-2 py-1 mb-10 hover:animate-pulse hover:cursor-pointer
            ${
              theme === "light"
                ? "text-slate-700 bg-slate-300"
                : "text-slate-300 bg-slate-700"
            }
            `}>
              {userID.displayName
                ? userID.displayName
                : userID.email.split("@")[0]}
            </p>
            <button
              className={`rounded-lg  px-2 py-1
                hover:opacity-100 hover:scale-110 cursor-pointer transition-all duration-300
                 opacity-40
             ${
               theme === "light"
                 ? "text-slate-700 bg-slate-300"
                 : "text-slate-300 bg-slate-700"
             }
            `}
              onClick={Logout}>
              Logout
            </button>
          </div>
        )}
        {theme === "light" ? (
          <LightThemeIcon onClick={toggleTheme} theme={theme} />
        ) : (
          <DarkThemeIcon onClick={toggleTheme} theme={theme} />
        )}
      </div>
      {/* <SideBarIcon
        onClick={toggleSpotifyEmbed}
        sideBar={spotifyEmebed}
        theme={theme}
      /> */}
      <EmbeddedFrame spotifyEmebed={spotifyEmebed} theme={theme} />

      <div className="flex sm:flex-row flex-col sm:items-baseline items-center sm:mx-10 mx-3">
        <SideBarIcon onClick={toggleSideBar} sideBar={sideBar} theme={theme} />
        <div
          className={`sm:flex flex-row sm:flex-col w-[10rem] max-w-[15rem] sm:mr-10
              ${
                !sideBar
                  ? "scale-0 transition-transform duration-500"
                  : "scale-100 transition-transform duration-500"
              }
              `}>
          {sideBar && (
            <SideBar
              newNote={createNewNote}
              setCurrentNoteId={setCurrentNoteId}
              notes={notes}
              theme={theme}
              deleteNote={deleteNote}
              currentNote={currentNote}
            />
          )}
        </div>
        <div className="">
          {currentNoteId && notes.length > 0 && (
            <NoteEditor
              theme={theme}
              currentNote={currentNote}
              updateNote={updateNote}
            />
          )}
        </div>
      </div>
    </div>
  ) : (
    <div
      className={`flex flex-col specialfont items-center w-full h-full min-h-screen min-w-screen
      ${
        theme === "light"
          ? "text-slate-600 bg-slate-200"
          : "text-slate-200 bg-slate-600"
      }`}>
      <div className="flex flex-col items-center">
        <h1 className="text-5xl font-bold absolute top-[35%] my-10">
          RightNote
        </h1>
        {theme === "light" ? (
          <LightThemeIcon onClick={toggleTheme} theme={theme} />
        ) : (
          <DarkThemeIcon onClick={toggleTheme} theme={theme} />
        )}
        <button
          className={`font-bold text-xl absolute top-[50%] rounded-md px-2 py-1
        ${
          theme === "light"
            ? "hover:bg-slate-600 bg-slate-300 text-slate-900 hover:text-slate-200"
            : "hover:bg-slate-200 bg-slate-700 text-slate-300 hover:text-slate-800"
        }
        `}
          onClick={createNewNote}>
          Create a new Note
        </button>
      </div>
    </div>
  );
}
export default App;
