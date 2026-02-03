let spheres = [];
let realMolecule = null;
let draggingRef = null; 
let draggingRotate = false, prevMouseX, prevMouseY;
let scale3D = 1.1;
let rotX = 0.8, rotY = -0.9;
let center;
const CORD_LENGTH = 70;
const BOND_RADIUS = 90;
const BOND_SEPARATION = 9;
let arialFont;

const OVAL_OFFSET = 2;
const OVAL_A = 36;
const OVAL_B = 27;
const OVAL_C = 27;
const RED_RADIUS = 36;

let orientationQuat = new Quaternion(1, 0, 0, 0); 
let cnv; 
let renderScaleMultiplier = 1;
let isMobile = false; 

let isModalOpen = false;

// --- CẤU HÌNH MÀU SẮC CHUẨN ---
const CPK = {
  H: [235, 235, 235],
  C: [70, 70, 70],
  N: [50, 80, 255],
  O: [255, 30, 30],
  F: [155, 235, 90],  
  Cl: [50, 255, 50],
  Br: [180, 50, 50], 
  I: [160, 0, 160],
  P: [255, 140, 0],
  S: [255, 240, 60],
  B: [255, 185, 185], 
  Be: [210, 255, 50],
  Xe: [160, 220, 255], 
  default: [225, 225, 225]
};

const UI_COLORS = {
  ovalFill: [100, 160, 255, 180],
  ovalFillUser: [100, 160, 255, 150],
  electron: [255, 225, 40],
  bond: [200, 200, 200],
  angleArc: [0, 229, 255],
  labelText: [10,10,10]
};

const ELEMENT_LABELS = {
  h2o: ["O", "H", "H"],
  co2: ["C", "O", "O"],
  so2: ["S", "O", "O"],
  becl2: ["Be", "Cl", "Cl"],
  xef2: ["Xe", "F", "F"],
  bf3: ["B", "F", "F", "F"],
  nh3: ["N", "H", "H", "H"],
  pcl3: ["P", "Cl", "Cl", "Cl"],
  clf3: ["Cl", "F", "F", "F"],
  brf3: ["Br", "F", "F", "F"],
  ch4: ["C", "H", "H", "H", "H"],
  sf4: ["S", "F", "F", "F", "F"],
  pcl5: ["P", "Cl", "Cl", "Cl", "Cl", "Cl"],
  brf5: ["Br", "F", "F", "F", "F", "F"],
  sf6: ["S", "F", "F", "F", "F", "F", "F"],
  if7: ["I", "F", "F", "F", "F", "F", "F", "F"],
  "nh4+": ["N", "H", "H", "H", "H"]
};
const CENTRAL_LABELS = {
  h2o: "O", co2: "C", so2: "S", becl2: "Be", xef2: "Xe", bf3: "B", nh3: "N",
  pcl3: "P", clf3: "Cl", brf3: "Br", ch4: "C", sf4: "S", pcl5: "P", brf5: "Br",
  sf6: "S", if7: "I", "nh4+": "N"
};

const STRICT_LINEAR_MOLECULES = ["co2", "becl2"];

const LANG = {
  vi: {
    vseprTitle: "MÔ PHỎNG VSEPR", controlsLabel: "Điều khiển", addLonePair: "Cặp electron",
    singleBond: "Liên kết đơn", doubleBond: "Liên kết đôi", tripleBond: "Liên kết ba",
    objectListLabel: "Danh sách đối tượng:", objectListLabelRight: "Danh sách đối tượng:",
    reset: "Reset", realMolecule: "Phân tử thật", saveImage: "Lưu ảnh",
    turnOn: "Bật", turnOff: "Tắt", angle: "góc", label: "nhãn", autoRotate: "xoay",
    help: "Hướng dẫn", helpTitle: "Hướng Dẫn & Lưu Ý",
    helpUsageTitle: "1. Cách sử dụng",
    helpUsage1: "<strong>Xoay:</strong> Nhấn giữ chuột trái (hoặc chạm 1 ngón) và di chuyển để xoay phân tử.",
    helpUsage2: "<strong>Zoom:</strong> Lăn chuột (hoặc dùng 2 ngón tay) để phóng to/thu nhỏ.",
    helpUsage3: "<strong>Di chuyển đối tượng:</strong> Nhấn giữ chuột trái vào một nguyên tử/cặp e và kéo để di chuyển đối tượng sang vị trí khác.",
    helpUsage4: "<strong>Menu Phải:</strong> Thêm các đối tượng (liên kết đơn, đôi, ba hoặc cặp electron tự do) để tự xây dựng phân tử.",
    helpUsage5: "<strong>Menu Trái:</strong> Chọn phân tử thật có sẵn hoặc các tùy chọn hiển thị.",
    helpDiffTitle: "2. Sự khác biệt về Góc liên kết",
    helpDiffDesc: "Có sự khác biệt giữa <strong>\"Phân tử thật\"</strong> (dữ liệu thực nghiệm) và <strong>\"Mô phỏng VSEPR\"</strong> (khi bạn tự thêm đối tượng):",
    helpDiff1: "<strong>Mô phỏng VSEPR (Sidebar Phải):</strong> Hệ thống chỉ tính toán dựa trên lực đẩy tĩnh điện đơn giản giữa các đám mây electron. Các liên kết và cặp electron được coi là các điểm điện tích đẩy nhau để đạt trạng thái cân bằng hình học lý tưởng.",
    helpDiff2: "<strong>Phân tử thật (Sidebar Trái):</strong> Góc liên kết được lấy từ dữ liệu thực nghiệm. Trong thực tế, các yếu tố như <em>độ âm điện</em>, <em>kích thước nguyên tử</em>, và <em>lai hóa orbital</em> làm cho góc liên kết lệch đi so với lý thuyết VSEPR lý tưởng (Ví dụ: Góc H-O-H trong nước là 104.5° thay vì 109.5° của tứ diện đều).",
    helpDiffNote: "<em>Hãy sử dụng chế độ \"Phân tử thật\" để tham khảo số liệu chính xác, và chế độ tự xây dựng để hiểu nguyên lý lực đẩy VSEPR.</em>",
    helpSource: "<strong>Nguồn dữ liệu:</strong> Các thông số về độ dài liên kết và góc liên kết của các \"Phân tử thật\" được tham khảo từ <em>CRC Handbook of Chemistry and Physics</em> và cơ sở dữ liệu cấu trúc hóa học chuẩn (NIST)."
  },
  en: {
    vseprTitle: "VSEPR SIMULATION", controlsLabel: "Controls", addLonePair: "Electron pair",
    singleBond: "Single bond", doubleBond: "Double bond", tripleBond: "Triple bond",
    objectListLabel: "Objects:", objectListLabelRight: "Objects:", reset: "Reset",
    realMolecule: "Real molecule", saveImage: "Save Image",
    turnOn: "Show", turnOff: "Hide", angle: "angle", label: "label", autoRotate: "auto-rotate",
    help: "Guide / Help", helpTitle: "Guide & Notes",
    helpUsageTitle: "1. How to use",
    helpUsage1: "<strong>Rotate:</strong> Hold left mouse button (or 1 finger touch) and drag to rotate.",
    helpUsage2: "<strong>Zoom:</strong> Scroll mouse wheel (or pinch with 2 fingers) to zoom in/out.",
    helpUsage3: "<strong>Move Object:</strong> Click and hold left mouse button on an atom/electron pair and drag to move the object to another position.",
    helpUsage4: "<strong>Right Menu:</strong> Add objects (single/double/triple bonds or lone pairs) to build your own molecule.",
    helpUsage5: "<strong>Left Menu:</strong> Select preset real molecules or toggle display options.",
    helpDiffTitle: "2. Bond Angle Differences",
    helpDiffDesc: "There is a difference between <strong>\"Real Molecules\"</strong> (experimental data) and <strong>\"VSEPR Simulation\"</strong> (when you build it yourself):",
    helpDiff1: "<strong>VSEPR Simulation (Right Sidebar):</strong> The system calculates geometry based on simple electrostatic repulsion between electron clouds. Bonds and lone pairs are treated as point charges repelling each other to reach an ideal geometric equilibrium.",
    helpDiff2: "<strong>Real Molecule (Left Sidebar):</strong> Bond angles are taken from experimental data. In reality, factors like <em>electronegativity</em>, <em>atomic size</em>, and <em>orbital hybridization</em> cause bond angles to deviate from ideal VSEPR theory (e.g., H-O-H angle in water is 104.5° instead of the ideal tetrahedral 109.5°).",
    helpDiffNote: "<em>Use \"Real Molecule\" mode for accurate data, and build mode to understand VSEPR repulsion principles.</em>",
    helpSource: "<strong>Data Source:</strong> Bond lengths and angles for \"Real Molecules\" are referenced from the <em>CRC Handbook of Chemistry and Physics</em> and standard chemical structure databases (NIST)."
  }
};
let curLang = "vi";

