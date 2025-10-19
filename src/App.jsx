import { useEffect, useState } from "react"
import "./wasm_exec.js"
import wasmUrl from "./rocketsql.wasm?url";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";

function App() {
  const [code, setCode] = useState("")
  const [results, setResults] = useState("No results yet.")
  const [pages, setPages] = useState("")

  useEffect(() => {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject)
      .then(result => {
        go.run(result.instance)
        loadSampleData()
        setPages(getAllPages())
      })
  }, [])

  return (
    <div
      className="h-screen w-full grid"
      style={{
        gridTemplateRows: "70% 30%",
        gridTemplateColumns: "60% 40%",
      }}
    >
      <div className="bg-white border border-gray-300 p-4 overflow-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Pages</h2>
        {pages.length === 0 ? (
          <p className="text-gray-500 italic">No pages loaded.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pages.map((page) => (
              <div
                key={page.Id}
                className="border border-gray-200 rounded-lg shadow-sm p-3 bg-gray-50 hover:shadow-md transition-shadow duration-150"
              >
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">ID:</span> {page.Id}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Type:</span> {page.Type}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Table:</span> ...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>


      <div className="bg-green-300 flex items-center justify-center text-xl font-semibold">
        Description
      </div>

      <div className="bg-white grid grid-rows-[auto_1fr] border border-gray-300 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300 shrink-0">
          <span className="font-semibold text-gray-800 text-lg">SQL Editor</span>
          <button
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:shadow-md transition-colors duration-150 flex items-center gap-1 cursor-pointer"
            onClick={() => {
              setResults(`${executeSQL(code)}`)
              setPages(getAllPages())
            }}
          >
            Run
          </button>
        </div>

        <div className="p-2 bg-gray-50 overflow-auto min-w-0">
          <CodeMirror
            value={code}
            height="100%"
            extensions={[sql(), EditorView.lineWrapping]}
            onChange={(value) => setCode(value)}
            theme="light"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
            }}
            className="w-full h-full text-sm font-mono"
          />
        </div>
      </div>


      <div className="bg-white grid grid-rows-[auto_1fr] border border-gray-300">
        <div className="flex items-center px-4 py-2 bg-gray-100 border-b border-gray-300">
          <span className="font-semibold text-gray-800 text-lg">Results</span>
        </div>

        <div className="p-4 bg-gray-50 text-sm font-mono text-gray-900 whitespace-pre-wrap overflow-auto">
          {results}
        </div>
      </div>

    </div>
  )

  function loadSampleData() {
    const queries = [
      // Schema
      "CREATE TABLE students (name VARCHAR(32), age INT, year INT);",
      "CREATE TABLE profs (name VARCHAR(32), dept CHAR(3));",
      "CREATE TABLE courses (name VARCHAR(32), code CHAR(6));",
      "CREATE TABLE grades (student_name VARCHAR(32), course_code CHAR(6), grade FLOAT);",

      // Students
      "INSERT INTO students VALUES ('Ali Hassan', 20, 2);",
      "INSERT INTO students VALUES ('Mona Adel', 21, 3);",
      "INSERT INTO students VALUES ('Karim Youssef', 19, 1);",
      "INSERT INTO students VALUES ('Sara Nabil', 22, 4);",
      "INSERT INTO students VALUES ('Ahmed Samir', 21, 3);",
      "INSERT INTO students VALUES ('Laila Mostafa', 20, 2);",
      "INSERT INTO students VALUES ('Omar Khaled', 18, 1);",
      "INSERT INTO students VALUES ('Hana Ibrahim', 23, 4);",
      "INSERT INTO students VALUES ('Youssef Amr', 22, 4);",
      "INSERT INTO students VALUES ('Nour Ali', 19, 1);",

      // Profs
      "INSERT INTO profs VALUES ('Dr. Hany Lotfy', 'CSE');",
      "INSERT INTO profs VALUES ('Dr. Salma Magdy', 'MAT');",
      "INSERT INTO profs VALUES ('Dr. Ehab Kamel', 'PHY');",
      "INSERT INTO profs VALUES ('Dr. Rania Fouad', 'BIO');",
      "INSERT INTO profs VALUES ('Dr. Ahmed Rashed', 'EEE');",
      "INSERT INTO profs VALUES ('Dr. Laila Hassan', 'CSE');",
      "INSERT INTO profs VALUES ('Dr. Karim Adel', 'CHE');",
      "INSERT INTO profs VALUES ('Dr. Yara Mahmoud', 'MAT');",
      "INSERT INTO profs VALUES ('Dr. Omar Said', 'EEE');",
      "INSERT INTO profs VALUES ('Dr. Samir Hossam', 'PHY');",

      // Courses
      "INSERT INTO courses VALUES ('Databases', 'CSE202');",
      "INSERT INTO courses VALUES ('Operating Systems', 'CSE301');",
      "INSERT INTO courses VALUES ('Linear Algebra', 'MAT201');",
      "INSERT INTO courses VALUES ('Electromagnetics', 'EEE204');",
      "INSERT INTO courses VALUES ('Organic Chemistry', 'CHE110');",
      "INSERT INTO courses VALUES ('Modern Physics', 'PHY220');",
      "INSERT INTO courses VALUES ('Genetics', 'BIO210');",
      "INSERT INTO courses VALUES ('Algorithms', 'CSE303');",
      "INSERT INTO courses VALUES ('Probability', 'MAT205');",
      "INSERT INTO courses VALUES ('Control Systems', 'EEE310');",

      // Grades
      "INSERT INTO grades VALUES ('Ali Hassan', 'CSE202', 88.5);",
      "INSERT INTO grades VALUES ('Mona Adel', 'CSE301', 91.0);",
      "INSERT INTO grades VALUES ('Karim Youssef', 'MAT201', 76.2);",
      "INSERT INTO grades VALUES ('Sara Nabil', 'CSE303', 94.8);",
      "INSERT INTO grades VALUES ('Ahmed Samir', 'EEE204', 82.0);",
      "INSERT INTO grades VALUES ('Laila Mostafa', 'CHE110', 79.4);",
      "INSERT INTO grades VALUES ('Omar Khaled', 'PHY220', 85.6);",
      "INSERT INTO grades VALUES ('Hana Ibrahim', 'BIO210', 90.3);",
      "INSERT INTO grades VALUES ('Youssef Amr', 'MAT205', 73.9);",
      "INSERT INTO grades VALUES ('Nour Ali', 'EEE310', 87.1);",
    ];

    queries.forEach((query) => executeSQL(query));
  }
}

export default App
