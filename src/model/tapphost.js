/**
   * @param {string} appid
   */
async function getApphost(appid) {
  if (appid > "") {
    const res = await fetch("/regapp/host/" + appid);
    return await res.json();
  } else {
    return [];
  }
}

async function getData() {
  const res = await fetch("/regapp");
  const rows = await res.json();
  return rows.map((r) => { r.unshift(0); return r });
}

/**
   * @param {any[]} deldata
   */
function delApp(deldata) {

  fetch("/regapp", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: deldata,
    }),
  }).then(res => {
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res ;
  }).catch((err) => {
    throw err;
  });
}

/**
   * @param {any[]} deldata_dtl
   */
function delAppHost(deldata_dtl) {

  fetch("/regapp/host", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: deldata_dtl,
    }),
  }).catch((err) => {
    throw err;
  });
}

/**
 * 
 * @param {any[]} data 
 * @returns 
 */
function updApp(data) {

  const udata = data.filter(r => r[0]).map(r => { r.shift(); return r });
  if (udata.length == 0) return;
  fetch("/regapp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: udata,
    }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      let rmsg = await res.json();
      return rmsg ;
    })
    .catch((err) => { throw err });

}
/**
 * 
 * @param {any[]} datadtl 
 * @returns 
 */
function updAppHost(datadtl) {

  if (datadtl.length === 0) return;
  fetch("/regapp/host", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ins: datadtl.filter(r => r[0] == 0).map(r => { r.shift(); return r; }),
      upd: datadtl.filter(r => r[0] > 0),
    }),
  }).then(async res => {
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const rmsg = await res.json();
    return rmsg ;
  }).catch((err) => {
    throw err ;
  });
}
