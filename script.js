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

let modoMover = false;

let ultimoX = 0;

let ultimoY = 0;


let moviendoModelo = false;

let ultimoMoverX = 0;

let ultimoMoverY = 0;


let historial = [];

let limiteHistorial = 30;

let camaraBloqueada = false;

let ultimoMovimientoX = 0;

let ultimoMovimientoY = 0;

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


const botonCamara =
document.getElementById(
    "botonCamara"
);


const botonMover =
document.getElementById(
    "botonMover"
);


const botonDeshacer =
document.getElementById(
    "botonDeshacer"
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


function guardarEstado(){


    if(!modeloActual) return;



    const estado = {


        posicion: modeloActual.position.clone(),


        rotacion: modeloActual.rotation.clone(),


        huesos: []


    };



    huesosUsables.forEach(

        (hueso)=>{


            estado.huesos.push({

                hueso:hueso,

                rotacion:hueso.rotation.clone()

            });


        }

    );



    historial.push(estado);



    if(historial.length > limiteHistorial){

        historial.shift();

    }


}


function deshacer(){


    if(historial.length === 0){

        return;

    }



    const estado =
    historial.pop();



    modeloActual.position.copy(

        estado.posicion

    );



    modeloActual.rotation.copy(

        estado.rotacion

    );



    estado.huesos.forEach(

        (dato)=>{


            dato.hueso.rotation.copy(

                dato.rotacion

            );


        }

    );


}


function mostrarControlesHuesos(valor){


    puntosHuesos.forEach(

        (punto)=>{

            punto.visible = valor;

        }

    );


    controlesRotacion.forEach(

        (control)=>{


            control.visible.visible = valor;


            control.touch.visible = valor;


        }

    );


}


function eliminarControlesRotacion(){

    controlesRotacion.forEach((control)=>{

        escena.remove(control.visible);

        escena.remove(control.touch);

    });

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

    for(let i=0;i<3;i++){

        //------------------------------------
        // CÍRCULO VISIBLE
        //------------------------------------

        const circulo = new THREE.Mesh(

            new THREE.TorusGeometry(

                tamaño,

                0.03,

                16,

                64

            ),

            new THREE.MeshBasicMaterial({

                color:colores[i],

                depthTest:false

            })

        );

        circulo.renderOrder = 1000;

        if(i===0){

            circulo.rotation.y=Math.PI/2;

        }

        if(i===1){

            circulo.rotation.x=Math.PI/2;

        }

        //------------------------------------
        // ÁREA TÁCTIL
        //------------------------------------

        const touch = new THREE.Mesh(

            new THREE.TorusGeometry(

                tamaño,

                0.12,

                16,

                64

            ),

            new THREE.MeshBasicMaterial({

                transparent:true,

                opacity:0

            })

        );

        touch.rotation.copy(

            circulo.rotation

        );

        touch.userData.eje=i;

        //------------------------------------

        escena.add(circulo);

        escena.add(touch);

        controlesRotacion.push({

            visible:circulo,

            touch:touch

        });

    }

    actualizarControlesRotacion(

        hueso

    );

}


function actualizarControlesRotacion(hueso){

    if(!hueso) return;

    const posicion=new THREE.Vector3();

    hueso.getWorldPosition(

        posicion

    );

    controlesRotacion.forEach((control)=>{

        control.visible.position.copy(

            posicion

        );

        control.touch.position.copy(

            posicion

        );

    });

}


// SELECCIÓN DE HUESOS

const raycaster =
new THREE.Raycaster();


const mouse =
new THREE.Vector2();



canvas.addEventListener(

"pointerdown",

(evento)=>{


    if(modoMover){


    guardarEstado();


    moviendoModelo = true;


    ultimoMoverX = evento.clientX;


    ultimoMoverY = evento.clientY;


    return;

}



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

    controlesRotacion.map(

        control=>control.touch

    )

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


    guardarEstado();
        

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


if(modoMover && moviendoModelo){


    const deltaX =
    evento.clientX - ultimoMoverX;


    const deltaY =
    evento.clientY - ultimoMoverY;


    ultimoMoverX =
    evento.clientX;


    ultimoMoverY =
    evento.clientY;



    if(modeloActual){

        modeloActual.position.x += deltaX * 0.005;

        modeloActual.position.y -= deltaY * 0.005;

    }


    return;

}



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


    if(!camaraBloqueada){

        controles.enabled = true;

    }


}

);


botonCamara.addEventListener(

"click",

()=>{


camaraBloqueada =
!camaraBloqueada;



controles.enabled =
!camaraBloqueada;



if(camaraBloqueada){

botonCamara.textContent =
"🔓";

}else{

botonCamara.textContent =
"🔒";

}


}

);

botonMover.addEventListener(

"click",

()=>{


    modoMover = !modoMover;



    if(modoMover){


        controles.enabled = false;


        mostrarControlesHuesos(false);


        console.log(
            "Modo mover activado"
        );


    }else{


        controles.enabled = true;


        mostrarControlesHuesos(true);


        console.log(
            "Modo mover desactivado"
        );


    }


}

);


botonDeshacer.addEventListener(

"click",

()=>{

    deshacer();

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
