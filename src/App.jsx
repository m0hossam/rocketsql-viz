import { useEffect } from "react"
import "./wasm_exec.js"
import wasmUrl from "./rocketsql.wasm?url";

function App() {
  useEffect(() => {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject)
      .then(result => {
        go.run(result.instance)
        executeSQL("CREATE TABLE hello (a int, b varchar(32))")
        executeSQL("INSERT INTO hello VALUES (1, 'hello')")
        executeSQL("INSERT INTO hello VALUES (2, 'world')")
        console.log(executeSQL("SELECT * FROM hello"));
      })
  }, [])

  return (
    <div>
      hello, world
    </div>
  )
}

export default App
