import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function GroupPage() {
  const router = useRouter();
  const { token } = router.query;

  const [group, setGroup] = useState(null);

  useEffect(() => {
    if (token) {
      loadGroup();
    }
  }, [token]);

  async function loadGroup() {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("token", token)
      .single();

    if (!error) {
      setGroup(data);
    }
  }

  if (!group) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Loading group...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>{group.name}</h1>

      <p>Group token:</p>

      <code>{group.token}</code>

      <h2 style={{ marginTop: 40 }}>
        Calendar coming next
      </h2>
    </div>
  );
}
