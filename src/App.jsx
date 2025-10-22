import { useEffect, useState } from "react";
import "./wasm_exec.js";
import wasmUrl from "./rocketsql.wasm?url";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";
import Page from "./components/Page.jsx";
import Description from "./components/Description.jsx";

function App() {
  const [code, setCode] = useState("");
  const [results, setResults] = useState("No results yet.");
  const [pages, setPages] = useState([]);
  const [tables, setTables] = useState([]);
  const [openedPage, setOpenedPage] = useState(null);
  const [selectedObj, setSelectedObj] = useState(null);
  const [selectedId, setSelectedId] = useState(null)
  const [showEditor, setShowEditor] = useState(true);

  useEffect(() => {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject).then(
      (result) => {
        go.run(result.instance);
        loadSampleData();
        updateTablesAndPages();
      }
    );
  }, []);

  function updateTablesAndPages() {
    const tbls = getAllTables();
    const pgs = assignTableToPages(tbls, getAllPages());
    if (openedPage !== null) {
      const updatedPage = pgs.find((pg) => pg.id === openedPage.id)
      if (updatedPage !== undefined) {
        setOpenedPage(updatedPage)
      }
    }
    setTables(tbls);
    setPages(pgs);
    setSelectedId(null)
    setSelectedObj(null)
  }

  function updateSelectedItem(id) {
    setSelectedId((prev) => { // Unselect
      if (prev === id) {
        setSelectedObj(null)
        return null
      }

      setSelectedObj(createObj(id))
      return id
    })
  }

  return (
    <div
      className="h-screen w-full grid"
      style={{
        gridTemplateRows: showEditor ? "70% 30%" : "100%",
        gridTemplateColumns: "60% 40%",
      }}
    >
      {openedPage ? (
        <Page
          page={openedPage}
          onClose={() => {
            setOpenedPage(null)
            setSelectedId(null)
            setSelectedObj(null)
          }}
          handleClick={updateSelectedItem}
          selectedId={selectedId}
        />
      ) : (
        <div className="bg-gray-200 border border-gray-300 p-4 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">Pages</h2>
            <button
              className="text-sm text-gray-700 hover:underline cursor-pointer"
              onClick={() => setShowEditor(!showEditor)}
            >
              {showEditor ? "Hide SQL Editor ↓" : "Show SQL Editor ↑"}
            </button>
          </div>

          {pages.length === 0 ? (
            <p className="text-gray-500 italic">No pages loaded.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-[500px] sm:min-w-0">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="border-2 border-transparent rounded-lg shadow-md p-3 bg-white
                  hover:border-black hover:shadow-md transition-all duration-150 cursor-pointer"
                    onClick={() => setOpenedPage(pages[page.id - 1])}
                  >
                    <p className="text-lg font-bold text-gray-800">{page.id}</p>
                    <p className="text-sm text-gray-700">
                      {page.table ? page.type : "Empty Page"}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {page.table}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Description selectedObj={selectedObj} />

      {/* 👇 Collapsible Editor + Results */}
      {showEditor && (
        <>
          <div className="bg-white grid grid-rows-[auto_1fr] border border-gray-300 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300 shrink-0">
              <span className="font-semibold text-gray-800 text-lg">
                SQL Editor
              </span>
              <button
                className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:shadow-md transition-colors duration-150 flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  setResults(`${executeSQL(code)}`);
                  updateTablesAndPages();
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
        </>
      )}
    </div>
  );

  // -----------------------------
  // Utility functions
  // -----------------------------

  function assignTableToPages(tbls, pgs) {
    function dfs(node, tableName) {
      if (!node || !node.id) return;

      const page = pgs[node.id - 1];
      if (page) page.table = tableName;

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          dfs(child, tableName);
        }
      }
    }

    for (const tbl of tbls) {
      if (tbl.root) dfs(tbl.root, tbl.name);
    }

    return [...pgs];
  }

  function createObj(id) {
    const obj = {}
    if (id === "header") {
      obj.name = "Page Header"
      obj.pageType = openedPage.type
      obj.offsetOfFirstFreeBlock = openedPage.freeBlocks.length > 0 ? openedPage.freeBlocks[0].start : 0
      obj.numberOfCells = openedPage.numCells
      obj.offsetOfCellArray = openedPage.cellArrOff
      obj.numberOfFragmentedBytes = openedPage.numFragBytes
      obj.rightmostChildPageNumber = openedPage.lastPtr
    } else if (id.startsWith("cell-")) {
      const index = parseInt(id.split("-")[1], 10);
      const cell = openedPage.cells[index]
      if (openedPage.type === "Leaf Page") {
        obj.name = "Leaf Page Cell"
        obj.key = cell.key
        obj.row = cell.row
      } else {
        obj.name = "Interior Page Cell"
        obj.key = cell.key
        obj.pointer = cell.ptr
      }
    } else if (id.startsWith("ptr-")) {
      const index = parseInt(id.split("-")[1], 10);
      obj.name = "Cell Pointer"
      obj.cellOffset = openedPage.cellOffsets[index]
    } else if (id.startsWith("free-")) {
      const index = parseInt(id.split("-")[1], 10);
      obj.name = "Free Block"
      obj.totalSize = openedPage.freeBlocks[index].size
      obj.offsetOfNextFreeBlock = openedPage.freeBlocks[index].nextOff
    } else {
      obj.name = "Unknown";
    }
    return obj
  }

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

export default App;