/* === CẤU HÌNH VẬT lý NÂNG CAO === */
const MOLECULES_PRESET = {
  h2o: { bonds: [{theta: radians(52), phi: Math.PI/2, type: "single"}, {theta: radians(128), phi: Math.PI/2, type: "single"}], lonePairs: [{theta: radians(245), phi: Math.PI/2}, {theta: radians(315), phi: Math.PI/2}], physics: { lp_lp: 1.6, lp_bp: 1.208, bp_bp: 1.0 } },
  co2: { bonds: [{theta: 0, phi: Math.PI/2, type: "double"}, {theta: Math.PI, phi: Math.PI/2, type: "double"}], lonePairs: [] },
  so2: { bonds: [{theta: radians(60), phi: Math.PI/2, type: "double"}, {theta: radians(180), phi: Math.PI/2, type: "single"}], lonePairs: [{theta: radians(300), phi: Math.PI/2}], physics: { lp_bp: 1.0, bp_bp: 1.08 } },
  becl2: { bonds: [{theta: 0, phi: Math.PI/2, type: "single"}, {theta: Math.PI, phi: Math.PI/2, type: "single"}], lonePairs: [] },
  xef2: { bonds: [{theta: 0, phi: Math.PI/2, type: "single"}, {theta: Math.PI, phi: Math.PI/2, type: "single"}], lonePairs: [{theta: radians(54), phi: 0.8}, {theta: radians(125), phi: 1.38}, {theta: radians(271), phi: 2.07}], physics: { lp_lp: 2.0, lp_bp: 2.2, bp_bp: 4.0 } },
  bf3: { bonds: [{theta: 0, phi: Math.PI/2, type: "single"}, {theta: (2*Math.PI)/3, phi: Math.PI/2, type: "single"}, {theta: (4*Math.PI)/3, phi: Math.PI/2, type: "single"}], lonePairs: [] },
  nh3: { bonds: [{theta: 0, phi: Math.acos(-1/3), type: "single"}, {theta: Math.PI*2/3, phi: Math.acos(-1/3), type: "single"}, {theta: Math.PI*4/3, phi: Math.acos(-1/3), type: "single"}], lonePairs: [{theta: 0, phi: 0}], physics: { lp_bp: 1.45, bp_bp: 1.38 } },
  pcl3: { bonds: [{theta: 0, phi: Math.acos(-1/3), type: "single"}, {theta: Math.PI*2/3, phi: Math.acos(-1/3), type: "single"}, {theta: Math.PI*4/3, phi: Math.acos(-1/3), type: "single"}], lonePairs: [{theta: 0, phi: 0}], physics: { lp_bp: 1.77, bp_bp: 1.0 } },
  clf3: { bonds: [{theta: radians(0), phi: Math.PI/2, type: "single", posTag: "axial"}, {theta: radians(180), phi: Math.PI/2, type: "single", posTag: "axial"}, {theta: radians(90), phi: Math.PI/2, type: "single", posTag: "equatorial"}], lonePairs: [{theta: radians(210), phi: Math.PI/2}, {theta: radians(330), phi: Math.PI/2}], customPhysics: { lp_lp: 1.1, lp_bp_axial: 1.13, lp_bp_equatorial: 3, bp_bp: 1.43 } },
  brf3: { bonds: [{theta: radians(0), phi: Math.PI/2, type: "single", posTag: "axial"}, {theta: radians(180), phi: Math.PI/2, type: "single", posTag: "axial"}, {theta: radians(90), phi: Math.PI/2, type: "single", posTag: "equatorial"}], lonePairs: [{theta: radians(210), phi: Math.PI/2}, {theta: radians(330), phi: Math.PI/2}], customPhysics: { lp_lp: 1.1, lp_bp_axial: 1.13, lp_bp_equatorial: 2.0, bp_bp: 1.22 } },
  ch4: { bonds: [{theta: 0, phi: 0, type: "single"}, {theta: Math.PI/2, phi: Math.acos(-1/3), type: "single"}, {theta: Math.PI, phi: Math.acos(-1/3), type: "single"}, {theta: 3*Math.PI/2, phi: Math.acos(-1/3), type: "single"}], lonePairs: [] },
  sf4: { bonds: [{theta: radians(0), phi: Math.PI/2, type: "single", posTag: "axial"}, {theta: radians(180), phi: Math.PI/2, type: "single", posTag: "axial"}, {theta: radians(120), phi: Math.PI/2, type: "single", posTag: "equatorial"}, {theta: radians(240), phi: Math.PI/2, type: "single", posTag: "equatorial"}], lonePairs: [{theta: 0, phi: 0.4}], customPhysics: { lp_bp_axial: 2.075, lp_bp_equatorial: 1.4, bp_bp: 1.0 } },
  pcl5: { bonds: [{theta: 0, phi: Math.PI/2, type: "single"}, {theta: 2*Math.PI/3, phi: Math.PI/2, type: "single"}, {theta: 4*Math.PI/3, phi: Math.PI/2, type: "single"}, {theta: 0, phi: 0, type: "single"}, {theta: 0, phi: Math.PI, type: "single"}], lonePairs: [] },
  brf5: { bonds: [{theta: 0, phi: Math.PI/2, type: "single"}, {theta: Math.PI, phi: Math.PI/2, type: "single"}, {theta: Math.PI, phi: Math.PI/2, type: "single"}, {theta: 3*Math.PI/2, phi: Math.PI/2, type: "single"}, {theta: 0, phi: 0, type: "single"}], lonePairs: [{theta: 0, phi: Math.PI}], physics: { lp_bp: 1.8, bp_bp: 1.22 } },
  sf6: { bonds: [{theta: 0, phi: Math.PI/2, type: "single"}, {theta: (2*Math.PI)/3, phi: Math.PI/2, type: "single"}, {theta: (4*Math.PI)/3, phi: Math.PI/2, type: "single"}, {theta: 0, phi: 0, type: "single"}, {theta: 0, phi: Math.PI, type: "single"}, {theta: Math.PI, phi: 0, type: "single"}], lonePairs: [] },
  if7: { bonds: [{theta: 0, phi: Math.acos(0.7559), type: "single"}, {theta: Math.PI/3, phi: Math.acos(0.711), type: "single"}, {theta: 2*Math.PI/3, phi: Math.acos(0.711), type: "single"}, {theta: Math.PI, phi: Math.acos(0.711), type: "single"}, {theta: 4*Math.PI/3, phi: Math.acos(0.711), type: "single"}, {theta: 5*Math.PI/3, phi: Math.acos(0.711), type: "single"}, {theta: 0, phi: 0, type: "single"}], lonePairs: [], physics: { bp_bp: 3.8 } },
  "nh4+": { bonds: [{theta: 0, phi: 0, type: "single"}, {theta: Math.PI/2, phi: Math.acos(-1/3), type: "single"}, {theta: Math.PI, phi: Math.acos(-1/3), type: "single"}, {theta: 3*Math.PI/2, phi: Math.acos(-1/3), type: "single"}], lonePairs: [] }
};

let pointerOnSidebar = false;
let pointerOnSidebarRight = false;
let sphereIdCounter = 1;

let showAngle = false;
let showLabels = false;
let autoRotate = false;

let angleRepresentatives = [];
let dragObjUnit = null;
let dragObjRadius = null;
let lastMoleculeSelect = "";
let moleculePresetIsActive = false;
let useTrackball = true;

function radians(x) { return x * Math.PI / 180; }
function degrees(x) { return x * 180 / Math.PI; }

function getElementColor(sym) {
  if (!sym || typeof sym !== 'string' || sym.length === 0) return CPK.default;
  let s = sym.replace(/[^A-Za-z]/g, "");
  let key = s[0].toUpperCase() + (s.length>1 ? s[1].toLowerCase() : "");
  return CPK[key] || CPK[s[0].toUpperCase()] || CPK.default;
}

function getDetailParams(g) {
  let scaleFactor = constrain(scale3D, 0.5, 4.0);
  let mult = map(scaleFactor, 0.5, 4.0, 0.8, 3.0);
  
  if (g) {
    return { sphereDetailX: 128, sphereDetailY: 128, ellipsoidDetailX: 96, ellipsoidDetailY: 96, cylinderDetail: 64, arcSteps: 140 };
  } else {
    // Chỉ giảm nhẹ trên mobile để đảm bảo vẫn tròn trịa
    if (isMobile || windowWidth < 800) { mult *= 0.8; }
    
    let sd = Math.max(16, Math.round(32 * mult));
    let ed = Math.max(12, Math.round(24 * mult));
    let cd = Math.max(8, Math.round(16 * mult));
    
    if (sd % 2 === 1) sd++; if (ed % 2 === 1) ed++; if (cd % 2 === 1) cd++;
    
    let arc = Math.min(100, Math.max(24, Math.round(24 * mult)));
    return { sphereDetailX: sd, sphereDetailY: sd, ellipsoidDetailX: ed, ellipsoidDetailY: ed, cylinderDetail: cd, arcSteps: arc };
  }
}

function safeInt(v, fallback) {
  if (typeof v === 'number' && isFinite(v)) return Math.max(1, Math.floor(v));
  return fallback || 12;
}

function Quaternion(w, x, y, z) {
  this.w = w === undefined ? 1 : w;
  this.x = x || 0; this.y = y || 0; this.z = z || 0;
}
Quaternion.prototype.copy = function() { return new Quaternion(this.w, this.x, this.y, this.z); };
Quaternion.prototype.mult = function(q) {
  return new Quaternion(
    this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z,
    this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y,
    this.w*q.y - this.x*q.z + this.y*q.w + this.z*q.x,
    this.w*q.z + this.x*q.y - this.y*q.x + this.z*q.w
  );
};
Quaternion.prototype.normalize = function() {
  let mag = Math.sqrt(this.w*this.w+this.x*this.x+this.y*this.y+this.z*this.z);
  if (mag === 0) return this;
  this.w/=mag; this.x/=mag; this.y/=mag; this.z/=mag;
  return this;
};
Quaternion.prototype.multVec = function(vec) {
  let qvec = new Quaternion(0, vec[0], vec[1], vec[2]);
  let res = this.mult(qvec).mult(this.conjugate());
  return [res.x, res.y, res.z];
};
Quaternion.prototype.conjugate = function() { return new Quaternion(this.w, -this.x, -this.y, -this.z); };

function axisAngleQuat(axis, angle) {
  let s = Math.sin(angle/2);
  return new Quaternion(Math.cos(angle/2), axis.x*s, axis.y*s, axis.z*s);
}

