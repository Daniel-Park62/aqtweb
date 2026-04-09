import  { readable, writable } from 'svelte/store'

let value = "";
let aqtpass = 'abcd';

export const gtcode = writable(value) ;
export const isLogged = writable(0);
export const authApps = writable(".*");
export const userid = writable("") ;
export const appids = writable([]) ;
export const rooturl = readable('') ;

export const pjtName = writable("중장기 IT인프라 최적화") ;

export const getCheckPass = async ( password ) => {
	if ( password === aqtpass )
		return 1
} ;

export const setCheckPass = async ( password ) => {
  aqtpass = password ;
}