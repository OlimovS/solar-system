import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import starsTexture from "../img/stars.jpg";
import sunTexture from "../img/sun.jpg";
import mercuryTexture from "../img/mercury.jpg";
import venusTexture from "../img/venus.jpg";
import earthTexture from "../img/earth.jpg";
import marsTexture from "../img/mars.jpg";
import jupiterTexture from "../img/jupiter.jpg";
import saturnTexture from "../img/saturn.jpg";
import saturnRingTexture from "../img/saturn ring.png";
import uranusTexture from "../img/uranus.jpg";
import uranusRingTexture from "../img/uranus ring.png";
import neptuneTexture from "../img/neptune.jpg";
import plutoTexture from "../img/pluto.jpg";
import moonTexture from "../img/moonmap4k.jpg";

const solar_system = {
  sun: { size: 20, segments: { height: 60, width: 60 } },
  planets: [
    {
      texture: mercuryTexture,
      size: 3.2,
      position: 35,
      rotation_own_orbit: 0.01,
      rotation_around_sun: 0.016,
      segments: { height: 60, width: 60 },
    },
    {
      texture: venusTexture,
      size: 5.8,
      position: 50,
      rotation_own_orbit: 0.01,
      rotation_around_sun: 0.013,
      segments: { height: 60, width: 60 },
    },
    {
      texture: earthTexture,
      size: 6,
      position: 68,
      rotation_own_orbit: 0.01,
      rotation_around_sun: 0.01,
      segments: { height: 60, width: 60 },
      natural_satellites: [
        {
          texture: moonTexture,
          size: 1,
          rotation_around_parent: 0.02,
        },
      ],
    },
    {
      texture: marsTexture,
      size: 4,
      position: 90,
      rotation_own_orbit: 0.01,
      rotation_around_sun: 0.008,
      segments: { height: 60, width: 60 },
    },
    {
      texture: jupiterTexture,
      size: 12,
      position: 120,
      rotation_own_orbit: 0.01,
      rotation_around_sun: 0.002,
      segments: { height: 60, width: 60 },
    },
    {
      texture: saturnTexture,
      size: 10,
      position: 160,
      rotation_own_orbit: 0.01,
      rotation_around_sun: 0.0009,
      segments: { height: 60, width: 60 },
      ring: {
        innerRadius: 11,
        outerRadius: 20,
        texture: uranusRingTexture,
      },
    },
    {
      texture: uranusTexture,
      size: 7,
      position: 190,
      rotation_own_orbit: 0.01,
      rotation_around_sun: 0.0004,
      segments: { height: 60, width: 60 },
      ring: {
        innerRadius: 8,
        outerRadius: 12,
        texture: saturnRingTexture,
      },
    },
    {
      texture: neptuneTexture,
      size: 7,
      position: 220,
      rotation_own_orbit: 0.01,
      rotation_around_sun: 0.0001,
      segments: { height: 60, width: 60 },
    },
    {
      texture: plutoTexture,
      size: 2.8,
      position: 240,
      rotation_own_orbit: 0.01,
      rotation_around_sun: 0.00007,
      segments: { height: 60, width: 60 },
    },
  ],
};

//==============================
//=========   Set up ===========
//==============================

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);

const orbit_controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(-200, 200, 200);
orbit_controls.update();

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//==============================
//==== setting up the scene ====
//==============================
// initing texture objects
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

scene.background = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

// setting up ambient lighting

const ambient_lighting = new THREE.AmbientLight(0x333333, 1);
scene.add(ambient_lighting);

// setting up the sun
const sun_geo = new THREE.SphereGeometry(
  solar_system.sun.size,
  solar_system.sun.segments.width,
  solar_system.sun.segments.height
);
const sun_material = new THREE.MeshBasicMaterial({
  map: textureLoader.load(sunTexture),
});
const sun = new THREE.Mesh(sun_geo, sun_material);
scene.add(sun);

// adding spotlight
const spotlight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(spotlight);
// =======
// helpers
// =======
// const axesHelper = new THREE.AxesHelper(40);
// scene.add(axesHelper);

// const spotLightHelper = new THREE.PointLightHelper(spotlight);
// scene.add(spotLightHelper);

const getRandom = (start, end) => {
  return Math.floor(start + Math.random() * end);
};

// rendering planets
const createPlanet = (planet_data) => {
  const { size, texture, position } = planet_data;
  const planet_geo = new THREE.SphereGeometry(size, 30, 30);
  const planet_material = new THREE.MeshStandardMaterial({
    map: textureLoader.load(texture),
  });
  const planet = new THREE.Mesh(planet_geo, planet_material);
  // planet parent object
  const planet_parent = new THREE.Object3D();

  //   if it has ring
  if (planet_data.ring) {
    const {
      innerRadius,
      outerRadius,
      texture: ring_texture,
    } = planet_data.ring;
    const ring_geo = new THREE.RingGeometry(innerRadius, outerRadius, 32);
    const ring_material = new THREE.MeshBasicMaterial({
      map: textureLoader.load(ring_texture),
      side: THREE.DoubleSide,
    });
    const ring_mesh = new THREE.Mesh(ring_geo, ring_material);
    ring_mesh.position.x = position;
    ring_mesh.rotation.x = -0.5 * Math.PI;

    planet_parent.add(ring_mesh);
  }

  //   if it has natural_satellites
  let natural_satellites;
  if (planet_data.natural_satellites) {
    natural_satellites = planet_data.natural_satellites.map(
      ({ size: sat_size, texture, rotation_around_parent }) => {
        const sat_geo = new THREE.SphereGeometry(sat_size, 60, 60);
        const sat_material = new THREE.MeshStandardMaterial({
          map: textureLoader.load(texture),
        });

        const satellite = new THREE.Mesh(sat_geo, sat_material);
        const sat_parent = new THREE.Object3D();
        satellite.position.x = size + 3 * sat_size;
        sat_parent.add(satellite);
        planet.add(sat_parent);
        return { parent: sat_parent, rotation_around_parent };
      }
    );
  }

  planet_parent.add(planet);
  planet.position.x = position;
  planet_parent.rotateY(getRandom(0, 360));

  return {
    parent: planet_parent,
    mesh: planet,
    rotation_own_orbit: planet_data.rotation_own_orbit,
    rotation_around_sun: planet_data.rotation_around_sun,
    natural_satellites: natural_satellites,
  };
};

const planets = solar_system.planets.map(createPlanet);

// ===================
// ==== RENDERING ====
// ===================

planets.forEach((planet) => {
  scene.add(planet.parent);
});

function animate() {
  planets.forEach((planet) => {
    planet.mesh.rotateY(planet.rotation_own_orbit);
    planet.parent.rotateY(planet.rotation_around_sun);
    planet?.natural_satellites?.forEach((sat) => {
      sat.parent.rotateY(sat.rotation_around_parent);
    });
  });
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
