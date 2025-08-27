<script context="module" lang="ts">
	let onTop   //keeping track of which open modal is on top
	const modals={}  //all modals get registered here for easy future access
	
	// 	returns an object for the modal specified by `id`, which contains the API functions (`open` and `close` )
	export function getModal(id=''){
		return modals[id]
	}
</script>

<script lang="ts">
import {onDestroy} from 'svelte'
	
let topDiv
let visible=false
let prevOnTop
let closeCallback = null;
let w = 95;
let h = 95;

export let id='' ;

function keyPress(ev){
	//only respond if the current modal is the top one
	if(ev.key=="Escape" && onTop==topDiv) close() ; //ESC
}

/**  API **/
function open(callback, wd=95,he=95){
	closeCallback=callback ;
	if(visible) return ;
	prevOnTop=onTop ;
	onTop=topDiv ;
	window.addEventListener("keydown",keyPress) ;
	// let modal = document.getElementById('modal') ;

	if (wd) w = wd ;
	if (he) h = he ;
	
	//this prevents scrolling of the main window on larger screens
	document.body.style.overflow="visible" 

	visible=true ;
	//Move the modal in the DOM to be the last child of <BODY> so that it can be on top of everything
	document.body.appendChild(topDiv) ;
}
	
function close(retVal=''){
	if(!visible) return ;
	window.removeEventListener("keydown",keyPress) ;
	onTop=prevOnTop ;
	if(onTop==null) document.body.style.overflow="" ;
	visible=false ;
	if(typeof closeCallback == "function") closeCallback(retVal) ;
}
	
//expose the API
modals[id]={open,close} ;
	
onDestroy(()=>{
	delete modals[id] ;
	window.removeEventListener("keydown",keyPress) ;
})
	
</script>

<div id="topModal" class:visible bind:this={topDiv} >
	<div id='modal' style='--w:{w};--h:{h} ' on:click|stopPropagation={()=>{}}>
		<svg id="close" on:click={()=> close()} viewBox="0 0 12 12">
			<circle cx=6 cy=6 r=6 />
			<line x1=3 y1=3 x2=9 y2=9 />
			<line x1=9 y1=3 x2=3 y2=9 />
		</svg>
		<div id='modal-content'>
			<slot></slot>
		</div>
	</div>
</div>

<style>
	#topModal {
		visibility: hidden;
		z-index: 9999;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #4448;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	#modal {
		position: relative;
    /* height: calc(var(--h) * 1%); */
		height : auto;
    width : calc(var(--w) * 1%);
		border-radius: 6px;
		background: white;
    border: 2px solid #000;
		filter: drop-shadow(5px 5px 5px #555);
		padding: 1em;
	}

	.visible {
		visibility: visible !important;
	}

	#close {
		position: absolute;
		top:-12px;
		right:-12px;
		width:24px;
		height:24px;
		cursor: pointer;
		fill:#F44;
		transition: transform 0.3s;
	}	

	#close:hover {
		transform: scale(2);
	}

	#close line {
		stroke:#FFF;
		stroke-width:2;
	}
	#modal-content {
		max-width: calc(100vw - 20px);
		max-height: 100%;
		/* overflow: auto; */
	}

</style>