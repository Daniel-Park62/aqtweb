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
async function delApp(deldata) {

  return fetch("/regapp", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: deldata,
    }) 
  });
}

/**
   * @param {any[]} deldata_dtl
   */
async function delAppHost(deldata_dtl) {

  return fetch("/regapp/host", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: deldata_dtl,
    }) 
  }) ;
  }
/**
 * 
 * @param {any[]} udata 
 * @returns 
 */
async function updApp(udata) {

  return fetch("/regapp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: udata,
    }),
  }) ;
}
/**
 * 
 * @param {any[]} datadtl 
 * @returns 
 */
function updAppHost(datadtl) {

  if (datadtl.length === 0) return;
  return fetch("/regapp/host", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ins: datadtl.filter(r => r[0] === 0).map(r => {  r.slice(1) ; }),
      upd: datadtl.filter(r => r[0] > 0),
    }) 
  }) ;
}
module.exports = { getApphost, getData, delApp, delAppHost, updApp, updAppHost };