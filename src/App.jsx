import { useEffect, useState } from "react"
import "./wasm_exec.js"
import wasmUrl from "./rocketsql.wasm?url";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";

function App() {
  const [code, setCode] = useState("");
  const [results, setResults] = useState("No results yet.");

  useEffect(() => {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject)
      .then(result => go.run(result.instance))
  }, [])

  return (
    <div
      className="h-screen w-full grid"
      style={{
        gridTemplateRows: "70% 30%",
        gridTemplateColumns: "60% 40%",
      }}
    >
      <div className="bg-blue-300 flex items-center justify-center text-xl font-semibold">
        Pages
      </div>

      <div className="bg-green-300 flex items-center justify-center text-xl font-semibold">
        Description
      </div>

      <div className="bg-white grid grid-rows-[auto_1fr] border border-gray-300 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300 shrink-0">
          <span className="font-semibold text-gray-800 text-lg">SQL Editor</span>
          <button
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:shadow-md transition-colors duration-150 flex items-center gap-1 cursor-pointer"
            onClick={() => setResults(`${executeSQL(code)}`)}
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
  );
}

export default App