function applyQuaternionRotationToG(q, g) {
  if (!q) return; 
  let qw = q.w, qx = q.x, qy = q.y, qz = q.z;
  let angle = 2 * Math.acos(qw);
  let s = Math.sqrt(1 - qw * qw);
  if (s < 0.001) return;
  let axis = createVector(qx/s, qy/s, qz/s);
  if (g) g.rotate(angle, axis);
  else rotate(angle, axis);
}

function preload() {
  try { arialFont = loadFont('Arial.ttf'); } catch (e) { arialFont = null; }
}

function renderObjectList() { return; }

function setup() {
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || windowWidth < 800;

  // Tính toán kích thước canvas chuẩn
  let cW, cH;
  const sidebarW = document.getElementById('sidebar').offsetWidth || 0;
  const sidebarRightW = document.getElementById('sidebar-right').offsetWidth || 0;

  if (windowWidth <= 850) { 
    cW = windowWidth; 
    cH = windowHeight; // Sử dụng windowHeight thay vì 100dvh để tương thích tốt hơn với P5.js
  } else { 
    cW = windowWidth - sidebarW - sidebarRightW; 
    cH = windowHeight; 
  }

  cnv = createCanvas(cW, cH, WEBGL);
  cnv.parent('canvas-container');
  
  // FIX QUAN TRỌNG: Sử dụng pixelDensity mặc định của thiết bị, nhưng giới hạn tối đa là 2
  // Không ép về 1 trên mobile vì có thể làm hình ảnh bị vỡ/mờ trên màn hình Retina
  pixelDensity(Math.min(window.devicePixelRatio, 2));

  center = createVector(0, 0, 0);

  if (arialFont) textFont(arialFont);
  textSize(25);
  textAlign(CENTER, CENTER);

  document.getElementById('addSphereBtn').onclick = () => { addSphere(); };
  document.getElementById('addSingleBondBtn').onclick = () => { addBondSphere("single"); };
  document.getElementById('addDoubleBondBtn').onclick = () => { addBondSphere("double"); };
  document.getElementById('addTripleBondBtn').onclick = () => { addBondSphere("triple"); };

  const angleBtnElem = document.getElementById('angleBtn');
  if (angleBtnElem) angleBtnElem.onclick = () => { showAngle = !showAngle; updateAngleRepresentatives(); updateButtonLabels(); };

  const labelBtnElem = document.getElementById('labelBtn');
  if (labelBtnElem) labelBtnElem.onclick = () => { showLabels = !showLabels; updateButtonLabels(); };

  const resetBtnElem = document.getElementById('resetBtn');
  if (resetBtnElem) resetBtnElem.onclick = resetSystem;

  const autoRotateBtn = document.getElementById('autoRotateBtn');
  if (autoRotateBtn) autoRotateBtn.onclick = () => { autoRotate = !autoRotate; updateButtonLabels(); };

  const saveImgBtn = document.getElementById('saveImgBtn');
  if (saveImgBtn) saveImgBtn.onclick = saveHighResImage;

  const helpBtn = document.getElementById('helpBtn');
  const modal = document.getElementById('help-modal');
  const closeModal = document.querySelector('.close-modal');
  
  if(helpBtn) helpBtn.onclick = () => { 
    if(modal) {
      modal.classList.add('show'); 
      isModalOpen = true; 
    }
  };
  
  const hideModal = () => {
    if(modal) {
      modal.classList.remove('show');
      isModalOpen = false;
    }
  };

  if(closeModal) closeModal.onclick = hideModal;
  
  window.addEventListener('click', (e) => {
    if(modal && e.target === modal) hideModal();
  });

  const sidebar = document.getElementById('sidebar');
  const sidebarRight = document.getElementById('sidebar-right');

  const setSidebarPointer = (val) => { pointerOnSidebar = val; };
  const setSidebarRightPointer = (val) => { pointerOnSidebarRight = val; };

  sidebar.addEventListener('mouseenter', () => setSidebarPointer(true));
  sidebar.addEventListener('mouseleave', () => setSidebarPointer(false));
  sidebar.addEventListener('touchstart', () => setSidebarPointer(true), {passive: true});
  sidebar.addEventListener('touchend', () => setSidebarPointer(false));

  sidebarRight.addEventListener('mouseenter', () => setSidebarRightPointer(true));
  sidebarRight.addEventListener('mouseleave', () => setSidebarRightPointer(false));
  sidebarRight.addEventListener('touchstart', () => setSidebarRightPointer(true), {passive: true});
  sidebarRight.addEventListener('touchend', () => setSidebarRightPointer(false));

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileListBtn = document.getElementById('mobile-list-btn');
  const overlay = document.getElementById('mobile-overlay');
  const closeBtns = document.querySelectorAll('.mobile-close-btn');

  function closeAllMenus() {
    sidebar.classList.remove('open');
    sidebarRight.classList.remove('open');
    overlay.classList.remove('active');
    pointerOnSidebar = false;
    pointerOnSidebarRight = false;
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.onclick = () => {
      sidebar.classList.toggle('open');
      sidebarRight.classList.remove('open');
      if (sidebar.classList.contains('open')) { overlay.classList.add('active'); pointerOnSidebar = true; } else { overlay.classList.remove('active'); }
    };
  }

  if (mobileListBtn) {
    mobileListBtn.onclick = () => {
      sidebarRight.classList.toggle('open');
      sidebar.classList.remove('open');
      if (sidebarRight.classList.contains('open')) { overlay.classList.add('active'); pointerOnSidebarRight = true; } else { overlay.classList.remove('active'); }
    };
  }

  if (overlay) overlay.onclick = closeAllMenus;
  closeBtns.forEach(btn => btn.onclick = closeAllMenus);

  document.getElementById('langSelect').addEventListener('change', function(e){ curLang = this.value; updateButtonLabels(); });

  document.getElementById('moleculeSelect').addEventListener('change', function(e){
    let val = this.value;
    if (val) { lastMoleculeSelect = val; loadRealMolecule(val); updateAddButtonsLock(); }
  });

  renderObjectList();
  updateRightSidebar();
  
  // Thiết lập các thuộc tính WebGL để đảm bảo tương thích tốt nhất
  setAttributes('depth', true);
  setAttributes('alpha', true);
  setAttributes('antialias', true); // Bật khử răng cưa
  setAttributes('perPixelLighting', true);
  
  // FIX QUAN TRỌNG: Điều chỉnh scale ban đầu cho mobile nếu màn hình nhỏ (portrait)
  if (windowWidth < 600) {
    scale3D = 0.85; // Thu nhỏ một chút trên mobile portrait để vừa vặn
  } else {
    scale3D = 1.1;
  }

  orientationQuat = new Quaternion(1,0,0,0);
  updateButtonLabels();
  updateAddButtonsLock();
}

function windowResized() {
  let cW, cH;
  if (windowWidth <= 850) { 
    cW = windowWidth; 
    cH = windowHeight; 
  } else {
    const sidebarW = document.getElementById('sidebar').offsetWidth || 0;
    const sidebarRightW = document.getElementById('sidebar-right').offsetWidth || 0;
    cW = windowWidth - sidebarW - sidebarRightW;
    cH = windowHeight;
  }
  resizeCanvas(cW, cH);
}

function touchMoved() {
  if (isModalOpen || pointerOnSidebar || pointerOnSidebarRight) { return true; } 
  // FIX QUAN TRỌNG: Return false để P5.js bắt sự kiện touch nhưng không cuộn trang
  return false; 
}

function shouldLockAddButtons() {
  const moleculeSelect = document.getElementById('moleculeSelect');
  let val = moleculeSelect.value;
  let preset = MOLECULES_PRESET[val];
  if (val && preset) {
    let requiredCount = (preset.bonds?.length || 0) + (preset.lonePairs?.length || 0);
    if (moleculePresetIsActive && realMolecule && realMolecule.atoms.length === requiredCount) return true;
    if (!moleculePresetIsActive && spheres.length === requiredCount) return true;
  }
  return false;
}

function updateAddButtonsLock() {
  let lock = shouldLockAddButtons();
  ["addSphereBtn", "addSingleBondBtn", "addDoubleBondBtn", "addTripleBondBtn"].forEach(id => {
    let btn = document.getElementById(id);
    if (btn) {
      btn.disabled = lock;
      btn.style.opacity = lock ? "0.45" : "1";
      btn.style.cursor = lock ? "not-allowed" : "pointer";
    }
  });
}

function resetSystem() {
  spheres = [];
  realMolecule = null;
  draggingRef = null;
  draggingRotate = false;
  scale3D = (windowWidth < 600) ? 0.85 : 1.1; // Reset về scale phù hợp
  rotX = 0.8;
  rotY = -0.9;
  orientationQuat = new Quaternion(1, 0, 0, 0);
  sphereIdCounter = 1;
  showAngle = false;
  angleRepresentatives = [];
  showLabels = false;
  moleculePresetIsActive = false;
  autoRotate = false;
  renderObjectList();
  updateRightSidebar();
  setAXnEmFormula();
  let molSelect = document.getElementById('moleculeSelect');
  if (molSelect) molSelect.selectedIndex = 0;
  lastMoleculeSelect = "";
  updateAddButtonsLock();
  updateButtonLabels();
  if (windowWidth <= 850) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-right').classList.remove('open');
    document.getElementById('mobile-overlay').classList.remove('active');
  }
}

