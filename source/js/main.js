import {
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    DirectionalLight,
    AmbientLight,
    PerspectiveCamera,
    BoxGeometry,
    DoubleSide,
    FrontSide,
    Mesh,
    BufferGeometry,
    MeshStandardMaterial,
    SphereGeometry,
    MathUtils,
    Raycaster,
    GridHelper,
    PointLight,
    Vector2,
} from 'three';
import {
    TransformControls
} from 'three/examples/jsm/controls/TransformControls.js';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';
import {
    Brush,
    Evaluator,
    EdgesHelper,
    GridMaterial,
    INTERSECTION,
} from 'three-bvh-csg';
import '../css/main.css';

let renderer, scene, camera;
let evaluator, raycaster;
let gridHelper, edgesHelper;
let orbitControls, transformControls;
let box, sphere;
let ambientLight, light;
let evaluatedMaterialMap, evaluated;
let selected, flags;

window.addEventListener('load', init)

function init() {
    renderer = getRenderer();
    scene = getScene();
    camera = getCamera();
    document.body.appendChild(renderer.domElement);

    evaluator = getEvaluator();
    raycaster = getRaycaster();

    gridHelper = getGridHelper();
    edgesHelper = getEdgesHelper();
    scene.add(gridHelper, edgesHelper);

    orbitControls = getOrbitControls();
    transformControls = getTransformControls();
    scene.add(transformControls.getHelper());

    box = getBox();
    sphere = getSphere();
    scene.add(box.brush, sphere.brush);
    scene.add(box.object3D, sphere.object3D);

    ambientLight = getAmbientLight();
    light = getLight();
    scene.add(ambientLight, light.object3D);

    evaluatedMaterialMap = getEvaluatedMaterialMap();
    evaluated = getEvaluated();
    scene.add(evaluated);

    selected = getSelected();
    flags = getFlags();

    window.addEventListener('mousedown', onWindowMouseDown);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onWindowKeyDown);
    window.addEventListener('keyup', onWindowKeyUp);

    optimizeEvaluator();
    render();
}

function getRenderer() {
    let renderer;
    renderer = new WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x111111, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    return renderer;
}

function getScene() {
    let scene;
    scene = new Scene();
    return scene;
}

function getCamera() {
    let camera;
    camera = new PerspectiveCamera();
    camera.fov = 75;
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.near = 0.1;
    camera.far = 100;
    camera.position.set(1, 2.5, 4);
    camera.updateProjectionMatrix();
    return camera;
}

function getEvaluator() {
    let evaluator;
    evaluator = new Evaluator();
    evaluator.debug.enabled = true;
    evaluator.attributes = ['position', 'normal'];
    evaluator.useGroups = true;
    return evaluator;
}

function getRaycaster() {
    let raycaster;
    raycaster = new Raycaster();
    return raycaster;
}

function getGridHelper() {
    let gridHelper;
    gridHelper = new GridHelper(8, 16, 0x888888, 0x444444);
    return gridHelper;
}

function getEdgesHelper() {
    let edgesHelper;
    edgesHelper = new EdgesHelper();
    edgesHelper.color.set(0xE91E63);
    return edgesHelper;
}

function getOrbitControls() {
    let orbitControls;
    orbitControls = new OrbitControls(camera, renderer.domElement);
    return orbitControls;
}

function getTransformControls() {
    let transformControls;
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setSize(0.75);
    transformControls.addEventListener('dragging-changed', onTransformControlsDraggingChanged);
    transformControls.addEventListener('objectChange', onTransformControlsObjectChange);
    return transformControls;
}

function onTransformControlsDraggingChanged(event) {
    orbitControls.enabled = (!event.value);
}

function onTransformControlsObjectChange(event) {
    flags.updateEvaluated = true;
}

function getAmbientLight() {
    let ambientLight;
    ambientLight = new AmbientLight(0xb0bec5, 0.35);
    return ambientLight;
}

function getLight() {
    let light;
    light = {}
    light.object3D = getLightObject3D();
    light.enabled = true;
    return light;
}

function getLightObject3D() {
    let lightObject3D;
    lightObject3D = new PointLight(0xffffff, 20);
    lightObject3D.position.set(-1, 2, 3);
    lightObject3D.castShadow = true;
    lightObject3D.shadow.mapSize.setScalar(2048);
    lightObject3D.shadow.bias = 1e-5;
    lightObject3D.shadow.normalBias = 1e-2;
    lightObject3D.shadow.camera.left = -2.5;
    lightObject3D.shadow.camera.bottom = -2.5;
    lightObject3D.shadow.camera.right = 2.5;
    lightObject3D.shadow.camera.top = 2.5;
    lightObject3D.shadow.camera.updateProjectionMatrix();
    return lightObject3D;
}

