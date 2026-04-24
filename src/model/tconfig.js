

/**
 * @typedef {Object} ConfigRow
 * @property {string} pjtnm
 * @property {string} col1
 * @property {string} col2
 * @property {string} diffc
 * @property {string} sflagc
 * @property {string} encval
 * @property {string} col1type
 * @property {string} expr1
 * @property {string} col2type
 * @property {string} expr2
 */

/**
 * @param {ConfigRow} curRow
 */
function updateConfig(curRow) {
  const rows = curRow;

  fetch("/aqtSetup", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(curRow),
  })
    .then(async (res) => {
      let rmsg = await res.json();
      alert(rmsg.message);
      if (res.status < 300) {
        getdata();
      }
    })
    .catch((err) => {
      alert("error:" + err.message);
    });
}

function altercol1(curRow) {
  let {
    col1,
    col1type,
    expr1
  } = curRow;

  fetch("/aqtSetup/altercol1", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      col1,
      expr1,
      col1type
    }),
  })
    .then(async (res) => {
      let rmsg = await res.json();
      alert(rmsg.message);
      if (res.status < 300) {
        getdata();
      }
    })
    .catch((err) => {
      alert("error:" + err.message);
    });
}
function altercol2(curRow) {
  let {
    col2,
    col2type,
    expr2
  } = curRow;

  fetch("/aqtSetup/altercol2", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      col2,
      expr2,
      col2type
    }),
  })
    .then(async (res) => {
      let rmsg = await res.json();
      alert(rmsg.message);
      if (res.status < 300) {
        getdata();
      }
    })
    .catch((err) => {
      alert("error:" + err.message);
    });
}
async function getdata() {
  const res = await fetch("/aqtSetup");
  if (res.status === 200) {
    return await res.json();
  } else {
    throw new Error(res.statusText);
  }
}

export { altercol1,altercol2,getdata, updateConfig } ;
