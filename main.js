import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const axisSize = 10;
const fence = {
    x: 2.52,
    y: 0.9,
    z: 0.11
}
const grassWidth = 5.5;
const grassLength = 5.5;
const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
const axesHelper = new THREE.AxesHelper(axisSize);
scene.add(axesHelper);
const grassGeometry = new THREE.PlaneGeometry(fence.x * 5, fence.x * 5);
const arrayOfPigs = [];
const mouse = new THREE.Vector2(); // Declare the mouse variable here

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xC2E3CC, 1);
document.body.appendChild( renderer.domElement );

camera.position.z = 20;
let houseModel;
let direction = 0.001;

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const box = new THREE.Box3().setFromObject(intersectedObject);
        const targetPosition = box.getCenter(new THREE.Vector3()).add(new THREE.Vector3(0, 0, 5));
        
        // Calculate desired camera position
        const distance = (box.getSize(new THREE.Vector3()).length() / (2 * Math.tan((camera.fov * Math.PI) / 360))) * 2.5;
        const zoomPosition = box.getCenter(new THREE.Vector3()).add(new THREE.Vector3(0, 0, distance));

        const targetCenter = box.getCenter(new THREE.Vector3());
        // Use GSAP to animate the camera position
        gsap.to(camera.position, {
            duration: 2.5, // duration of the animation
            x: zoomPosition.x,
            y: zoomPosition.y,
            z: zoomPosition.z,
            onUpdate: () => {
                camera.lookAt(targetCenter); // Keep looking at the object
            }
        });
    }
}

function pigWalk(thisPig) {
    if (thisPig.position.x >= grassWidth) {
        direction = -0.001;
    }
    else if (thisPig.position.x <= -grassWidth) {
        direction = 0.001;
    }
    thisPig.position.x += direction;
}

// Add event listener for mouse clicks
window.addEventListener('click', onMouseClick, false);

function animate() {
    sunLight.position.x = Math.cos(Date.now() * 0.001) * 5;
    sunMesh.position.x = sunLight.position.x;
    arrayOfPigs.forEach((eachPig, index) => {
        let threeCoordinates = new THREE.Vector3();

        eachPig.position.y = Math.cos(Date.now() * 0.01 + index)*0.1+0.5;
        eachPig.rotation.y += Math.cos(Date.now() * 0.01)*0.02;
        eachPig.getWorldPosition(threeCoordinates);
        pigWalk(eachPig);
    });
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
const housePromise = loader.loadAsync( '/static-files/Fantasy_Inn.glb');
const pigPromise = loader.loadAsync('/static-files/pig.glb');
const grassPromise = grassLoader.loadAsync('/static-files/grass.jpg');

const objectLoader = new OBJLoader();
const fencePromise = objectLoader.loadAsync('/static-files/Fence.obj');

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
    for (let numberOfPigs = 0; numberOfPigs < 3; numberOfPigs ++) {
        let newPig = pigModel.clone();
        arrayOfPigs.push(newPig);

        let randomX = getRandomIntInclusive(-grassWidth, grassWidth);
        let randomZ = getRandomIntInclusive(-grassLength, grassLength);

        newPig.position.set(randomX, -0.47, randomZ);
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
    const grassBox = new THREE.Box3().setFromObject(grassMesh);
    const size = grassBox.getSize(new THREE.Vector3());
    console.log(`grass size is ${JSON.stringify(size)}`);
    grassMesh.rotation.x = -1.57;
    scene.add(grassMesh);
	houseModel = houseGltf.scene;
    scene.add( houseModel );
    houseModel.rotation.z = 0;
    let pigModel = pigGltf.scene;
    arrayOfPigs.push(...cloneAndPlacePig(pigModel));

    renderer.setAnimationLoop( animate );
}).catch(function ( error ) {
	console.error( `loading failures, reason is ${error}` );
}); 

