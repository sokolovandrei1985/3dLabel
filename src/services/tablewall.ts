import * as THREE from 'three';

import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { TextureLoader, RepeatWrapping } from 'three';
const textureLoader = new TextureLoader();
const woodTexture = textureLoader.load('./textures/dark_wood.png');
const plasticTexture = textureLoader.load('./textures/normal_maps/Plastic016A_1K-JPG/Plastic016A_1K-JPG_NormalDX.jpg');
const plasticDisplacementMap = textureLoader.load('./textures/normal_maps/Plastic016A_1K-JPG/Plastic016A_1K-JPG_Displacement.jpg');
// const cottonTexture = textureLoader.load('./textures/normal_maps/leather_white_diff_4k/leather_white_diff_4k.jpg');
const foamTexture = textureLoader.load('./textures//Styrofoam005_2K-JPG/Styrofoam005_2K-JPG.jpg');
const foamDisplacementTexture = textureLoader.load('./textures/Styrofoam005_2K-JPG/Styrofoam005_2K-JPG_Displacement.jpg');
const paperTexture = textureLoader.load('./textures/naita.png');



export class Table extends THREE.Group {
  table: THREE.Mesh;
  reflector: Reflector;
  overlay: THREE.Mesh;
  // causticOverlay: THREE.Mesh;
  tableHeight: number;
  // causticTexture: THREE.Texture;  // добавим сюда

  constructor(width: number, depth: number, tableHeight: number, wallHeight = 1.0, wallThickness = 0.05) {
    super();

    this.tableHeight = tableHeight;

    // Основной стол
    const tableGeometry = new THREE.BoxGeometry(width, tableHeight, depth);
    const tableMaterial = new THREE.MeshPhysicalMaterial({
      // map: woodTexture,
      color: 0xffffff,//0x76B1F3,
      metalness: 0,
      roughness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.1,
      opacity: 1,
      transparent: false,
      side: THREE.DoubleSide
    });
    this.table = new THREE.Mesh(tableGeometry, tableMaterial);
    // this.table.position.y = tableHeight / 2;
    // this.table.castShadow = true;
    this.table.receiveShadow = true;
    this.add(this.table);

    // Reflector
    const reflectorGeometry = new THREE.PlaneGeometry(width, depth);
    this.reflector = new Reflector(reflectorGeometry, {
      clipBias: 0.0001,
      textureWidth: window.innerWidth * window.devicePixelRatio / 2,
      textureHeight: window.innerHeight * window.devicePixelRatio / 2,
      color: new THREE.Color(0xffffff)//0x363636),
           
    });
    this.reflector.position.set(0, tableHeight/2+tableHeight*0.01, 0);
    this.reflector.rotateX(-Math.PI / 2);
    this.reflector.receiveShadow = true;
    this.add(this.reflector);

    // Overlay (уменьшим позже)

    // const bottleCausticTexture = textureLoader.load('./textures/caustics/bottle.png');
    const overlayMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,//0xe4e4e4,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.02,
      ior: 1,
      opacity: 0.9,
      transparent: true,
      depthWrite: false,
      reflectivity: 0,
      side: THREE.FrontSide,        
    });
    
    const overlayGeometry = new THREE.PlaneGeometry(width, depth);
    this.overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    this.overlay.position.set(0, tableHeight/2 + tableHeight*0.03, 0);
    this.overlay.rotateX(-Math.PI / 2);
    this.overlay.receiveShadow = true;
    this.add(this.overlay);


//     //Каустический overlay
// const c_width = 3;
// const c_depth = 3.5;
// const causticGeometry = new THREE.PlaneGeometry(c_width, c_depth);


//     this.causticTexture = textureLoader.load('./textures/caustics/bottle.png', (texture) => {
//       texture.wrapS = THREE.ClampToEdgeWrapping;
//       texture.wrapT = THREE.ClampToEdgeWrapping;
//       texture.minFilter = THREE.LinearFilter;
//       texture.magFilter = THREE.LinearFilter;
//       texture.colorSpace = THREE.SRGBColorSpace;
//         texture.repeat.set(1, 1);   // Растянуть на весь прямоугольник
//   texture.offset.set(0, 0);   // Без смещения
//     });


//     const overlayCausticMaterial = new THREE.MeshPhysicalMaterial({
//       metalness: 0,
//       roughness: 0.8,
//       transmission: 0.1,
//       thickness: 0.2,
//       ior: 1.5,    
//       transparent: true,
//       depthWrite: false,
//       side: THREE.DoubleSide,      
//       alphaTest: 0.1,    
//        color: 0xffffff,
//       alphaMap: this.causticTexture, 
//         emissive: new THREE.Color(0xffffff),        // белое свечение
//       emissiveMap: this.causticTexture,            // та же текстура для свечения
//       emissiveIntensity: 20,                       // увеличь яркость свечения
//     });
    
//     this.causticOverlay = new THREE.Mesh(causticGeometry, overlayCausticMaterial);
//     // Поворачиваем плоскость, чтобы она лежала горизонтально


//     function degreesToRadians(degrees: number): number {
//       return degrees * (Math.PI / 180);
//     }
  
