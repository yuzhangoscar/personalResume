import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const axisSize = 10;
const fence = {
    x: 2.52,
    y: 0.9,
    z: 0.11
}
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
const axesHelper = new THREE.AxesHelper(axisSize);
scene.add(axesHelper);
const grassGeometry = new THREE.PlaneGeometry(fence.x * 5, fence.x * 5);

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xC2E3CC, 1);
document.body.appendChild( renderer.domElement );

camera.position.z = 20;
let houseModel;

function animate() {
    sunLight.position.x = Math.cos(Date.now() * 0.001) * 5;
    sunMesh.position.x = sunLight.position.x;
	renderer.render( scene, camera );
    controls.update();
}

const light = new THREE.AmbientLight( 0xffffff, 2 ); // soft white light
scene.add( light );
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(0, 10, 0);
scene.add(sunLight);
const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xff9900 });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(0, 10, 0);
scene.add(sunMesh);

const loader = new GLTFLoader();
const grassLoader = new THREE.TextureLoader();
const housePromise = loader.loadAsync( './public/Fantasy_Inn.glb');
const pigPromise = loader.loadAsync('./public/pig.glb');
const grassPromise = grassLoader.loadAsync('./public/grass.jpg');

const objectLoader = new OBJLoader();
const fencePromise = objectLoader.loadAsync('./public/Fence.obj');

function cloneAndPlaceFence(fenceObject){
    const arrayOfFences = [];
    for (let numberOfFences = 0; numberOfFences < 25; numberOfFences ++) {
        let newFence = fenceObject.clone();
        arrayOfFences.push(newFence);

        if(numberOfFences < 5) {
            newFence.position.set(fence.x * (numberOfFences - 2), 0, fence.x * 2.5);
        }
        if(numberOfFences >= 5 && numberOfFences < 10) {
            newFence.position.set(fence.x * (numberOfFences - 7), 0, (-1)*fence.x * 2.5);
        }
        if(numberOfFences >= 10 && numberOfFences < 15) {
            newFence.rotation.y = Math.PI / 2;
            newFence.position.set(fence.x * 2.5, 0, fence.x * (numberOfFences - 12));
        }
        if(numberOfFences >= 15 && numberOfFences < 20) {
            newFence.rotation.y = Math.PI / 2;
            newFence.position.set((-1)*fence.x * 2.5, 0, fence.x * (numberOfFences - 17));
        }
        scene.add(newFence);
    }
    return arrayOfFences;
}

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function cloneAndPlacePig(pigModel) {
    const arrayOfPigs = [];
    for (let numberOfPigs = 0; numberOfPigs < 10; numberOfPigs ++) {
        let newPig = pigModel.clone();
        arrayOfPigs.push(newPig);

        let randomX = getRandomIntInclusive(-fence.x * 2, fence.x * 2);
        let randomZ = getRandomIntInclusive(-fence.x * 2, fence.x * 2);

        newPig.position.set(randomX, 0.42, randomZ);
        scene.add(newPig);
    }
    return arrayOfPigs;
}

Promise.all([housePromise, grassPromise, fencePromise, pigPromise]).then(function ( [houseGltf, grassTexture, fenceObj, pigGltf] ) {
    fenceObj.scale.x = 0.02;
    fenceObj.scale.y = 0.02;
    fenceObj.scale.z = 0.02;
    cloneAndPlaceFence(fenceObj);
    grassTexture.repeat.set(1,1);
    const grassMaterial = new THREE.MeshLambertMaterial({
        map: grassTexture,
        vertexColors: THREE.VertexColors,
        side: THREE.DoubleSide,

    });

    const grassMesh = new THREE.Mesh(grassGeometry, grassMaterial);
    grassMesh.rotation.x = -1.57;
    scene.add(grassMesh);
	houseModel = houseGltf.scene;
    scene.add( houseModel );
    houseModel.rotation.z = 0;
    let pigModel = pigGltf.scene;
    cloneAndPlacePig(pigModel);

    renderer.setAnimationLoop( animate );
}).catch(function ( error ) {
	console.error( `loading failures, reason is ${error}` );
}); 

