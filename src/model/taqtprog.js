async function save(rdata) {
  try {
    const upds = rdata.filter((r) => r.chk && r.progno != 0);
    const inss = rdata.filter((r) => r.chk && r.progno == 0);

    // console.log(inss)     ;
    const res = await fetch("/taqtprog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        upd: upds,
        ins: inss,
      }),
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    throw err;
  };
}

function erase(rdata) {
  const delcodes = rdata
    .filter((r) => r.chk && r.progno > 0)
    .map((r) => r.progno);

  if (delcodes.length == 0) return;
  // console.log("del code:", delcodes) ;
  fetch("/taqtprog", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prognos: delcodes,
    }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return await res.json();
    })
    .catch((err) => {
      throw err;
    });
}
async function getdata() {

  const res = await fetch("/taqtprog");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return await res.json();
}

export { save, erase, getdata };
