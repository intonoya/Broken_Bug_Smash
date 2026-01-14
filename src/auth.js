async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || "Request failed");
  return payload;
}

document.addEventListener("DOMContentLoaded", () => {

  const suBtn = document.getElementById("su_btn");
  if (suBtn) {
    suBtn.onclick = async () => {
      const name = document.getElementById("su_name").value;
      const password = document.getElementById("su_pass").value;
      await postJSON("/api/signup", { name, password });
      window.location.href = "/signin";
    };
  }

  const siBtn = document.getElementById("si_btn");
  if (siBtn) {
    siBtn.onclick = async () => {
      const name = document.getElementById("si_name").value;
      const password = document.getElementById("si_pass").value;
      await postJSON("/api/login", { name, password });
      window.location.href = "/game";
    };
  }

});
