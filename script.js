import * as THREE from "three";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";


// CANVAS

const canvas =
document.getElementById(
    "visor3D"
);


// CARGADOR

const loader =
new GLTFLoader();


let modeloActual = null;

let puntosHuesos = [];

let huesosUsables = [];

const inputGLB =
document.getElementById(
    "archivoGLB"
);


// ESCENA

const escena =
new THREE.Scene();


escena.background =
new THREE.Color(
    0x202020
);



// CÁMARA

const camara =
new THREE.PerspectiveCamera(

    45,

    window.innerWidth /
    window.innerHeight,

    0.1,

    2000

);


camara.position.set(
    0,
    1,
    5
);



// RENDER

const render =
new THREE.WebGLRenderer({

    canvas:canvas,

    antialias:true

});


render.setPixelRatio(
    window.devicePixelRatio
);


render.setSize(

    window.innerWidth,

    window.innerHeight

);



// CONTROLES

const controles =
new OrbitControls(

    camara,

    canvas

);


controles.enableDamping = true;

controles.dampingFactor = 0.08;



// ILUMINACIÓN


const luzAmbiente =
new THREE.HemisphereLight(

    0xffffff,

    0x444444,

    2

);


escena.add(
    luzAmbiente
);



const luzDireccion =
new THREE.DirectionalLight(

    0xffffff,

    3

);


luzDireccion.position.set(

    5,

    5,

    5

);


escena.add(
    luzDireccion
);



// CARGAR GLB


inputGLB.addEventListener(

"change",

(evento)=>{


const archivo =
evento.target.files[0];


if(!archivo) return;



const ruta =
URL.createObjectURL(
    archivo
);



loader.load(

ruta,


(resultado)=>{


if(modeloActual){

escena.remove(
    modeloActual
);

}



modeloActual =
resultado.scene;



escena.add(
    modeloActual
);


// BUSCAR HUESOS

let huesosEncontrados = [];


modeloActual.traverse(

(objeto)=>{


if(
objeto.isSkinnedMesh &&
objeto.skeleton
){


objeto.skeleton.bones.forEach(

(hueso)=>{


if(
!huesosEncontrados.includes(hueso)
){

huesosEncontrados.push(
hueso
);

}


}

);


}


}

);



console.log(

"Huesos reales:",

huesosEncontrados.length

);

huesosUsables = [];


huesosEncontrados.forEach(

(hueso)=>{


const nombre =
hueso.name.toLowerCase();



if(

!nombre.includes("mixamorig") &&

!nombre.includes("helper") &&

!nombre.includes("twist")

){


huesosUsables.push(
hueso
);


}


}

);



console.log(

"Huesos para puntos:",

huesosUsables.length

);

function crearPunto(hueso){


const geometria =
new THREE.SphereGeometry(

0.08,

16,

16

);



const material =
new THREE.MeshBasicMaterial({

color:0xff3333,

depthTest:false

});



const punto =
new THREE.Mesh(

geometria,

material

);


punto.frustumCulled = false;


punto.renderOrder = 999;



punto.userData.hueso =
hueso;



escena.add(
punto
);


console.log(
"Creando punto:",
hueso.name
);


puntosHuesos.push(
punto
);


}


huesosUsables.forEach(

(hueso)=>{


crearPunto(
    hueso
);


}

);

// MEDIR MODELO

const caja =
new THREE.Box3()
.setFromObject(
    modeloActual
);



const centro =
caja.getCenter(
    new THREE.Vector3()
);



const tamaño =
caja.getSize(
    new THREE.Vector3()
);



// CENTRAR MODELO

modeloActual.position.sub(
    centro
);



// NUEVA MEDICIÓN

const cajaNueva =
new THREE.Box3()
.setFromObject(
    modeloActual
);



const centroNuevo =
cajaNueva.getCenter(
    new THREE.Vector3()
);



// CÁMARA


const maximo =
Math.max(

    tamaño.x,

    tamaño.y,

    tamaño.z

);



camara.position.set(

    0,

    maximo * 0.6,

    maximo * 2.2

);



controles.target.copy(
    centroNuevo
);


controles.update();



console.log(
"Modelo cargado:",
modeloActual.name
);



},


undefined,


(error)=>{

console.error(
error
);

}


);


});





// ANIMACIÓN


function animar(){

requestAnimationFrame(
    animar
);




controles.update();



render.render(

escena,

camara

);


}

function actualizarPuntos(){


if(!modeloActual) return;



modeloActual.updateMatrixWorld(
    true
);



puntosHuesos.forEach(

(punto)=>{


const posicion =
new THREE.Vector3();



punto.userData.hueso.getWorldPosition(

posicion

);



punto.position.copy(
    posicion
);


console.log(
hueso.name,
posicion
);


}

);


}

animar();






// RESIZE


window.addEventListener(

"resize",

()=>{


camara.aspect =

window.innerWidth /

window.innerHeight;



camara.updateProjectionMatrix();



render.setSize(

window.innerWidth,

window.innerHeight

);


}

);
