import * as THREE from 'three';
import { TextureLoader, RepeatWrapping } from 'three';

const textureLoader = new TextureLoader();
const plasticTexture = textureLoader.load('textures/normal_maps/Plastic016A_1K-JPG/Plastic016A_1K-JPG_NormalDX.jpg');
const woodTexture = textureLoader.load('textures/dark_wood.png');
const naitaTexture = textureLoader.load('textures/room_naita/naita_2.png');
const floorTexture = textureLoader.load('textures/room_naita/naita_floor.png');
export class Room extends THREE.Group {
  width: number;
  length: number;
  height: number;
  bottom: number;
  constructor(width: number, length: number, height:number, bottom: number) {
    super();

    this.width = width;
    this.length = length;
    this.height = height; // фиксированная высота
    this.bottom = bottom;
    const wallMaterial = new THREE.MeshPhysicalMaterial({
        //  color: 0x76B1F3, 
         roughness: 1,
         metalness: 0,
         map: naitaTexture,        
         side: THREE.FrontSide  });
 ;
    const floorMaterial = new THREE.MeshPhysicalMaterial({
    //  color: 0x76B1F3, 
        roughness: 1,
        metalness: 0,
        map: floorTexture,        
        side: THREE.FrontSide  });
// Пол
    const floorGeometry = new THREE.PlaneGeometry(this.width, this.length);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = bottom;
    floor.receiveShadow = true
    this.add(floor);

    // Задняя стена
    const backWallGeometry = new THREE.PlaneGeometry(this.width, this.height);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, this.bottom, -this.length / 2);
    backWall.receiveShadow = true
    this.add(backWall);

    // Передняя стена
    const frontWallGeometry = new THREE.PlaneGeometry(this.width, this.height);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, this.bottom, this.length / 2);
    frontWall.rotation.y = Math.PI;
    frontWall.receiveShadow = true
    this.add(frontWall);

    // Левая стена
    const leftWallGeometry = new THREE.PlaneGeometry(this.length, this.height);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-this.width / 2, this.bottom, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true
    this.add(leftWall);

    // Правая стена
    const rightWallGeometry = new THREE.PlaneGeometry(this.length, this.height);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(this.width / 2, this.bottom, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true
    this.add(rightWall);
  }
}
