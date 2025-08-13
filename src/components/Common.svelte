<script context="module">
  const lvlnm = { 0: "Origin", 1: "단위", 2: "통합", 3: "정합성" };
  const typenm = { 0: "", 1: "배치", 2: "실시간" };
  const proArr = {0:"tcp",1:"http",2:"udp",3:"tmax"};
  const appids = [];
  const appHist = {};
  export function setHist(a,b) {
    appHist[a] = b ;
  }
  export function getHist(a) {
    return appHist[a] ;
  }

  export function getLvlnm(l) {
    return lvlnm[l];
  }
  export function getTypenm(l) {
    return typenm[l];
  }
  export function getTypes() {
    return typenm;
  }
  export function getLvls() {
    return lvlnm;
  }
  export function getPros() {
    return proArr;
  }
  export function getProNm(x) {
    return proArr[x];
  }
  export function getAppid() {
    return appids ;
  }

  export async function getFirst() {
    const res = await fetch("/regapp");
    if (res.status <= 400) {
      const rdata = await res.json();
      rdata.forEach((/** @type {any[]} */ r) => {
        if ( appids.findIndex((a) => a.value == r[0]) == -1)
        appids.push( {value:r[0], name:r[0]} );
      });
    } else {
      throw new Error(res.statusText);
    }

  }
  getFirst() ;

</script>
<script>

</script>