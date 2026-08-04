import * as THREE from "three";


// CANVAS

const canvas =
document.getElementById(
    "visor3D"
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
    3
);



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
new THREE.MeshBasicMaterial({

    color:0x00ff00

});


const cubo =
new THREE.Mesh(

    geometria,

    material

);


escena.add(
    cubo
);



// ANIMACIÓN

function animar(){

    requestAnimationFrame(
        animar
    );


    cubo.rotation.y += 0.01;


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
