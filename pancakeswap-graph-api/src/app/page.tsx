"use client"

import { useState } from "react";
import axios from "axios";

export default function Home() {

  const [query, setQuery] = useState<string>("");
  const [data, setData] = useState<string>("");

  async function btnEnviarClick() {
    const { data } = await axios.post("https://gateway.thegraph.com/api/{api-key}/subgraphs/id/Hv1GncLY5docZoGtXjo4kwbTvxm3MAhVZqBZE4sUT9eZ", { query });
    setData(data.data);
  }

  return (
    <main>
      <div>
        <div style={{float: "left", width: 500 }}>
          <textarea id="txtFiltro" style={{height: 500, width: "100%"}} onChange={(evt) => setQuery(evt.target.value)} value={query}></textarea>
          <button onClick={btnEnviarClick}>Enviar</button>
        </div>
        <div style={{float: "right", width: 500 }}>
          <textarea style={{height: 500, width: "100%"}} readOnly={true} value={JSON.stringify(data)}></textarea>
        </div>
      </div>
    </main>
  )
}