function loadRealMolecule(molKey) {
  spheres = [];
  realMolecule = { center: createVector(0,0,0), centralLabel: CENTRAL_LABELS[molKey] || "", atoms: [] };
  moleculePresetIsActive = true;
  let preset = MOLECULES_PRESET[molKey];
  if (!preset) return;
  
  if (preset.customPhysics) realMolecule.customPhysics = preset.customPhysics;
  else if (preset.physics) realMolecule.physics = preset.physics;

  let bondLabels = ELEMENT_LABELS[molKey] || [];
  if (preset.bonds) {
    for (let i = 0; i < preset.bonds.length; i++) {
      let bond = preset.bonds[i];
      let targetUnit = sphericalToCartesian(1, bond.theta, bond.phi).normalize();
      let lbl = (bondLabels[i+1] !== undefined && bondLabels[i+1] !== null && bondLabels[i+1] !== "") ? bondLabels[i+1] : "X";
      realMolecule.atoms.push({
        pos: p5.Vector.mult(targetUnit, BOND_RADIUS),
        dragging: false, visualType: 'outer', bondType: bond.type,
        id: "R" + (sphereIdCounter++), label: lbl, targetUnit: targetUnit,
        posTag: bond.posTag 
      });
    }
  }
  if (preset.lonePairs) {
    for (let i = 0; i < preset.lonePairs.length; i++) {
      let lp = preset.lonePairs[i];
      let targetUnit = sphericalToCartesian(1, lp.theta, lp.phi).normalize();
      realMolecule.atoms.push({
        pos: p5.Vector.mult(targetUnit, CORD_LENGTH),
        dragging: false, visualType: 'oval', id: "R" + (sphereIdCounter++),
        label: "E", targetUnit: targetUnit
      });
    }
  }
  for (let i = 0; i < 600; i++) balancePhysicsForRealMolecule(true);
  updateAngleRepresentatives();
  renderObjectList();
  updateRightSidebar();
  setAXnEmFormula();
  updateAddButtonsLock();
}

function setAXnEmFormula() {
  let activeAtoms = (moleculePresetIsActive && realMolecule) ? realMolecule.atoms : spheres;
  let n = activeAtoms.filter(s => (s && (s.visualType === 'outer' || s.type === 'white'))).length;
  let m = activeAtoms.filter(s => (s && (s.visualType === 'oval' || s.type === 'blue'))).length;
  const elt = document.getElementById('axneFormula');
  if (elt) elt.innerHTML = `AX<sub>${n}</sub>E<sub>${m}</sub>`;
}

function addSphere() {
  if (shouldLockAddButtons()) return;
  spheres.push({
    pos: sphericalToCartesian(CORD_LENGTH, Math.random()*2*Math.PI, Math.random()*Math.PI),
    negative: true, dragging: false, type: 'blue', id: sphereIdCounter++,
    label: "E", source: 'user'
  });
  moleculePresetIsActive = false;
  updateSystemState();
}

function addBondSphere(bondType) {
  if (shouldLockAddButtons()) return;
  spheres.push({
    pos: sphericalToCartesian(BOND_RADIUS, Math.random()*2*Math.PI, Math.random()*Math.PI),
    negative: true, dragging: false, type: "white", bondType, id: sphereIdCounter++,
    label: "X", source: 'user'
  });
  moleculePresetIsActive = false;
  updateSystemState();
}

function updateSystemState() {
  updateAngleRepresentatives();
  renderScene(); 
  renderObjectList();
  updateRightSidebar();
  setAXnEmFormula();
  updateAddButtonsLock();
}

function updateAngleRepresentatives() {
  angleRepresentatives = [];
  let arr = moleculePresetIsActive && realMolecule ? realMolecule.atoms : spheres;
  if (!arr || arr.length < 2) return;

  const validIndices = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] && arr[i].pos) validIndices.push(i);
  }

  let foundAngles = []; 
  const TOLERANCE = 0.05; 

  for (let a = 0; a < validIndices.length; a++) {
    for (let b = a + 1; b < validIndices.length; b++) {
      const i = validIndices[a];
      const j = validIndices[b];
      
      const posA = arr[i].pos;
      const posB = arr[j].pos;
      
      const vA = posA.copy().normalize();
      const vB = posB.copy().normalize();
      const dot = Math.max(-1, Math.min(1, vA.dot(vB)));
      const angle = Math.acos(dot);
      
      if (angle < 0.1) continue;

      if (angle >= radians(170)) {
        let isStrictLinear = false;
        if (moleculePresetIsActive && lastMoleculeSelect) {
           if (STRICT_LINEAR_MOLECULES.includes(lastMoleculeSelect.toLowerCase())) {
             isStrictLinear = true;
           }
        }
        if (!isStrictLinear) continue;
      }
      
      let isRedundantSumAngle = false;
      for (let kIndex = 0; kIndex < validIndices.length; kIndex++) {
        const k = validIndices[kIndex];
        if (k === i || k === j) continue;
        const posC = arr[k].pos;
        if (!posC) continue;
        const vC = posC.copy().normalize();
        let angleAC = Math.acos(Math.max(-1, Math.min(1, vA.dot(vC))));
        let angleCB = Math.acos(Math.max(-1, Math.min(1, vC.dot(vB))));
        if (Math.abs((angleAC + angleCB) - angle) < 0.08) { 
           isRedundantSumAngle = true; break;
        }
      }
      if (isRedundantSumAngle) continue;

      const getGenericType = (atom) => {
        if (atom.visualType === 'oval' || atom.type === 'blue') return 'lone';
        return 'bond';
      };

      const typeA = getGenericType(arr[i]);
      const typeB = getGenericType(arr[j]);
      
      const typePair = [typeA, typeB].sort().join('-');

      const alreadyExists = foundAngles.some(item => {
        return item.typePair === typePair && Math.abs(item.angle - angle) < TOLERANCE;
      });

      if (!alreadyExists) {
        foundAngles.push({ typePair: typePair, angle: angle });
        angleRepresentatives.push([i, j]);
      }
    }
  }
}

function getAngleLabelPosition(arr, idxA, idxB) {
  let aObj = arr[idxA], bObj = arr[idxB];
  if (!aObj || !bObj || !aObj.pos || !bObj.pos) return createVector(0,0,0);
  let vA = aObj.pos.copy(); let vB = bObj.pos.copy();
  let dot = Math.max(-1, Math.min(1, vA.copy().normalize().dot(vB.copy().normalize())));
  let angleRad = Math.acos(dot);
  let unitA = vA.copy().normalize(); 
  let unitB = vB.copy().normalize();
  let n = p5.Vector.cross(unitA, unitB);
  if (n.mag() <= 1e-4) { n = createVector(0, 1, 0).cross(unitA); if (n.mag() < 1e-4) n = createVector(1, 0, 0).cross(unitA); }
  n.normalize();
  let midTheta = angleRad / 2;
  let arcRadius = 55;
  let labelRadius = arcRadius + 15;
  let midV = p5.Vector.mult(unitA, Math.cos(midTheta)).add(p5.Vector.mult(n.cross(unitA), Math.sin(midTheta))).setMag(labelRadius);
  return midV;
}

function getDistToCamera(posWorld) {
  let camZ = (height / 2.0) / Math.tan(Math.PI / 6.0);
  let transformed = createVector(posWorld.x, posWorld.y, posWorld.z);
  if (useTrackball && orientationQuat) {
    let rArr = orientationQuat.multVec([transformed.x, transformed.y, transformed.z]);
    transformed = createVector(rArr[0], rArr[1], rArr[2]);
  } else {
    transformed = rotateVector(transformed, createVector(1, 0, 0), rotX);
    transformed = rotateVector(transformed, createVector(0, 1, 0), rotY);
  }
  transformed.mult(scale3D);
  return dist(transformed.x, transformed.y, transformed.z, 0, 0, camZ);
}

