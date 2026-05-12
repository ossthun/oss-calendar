import { useRouter } from "next/router";

export default function GroupPage() {
  const router = useRouter();

  const { token } = router.query;

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "Arial"
      }}
    >
      <h1>Kalender</h1>

      <p>Token: {token}</p>
    </div>
  );
}
