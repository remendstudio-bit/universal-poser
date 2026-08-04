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

let huesoSeleccionado = null;

let puntoSeleccionado = null;

let controlesRotacion = [];

let ejeSeleccionado = null;

let arrastrando = false;

let ultimoX = 0;

let ultimoY = 0;


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


let tamañoPunto = 0.12;

const nombre =
hueso.name.toLowerCase();

if(

nombre.includes("distal") ||

nombre.includes("intermediate") ||

nombre.includes("proximal")

){

tamañoPunto = 0.08;

}

const geometria =
new THREE.SphereGeometry(

tamañoPunto,

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


    actualizarPuntos();


    controles.update();


    render.render(

        escena,

        camara

    );

}



// ACTUALIZAR POSICIÓN DE PUNTOS

function actualizarPuntos(){


    if(!modeloActual) return;


    modeloActual.updateMatrixWorld(true);


    puntosHuesos.forEach((punto)=>{


        const posicion =
        new THREE.Vector3();


        punto.userData.hueso.getWorldPosition(
            posicion
        );


        punto.position.copy(
            posicion
        );


    });


}



function eliminarControlesRotacion(){


    controlesRotacion.forEach(

        (circulo)=>{

            escena.remove(
                circulo
            );

        }

    );


    controlesRotacion = [];


}



function crearControlesRotacion(hueso){

    eliminarControlesRotacion();

    const tamaño = 1.0;

    const colores = [

        0xff0000,

        0x00ff00,

        0x0000ff

    ];

    for(let i = 0; i < 3; i++){

        // CÍRCULO VISIBLE

        const geometria =
        new THREE.TorusGeometry(

            tamaño,

            0.03,

            16,

            64

        );

        const material =
        new THREE.MeshBasicMaterial({

            color: colores[i],

            depthTest:false

        });

        const circulo =
        new THREE.Mesh(

            geometria,

            material

        );

        circulo.renderOrder = 1000;

        circulo.userData.eje = i;

        // ORIENTACIÓN DEL CÍRCULO

        if(i === 0){

            circulo.rotation.y = Math.PI / 2;

        }

        if(i === 1){

            circulo.rotation.x = Math.PI / 2;

        }

        // ÁREA TÁCTIL (INVISIBLE)

        const geometriaTouch =
        new THREE.TorusGeometry(

            tamaño,

            0.12,

            16,

            64

        );

        const materialTouch =
        new THREE.MeshBasicMaterial({

            transparent:true,

            opacity:0

        });

        const touch =
        new THREE.Mesh(

            geometriaTouch,

            materialTouch

        );

        // COPIAR LA MISMA ORIENTACIÓN

        touch.rotation.copy(
            circulo.rotation
        );

        touch.userData.eje = i;

        touch.userData.visible = circulo;

        // AGREGAR AMBOS A LA ESCENA

        escena.add(
            circulo
        );

        escena.add(
            touch
        );

        // SOLO EL INVISIBLE SE USA PARA DETECTAR TOQUES

        controlesRotacion.push(
            touch
        );

    }

    actualizarControlesRotacion(
        hueso
    );

}


if(i === 1){

circulo.rotation.x =
Math.PI / 2;

}


circulo.userData.eje =
i;



escena.add(
circulo
);



controlesRotacion.push(
circulo
);


}


actualizarControlesRotacion(hueso);


}


function actualizarControlesRotacion(hueso){


if(!hueso) return;



const posicion =
new THREE.Vector3();



hueso.getWorldPosition(
posicion
);



controlesRotacion.forEach(

(touch)=>{

touch.position.copy(
posicion
);

touch.userData.visible.position.copy(
posicion
);

}
);


}


// SELECCIÓN DE HUESOS

const raycaster =
new THREE.Raycaster();


const mouse =
new THREE.Vector2();



canvas.addEventListener(

"pointerdown",

(evento)=>{


    const rect =
    canvas.getBoundingClientRect();



    mouse.x =
    ((evento.clientX - rect.left) /
    rect.width) * 2 - 1;



    mouse.y =
    -((evento.clientY - rect.top) /
    rect.height) * 2 + 1;



    raycaster.setFromCamera(

        mouse,

        camara

    );



    const impactos =
    raycaster.intersectObjects(
        puntosHuesos
    );


    const impactosCirculos =
raycaster.intersectObjects(
    controlesRotacion
);


    if(impactos.length > 0){


    const punto =
    impactos[0].object;



    if(puntoSeleccionado){

        puntoSeleccionado.material.color.set(
            0xff3333
        );

    }



    punto.material.color.set(
        0x00ff00
    );



    puntoSeleccionado =
    punto;



    huesoSeleccionado =
    punto.userData.hueso;



    console.log(
        "Hueso seleccionado:",
        huesoSeleccionado.name
    );



    crearControlesRotacion(
        huesoSeleccionado
    );



}



if(impactosCirculos.length > 0){


    ejeSeleccionado =
    impactosCirculos[0].object.userData.eje;



    arrastrando = true;



    controles.enabled = false;



    ultimoX =
    evento.clientX;



    ultimoY =
    evento.clientY;



    console.log(
        "Eje seleccionado:",
        ejeSeleccionado
    );


}


});



canvas.addEventListener(

"pointermove",

(evento)=>{


if(

!arrastrando ||

!huesoSeleccionado ||

ejeSeleccionado === null

){

return;

}



const deltaX =
evento.clientX - ultimoX;



const deltaY =
evento.clientY - ultimoY;



ultimoX =
evento.clientX;



ultimoY =
evento.clientY;



switch(ejeSeleccionado){

case 0:

huesoSeleccionado.rotation.x -= deltaY * 0.01;

break;


case 1:

huesoSeleccionado.rotation.y += deltaX * 0.01;

break;


case 2:

huesoSeleccionado.rotation.z += deltaX * 0.01;

break;

}


}

);


canvas.addEventListener(

"pointerup",

()=>{


arrastrando = false;



ejeSeleccionado = null;



controles.enabled = true;


}
);


// INICIAR PROGRAMA

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