function renderScene(g, options = {}) {
  const prevScale = renderScaleMultiplier;
  renderScaleMultiplier = typeof options.labelScale === "number" ? options.labelScale : 1;
  const sceneScale = typeof options.sceneScale === "number" ? options.sceneScale : 1;

  updateAngleRepresentatives();
  const gfx = g || this;
  const details = getDetailParams(g);
  const useTransparent = options && options.transparent === true;
  
  if (useTransparent) {
    if (gfx.clear) gfx.clear(); else background(0, 0);
  } else {
    if (gfx.background) gfx.background(0); else background(0);
  }

  // FIX QUAN TRỌNG: Kiểm tra nếu gfx không hợp lệ
  if (!gfx) return;

  if (gfx.scale) gfx.scale(scale3D * sceneScale); else scale(scale3D * sceneScale);

  if (g) gfx.push(); else push();

  if (g === undefined) {
    if (autoRotate && !draggingRotate && !draggingRef) {
      if (useTrackball && orientationQuat) {
        let qRot = axisAngleQuat(createVector(0, 1, 0), 0.005);
        orientationQuat = qRot.mult(orientationQuat).normalize();
      } else { rotY += 0.005; }
    }
  }

  if (useTrackball && orientationQuat) {
    applyQuaternionRotationToG(orientationQuat, g);
  } else {
    if (g) { gfx.rotateX(rotX); gfx.rotateY(rotY); }
    else { rotateX(rotX); rotateY(rotY); }
  }

  if (gfx.ambientLight) gfx.ambientLight(130, 130, 130); else ambientLight(130, 130, 130); 
  if (gfx.directionalLight) gfx.directionalLight(180, 180, 180, 0.5, 0.5, -1); else directionalLight(180, 180, 180, 0.5, 0.5, -1); 
  if (gfx.pointLight) gfx.pointLight(40, 40, 40, 0, 0, 300); else pointLight(40, 40, 40, 0, 0, 300);

  // 1. VẼ HÌNH HỌC 3D (QUẢ CẦU, LIÊN KẾT)
  if (moleculePresetIsActive && realMolecule) drawRealCentral(realMolecule.center, g, details);
  else drawCentralPoint(g, details);

  if (!g) {
    balancePhysics(); 
    if (moleculePresetIsActive && realMolecule) balancePhysicsForRealMolecule();
  }

  for(let i=0; i<spheres.length; i++) {
    let s = spheres[i];
    if (!s) continue;
    try {
      if (s.type === 'blue') { drawElectronPairInsideForSphere(s, g, details); drawSphereFromArray(s, false, g, details); }
    } catch (err) {}
  }
  if (moleculePresetIsActive && realMolecule) {
    for (let i=0; i<realMolecule.atoms.length; i++) {
      let s = realMolecule.atoms[i];
      if (!s) continue;
      try {
        if (s.visualType === 'oval') { drawElectronPairInsideForSphere(s, g, details); drawSphereFromArray(s, true, g, details); }
      } catch (err) {}
    }
  }

  for(let i=0; i<spheres.length; i++) {
    let s = spheres[i];
    if (!s) continue;
    try {
      if (s.type !== 'blue') { drawSphereFromArray(s, false, g, details); }
      drawBondFromArray(s, center, g, details);
    } catch (err) {}
  }

  if (moleculePresetIsActive && realMolecule) {
    for (let i=0; i<realMolecule.atoms.length; i++) {
      let s = realMolecule.atoms[i];
      if (!s) continue;
      try {
        if (s.visualType !== 'oval') { drawSphereFromArray(s, true, g, details); }
        drawBondFromArrayReal(s, realMolecule.center, g, details);
      } catch (err) {}
    }
  }

  // 2. VẼ NHÃN VÀ GÓC (TRANSPARENCY SORTING)
  let labelsToDraw = [];

  if (showAngle) {
    let arr = moleculePresetIsActive && realMolecule ? realMolecule.atoms : spheres;
    angleRepresentatives.forEach(pair => {
      if (!arr) return;
      let a = pair[0], b = pair[1];
      if (arr[a] && arr[a].pos && arr[b] && arr[b].pos) {
        let pos = getAngleLabelPosition(arr, a, b);
        let dist = getDistToCamera(pos);
        labelsToDraw.push({ type: 'angle', arr: arr, idxA: a, idxB: b, pos: pos, dist: dist });
      }
    });
  }

  if (showLabels) {
    let centerPos = moleculePresetIsActive && realMolecule ? realMolecule.center : center;
    let centerLabel = "";
    if (moleculePresetIsActive && realMolecule && realMolecule.centralLabel) centerLabel = realMolecule.centralLabel;
    else if (!moleculePresetIsActive && spheres.find(s => s && s.type === "white")) centerLabel = "A";
    
    if (centerLabel) {
      let drawPos = centerPos.copy(); drawPos.z += 50; 
      labelsToDraw.push({ type: 'text', text: centerLabel, pos: centerPos, isCentral: true, dist: getDistToCamera(drawPos) });
    }

    let atomList = moleculePresetIsActive && realMolecule ? realMolecule.atoms : spheres;
    atomList.forEach(s => {
      if (!s) return;
      let shouldDraw = false;
      let labelTxt = s.label || "X";
      if (moleculePresetIsActive) { if (s.visualType === "outer") shouldDraw = true; } 
      else { if (s.type === "white") shouldDraw = true; }
      
      if (shouldDraw) {
        let drawPos = s.pos.copy(); drawPos.z += 45;
        labelsToDraw.push({ type: 'text', text: labelTxt, pos: s.pos, isCentral: false, dist: getDistToCamera(drawPos) });
      }
    });
  }

  labelsToDraw.sort((a, b) => b.dist - a.dist);

  const ctx = (gfx.drawingContext) ? gfx.drawingContext : drawingContext;
  if (ctx && ctx.depthMask) ctx.depthMask(false);

  labelsToDraw.forEach(item => {
    if (item.type === 'angle') {
      drawAngleArcFromArray(item.arr, item.idxA, item.idxB, g, details);
    } else if (item.type === 'text') {
      drawBillboardText(item.text, item.pos, 29, color(0), null, g, details, item.isCentral);
    }
  });

  if (ctx && ctx.depthMask) ctx.depthMask(true);

  if (g) gfx.pop(); else pop();

  renderScaleMultiplier = prevScale;
}

function draw() {
  try { renderScene(); } catch (err) { console.error("Render error:", err); }
}

function getCurrentCameraParams() {
  const r = _renderer;
  const cam = r && r._curCamera;
  if (!cam) {
    const fov = Math.PI / 3;
    const camZ = (height / 2) / Math.tan(fov / 2);
    return { eye: [0, 0, camZ], center: [0, 0, 0], up: [0, 1, 0], fov, near: camZ / 10, far: camZ * 10 };
  }
  return {
    eye: [cam.eyeX, cam.eyeY, cam.eyeZ], center: [cam.centerX, cam.centerY, cam.centerZ],
    up: [cam.upX, cam.upY, cam.upZ], fov: cam._fov || Math.PI / 3,
    near: cam._near || cam._nearPlane || 0.1, far: cam._far || cam._farPlane || 10000
  };
}

function saveHighResImage() {
  try {
    const targetBaseW = 3840; const targetBaseH = 2160;
    const aspect = width / height;
    let w = targetBaseW; let h = Math.round(w / aspect);
    if (h > targetBaseH) { h = targetBaseH; w = Math.round(h * aspect); }

    let gfx = createGraphics(w, h, WEBGL);
    gfx.pixelDensity(1);
    gfx.setAttributes('alpha', true); gfx.setAttributes('antialias', true);
    gfx.setAttributes('perPixelLighting', true); gfx.setAttributes('depth', true);
    if (arialFont) try { gfx.textFont(arialFont); } catch(e){}

    const camParams = getCurrentCameraParams();
    gfx.camera(...camParams.eye, ...camParams.center, ...camParams.up);
    gfx.perspective(camParams.fov, w / h, camParams.near, camParams.far);

    renderScene(gfx, { transparent: true, labelScale: 1, sceneScale: 1.1 });
    
    const dataURL = gfx.elt.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL; link.download = 'vsepr_4k_transparent.png';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    gfx.remove();
  } catch (e) { console.error("Lỗi khi lưu ảnh:", e); alert("Không thể lưu ảnh."); }
}

function drawAllLabels(g, details) { }

function drawBillboardText(txt, pos, size, col, strokeCol, g, details, isCentral = false) {
  const gfx = g || this;
  if (gfx.push) gfx.push(); else push();
  if (!pos) { if (gfx.pop) gfx.pop(); else pop(); return; }
  
  if (gfx.translate) gfx.translate(pos.x, pos.y, pos.z); else translate(pos.x, pos.y, pos.z);

  if (useTrackball && orientationQuat) {
    let qInv = orientationQuat.conjugate();
    applyQuaternionRotationToG(qInv, g);
  } else {
    if (g) { gfx.rotateY(-rotY); gfx.rotateX(-rotX); } else { rotateY(-rotY); rotateX(-rotX); }
  }

  const zOffset = isCentral ? 50 : 45;
  if (gfx.translate) gfx.translate(0, 0, zOffset); else translate(0, 0, zOffset);
  
  if (gfx.specularMaterial) gfx.specularMaterial(0); else specularMaterial(0);
  if (gfx.ambientMaterial) gfx.ambientMaterial(0); else ambientMaterial(0);
  if (gfx.emissiveMaterial) gfx.emissiveMaterial(255); else emissiveMaterial(255);
  
  const strokeWeightScaled = Math.max(1, 4 * renderScaleMultiplier);
  if (strokeCol) {
    if (gfx.stroke) { gfx.stroke(strokeCol); gfx.strokeWeight(strokeWeightScaled); } else { stroke(strokeCol); strokeWeight(strokeWeightScaled); }
  } else {
    if (gfx.stroke) { gfx.stroke(0); gfx.strokeWeight(strokeWeightScaled); } else { stroke(0); strokeWeight(strokeWeightScaled); }
  }

  if (gfx.fill) gfx.fill(col); else fill(col);
  const sizeScaled = Math.max(6, size * renderScaleMultiplier);
  if (gfx.textSize) gfx.textSize(sizeScaled); else textSize(sizeScaled);
  if (gfx.textAlign) gfx.textAlign(CENTER, CENTER); else textAlign(CENTER, CENTER);
  if (gfx.text) gfx.text(txt, 0, 0); else text(txt, 0, 0);

  if (gfx.pop) gfx.pop(); else pop();
}

function drawCentralPoint(g, details) {
  const gfx = g || this;
  const d = details || getDetailParams(g);
  if (gfx.push) gfx.push(); else push();
  if (gfx.noStroke) gfx.noStroke(); else noStroke();
  const nonRealRed = [255, 40, 40]; 
  let colToUse = nonRealRed;
  if (moleculePresetIsActive) {
    colToUse = CPK.default;
    if (realMolecule && realMolecule.centralLabel) colToUse = getElementColor(realMolecule.centralLabel);
  }
  if (gfx.ambientMaterial) gfx.ambientMaterial(...colToUse); else ambientMaterial(...colToUse);
  
  if (gfx.specularMaterial) gfx.specularMaterial(15); else specularMaterial(15); 
  if (gfx.shininess) gfx.shininess(10); else shininess(10);
  
  const sx = safeInt(d.sphereDetailX, 32); const sy = safeInt(d.sphereDetailY, 32);
  try { if (gfx.sphere) gfx.sphere(RED_RADIUS, sx, sy); else sphere(RED_RADIUS, sx, sy); } catch (err) {}
  if (gfx.pop) gfx.pop(); else pop();
}