//     const angleX = degreesToRadians(90);
//     const angleZ = degreesToRadians(-45);
//     this.causticOverlay.rotateX(angleX);
//     this.causticOverlay.rotateZ(angleZ);
//     // Смещаем по Y — над столом
//     this.causticOverlay.position.y = tableHeight + 0.1;
//     this.causticOverlay.position.z = -1.5;
//     this.causticOverlay.position.x = -1.5;
//     // Смещаем по Z, чтобы центр меньшей стороны совпал с центром стола
//     // this.causticOverlay.position.z = 2.2;  // смещение вперёд на половину глубины плоскости
//     //    function degreesToRadians(degrees: number): number {
//     //   return degrees * (Math.PI / 180);
//     // }
    
//     // this.causticOverlay.rotation.z = degreesToRadians(90)   // например, 60 градусов вниз



//     this.add(this.causticOverlay);




    // --- Рамка ---

    const frameWidth = width * 0.02;  // 4% от ширины стола
    const frameHeight = 0.04;         // сделаем рамку выше overlay для визуального перекрытия

    // Настройка текстуры рамки
    woodTexture.wrapS = RepeatWrapping;
    woodTexture.wrapT = RepeatWrapping;
    woodTexture.repeat.set(1, 1);

    const frameMaterial = new THREE.MeshPhysicalMaterial({
      // map: woodTexture,
      color: 0x76B1F3,
      metalness: 0.7,
      roughness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.1,
      side: THREE.DoubleSide,
    });

    // Левая рамка
    const leftFrameGeo = new THREE.BoxGeometry(frameWidth, frameHeight, depth + 2 * frameWidth);
    const leftFrame = new THREE.Mesh(leftFrameGeo, frameMaterial);
    leftFrame.position.set(-(width / 2) - (frameWidth / 2), tableHeight + frameHeight / 2, 0);
    leftFrame.castShadow = true;
    leftFrame.receiveShadow = true;
    // this.add(leftFrame);

    // Правая рамка
    const rightFrameGeo = new THREE.BoxGeometry(frameWidth, frameHeight, depth + 2 * frameWidth);
    const rightFrame = new THREE.Mesh(rightFrameGeo, frameMaterial);
    rightFrame.position.set((width / 2) + (frameWidth / 2), tableHeight + frameHeight / 2, 0);
    rightFrame.castShadow = true;
    rightFrame.receiveShadow = true;
    // this.add(rightFrame);

    // Передняя рамка
    const frontFrameGeo = new THREE.BoxGeometry(width, frameHeight, frameWidth);
    const frontFrame = new THREE.Mesh(frontFrameGeo, frameMaterial);
    frontFrame.position.set(0, tableHeight + frameHeight / 2, (depth / 2) + (frameWidth / 2));
    frontFrame.castShadow = true;
    frontFrame.receiveShadow = true;
    // this.add(frontFrame);

    // Задняя рамка
    const backFrameGeo = new THREE.BoxGeometry(width, frameHeight, frameWidth);
    const backFrame = new THREE.Mesh(backFrameGeo, frameMaterial);
    backFrame.position.set(0, tableHeight + frameHeight / 2, -(depth / 2) - (frameWidth / 2));
    backFrame.castShadow = true;
    backFrame.receiveShadow = true;
    // this.add(backFrame);

    // Уменьшаем overlay ровно на ширину рамки
    const overlayWidth = width - 2 * frameWidth;
    const overlayDepth = depth - 2 * frameWidth;

    // this.overlay.geometry.dispose();
    // this.overlay.geometry = new THREE.PlaneGeometry(overlayWidth, overlayDepth);
    // this.overlay.position.set(0, tableHeight + 0.03, 0);

    const wallWidth = width; // с учётом рамки
  const wallGeo = new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness);
  const wallMat = new THREE.MeshPhysicalMaterial({
    map: paperTexture,
    metalness: 0.9,
    displacementMap: plasticDisplacementMap,
    roughness: 0.5,
    clearcoat: 0.1,
    clearcoatRoughness: 0.1,
    reflectivity: 0,
    side: THREE.FrontSide,
  });

  const wall = new THREE.Mesh(wallGeo, wallMat);
  // Позиционируем стену:
  // по Y — чтобы стояла на столе
 wall.position.set(
  -(width / 2) - wallThickness,
  tableHeight + wallHeight / 2,
  0
);
wall.rotation.y = Math.PI / 2; // повернуть на 90 градусов
  wall.castShadow = true;
  wall.receiveShadow = true;

  


  // this.add(wall);
this.overlay.renderOrder = 15;
// this.causticOverlay.renderOrder = 18
  }

//     // Метод для управления смещением каустик-текстуры
//   setCausticsOffset(x: number, y: number) {
//     if (this.causticTexture) {
//       this.causticTexture.offset.set(x, y);
//     }
//   }

//   // Метод для управления масштабом (повторением) каустик-текстуры
//   setCausticsRepeat(x: number, y: number) {
//     if (this.causticTexture) {
//       this.causticTexture.repeat.set(x, y);
//     }
//   }

  // shiftTableToHeight(y: number) {
  //   this.position.y = y - this.tableHeight;
  //   this.updateMatrixWorld(true);
  // }
  
}