function getBox() {
    let box;
    box = {};
    box.geometry = getBoxGeometry();
    box.object3D = getMesh(box.geometry);
    box.brush = getBrush(box.geometry);
    box.enabled = true;
    return box;
}

function getBoxGeometry() {
    let boxGeometry;
    boxGeometry = new BoxGeometry(1, 1, 1, getBoxDim(), getBoxDim(), getBoxDim());
    return boxGeometry;
}

function getBoxDim() {
    let boxDim;
    boxDim = Math.round(MathUtils.lerp(1, 10, 1));
    return boxDim;
}

function getSphere() {
    let sphere;
    sphere = {};
    sphere.geometry = getSphereGeometry();
    sphere.object3D = getMesh(sphere.geometry);
    sphere.object3D.position.set(-1, 2, 0.5);
    sphere.object3D.material.color.set(0xE91E63);
    sphere.brush = getBrush(sphere.geometry);
    sphere.brush.material.roughness = 0.25;
    sphere.brush.material.color.set(0xE91E63);
    sphere.enabled = true;
    return sphere;
}

function getSphereGeometry() {
    let sphereGeometry;
    sphereGeometry = new SphereGeometry(0.5, getDimSphere(), getDimSphere());
    return sphereGeometry;
}

function getDimSphere() {
    let dimSphere;
    dimSphere = MathUtils.lerp(5, 32, 1);
    return dimSphere;
}