function drawRealCentral(pos, g, details) {
  const gfx = g || this;
  const d = details || getDetailParams(g);
  if (!pos) return;
  if (gfx.push) gfx.push(); else push();
  if (gfx.translate) gfx.translate(pos.x, pos.y, pos.z); else translate(pos.x, pos.y, pos.z);
  if (gfx.noStroke) gfx.noStroke(); else noStroke();
  let col = CPK.default;
  if (realMolecule && realMolecule.centralLabel) col = getElementColor(realMolecule.centralLabel);
  if (gfx.ambientMaterial) gfx.ambientMaterial(...col); else ambientMaterial(...col);
  
  if (gfx.specularMaterial) gfx.specularMaterial(15); else specularMaterial(15);
  if (gfx.shininess) gfx.shininess(10); else shininess(10);
  
  const sx = safeInt(d.sphereDetailX, 32); const sy = safeInt(d.sphereDetailY, 32);
  try { if (gfx.sphere) gfx.sphere(RED_RADIUS, sx, sy); else sphere(RED_RADIUS, sx, sy); } catch (err) {}
  if (gfx.pop) gfx.pop(); else pop();
}

function drawSphereFromArray(s, isReal, g, details) {
  const gfx = g || this;
  const d = details || getDetailParams(g);
  if (!s || !s.pos) return;
  if (gfx.push) gfx.push(); else push();

  let posToUse = s.pos.copy();
  let isOval = (isReal && s.visualType === 'oval') || (!isReal && s.type === 'blue');
  if (isOval) {
    let offsetVec = p5.Vector.mult(s.pos.copy().normalize(), OVAL_OFFSET);
    posToUse = p5.Vector.add(s.pos.copy(), offsetVec);
  }

  if (gfx.translate) gfx.translate(posToUse.x, posToUse.y, posToUse.z); else translate(posToUse.x, posToUse.y, posToUse.z);

  const sx = safeInt(d.sphereDetailX, 32); const sy = safeInt(d.sphereDetailY, 32);
  const ex = safeInt(d.ellipsoidDetailX, 24); const ey = safeInt(d.ellipsoidDetailY, 24);

  try {
    if (isReal) {
      if (s.visualType === 'oval') {
        const ctx = (g && g.drawingContext) ? g.drawingContext : drawingContext;
        try { if (ctx && ctx.depthMask) ctx.depthMask(false); if (ctx) ctx.enable(ctx.BLEND); ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA); } catch (e) {}
        if (gfx.noStroke) gfx.noStroke(); else noStroke();
        if (gfx.fill) gfx.fill(...UI_COLORS.ovalFill); else fill(...UI_COLORS.ovalFill);
        let toCenter = p5.Vector.mult(posToUse, -1).normalize();
        alignVectorToAxisToG(toCenter, createVector(1, 0, 0), g);
        if (gfx.ellipsoid) gfx.ellipsoid(OVAL_A, OVAL_B, OVAL_C, ex, ey); else ellipsoid(OVAL_A, OVAL_B, OVAL_C, ex, ey);
        try { if (ctx && ctx.depthMask) ctx.depthMask(true); } catch (e) {}
      } else {
        let col = CPK.default; if (s.label) col = getElementColor(s.label);
        if (gfx.ambientMaterial) gfx.ambientMaterial(...col); else ambientMaterial(...col);
        
        let isDark = (col[0] + col[1] + col[2]) < 380;
        let spec = isDark ? 10 : 30;
        if (gfx.specularMaterial) gfx.specularMaterial(spec); else specularMaterial(spec);
        if (gfx.shininess) gfx.shininess(isDark ? 10 : 20); else shininess(isDark ? 10 : 20);
        
        if (gfx.sphere) gfx.sphere(27, sx, sy); else sphere(27, sx, sy);
      }
    } else {
      if (s.type === 'blue') {
        const ctx = (g && g.drawingContext) ? g.drawingContext : drawingContext;
        try { if (ctx && ctx.depthMask) ctx.depthMask(false); if (ctx) ctx.enable(ctx.BLEND); ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA); } catch (e) {}
        if (gfx.noStroke) gfx.noStroke(); else noStroke();
        if (gfx.fill) gfx.fill(...UI_COLORS.ovalFillUser); else fill(...UI_COLORS.ovalFillUser);
        let toCenter = p5.Vector.mult(posToUse, -1).normalize();
        alignVectorToAxisToG(toCenter, createVector(1, 0, 0), g);
        if (gfx.ellipsoid) gfx.ellipsoid(OVAL_A, OVAL_B, OVAL_C, ex, ey); else ellipsoid(OVAL_A, OVAL_B, OVAL_C, ex, ey);
        try { if (ctx && ctx.depthMask) ctx.depthMask(true); } catch (e) {}
      } else {
        if (gfx.ambientMaterial) gfx.ambientMaterial(...CPK.default); else ambientMaterial(...CPK.default);
        if (gfx.specularMaterial) gfx.specularMaterial(30); else specularMaterial(30);
        if (gfx.shininess) gfx.shininess(20); else shininess(20);
        if (gfx.sphere) gfx.sphere(27, sx, sy); else sphere(27, sx, sy);
      }
    }
  } catch (err) {}
  if (gfx.pop) gfx.pop(); else pop();
}

function drawBondFromArray(s, centerVec, g, details) {
  if (!s) return;
  if ((s.type !== "white") && (s.visualType !== 'outer')) return;
  let n = (s.bondType === "triple") ? 3 : (s.bondType === "double" ? 2 : 1);
  drawBondBetweenPoints(centerVec, s.pos, n, g, details);
}

function drawBondFromArrayReal(s, realCenter, g, details) {
  if (!s || s.visualType !== 'outer') return;
  let n = (s.bondType === "triple") ? 3 : (s.bondType === "double" ? 2 : 1);
  drawBondBetweenPoints(realCenter, s.pos, n, g, details);
}

function drawBondBetweenPoints(A, B, num, g, details) {
  const gfx = g || this;
  const d = details || getDetailParams(g);
  if (!A || !B) return;
  let dlen = p5.Vector.dist(A, B);
  let bondVec = p5.Vector.sub(B, A).normalize();
  let mid = p5.Vector.add(A, B).mult(0.5);

  let viewVec;
  if (useTrackball && orientationQuat) {
      let invQ = orientationQuat.conjugate();
      let vArr = invQ.multVec([0, 0, 1]);
      viewVec = createVector(vArr[0], vArr[1], vArr[2]);
  } else {
      viewVec = createVector(0, 0, 1);
      let ry = -rotY;
      let x1 = viewVec.x * Math.cos(ry) + viewVec.z * Math.sin(ry);
      let z1 = -viewVec.x * Math.sin(ry) + viewVec.z * Math.cos(ry);
      viewVec.x = x1; viewVec.z = z1;
      let rx = -rotX;
      let y2 = viewVec.y * Math.cos(rx) - viewVec.z * Math.sin(rx);
      let z2 = viewVec.y * Math.sin(rx) + viewVec.z * Math.cos(rx);
      viewVec.y = y2; viewVec.z = z2;
  }

  let ortho = p5.Vector.cross(bondVec, viewVec);
  if (ortho.mag() < 0.01) {
      ortho = randomOrthogonal(bondVec);
  }
  ortho.normalize();

  const cd = safeInt(d.cylinderDetail, 12);
  for (let i = 0; i < num; i++) {
    let offset = (num === 1) ? 0 : (i - (num-1)/2) * BOND_SEPARATION;
    if (gfx.push) gfx.push(); else push();
    if (gfx.translate) gfx.translate(mid.x + ortho.x*offset, mid.y + ortho.y*offset, mid.z + ortho.z*offset);
    else translate(mid.x + ortho.x*offset, mid.y + ortho.y*offset, mid.z + ortho.z*offset);
    let v1 = createVector(0,1,0);
    let axis = v1.cross(bondVec);
    let angle = Math.acos(Math.max(-1, Math.min(1, v1.dot(bondVec))));
    if (axis.mag() > 1e-6) { if (gfx.rotate) gfx.rotate(angle, axis.normalize()); else rotate(angle, axis.normalize()); }
    else if (v1.dot(bondVec) < -0.99) { if (gfx.rotate) gfx.rotate(Math.PI, createVector(1,0,0)); else rotate(Math.PI, createVector(1,0,0)); }
    try {
      if (gfx.ambientMaterial) gfx.ambientMaterial(...UI_COLORS.bond); else ambientMaterial(...UI_COLORS.bond);
      if (gfx.noStroke) gfx.noStroke(); else noStroke();
      if (gfx.specularMaterial) gfx.specularMaterial(20); else specularMaterial(20);
      if (gfx.shininess) gfx.shininess(15); else shininess(15);
      if (gfx.cylinder) gfx.cylinder(4, dlen, cd); else cylinder(4, dlen, cd);
    } catch (err) {}
    if (gfx.pop) gfx.pop(); else pop();
  }
}

