import { useRouter } from "next/router";

export default function GroupPage() {
  const router = useRouter();

  const { token } = router.query;

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "Arial",
        background: "#f5f6fa",
        minHeight: "100vh"
      }}
    >
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          maxWidth: 700,
          margin: "0 auto"
        }}
      >
        <h1>Kalender</h1>

        <p>
          Öffentliche Kalenderseite
        </p>

        <p>
          <strong>Token:</strong>{" "}
          {token}
        </p>
      </div>
    </div>
  );
}