function getMesh(geometry) {
    let mesh;
    mesh = new Mesh(geometry, getMeshMaterial());
    mesh.position.set(0, 0.5, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function getMeshMaterial() {
    let meshMaterial;
    meshMaterial = new MeshStandardMaterial();
    return meshMaterial;
}

function getBrush(geometry) {
    let brush;
    brush = new Brush(geometry, getBrushMaterial());
    brush.visible = false;
    return brush;
}

function getBrushMaterial() {
    let brushMaterial;
    brushMaterial = new GridMaterial();
    brushMaterial.opacity = 0.15;
    brushMaterial.transparent = true;
    brushMaterial.depthWrite = false;
    brushMaterial.polygonOffset = true;
    brushMaterial.polygonOffsetFactor = 0.2;
    brushMaterial.polygonOffsetUnits = 0.2;
    brushMaterial.side = DoubleSide;
    brushMaterial.premultipliedAlpha = true;
    brushMaterial.enableGrid = false;
    return brushMaterial;
}

function getEvaluatedMaterialMap() {
    let evaluatedMaterialMap;
    evaluatedMaterialMap = new Map();
    evaluatedMaterialMap.set(box.brush.material, getEvaluatedMaterial(box.brush));
    evaluatedMaterialMap.set(sphere.brush.material, getEvaluatedMaterial(sphere.brush));
    return evaluatedMaterialMap;
}

function getEvaluatedMaterial(brush) {
    let evaluatedMeshMaterial;
    evaluatedMeshMaterial = brush.material.clone();
    evaluatedMeshMaterial.side = FrontSide;
    evaluatedMeshMaterial.opacity = 1;
    evaluatedMeshMaterial.transparent = false;
    evaluatedMeshMaterial.depthWrite = true;
    evaluatedMeshMaterial.enableGrid = false;
    return evaluatedMeshMaterial;
}

function getEvaluated() {
    let evaluated;
    evaluated = new Mesh(getEvaluatedGeometry(), getMeshMaterial());
    evaluated.castShadow = true;
    evaluated.receiveShadow = true;
    return evaluated;
}

function getEvaluatedGeometry() {
    let evaluatedGeometry;
    evaluatedGeometry = new BufferGeometry();
    return evaluatedGeometry;
}

function getSelected() {
    let selected;
    selected = {};
    selected.mesh = null;
    selected.HTMLElement = null;
    return selected;
}

function getFlags() {
    let flags;
    flags = {};
    flags.updateEvaluated = true;
    return flags;
}


function onWindowMouseDown(event) {
    if (event.target.dataset.key) {
        onKeyDown(event.target.dataset.key.toLowerCase());
        return;
    }
    if (transformControls.dragging) {
        return;
    }
    raycaster.setFromCamera(getPointer(event), camera);
    selectObject(getObjectByMesh(getRaycasterIntersection()));
}

function getObjectByMesh(mesh) {
    let objectByMesh;
    objectByMesh = [box, sphere].find((item) => item.object3D === mesh);
    return objectByMesh;
}

function getRaycasterIntersection() {
    let raycasterIntersection;
    raycasterIntersection = raycaster.intersectObjects(scene.children, false);
    raycasterIntersection = raycasterIntersection.filter((item) => getIsTransformable(item));
    raycasterIntersection = raycasterIntersection[0]?.object;
    return raycasterIntersection;
}

function getIsTransformable(object) {
    let isTransformable;
    isTransformable = (object.object?.constructor === Mesh);
    isTransformable ||= (object.object?.constructor === DirectionalLight);
    isTransformable &&= (object.object?.geometry?.type !== 'BufferGeometry');
    return isTransformable;
}

function getPointer(event) {
    let pointer;
    pointer = new Vector2();
    pointer.x = (event.clientX/window.innerWidth)*2 - 1;
    pointer.y = -(event.clientY/window.innerHeight)*2 + 1;
    return pointer;
}

function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onWindowKeyDown(event) {
    onKeyDown(event.key);
}

function onKeyDown(key) {
    switch (key) {
        case 'q':
            transformControls.setSpace(transformControls.space === 'local' ? 'world' : 'local');
            break;
        case 'Shift':
            transformControls.setTranslationSnap(0.5);
            transformControls.setRotationSnap(MathUtils.degToRad(45));
            transformControls.setScaleSnap(1);
            break;
        case 'Escape':
            deselectObject();
            break;
        case 'w':
            transformControls.setMode('translate');
            break;
        case 'e':
            transformControls.setMode('rotate');
            break;
        case 'r':
            if (!(selected.mesh?.object3D instanceof PointLight)) {
                transformControls.setMode('scale');
            }
            break;
        case 's':
            selectObject(box);
            break;
        case 'd':
            selectObject(sphere);
            break;
        case 'f':
            if (transformControls.getMode() === 'scale') {
                transformControls.setMode('translate');
            }
            selectObject(light);
            break;
        case ' ':
            if (selected.mesh) {
                selected.mesh.enabled = !selected.mesh.enabled;
                flags.updateEvaluated = true;
                selected.HTMLElement.classList.toggle('info__disabled', !selected.mesh.enabled);
            }
            break;
    }
}

function onWindowKeyUp(event) {
    switch (event.key) {
        case 'Shift':
            transformControls.setTranslationSnap(null);
            transformControls.setRotationSnap(null);
            transformControls.setScaleSnap(null);
            break;
    }
}

function selectObject(object) {
    if (!object) {
        deselectObject();
        return;
    }
    selected.mesh = object;
    selected.HTMLElement = document.querySelector(`.info__${getObjectType()}`);
    transformControls.attach(selected.mesh.object3D);
}

function getObjectType() {
    let objectType;
    objectType = (selected.mesh.geometry ?? selected.mesh.object3D);
    objectType = objectType.constructor.name;
    return objectType;
}

function deselectObject() {
    selected.mesh = null;
    selected.HTMLElement = null;
    transformControls.detach();
}


function optimizeEvaluator() {
    evaluator.evaluate(box.brush, sphere.brush, INTERSECTION, evaluated);
    evaluated.material = evaluated.material.map((m) => {return evaluatedMaterialMap.get(m);});
    [box, sphere].forEach((item)=> setBrushVisible(item, true));
    renderer.render(scene, camera);
}

function render() {
    requestAnimationFrame(render);
    if (flags.updateEvaluated) {
        flags.updateEvaluated = false;
        updateEvaluated();
    }
    light.object3D.visible = light.enabled;
    renderer.render(scene, camera);
}

function updateEvaluated() {
    synchronizeObjects();
    evaluated.visible = (box.enabled && sphere.enabled);
    edgesHelper.visible = evaluated.visible;
    if (evaluated.visible) {
        [box, sphere].forEach((item) => item.brush.updateMatrixWorld());
        evaluator.evaluate(box.brush, sphere.brush, INTERSECTION, evaluated);
        evaluated.material = evaluated.material.map((m) => {return evaluatedMaterialMap.get(m);});
        edgesHelper.setEdges(evaluator.debug.intersectionEdges);
    }
    let intersected = evaluated.visible && Boolean(evaluator.debug.intersectionEdges.length);
    [box, sphere].forEach((item)=> setBrushVisible(item, intersected));
}

function synchronizeObjects() {
    synchronize(edgesHelper, box.object3D);
    synchronize(sphere.brush, sphere.object3D);
    synchronize(box.brush, box.object3D);
}

function synchronize(geometry1, geometry2) {
    geometry1.position.x = geometry2.position.x;
    geometry1.position.y = geometry2.position.y;
    geometry1.position.z = geometry2.position.z;
    geometry1.rotation.x = geometry2.rotation.x;
    geometry1.rotation.y = geometry2.rotation.y;
    geometry1.rotation.z = geometry2.rotation.z;
    geometry1.scale.x = geometry2.scale.x;
    geometry1.scale.y = geometry2.scale.y;
    geometry1.scale.z = geometry2.scale.z;
}

function setBrushVisible(object, visibility) {
    object.brush.visible = object.enabled && visibility;
    object.object3D.visible = object.enabled && !visibility;
}