function drawAngleArcFromArray(arr, idxA, idxB, g, details) {
  if (!arr || arr.length === 0) return;
  let aObj = arr[idxA], bObj = arr[idxB];
  if (!aObj || !bObj || !aObj.pos || !bObj.pos) return;
  let vA = aObj.pos.copy(); let vB = bObj.pos.copy();
  let dot = Math.max(-1, Math.min(1, vA.copy().normalize().dot(vB.copy().normalize())));
  let angleRad = Math.acos(dot);
  if (angleRad < 0.05) return;
  let unitA = vA.copy().normalize(); let unitB = vB.copy().normalize();
  
  let arcRadius = 55; 

  let n = p5.Vector.cross(unitA, unitB);
  if (n.mag() <= 1e-4) { n = createVector(0, 1, 0).cross(unitA); if (n.mag() < 1e-4) n = createVector(1, 0, 0).cross(unitA); }
  n.normalize();
  
  const d = details || getDetailParams(g);
  let arcSteps = safeInt(d.arcSteps, 60);
  let vertices = [];

  for (let i = 0; i <= arcSteps; i++) {
    let t = i / arcSteps; let theta = angleRad * t;
    let cost = Math.cos(theta), sint = Math.sin(theta);
    let v = p5.Vector.mult(unitA, cost).add(p5.Vector.mult(n.cross(unitA), sint)).add(p5.Vector.mult(n, n.dot(unitA) * (1 - cost)));
    v.setMag(arcRadius); vertices.push(v);
  }
  const gfx = g || this;
  if (gfx.push) gfx.push(); else push();
  if (gfx.noFill) gfx.noFill(); else noFill();
  if (gfx.stroke) gfx.stroke(...UI_COLORS.angleArc); else stroke(...UI_COLORS.angleArc);
  if (gfx.strokeWeight) gfx.strokeWeight(4); else strokeWeight(4); 
  
  if (gfx.beginShape) { gfx.beginShape(); vertices.forEach(tv => gfx.vertex(tv.x, tv.y, tv.z)); gfx.endShape(); }
  else { beginShape(); vertices.forEach(tv => vertex(tv.x, tv.y, tv.z)); endShape(); }

  let midTheta = angleRad / 2;
  let labelRadius = arcRadius + 15; 
  let midV = p5.Vector.mult(unitA, Math.cos(midTheta)).add(p5.Vector.mult(n.cross(unitA), Math.sin(midTheta))).setMag(labelRadius);
  
  drawBillboardText(nf(degrees(angleRad), 1, 1) + "°", midV, 22, color(255,225,24), color(0, 100), g, details);

  if (gfx.pop) gfx.pop(); else pop();
}

function drawElectronPairInsideForSphere(s, g, details) {
  const gfx = g || this;
  if (!s || !s.pos) return;
  const gap = 14; const rDot = 6;
  let offsetVec = createVector(0,0,0);
  if (s.pos.mag() > 1e-6) offsetVec = p5.Vector.mult(s.pos.copy().normalize(), OVAL_OFFSET);
  const base = p5.Vector.add(s.pos.copy(), offsetVec);
  let toCenter = p5.Vector.mult(base, -1).normalize();
  let perp = p5.Vector.cross(toCenter, createVector(0,1,0));
  if (perp.mag() < 1e-3) perp = p5.Vector.cross(toCenter, createVector(1,0,0));
  perp.normalize();
  let leftPos = p5.Vector.add(base, p5.Vector.mult(perp, -gap/2));
  let rightPos = p5.Vector.add(base, p5.Vector.mult(perp, gap/2));
  const d = details || getDetailParams(g);
  const dotDetail = Math.max(24, Math.floor((d.sphereDetailX || 32) / 3));
  const sx = safeInt(dotDetail, 24); const sy = safeInt(dotDetail, 24);
  [leftPos, rightPos].forEach(pos => {
    try {
      if (gfx.push) gfx.push(); else push();
      if (gfx.translate) gfx.translate(pos.x, pos.y, pos.z); else translate(pos.x, pos.y, pos.z);
      if (gfx.noStroke) gfx.noStroke(); else noStroke();
      if (gfx.ambientMaterial) gfx.ambientMaterial(...UI_COLORS.electron); else ambientMaterial(...UI_COLORS.electron);
      
      if (gfx.specularMaterial) gfx.specularMaterial(40); else specularMaterial(40);
      if (gfx.shininess) gfx.shininess(30); else shininess(30);
      
      if (gfx.sphere) gfx.sphere(rDot, sx, sy); else sphere(rDot, sx, sy);
      if (gfx.pop) gfx.pop(); else pop();
    } catch (e) {}
  });
}

function findHitSphere(mx, my) {
  let candidates = [];
  let camZ = (height / 2.0) / Math.tan(Math.PI / 6.0);
  
  function testArray(arr, whichName) {
    for (let i = 0; i < arr.length; i++) {
      let s = arr[i];
      if (!s || !s.pos) continue;
      
      let v = createVector(s.pos.x, s.pos.y, s.pos.z);
      let rotatedPos;
      
      if (useTrackball && orientationQuat) {
        let rArr = orientationQuat.multVec([v.x, v.y, v.z]);
        rotatedPos = createVector(rArr[0], rArr[1], rArr[2]);
      } else {
        let vX = rotateVector(v, createVector(1, 0, 0), rotX);
        rotatedPos = rotateVector(vX, createVector(0, 1, 0), rotY);
      }
      
      let tx = rotatedPos.x * scale3D;
      let ty = rotatedPos.y * scale3D;
      let tz = rotatedPos.z * scale3D;
      
      let distToCam = camZ - tz;
      if(distToCam < 1) distToCam = 1; 
      let fovFactor = camZ / distToCam; 
      
      let screenX = tx * fovFactor;
      let screenY = ty * fovFactor;
      
      let baseRadius = 27;
      if (s.visualType === 'oval' || s.type === 'blue') baseRadius = Math.max(OVAL_A, OVAL_B);
      let screenRadius = baseRadius * scale3D * fovFactor;
      
      let d = dist(screenX, screenY, mx, my);
      
      if (d < screenRadius * 1.3) {
        candidates.push({ which: whichName, idx: i, z: tz });
      }
    }
  }
  
  testArray(spheres, 'user');
  if (moleculePresetIsActive && realMolecule) testArray(realMolecule.atoms, 'real');
  
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.z - a.z);
  return { which: candidates[0].which, idx: candidates[0].idx };
}

function mousePressed() {
  if (isModalOpen || pointerOnSidebar || pointerOnSidebarRight) return;
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  let best = findHitSphere(mx, my);
  if (best) {
    draggingRef = { which: best.which, idx: best.idx };
    let arr = (best.which === 'user') ? spheres : realMolecule.atoms;
    if (arr && arr[best.idx]) {
      arr[best.idx].dragging = true;
      prevMouseX = mouseX; prevMouseY = mouseY;
      dragObjRadius = arr[best.idx].pos.mag();
      dragObjUnit = p5.Vector.div(arr[best.idx].pos, dragObjRadius);
    } else draggingRef = null;
  } else {
    draggingRotate = true; prevMouseX = mouseX; prevMouseY = mouseY;
  }
}

function mouseDragged() {
  if (isModalOpen || pointerOnSidebar || pointerOnSidebarRight) return;
  if (draggingRef && dragObjUnit) {
    let arr = (draggingRef.which === 'user') ? spheres : realMolecule.atoms;
    if (!arr || !arr[draggingRef.idx]) { draggingRef = null; return; }
    let dx = mouseX - prevMouseX; let dy = mouseY - prevMouseY;
    let v = dragObjUnit.copy();
    let sensitivity = 1.6;
    if (useTrackball && orientationQuat) {
      let q = orientationQuat;
      let yAxis = createVector(...q.multVec([0,1,0])).normalize();
      let xAxis = createVector(...q.multVec([1,0,0])).normalize();
      v = rotateVector(v, yAxis, -dx * sensitivity * Math.PI / width);
      v = rotateVector(v, xAxis, dy * sensitivity * Math.PI / height);
    } else {
      v = rotateVector(v, createVector(0,1,0), -dx * sensitivity * Math.PI / width);
      let X_axis = rotateVector(createVector(1,0,0), createVector(0,1,0), rotY);
      v = rotateVector(v, X_axis, dy * sensitivity * Math.PI / height);
    }
    arr[draggingRef.idx].pos = p5.Vector.mult(v, dragObjRadius);
    dragObjUnit = v.copy().normalize();
    prevMouseX = mouseX; prevMouseY = mouseY;
  } else if (draggingRotate) {
    if (useTrackball) {
      let dx = -(mouseX - prevMouseX); let dy = -(mouseY - prevMouseY);
      let viewportDiag = Math.sqrt(width * width + height * height);
      let normDx = dx / viewportDiag; let normDy = dy / viewportDiag;
      let angle = Math.sqrt(normDx * normDx + normDy * normDy) * Math.PI * 1.2;
      if (angle !== 0) {
        let axis = createVector(normDy, -normDx, 0).normalize();
        let qdrag = axisAngleQuat(axis, angle);
        orientationQuat = qdrag.mult(orientationQuat).normalize();
      }
    } else {
      rotY -= (mouseX - prevMouseX) * 0.01; rotX -= (mouseY - prevMouseY) * 0.01;
    }
    prevMouseX = mouseX; prevMouseY = mouseY;
  }
}

function mouseReleased() {
  if (draggingRef) {
    let arr = (draggingRef.which === 'user') ? spheres : (realMolecule ? realMolecule.atoms : []);
    if (arr && arr[draggingRef.idx]) {
      arr[draggingRef.idx].dragging = false;
      if (draggingRef.which === 'real' && realMolecule && realMolecule.atoms[draggingRef.idx]) {
        realMolecule.atoms[draggingRef.idx].targetUnit = realMolecule.atoms[draggingRef.idx].pos.copy().normalize();
      }
    }
  }
  draggingRef = null; draggingRotate = false;
}

function mouseWheel(event) {
  if (!isModalOpen && !pointerOnSidebar && !pointerOnSidebarRight) {
    scale3D = constrain(scale3D - event.delta * 0.001, 0.2, 4);
  }
}

