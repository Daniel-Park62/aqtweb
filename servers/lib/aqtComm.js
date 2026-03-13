
function getYmd(dt){
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  const ss = String(dt.getSeconds()).padStart(2, '0');
  const mmm = String(dt.getMilliseconds()).padStart(3, '0');

  return `${year}${month}${day}${hh}${mm}${ss}${mmm}`;
}

export {getYmd};
