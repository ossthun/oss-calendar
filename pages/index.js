import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Noch nicht geklickt");

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Click Test</h1>

      <button
        onClick={() => setMessage("Button funktioniert")}
        style={{
          padding: 14,
          fontSize: 18,
        }}
      >
        Test klicken
      </button>

      <p>{message}</p>
    </div>
  );
}