function balancePhysics(strong = false) {
  const kE = strong ? 12000000 : 3000000;
  const restoreK = strong ? 7.5 : 2.5;
  const moveStep = strong ? 0.36 : 0.12; 
  for (let i = 0; i < spheres.length; i++) {
    let sA = spheres[i];
    if (!sA || sA.dragging) continue;
    let fNetX = 0, fNetY = 0, fNetZ = 0;
    for (let j = 0; j < spheres.length; j++) {
      if (i === j) continue;
      let sB = spheres[j];
      if (!sB) continue;
      let dx = sA.pos.x - sB.pos.x; let dy = sA.pos.y - sB.pos.y; let dz = sA.pos.z - sB.pos.z;
      let d2 = dx*dx + dy*dy + dz*dz;
      let d = Math.sqrt(d2); if (d < 5) d = 5; 
      let factor = kE / (d * d * d);
      fNetX += dx * factor; fNetY += dy * factor; fNetZ += dz * factor;
    }
    let currentMag = Math.sqrt(sA.pos.x*sA.pos.x + sA.pos.y*sA.pos.y + sA.pos.z*sA.pos.z);
    let targetR = (sA.type === "white") ? BOND_RADIUS : CORD_LENGTH;
    if(currentMag < 0.1) currentMag = 0.1;
    let restoreFactor = (targetR - currentMag) * restoreK / currentMag;
    fNetX += sA.pos.x * restoreFactor; fNetY += sA.pos.y * restoreFactor; fNetZ += sA.pos.z * restoreFactor;
    sA.pos.x += fNetX * moveStep; sA.pos.y += fNetY * moveStep; sA.pos.z += fNetZ * moveStep;
    sA.pos.setMag(targetR);
  }
}

function balancePhysicsForRealMolecule(strong = false) {
  if (!realMolecule || !realMolecule.atoms.length) return;
  const atoms = realMolecule.atoms;
  const kE = strong ? 12000000 : 3000000;
  const restoreK = strong ? 7.5 : 2.5;
  const moveStep = strong ? 0.36 : 0.12;

  let physics = realMolecule.physics || { lp_lp: 1.6, lp_bp: 1.25, bp_bp: 1.0 };
  let custom = realMolecule.customPhysics || null;

  let axialConstraintNormal = null;
  if (custom && custom.lp_bp_axial) {
    let eqs = atoms.filter(a => a.posTag === 'equatorial');
    if (eqs.length >= 2) {
      axialConstraintNormal = p5.Vector.sub(eqs[0].pos, eqs[1].pos).normalize();
    }
  }

  for (let i = 0; i < atoms.length; i++) {
    let sA = atoms[i];
    if (!sA || sA.dragging) continue;
    let fNetX = 0, fNetY = 0, fNetZ = 0;
    
    let isLPA = (sA.visualType === 'oval');
    let posTagA = sA.posTag; 

    for (let j = 0; j < atoms.length; j++) {
      if (i === j) continue;
      let sB = atoms[j];
      if (!sB) continue;
      let dx = sA.pos.x - sB.pos.x; let dy = sA.pos.y - sB.pos.y; let dz = sA.pos.z - sB.pos.z;
      let d2 = dx*dx + dy*dy + dz*dz;
      let d = Math.sqrt(d2); if (d < 5) d = 5;
      
      let isLPB = (sB.visualType === 'oval');
      let posTagB = sB.posTag;

      let mult = 1.0;
      
      if (custom) {
        if (isLPA && isLPB) {
            mult = custom.lp_lp || 1.6;
        } else if (!isLPA && !isLPB) {
            mult = custom.bp_bp || 1.0;
        } else {
            let bpTag = isLPA ? posTagB : posTagA; 
            if (bpTag === 'axial' && custom.lp_bp_axial) {
                mult = custom.lp_bp_axial;
            } else if (bpTag === 'equatorial' && custom.lp_bp_equatorial) {
                mult = custom.lp_bp_equatorial;
            } else {
                mult = custom.lp_bp || 1.25; 
            }
        }
      } else {
        if (isLPA && isLPB) mult = physics.lp_lp || 1.6;
        else if (isLPA || isLPB) mult = physics.lp_bp || 1.25;
        else mult = physics.bp_bp || 1.0;
      }

      let factor = (kE * mult) / (d * d * d);
      
      let forceX = dx * factor;
      let forceY = dy * factor;
      let forceZ = dz * factor;

      if (axialConstraintNormal && posTagA === 'axial' && isLPB) {
         let dot = forceX * axialConstraintNormal.x + forceY * axialConstraintNormal.y + forceZ * axialConstraintNormal.z;
         forceX -= dot * axialConstraintNormal.x;
         forceY -= dot * axialConstraintNormal.y;
         forceZ -= dot * axialConstraintNormal.z;
      }

      fNetX += forceX; fNetY += forceY; fNetZ += forceZ;
    }
    let currentMag = sA.pos.mag();
    let targetR = (sA.visualType === 'outer') ? BOND_RADIUS : CORD_LENGTH;
    if (currentMag < 0.1) currentMag = 0.1;
    let restoreFactor = (targetR - currentMag) * restoreK / currentMag;
    fNetX += sA.pos.x * restoreFactor; fNetY += sA.pos.y * restoreFactor; fNetZ += sA.pos.z * restoreFactor;
    sA.pos.x += fNetX * moveStep; sA.pos.y += fNetY * moveStep; sA.pos.z += fNetZ * moveStep;
    sA.pos.setMag(targetR);
  }
}

function alignVectorToAxisToG(targetDir, fromAxis, g) {
  let axis = p5.Vector.cross(fromAxis, targetDir);
  let dot = p5.Vector.dot(fromAxis, targetDir);
  let angle = Math.acos(Math.max(-1, Math.min(1, dot)));
  if (axis.mag() > 1e-6) { if (g) g.rotate(angle, axis.normalize()); else rotate(angle, axis.normalize()); }
  else if (dot < -0.999) { if (g) g.rotate(Math.PI, createVector(0,1,0)); else rotate(Math.PI, createVector(0,1,0)); }
}

function rotateVector(v, axis, angle) {
  let u = axis.copy().normalize();
  let cost = Math.cos(angle), sint = Math.sin(angle);
  return p5.Vector.add(p5.Vector.add(v.copy().mult(cost), u.cross(v).mult(sint)), u.mult(v.dot(u) * (1 - cost)));
}

function sphericalToCartesian(r, theta, phi) {
  return createVector(r*Math.sin(phi)*Math.cos(theta), r*Math.sin(phi)*Math.sin(theta), r*Math.cos(phi));
}

function randomOrthogonal(vec) {
  let rv = Math.abs(vec.x) < 0.5 ? createVector(1, 0, 0) : createVector(0, 1, 0);
  return p5.Vector.cross(vec, rv).normalize();
}

function updateRightSidebar() {
  const list = document.getElementById('objectListRight');
  if(!list) return;
  list.innerHTML = "";
  if (moleculePresetIsActive && realMolecule) {
    if (realMolecule.centralLabel) {
      const centDiv = document.createElement('div');
      centDiv.className = "object-list-item";
      centDiv.innerHTML = `<span class="object-list-label">${realMolecule.centralLabel}</span>`;
      list.appendChild(centDiv);
    }
    realMolecule.atoms.forEach((s, idx) => {
      const div = document.createElement('div');
      div.className = "object-list-item";
      let label = (s.visualType === 'oval') ? ( (curLang === 'en') ? 'Lone pair #' + s.id : 'Cặp electron #' + s.id )
                : ( (curLang === 'en') ? 'Outer atom #' + s.id : 'Liên kết #' + s.id );
      div.innerHTML = `<span class="object-list-label">${label}</span>`;
      div.onclick = ()=> { div.style.background = "#1f2b33"; setTimeout(()=>div.style.background="#131721",120); };
      list.appendChild(div);
    });
  }
  spheres.forEach((s, idx) => {
    const div = document.createElement('div');
    div.className = "object-list-item";
    let label =
      (s.type === "blue") ? ((curLang === "en") ? "Electron pair #" + s.id : "Cặp electron #" + s.id) :
      ((s.bondType === "triple" ? (curLang === "en" ? "Triple bond" : "LK ba") :
        s.bondType === "double" ? (curLang === "en" ? "Double bond" : "LK đôi") :
        (curLang === "en" ? "Single bond" : "LK đơn")) + " #" + s.id );
    div.innerHTML = `<span class="object-list-label">${label}</span>`;
    const btn = document.createElement('button');
    btn.className = "object-x"; btn.textContent = "x";
    btn.onclick = () => { spheres.splice(idx, 1); updateSystemState(); };
    div.appendChild(btn);
    list.appendChild(div);
  });
}

function updateButtonLabels() {
  document.querySelectorAll("[data-translate]").forEach(el=>{
    const key = el.getAttribute("data-translate");
    if(key && LANG[curLang][key]) {
      el.innerHTML = LANG[curLang][key];
    }
  });
  const L = LANG[curLang];
  const anglePrefix = showAngle ? L.turnOff : L.turnOn;
  const labelPrefix = showLabels ? L.turnOff : L.turnOn;
  const rotatePrefix = autoRotate ? L.turnOff : L.turnOn;
  const angleBtn = document.getElementById('angleBtn');
  if(angleBtn) angleBtn.innerText = `${anglePrefix} ${L.angle}`;
  const labelBtn = document.getElementById('labelBtn');
  if(labelBtn) labelBtn.innerText = `${labelPrefix} ${L.label}`;
  const rotateBtn = document.getElementById('autoRotateBtn');
  if(rotateBtn) rotateBtn.innerText = `${rotatePrefix} ${L.autoRotate}`;
  document.querySelectorAll(".sidebar-buttons button").forEach(btn=>{
    if(btn.id === 'resetBtn') btn.innerText = L.reset;
    if(btn.dataset.translate === "addLonePair") btn.innerText = L.addLonePair;
  });
  const molSelect = document.getElementById('moleculeSelect');
  if(molSelect) {
    let opt = molSelect.querySelector('option[data-translate="realMolecule"]');
    if(opt) opt.innerText = L.realMolecule;
  }
  updateRightSidebar();
}

document.addEventListener('contextmenu', e => e.preventDefault());