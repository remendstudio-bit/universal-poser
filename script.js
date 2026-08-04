import * as THREE from "three";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

// CANVAS

const canvas =
document.getElementById(
    "visor3D"
);

const loader =
new GLTFLoader();


let modeloActual = null;

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

    1000

);


camara.position.set(
    0,
    1,
    5
);

camara.lookAt(
    0,
    0,
    0
);


// CONTROLES DE CÁMARA

const controles =
new OrbitControls(

    camara,

    canvas

);


controles.enableRotate = true;

controles.enableZoom = true;

controles.enablePan = true;

controles.enableDamping = true;

controles.dampingFactor = 0.08;


controles.target.set(

    0,

    1,

    0

);


controles.update();


// RENDERER

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



// PRIMER OBJETO DE PRUEBA

const geometria =
new THREE.BoxGeometry(
    1,
    1,
    1
);


const material =
new THREE.MeshStandardMaterial({

    color:0x00ff00,

    roughness:0.6,

    metalness:0.1

});


const cubo =
new THREE.Mesh(

    geometria,

    material

);


cubo.position.y = 1;


// escena.add(cubo);

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




// CARGAR MODELO GLB


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



// CENTRAR MODELO

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



modeloActual.position.sub(
    centro
);



// AJUSTAR CÁMARA

const maximo =
Math.max(

    tamaño.x,

    tamaño.y,

    tamaño.z

);



camara.position.set(

    0,

    maximo * 0.5,

    maximo * 2

);



controles.target.set(

    0,

    0,

    0

);


controles.update();



console.log(
"Modelo cargado correctamente"
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


    cubo.rotation.y += 0.01;


    controles.update();


    render.render(

        escena,

        camara

    );

}


animar();




// AJUSTE DE PANTALLA

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
