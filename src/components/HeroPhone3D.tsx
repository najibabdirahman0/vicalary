import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ICON_IMAGES, IMAGES, TapeId } from '../data/tapes';
import { RoutePath } from './SiteMenu';

interface HeroPhone3DProps {
  progressRef: React.MutableRefObject<number>;
  registerRenderTrigger: (fn: (() => void) | null) => void;
  onNavigate?: (path: RoutePath) => void;
  className?: string;
}

type FrontScreenMode = 'landing' | 'dashboard';

type WidgetKey =
  | null
  | 'camera'
  | 'scanner'
  | 'cookbook'
  | 'budget'
  | 'progress'
  | 'milestone'
  | 'meal';

interface HitZone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  action: () => void;
}

interface PurchaseExpense {
  name: string;
  time: string;
  amount: number;
}

interface PhoneAppState {
  screen: FrontScreenMode;
  darkMode: boolean;
  caloriesConsumed: number;
  caloriesGoal: number;
  dailyBudgetAllowance: number;
  budgetSpentToday: number;
  monthlyBudget: number;
  monthlySpent: number;
  selectedDayIdx: number;
  mealIdx: number;
  selectedMood: string;
  activeWidget: WidgetKey;
  // Camera Meal Analysis state (Camera.tsx -> MealAnalysis.tsx)
  cameraStage: 'viewfinder' | 'scanning' | 'analysis';
  cameraPresetIdx: number;
  // Barcode Scanner state (scanner/page.tsx -> ProductDetails.tsx)
  scannerStage: 'reticle' | 'scanning' | 'analysis';
  scannerPresetIdx: number;
  hasBoycottedProduct: boolean;
  boycottCount: number;
  // Cookbook state (Cookbook.tsx -> RecipeDetails.tsx)
  cookStage: 'browse' | 'details';
  cookStepIdx: number;
  cookTab: 'for_you' | 'all';
  // Budget expenses ledger (Budget.tsx)
  recentExpenses: PurchaseExpense[];
  toastText: string | null;
}

const CAMERA_MEAL_PRESETS = [
  {
    name: 'Herb Grilled Chicken Bowl',
    verdict: 'GOOD' as const,
    calories: 520,
    protein: 42,
    carbs: 38,
    fat: 18,
    fiber: 7,
    sugar: 4,
    sodium: 410,
    vitamins: ['Vitamin B6', 'Vitamin C', 'Niacin'],
    minerals: ['Potassium', 'Selenium', 'Iron'],
    items: [
      { name: 'Grilled Chicken', portion: '~170g', kcal: 280 },
      { name: 'Herb Quinoa', portion: '~110g', kcal: 140 },
      { name: 'Garden Greens', portion: '~85g', kcal: 45 },
      { name: 'Olive Glaze', portion: '1 tbsp', kcal: 55 },
    ],
    recommendation:
      'High protein-to-calorie balance keeps you full and fits cleanly inside your 2,000 kcal daily maintenance plan.',
  },
  {
    name: 'Warm Shakshuka & Pita',
    verdict: 'GOOD' as const,
    calories: 410,
    protein: 24,
    carbs: 36,
    fat: 17,
    fiber: 6,
    sugar: 8,
    sodium: 490,
    vitamins: ['Vitamin A', 'Vitamin E', 'Folate'],
    minerals: ['Iron', 'Calcium', 'Zinc'],
    items: [
      { name: 'Poached Eggs (2)', portion: '2 large', kcal: 150 },
      { name: 'Spiced Tomato', portion: '~180g', kcal: 95 },
      { name: 'Whole Pita', portion: '1 piece', kcal: 145 },
      { name: 'Fresh Herbs', portion: 'Garnish', kcal: 20 },
    ],
    recommendation:
      'Balanced morning protein and slow-release carbs to sustain energy without blood sugar spikes.',
  },
];

const SCANNER_PRODUCT_PRESETS = [
  {
    name: 'Barista Oat Beverage',
    brand: 'Oatly Nordic AB',
    barcode: '7394376616020',
    origin: 'Sweden (SE)',
    category: 'Dairy Alternative',
    price: 3.8,
    calories: 120,
    protein: 3,
    carbs: 16,
    fat: 5,
    sugar: 7,
    healthStatus: 'GOOD' as const,
    isFlagged: false,
    ingredients:
      'OAT BASE (WATER, OATS 10%), RAPESEED OIL, DIPOTASSIUM PHOSPHATE, CALCIUM CARBONATE, SALT, VITAMIN D2, RIBOFLAVIN, B12',
    contains: 'CONTAINS: GLUTEN-FREE CERTIFIED OATS • DAIRY-FREE',
    goalHeadline: 'Fits Daily Maintain Plan',
    goalReason: 'Zero lactose, clean fortification, moderate glycemic load.',
    boycottReason: '',
  },
  {
    name: 'Classic Caramel Soda 330ml',
    brand: 'MegaBev Global',
    barcode: '5449000000996',
    origin: 'Global Conglomerate',
    category: 'Carbonated Soft Drink',
    price: 1.95,
    calories: 139,
    protein: 0,
    carbs: 35,
    fat: 0,
    sugar: 35,
    healthStatus: 'POOR' as const,
    isFlagged: true,
    ingredients:
      'CARBONATED WATER, HIGH FRUCTOSE SUGAR, CARAMEL COLOR (E150d), PHOSPHORIC ACID, NATURAL FLAVORS, CAFFEINE',
    contains: 'HIGH ADDED SUGAR: 35G PER CAN (70% DAILY LIMIT)',
    goalHeadline: 'Avoid — Flagged Product',
    goalReason: 'Targeted by consumer boycott campaigns & excessive added sugar.',
    boycottReason:
      'Flagged under active ethical consumer boycott registry due to corporate supply-chain ties.',
  },
];

const COOKBOOK_RECIPES = [
  {
    session: 'LUNCH · 18 MIN',
    title: 'Herb Grilled Chicken',
    macros: '520 kcal · 42g protein',
    kcal: 520,
    protein: 42,
    carbs: 38,
    fat: 18,
    price: 4.2,
    prep: '18 min prep · Halal Certified',
    steps: [
      'Pat 170g chicken breast dry and rub with lemon zest, sumac & olive oil.',
      'Sear 5 min per side on medium-high until internal temp reaches 74°C.',
      'Slice over warm herb quinoa & crisp greens; drizzle citrus pan jus.',
    ],
  },
  {
    session: 'BREAKFAST · 12 MIN',
    title: 'Warm Shakshuka Bowl',
    macros: '410 kcal · 24g protein',
    kcal: 410,
    protein: 24,
    carbs: 36,
    fat: 17,
    price: 3.4,
    prep: '12 min prep · Halal Certified',
    steps: [
      'Saute sweet bell pepper, garlic & cumin in olive oil until fragrant.',
      'Simmer crushed tomatoes 6 min, crack 2 eggs into wells & cover softly.',
      'Finish with fresh parsley and serve warm with toasted whole wheat pita.',
    ],
  },
  {
    session: 'DINNER · 20 MIN',
    title: 'Citrus Glazed Salmon',
    macros: '590 kcal · 46g protein',
    kcal: 590,
    protein: 46,
    carbs: 32,
    fat: 26,
    price: 6.1,
    prep: '20 min prep · Omega-3 Rich',
    steps: [
      'Whisk fresh orange juice, honey, ginger & crushed garlic into a glaze.',
      'Bake salmon fillet at 200°C for 11 min while basting halfway.',
      'Plate alongside steamed broccoli & sesame brown rice.',
    ],
  },
];

function getHijriMonthHeader(): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      month: 'long',
      year: 'numeric',
    }).formatToParts(new Date());
    const month = parts.find((p) => p.type === 'month')?.value || 'Rabi al-Thani';
    const year = parts.find((p) => p.type === 'year')?.value || '1448';
    return `${month.toUpperCase()} ${year} AH`;
  } catch {
    return 'RABI AL-THANI 1448 AH';
  }
}

function getCalendarStripDays(): Array<{ n: string; label: string; type: 'normal' | 'today' | 'milestone' }> {
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date();
  const list: Array<{ n: string; label: string; type: 'normal' | 'today' | 'milestone' }> = [];
  for (let offset = -2; offset <= 2; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    let hijriDay = String(d.getDate());
    try {
      const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
      }).formatToParts(d);
      hijriDay = parts.find((p) => p.type === 'day')?.value || hijriDay;
    } catch {
      // Fallback already set
    }
    list.push({
      n: hijriDay,
      label: offset === 0 ? 'TODAY' : offset === 2 ? 'WK 2' : dayNames[d.getDay()],
      type: offset === 0 ? 'today' : offset === 2 ? 'milestone' : 'normal',
    });
  }
  return list;
}

function smootherStep(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawWrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currY);
      line = words[i] + ' ';
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currY);
  }
  return currY;
}

function drawStatusBar(ctx: CanvasRenderingContext2D, W: number, dark: boolean) {
  const ink = dark ? '#FFFFFF' : '#09101D';
  ctx.save();
  ctx.fillStyle = ink;
  ctx.font = '900 40px "DM Sans", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('9:41', 54, 58);

  // iPhone 18 Pro Max micro Dynamic Pill
  ctx.fillStyle = '#04060A';
  drawRoundedRectPath(ctx, W / 2 - 64, 34, 128, 34, 17);
  ctx.fill();

  ctx.fillStyle = ink;
  const bx = W - 160;
  for (let i = 0; i < 4; i++) {
    const bh = 11 + i * 5;
    ctx.fillRect(bx + i * 11, 70 - bh, 7, bh);
  }
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4.5;
  drawRoundedRectPath(ctx, W - 104, 42, 52, 28, 7);
  ctx.stroke();
  drawRoundedRectPath(ctx, W - 97, 48, 36, 16, 3);
  ctx.fill();
  ctx.restore();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  focusTop = false
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(dw / iw, dh / ih);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (iw - sw) * 0.5;
  const sy = focusTop ? 0 : (ih - sh) * 0.5;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function createRoundedShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function createRoundedScreenGeometry(w: number, h: number, r: number): THREE.ShapeGeometry {
  const shape = createRoundedShape(w, h, r);
  const geo = new THREE.ShapeGeometry(shape, 24);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uv.setXY(i, (px + w / 2) / w, (py + h / 2) / h);
  }
  uv.needsUpdate = true;
  return geo;
}

function createRoundedChassisGeometry(
  w: number,
  h: number,
  r: number,
  depth: number,
  bevelSize: number
): THREE.BufferGeometry {
  const iw = w - bevelSize * 2;
  const ih = h - bevelSize * 2;
  const ir = Math.max(0.05, r - bevelSize);
  const shape = createRoundedShape(iw, ih, ir);

  const rawGeo = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 32,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 14,
  });
  rawGeo.center();
  const indexed = mergeVertices(rawGeo);
  rawGeo.dispose();
  if (
    indexed.index &&
    indexed.attributes.position &&
    indexed.attributes.normal &&
    indexed.attributes.uv
  ) {
    indexed.computeTangents();
  }
  return indexed;
}

// Create clean Apple silhouette + leaf SVG path & 3D Shape (standard 0..1000 space centered at 0,0)
function buildAppleBodyShape(scale: number): THREE.Shape {
  // Normalized iconic bitten Apple silhouette centered near (0,0), Y-up for Three.js Shape
  const s = new THREE.Shape();
  s.moveTo(0.0 * scale, 0.255 * scale);
  s.bezierCurveTo(
    0.08 * scale,
    0.295 * scale,
    0.21 * scale,
    0.295 * scale,
    0.295 * scale,
    0.21 * scale
  );
  s.bezierCurveTo(
    0.345 * scale,
    0.16 * scale,
    0.365 * scale,
    0.105 * scale,
    0.365 * scale,
    0.105 * scale
  );
  // Iconic right-side bite curve
  s.bezierCurveTo(
    0.23 * scale,
    0.04 * scale,
    0.23 * scale,
    -0.135 * scale,
    0.375 * scale,
    -0.21 * scale
  );
  // Lower right hip to base
  s.bezierCurveTo(
    0.34 * scale,
    -0.315 * scale,
    0.26 * scale,
    -0.435 * scale,
    0.165 * scale,
    -0.44 * scale
  );
  s.bezierCurveTo(
    0.095 * scale,
    -0.445 * scale,
    0.055 * scale,
    -0.4 * scale,
    0.0 * scale,
    -0.4 * scale
  );
  // Base left dip
  s.bezierCurveTo(
    -0.055 * scale,
    -0.4 * scale,
    -0.095 * scale,
    -0.445 * scale,
    -0.165 * scale,
    -0.44 * scale
  );
  s.bezierCurveTo(
    -0.275 * scale,
    -0.43 * scale,
    -0.415 * scale,
    -0.22 * scale,
    -0.415 * scale,
    -0.015 * scale
  );
  s.bezierCurveTo(
    -0.415 * scale,
    0.185 * scale,
    -0.275 * scale,
    0.3 * scale,
    -0.155 * scale,
    0.295 * scale
  );
  s.bezierCurveTo(
    -0.08 * scale,
    0.29 * scale,
    -0.04 * scale,
    0.255 * scale,
    0.0 * scale,
    0.255 * scale
  );
  return s;
}

function buildAppleLeafShape(scale: number): THREE.Shape {
  const leaf = new THREE.Shape();
  leaf.moveTo(0.005 * scale, 0.295 * scale);
  leaf.bezierCurveTo(
    0.005 * scale,
    0.425 * scale,
    0.115 * scale,
    0.53 * scale,
    0.225 * scale,
    0.54 * scale
  );
  leaf.bezierCurveTo(
    0.23 * scale,
    0.405 * scale,
    0.115 * scale,
    0.3 * scale,
    0.005 * scale,
    0.295 * scale
  );
  return leaf;
}

// Draw identical crisp Apple icon onto Canvas 2D (Y-down!)
function drawAppleLogoOnCanvas(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.translate(cx, cy);
  const k = size;
  const drawShape = (pts: (ctx: CanvasRenderingContext2D) => void) => {
    ctx.beginPath();
    pts(ctx);
    ctx.closePath();
    ctx.fill();
  };

  // Apple body (Y-down flips sign of Y vs Three.js Y-up!)
  drawShape((c) => {
    c.moveTo(0.0 * k, -0.255 * k);
    c.bezierCurveTo(0.08 * k, -0.295 * k, 0.21 * k, -0.295 * k, 0.295 * k, -0.21 * k);
    c.bezierCurveTo(0.345 * k, -0.16 * k, 0.365 * k, -0.105 * k, 0.365 * k, -0.105 * k);
    c.bezierCurveTo(0.23 * k, -0.04 * k, 0.23 * k, 0.135 * k, 0.375 * k, 0.21 * k);
    c.bezierCurveTo(0.34 * k, 0.315 * k, 0.26 * k, 0.435 * k, 0.165 * k, 0.44 * k);
    c.bezierCurveTo(0.095 * k, 0.445 * k, 0.055 * k, 0.4 * k, 0.0 * k, 0.4 * k);
    c.bezierCurveTo(-0.055 * k, 0.4 * k, -0.095 * k, 0.445 * k, -0.165 * k, 0.44 * k);
    c.bezierCurveTo(-0.275 * k, 0.43 * k, -0.415 * k, 0.22 * k, -0.415 * k, 0.015 * k);
    c.bezierCurveTo(-0.415 * k, -0.185 * k, -0.275 * k, -0.3 * k, -0.155 * k, -0.295 * k);
    c.bezierCurveTo(-0.08 * k, -0.29 * k, -0.04 * k, -0.255 * k, 0.0 * k, -0.255 * k);
  });

  // Leaf on top right
  drawShape((c) => {
    c.moveTo(0.005 * k, -0.295 * k);
    c.bezierCurveTo(0.005 * k, -0.425 * k, 0.115 * k, -0.53 * k, 0.225 * k, -0.54 * k);
    c.bezierCurveTo(0.23 * k, -0.405 * k, 0.115 * k, -0.3 * k, 0.005 * k, -0.295 * k);
  });

  ctx.restore();
}

// iPhone 18 Pro Max Deep Rose-Burgundy Brushed Titanium Rear Texture with Apple Icon & MagSafe Ring
function createIPhone18ProMaxBackTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 2048;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  // Brushed Burgundy Titanium unibody frame matching Pinterest iPhone 18 Pro Max finish
  const bodyGrad = ctx.createLinearGradient(0, 0, W, H);
  bodyGrad.addColorStop(0, '#813c49');
  bodyGrad.addColorStop(0.5, '#682c38');
  bodyGrad.addColorStop(1, '#52202a');
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(0, 0, W, H);

  // Two-tone frosted Ceramic Shield rear MagSafe glass window
  const glassX = 76;
  const glassY = 660;
  const glassW = W - 152;
  const glassH = H - 744;
  const glassGrad = ctx.createLinearGradient(glassX, glassY, glassX + glassW, glassY + glassH);
  glassGrad.addColorStop(0, '#723340');
  glassGrad.addColorStop(0.45, '#5d2632');
  glassGrad.addColorStop(1, '#491b25');
  ctx.fillStyle = glassGrad;
  drawRoundedRectPath(ctx, glassX, glassY, glassW, glassH, 110);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,214,222,0.34)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Micro matte glass grain inside window
  ctx.fillStyle = 'rgba(255,225,232,0.032)';
  for (let i = 0; i < 2000; i++) {
    const px = glassX + ((i * 197) % glassW);
    const py = glassY + ((i * 463) % glassH);
    ctx.fillRect(px, py, 2, 2);
  }

  // Subtle Rose-Champagne metallic MagSafe Ring centered in the glass panel
  const cx = W / 2;
  const cy = glassY + glassH * 0.44;
  ctx.strokeStyle = 'rgba(255,216,224,0.32)';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, 245, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(30,10,14,0.28)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 255, 0, Math.PI * 2);
  ctx.stroke();

  // Alignment magnet bar below MagSafe ring
  ctx.fillStyle = 'rgba(255,216,224,0.34)';
  drawRoundedRectPath(ctx, cx - 11, cy + 286, 22, 84, 11);
  ctx.fill();

  // High-contrast mirror rose-chrome Apple Logo right at center of MagSafe ring
  const appleGrad = ctx.createLinearGradient(cx - 110, cy - 130, cx + 110, cy + 130);
  appleGrad.addColorStop(0, '#F5D0D7');
  appleGrad.addColorStop(0.4, '#C57B89');
  appleGrad.addColorStop(0.75, '#E9B7C0');
  appleGrad.addColorStop(1, '#8C4452');
  ctx.fillStyle = appleGrad;
  drawAppleLogoOnCanvas(ctx, cx, cy + 4, 240);

  // Subtle etched Apple spec text at bottom of titanium edge
  ctx.fillStyle = 'rgba(255,220,226,0.45)';
  ctx.textAlign = 'center';
  ctx.font = '700 22px "DM Sans", system-ui, sans-serif';
  ctx.fillText('iPhone 18 Pro Max', cx, H - 52);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function HeroPhone3D({
  progressRef,
  registerRenderTrigger,
  onNavigate,
  className = '',
}: HeroPhone3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  useEffect(() => {
    const container = mountRef.current;
    if (!container || typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = Math.max(260, container.clientWidth || 380);
    const height = Math.max(360, container.clientHeight || 580);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, width / height, 0.1, 40);
    camera.position.set(0, 0, 8.45);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xffeff2, 0x1e0e14, 0.98);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffeef2, 2.05);
    keyLight.position.set(5.4, 6.8, 6.8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa6eb67, 1.3);
    rimLight.position.set(-5.8, -1.8, -4.5);
    scene.add(rimLight);

    const backFillLight = new THREE.DirectionalLight(0xffd6de, 1.75);
    backFillLight.position.set(3.2, 4.4, -7.2);
    scene.add(backFillLight);

    let areaLeft: THREE.RectAreaLight | null = null;
    let areaRight: THREE.RectAreaLight | null = null;
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      areaLeft = new THREE.RectAreaLight(0xffe6eb, 3.6, 2.2, 7.2);
      areaLeft.position.set(-4.6, 0.4, 3.8);
      areaLeft.lookAt(0, 0, 0);
      scene.add(areaLeft);

      areaRight = new THREE.RectAreaLight(0xffd5de, 3.8, 2.4, 7.2);
      areaRight.position.set(4.6, -0.4, -4.2);
      areaRight.lookAt(0, 0, 0);
      scene.add(areaRight);
    }

    // =========================================================================
    // IPHONE 18 PRO MAX HARDWARE (PINTEREST BURGUNDY ALUMINUM UNIBODY)
    // =========================================================================
    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    const W = 2.02;
    const H = 4.38;
    const R = 0.36;
    const coreDepth = 0.118;
    const bevelSize = 0.017;
    const halfThick = coreDepth / 2 + bevelSize; // ~0.076 slender Pro Max profile

    const titaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0x74303e,
      metalness: 0.9,
      roughness: 0.2,
      anisotropy: 0.85,
      anisotropyRotation: Math.PI * 0.5,
      clearcoat: 0.68,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.65,
    });

    const polishedMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0x8e4251,
      metalness: 0.94,
      roughness: 0.14,
      clearcoat: 0.88,
      clearcoatRoughness: 0.09,
      envMapIntensity: 1.85,
    });

    const mirrorAppleMat = new THREE.MeshPhysicalMaterial({
      color: 0xebbcc5,
      metalness: 0.98,
      roughness: 0.06,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 2.2,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const obsidianGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050609,
      metalness: 0.12,
      roughness: 0.06,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.15,
    });

    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0x3b1820,
      metalness: 0.2,
      roughness: 0.55,
    });

    const opticLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x091632,
      metalness: 0.32,
      roughness: 0.04,
      iridescence: 1.0,
      iridescenceIOR: 1.45,
      clearcoat: 1.0,
      envMapIntensity: 1.6,
    });

    const flashLedMat = new THREE.MeshPhysicalMaterial({
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      clearcoat: 0.9,
    });

    // 1. Sleek Contoured 6.9" Burgundy Unibody Chassis
    const chassisGeo = createRoundedChassisGeometry(W, H, R, coreDepth, bevelSize);
    const chassisMesh = new THREE.Mesh(chassisGeo, titaniumMat);
    phoneGroup.add(chassisMesh);

    // 2. Edge-to-Edge Zero-Lip Ceramic Shield Glass Rim
    const bezelGeo = createRoundedScreenGeometry(W - 0.02, H - 0.02, R - 0.01);
    const frontBezel = new THREE.Mesh(bezelGeo, obsidianGlassMat);
    frontBezel.position.z = halfThick + 0.0007;
    phoneGroup.add(frontBezel);

    // 3. Low-Profile Pinterest Side-Rail Hardware + Flush Antenna Seams + USB-C
    const actionBtnGeo = new THREE.CapsuleGeometry(0.008, 0.14, 6, 12);
    const actionBtn = new THREE.Mesh(actionBtnGeo, polishedMetalMat);
    actionBtn.scale.set(0.65, 1, 1.35);
    actionBtn.position.set(-W / 2 - 0.001, 1.24, 0);
    phoneGroup.add(actionBtn);

    const volBtnGeo = new THREE.CapsuleGeometry(0.008, 0.25, 6, 12);
    const volUpBtn = new THREE.Mesh(volBtnGeo, polishedMetalMat);
    volUpBtn.scale.set(0.65, 1, 1.35);
    volUpBtn.position.set(-W / 2 - 0.001, 0.78, 0);
    phoneGroup.add(volUpBtn);

    const volDownBtn = new THREE.Mesh(volBtnGeo, polishedMetalMat);
    volDownBtn.scale.set(0.65, 1, 1.35);
    volDownBtn.position.set(-W / 2 - 0.001, 0.38, 0);
    phoneGroup.add(volDownBtn);

    const powerBtnGeo = new THREE.CapsuleGeometry(0.008, 0.44, 6, 12);
    const powerBtn = new THREE.Mesh(powerBtnGeo, polishedMetalMat);
    powerBtn.scale.set(0.65, 1, 1.45);
    powerBtn.position.set(W / 2 + 0.001, 0.68, 0);
    phoneGroup.add(powerBtn);

    // Flush recessed sapphire Camera Control track on lower-right rail
    const camCtrlGeo = new THREE.BoxGeometry(0.007, 0.25, 0.044);
    const camCtrlBtn = new THREE.Mesh(camCtrlGeo, antennaMat);
    camCtrlBtn.position.set(W / 2 - 0.001, -0.78, 0);
    phoneGroup.add(camCtrlBtn);

    // Razor-thin flush antenna breaks
    const antennaGeo = new THREE.BoxGeometry(0.008, 0.014, coreDepth + 0.002);
    const antennaPositions: Array<[number, number]> = [
      [-W / 2 + 0.002, H / 2 - 0.45],
      [W / 2 - 0.002, H / 2 - 0.45],
      [-W / 2 + 0.002, -H / 2 + 0.45],
      [W / 2 - 0.002, -H / 2 + 0.45],
    ];
    antennaPositions.forEach(([ax, ay]) => {
      const band = new THREE.Mesh(antennaGeo, antennaMat);
      band.position.set(ax, ay, 0);
      phoneGroup.add(band);
    });

    const usbcRingGeo = new THREE.BoxGeometry(0.25, 0.012, 0.068);
    const usbcRing = new THREE.Mesh(usbcRingGeo, polishedMetalMat);
    usbcRing.position.set(0, -H / 2 + 0.001, 0);
    phoneGroup.add(usbcRing);

    const usbcCavityGeo = new THREE.BoxGeometry(0.21, 0.016, 0.05);
    const usbcCavity = new THREE.Mesh(usbcCavityGeo, antennaMat);
    usbcCavity.position.set(0, -H / 2 - 0.001, 0);
    phoneGroup.add(usbcCavity);

    const grilleDotGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.014, 10);
    const grilleInst = new THREE.InstancedMesh(grilleDotGeo, antennaMat, 10);
    const grilleDummy = new THREE.Object3D();
    let gIdx = 0;
    for (let side = -1; side <= 1; side += 2) {
      for (let k = 0; k < 5; k++) {
        grilleDummy.position.set(side * (0.25 + k * 0.05), -H / 2 + 0.001, 0);
        grilleDummy.updateMatrix();
        grilleInst.setMatrixAt(gIdx++, grilleDummy.matrix);
      }
    }
    grilleInst.instanceMatrix.needsUpdate = true;
    grilleInst.computeBoundingSphere();
    phoneGroup.add(grilleInst);

    // =========================================================================
    // IPHONE 18 PRO MAX BACKSIDE (PRO FUSION MODULE + MIRROR APPLE ICON)
    // =========================================================================
    const backGlassTex = createIPhone18ProMaxBackTexture();
    backGlassTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 1);

    const backGlassMat = new THREE.MeshPhysicalMaterial({
      map: backGlassTex,
      roughness: 0.28,
      metalness: 0.24,
      clearcoat: 0.58,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.4,
    });
    const backGlassPlate = new THREE.Mesh(bezelGeo, backGlassMat);
    backGlassPlate.position.z = -(halfThick + 0.0009);
    backGlassPlate.rotation.y = Math.PI;
    phoneGroup.add(backGlassPlate);

    // Flush-beveled Specular Mirror Rose-Chrome Apple Emblem centered in MagSafe ring
    const appleScale = 0.52;
    const appleBodyGeo = new THREE.ExtrudeGeometry(buildAppleBodyShape(appleScale), {
      depth: 0.004,
      bevelEnabled: false,
      curveSegments: 24,
    });
    const appleLeafGeo = new THREE.ExtrudeGeometry(buildAppleLeafShape(appleScale), {
      depth: 0.004,
      bevelEnabled: false,
      curveSegments: 18,
    });
    const backAppleGroup = new THREE.Group();
    backAppleGroup.position.set(0, -0.32, -(halfThick + 0.0032));
    backAppleGroup.rotation.y = Math.PI;
    backAppleGroup.add(new THREE.Mesh(appleBodyGeo, mirrorAppleMat));
    backAppleGroup.add(new THREE.Mesh(appleLeafGeo, mirrorAppleMat));
    phoneGroup.add(backAppleGroup);

    // iPhone 18 Pro Max Sleek Pro Fusion Camera Module Plateau
    const barW = W - 0.28;
    const barH = 0.88;
    const barY = 1.44;
    const barZ = -(halfThick + 0.012);

    const plateauTrimGeo = createRoundedChassisGeometry(barW + 0.04, barH + 0.04, 0.22, 0.013, 0.009);
    const plateauTrimMesh = new THREE.Mesh(plateauTrimGeo, polishedMetalMat);
    plateauTrimMesh.position.set(0, barY, barZ + 0.004);
    phoneGroup.add(plateauTrimMesh);

    const plateauGlassGeo = createRoundedChassisGeometry(barW, barH, 0.2, 0.015, 0.009);
    const plateauGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x451c25,
      metalness: 0.44,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.6,
    });
    const plateauGlassMesh = new THREE.Mesh(plateauGlassGeo, plateauGlassMat);
    plateauGlassMesh.position.set(0, barY, barZ - 0.003);
    phoneGroup.add(plateauGlassMesh);

    // Low-Profile Precision 48MP Triple-Camera Array
    const lensRingOuterGeo = new THREE.CylinderGeometry(0.165, 0.175, 0.036, 32);
    const lensBarrelGeo = new THREE.CylinderGeometry(0.132, 0.132, 0.042, 32);
    const lensOpticGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.046, 28);

    const lensOffsets: Array<[number, number]> = [
      [0.58, barY + 0.2],  // Upper-Left (Ultra-Wide)
      [0.58, barY - 0.2],  // Lower-Left (Periscope Telephoto)
      [0.21, barY],        // Middle-Right (48MP Fusion Main)
    ];

    lensOffsets.forEach(([lx, ly]) => {
      const collar = new THREE.Mesh(lensRingOuterGeo, polishedMetalMat);
      collar.rotation.x = Math.PI * 0.5;
      collar.position.set(lx, ly, barZ - 0.02);
      phoneGroup.add(collar);

      const barrel = new THREE.Mesh(lensBarrelGeo, obsidianGlassMat);
      barrel.rotation.x = Math.PI * 0.5;
      barrel.position.set(lx, ly, barZ - 0.022);
      phoneGroup.add(barrel);

      const glass = new THREE.Mesh(lensOpticGeo, opticLensMat);
      glass.rotation.x = Math.PI * 0.5;
      glass.position.set(lx, ly, barZ - 0.024);
      phoneGroup.add(glass);
    });

    // True Tone Flash, LiDAR Scanner & Mic on Far Right of Camera Plateau
    const flashCollarGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.014, 24);
    const flashCollar = new THREE.Mesh(flashCollarGeo, flashLedMat);
    flashCollar.rotation.x = Math.PI * 0.5;
    flashCollar.position.set(-0.56, barY + 0.2, barZ - 0.014);
    phoneGroup.add(flashCollar);

    const lidarGeo = new THREE.CylinderGeometry(0.078, 0.078, 0.014, 24);
    const lidarMesh = new THREE.Mesh(lidarGeo, obsidianGlassMat);
    lidarMesh.rotation.x = Math.PI * 0.5;
    lidarMesh.position.set(-0.56, barY - 0.2, barZ - 0.014);
    phoneGroup.add(lidarMesh);

    const micGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.014, 12);
    const micMesh = new THREE.Mesh(micGeo, antennaMat);
    micMesh.rotation.x = Math.PI * 0.5;
    micMesh.position.set(-0.56, barY, barZ - 0.014);
    phoneGroup.add(micMesh);

    // =========================================================================
    // FRONT OLED DISPLAY (UNWASHED TRUE-COLOR INTERACTIVE GITHUB SCREENS)
    // =========================================================================
    const TEX_W = 1024;
    const TEX_H = 2048;
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 1);

    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = TEX_W;
    frontCanvas.height = TEX_H;
    const frontCtx = frontCanvas.getContext('2d')!;
    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.anisotropy = maxAniso;

    const loadedImgs: Record<string, HTMLImageElement | null> = {
      landing: null,
      chicken: null,
      cookingWoman: null,
      foodAllergies: null,
      calmRest: null,
      camera: null,
      scanner: null,
      cook: null,
      budget: null,
    };

    const appState: PhoneAppState = {
      screen: 'landing',
      darkMode: false,
      caloriesConsumed: 1480,
      caloriesGoal: 2000,
      dailyBudgetAllowance: 18.5,
      budgetSpentToday: 4.2,
      monthlyBudget: 555,
      monthlySpent: 142.4,
      selectedDayIdx: 2,
      mealIdx: 0,
      selectedMood: 'Calm',
      activeWidget: null,
      cameraStage: 'analysis',
      cameraPresetIdx: 0,
      scannerStage: 'analysis',
      scannerPresetIdx: 0,
      hasBoycottedProduct: false,
      boycottCount: 14,
      cookStage: 'details',
      cookStepIdx: 0,
      cookTab: 'for_you',
      recentExpenses: [
        { name: 'Herb Chicken Bowl Prep', time: '12:18 PM', amount: 4.2 },
        { name: 'Fresh Mint & Tomatoes', time: '09:05 AM', amount: 2.85 },
      ],
      toastText: null,
    };

    let hoveredZoneId: string | null = null;
    let toastTimer = 0;
    let scanTimeout = 0;
    const frontHitZones: HitZone[] = [];

    const showToast = (msg: string) => {
      appState.toastText = msg;
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        if (!disposed) {
          appState.toastText = null;
          drawFrontScreen();
          requestRender();
        }
      }, 2400);
    };

    const navigateToModule = (id: TapeId) => {
      onNavigateRef.current?.(`/products/${id}`);
    };

    // Landing Screen (app/_pages/Index.tsx from GitHub)
    const drawLandingScreen = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, TEX_W, TEX_H);

      const heroH = Math.round(TEX_H * 0.49);
      ctx.fillStyle = '#F1CA9E';
      ctx.fillRect(0, 0, TEX_W, heroH);

      if (loadedImgs.landing) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, TEX_W, heroH);
        ctx.clip();
        drawCoverImage(ctx, loadedImgs.landing, 0, 0, TEX_W, heroH, true);
        ctx.restore();
      }

      const fadeGrad = ctx.createLinearGradient(0, heroH - 250, 0, heroH);
      fadeGrad.addColorStop(0, 'rgba(255,255,255,0)');
      fadeGrad.addColorStop(0.55, 'rgba(255,255,255,0.78)');
      fadeGrad.addColorStop(1, 'rgba(255,255,255,1)');
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, heroH - 250, TEX_W, 250);

      ctx.fillStyle = '#09101D';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '900 94px "DM Sans", system-ui, sans-serif';
      ctx.fillText('Start Your Journey', TEX_W / 2, heroH + 22);

      ctx.fillStyle = '#1E293B';
      ctx.font = '700 46px "DM Sans", system-ui, sans-serif';
      drawWrapText(
        ctx,
        'Personalized nutrition, halal meal plans & daily food budget.',
        TEX_W / 2,
        heroH + 154,
        TEX_W - 110,
        66
      );

      const ctaX = 64;
      const ctaY = TEX_H - 360;
      const ctaW = TEX_W - 128;
      const ctaH = 180;
      const ctaHovered = hoveredZoneId === 'front-get-started';

      ctx.save();
      ctx.shadowColor = ctaHovered ? 'rgba(19,236,55,0.45)' : 'rgba(9,16,29,0.28)';
      ctx.shadowBlur = ctaHovered ? 36 : 24;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = ctaHovered ? '#0D2F4F' : '#090D12';
      drawRoundedRectPath(ctx, ctaX, ctaY, ctaW, ctaH, 90);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = ctaHovered ? '#13EC37' : '#A6EB67';
      ctx.lineWidth = ctaHovered ? 7 : 4;
      drawRoundedRectPath(ctx, ctaX, ctaY, ctaW, ctaH, 90);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 60px "DM Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Get Started  →', TEX_W / 2, ctaY + ctaH / 2);

      frontHitZones.push({
        id: 'front-get-started',
        x: ctaX - 16,
        y: ctaY - 16,
        w: ctaW + 32,
        h: ctaH + 32,
        action: () => {
          appState.screen = 'dashboard';
          appState.activeWidget = null;
          hoveredZoneId = null;
          drawFrontScreen();
          requestRender();
        },
      });

      ctx.fillStyle = '#0D2F4F';
      ctx.font = '800 34px "DM Sans", system-ui, sans-serif';
      ctx.fillText('Tap Get Started to open Dashboard', TEX_W / 2, TEX_H - 126);

      ctx.fillStyle = '#94A3B8';
      drawRoundedRectPath(ctx, TEX_W / 2 - 140, TEX_H - 52, 280, 12, 6);
      ctx.fill();

      drawStatusBar(ctx, TEX_W, false);
    };

    // GitHub Repo Faithful Feature Views (Camera/MealAnalysis, Scanner/ProductDetails, Cookbook/RecipeDetails, Budget)
    const drawWidgetPreview = (ctx: CanvasRenderingContext2D) => {
      const dark = appState.darkMode;
      const surface = dark ? '#0B141A' : '#FFFFFF';
      const cardBg = dark ? '#162229' : '#F8FAFC';
      const ink = dark ? '#FFFFFF' : '#09101D';
      const muted = dark ? '#CBD5E1' : '#475569';

      ctx.fillStyle = surface;
      ctx.fillRect(0, 0, TEX_W, TEX_H);
      drawStatusBar(ctx, TEX_W, dark);

      // Top Sticky Header matching GitHub repo ("← Dashboard" + Verdict / Status + "Full Module ↗")
      const backHover = hoveredZoneId === 'widget-back';
      ctx.fillStyle = backHover ? '#A6EB67' : cardBg;
      drawRoundedRectPath(ctx, 42, 118, 286, 86, 43);
      ctx.fill();
      ctx.strokeStyle = dark ? '#334155' : '#0D2F4F';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.fillStyle = backHover ? '#09101D' : ink;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 36px "DM Sans", system-ui, sans-serif';
      ctx.fillText('← Dashboard', 185, 161);
      frontHitZones.push({
        id: 'widget-back',
        x: 30,
        y: 106,
        w: 310,
        h: 110,
        action: () => {
          appState.activeWidget = null;
          hoveredZoneId = null;
          drawFrontScreen();
          requestRender();
        },
      });

      const widgetToTape: Record<Exclude<WidgetKey, null>, TapeId> = {
        camera: 'camera',
        scanner: 'scanner',
        cookbook: 'cookbook',
        budget: 'budget',
        progress: 'coach',
        milestone: 'spiritual',
        meal: 'cookbook',
      };
      const targetModule = widgetToTape[appState.activeWidget!];
      const extHover = hoveredZoneId === 'widget-open-module';
      ctx.fillStyle = extHover ? '#13EC37' : '#0D2F4F';
      drawRoundedRectPath(ctx, TEX_W - 404, 118, 362, 86, 43);
      ctx.fill();
      ctx.fillStyle = extHover ? '#09101D' : '#D9F7C4';
      ctx.font = '900 35px "DM Sans", system-ui, sans-serif';
      ctx.fillText('Full Module  ↗', TEX_W - 223, 161);
      frontHitZones.push({
        id: 'widget-open-module',
        x: TEX_W - 416,
        y: 106,
        w: 386,
        h: 110,
        action: () => navigateToModule(targetModule),
      });

      const cardX = 42;
      const cardW = TEX_W - 84;
      const wType = appState.activeWidget;

      // =======================================================================
      // 1. CAMERA + MEAL ANALYSIS (Camera.tsx -> MealAnalysis.tsx from GitHub)
      // =======================================================================
      if (wType === 'camera') {
        const meal = CAMERA_MEAL_PRESETS[appState.cameraPresetIdx];

        if (appState.cameraStage !== 'analysis') {
          // Live Camera Viewfinder with Meal Ready & Analyze Shutter
          ctx.fillStyle = '#090E16';
          drawRoundedRectPath(ctx, cardX, 232, cardW, 1340, 48);
          ctx.fill();

          const img = appState.cameraPresetIdx === 0 ? loadedImgs.chicken : loadedImgs.landing;
          if (img) {
            ctx.save();
            drawRoundedRectPath(ctx, cardX, 232, cardW, 1340, 48);
            ctx.clip();
            drawCoverImage(ctx, img, cardX, 232, cardW, 1340, appState.cameraPresetIdx === 1);
            ctx.restore();
          }

          // Camera scan reticle brackets
          ctx.strokeStyle = appState.cameraStage === 'scanning' ? '#13EC37' : '#FFFFFF';
          ctx.lineWidth = 8;
          const rx = cardX + 120;
          const ry = 480;
          const rw = cardW - 240;
          const rh = 640;
          // Top-left, Top-right, Bottom-left, Bottom-right
          ctx.beginPath();
          ctx.moveTo(rx, ry + 70); ctx.lineTo(rx, ry); ctx.lineTo(rx + 70, ry);
          ctx.moveTo(rx + rw - 70, ry); ctx.lineTo(rx + rw, ry); ctx.lineTo(rx + rw, ry + 70);
          ctx.moveTo(rx, ry + rh - 70); ctx.lineTo(rx, ry + rh); ctx.lineTo(rx + 70, ry + rh);
          ctx.moveTo(rx + rw - 70, ry + rh); ctx.lineTo(rx + rw, ry + rh); ctx.lineTo(rx + rw, ry + rh - 70);
          ctx.stroke();

          ctx.fillStyle = 'rgba(0,0,0,0.72)';
          drawRoundedRectPath(ctx, cardX + 60, 276, cardW - 120, 96, 48);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.font = '900 34px "DM Sans", system-ui, sans-serif';
          ctx.fillText(
            appState.cameraStage === 'scanning'
              ? '✦ Identifying food & macros...'
              : `Detected: ${meal.name}`,
            TEX_W / 2,
            324
          );

          // Bottom Shutter Button -> triggers MealAnalysis
          ctx.fillStyle = hoveredZoneId === 'cam-analyze' ? '#13EC37' : '#A6EB67';
          drawRoundedRectPath(ctx, cardX, 1618, cardW, 152, 76);
          ctx.fill();
          ctx.fillStyle = '#09101D';
          ctx.font = '900 46px "DM Sans", system-ui, sans-serif';
          ctx.fillText('Analyze Meal  ✦', TEX_W / 2, 1694);
          frontHitZones.push({
            id: 'cam-analyze',
            x: cardX,
            y: 1610,
            w: cardW,
            h: 170,
            action: () => {
              appState.cameraStage = 'analysis';
              drawFrontScreen();
              requestRender();
            },
          });
        } else {
          // MealAnalysis.tsx Full Breakdown Screen
          // Top Switch Meal & Verdict Pill
          ctx.fillStyle = '#DCFCE7';
          drawRoundedRectPath(ctx, cardX, 232, 220, 64, 32);
          ctx.fill();
          ctx.fillStyle = '#15803D';
          ctx.textAlign = 'center';
          ctx.font = '900 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`VERDICT: ${meal.verdict}`, cardX + 110, 264);

          ctx.fillStyle = hoveredZoneId === 'cam-switch' ? '#A6EB67' : cardBg;
          drawRoundedRectPath(ctx, cardX + cardW - 340, 232, 340, 64, 32);
          ctx.fill();
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = ink;
          ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
          ctx.fillText('↻ Next Meal Photo', cardX + cardW - 170, 264);
          frontHitZones.push({
            id: 'cam-switch',
            x: cardX + cardW - 348,
            y: 224,
            w: 356,
            h: 82,
            action: () => {
              appState.cameraPresetIdx = (appState.cameraPresetIdx + 1) % CAMERA_MEAL_PRESETS.length;
              appState.cameraStage = 'analysis';
              drawFrontScreen();
              requestRender();
            },
          });

          // Meal Photograph Banner (MealAnalysis.tsx)
          const imgY = 320;
          const imgH = 380;
          ctx.fillStyle = '#0F172A';
          drawRoundedRectPath(ctx, cardX, imgY, cardW, imgH, 42);
          ctx.fill();
          const mealImg = appState.cameraPresetIdx === 0 ? loadedImgs.chicken : loadedImgs.landing;
          if (mealImg) {
            ctx.save();
            drawRoundedRectPath(ctx, cardX, imgY, cardW, imgH, 42);
            ctx.clip();
            drawCoverImage(ctx, mealImg, cardX, imgY, cardW, imgH, appState.cameraPresetIdx === 1);
            ctx.restore();
          }
          const grad = ctx.createLinearGradient(0, imgY + 120, 0, imgY + imgH);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, 'rgba(0,0,0,0.88)');
          ctx.fillStyle = grad;
          drawRoundedRectPath(ctx, cardX, imgY, cardW, imgH, 42);
          ctx.fill();

          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 48px "DM Sans", system-ui, sans-serif';
          ctx.fillText(meal.name, cardX + 34, imgY + 236);
          ctx.fillStyle = '#13EC37';
          ctx.font = '800 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText('✦ Multi-food visual analysis', cardX + 34, imgY + 306);

          // Identified Meal Components Row (matching MealAnalysis horizontal component tiles)
          const itemY = 724;
          const itemW = (cardW - 42) / 4;
          meal.items.forEach((it, idx) => {
            const ix = cardX + idx * (itemW + 14);
            ctx.fillStyle = cardBg;
            drawRoundedRectPath(ctx, ix, itemY, itemW, 200, 26);
            ctx.fill();
            ctx.strokeStyle = dark ? '#334155' : '#E2E8F0';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.fillStyle = ink;
            ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
            ctx.fillText(it.name.split(' ')[0], ix + itemW / 2, itemY + 28);
            ctx.fillStyle = muted;
            ctx.font = '700 24px "DM Sans", system-ui, sans-serif';
            ctx.fillText(it.portion, ix + itemW / 2, itemY + 78);
            ctx.fillStyle = '#16A34A';
            ctx.font = '900 34px "DM Sans", system-ui, sans-serif';
            ctx.fillText(`${it.kcal}`, ix + itemW / 2, itemY + 124);
            ctx.font = '700 22px "DM Sans", system-ui, sans-serif';
            ctx.fillText('kcal', ix + itemW / 2, itemY + 162);
          });

          // Dark TOTAL Bar (MealAnalysis.tsx exact style)
          ctx.fillStyle = '#0F172A';
          drawRoundedRectPath(ctx, cardX, 946, cardW, 92, 26);
          ctx.fill();
          ctx.textAlign = 'left';
          ctx.fillStyle = '#94A3B8';
          ctx.font = '900 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText('TOTAL IDENTIFIED', cardX + 32, 976);
          ctx.textAlign = 'right';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 44px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`${meal.calories} kcal`, cardX + cardW - 32, 968);

          // 6-Macro Grid (Protein, Carbs, Fat, Fiber, Sugar, Sodium)
          const macroY = 1062;
          const mW = (cardW - 36) / 3;
          const macros = [
            { l: 'PROTEIN', v: `${meal.protein}g` },
            { l: 'CARBS', v: `${meal.carbs}g` },
            { l: 'FAT', v: `${meal.fat}g` },
            { l: 'FIBER', v: `${meal.fiber}g` },
            { l: 'SUGAR', v: `${meal.sugar}g` },
            { l: 'SODIUM', v: `${meal.sodium}mg` },
          ];
          macros.forEach((m, i) => {
            const mx = cardX + (i % 3) * (mW + 18);
            const my = macroY + Math.floor(i / 3) * 136;
            ctx.fillStyle = cardBg;
            drawRoundedRectPath(ctx, mx, my, mW, 120, 24);
            ctx.fill();
            ctx.strokeStyle = dark ? '#334155' : '#E2E8F0';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.fillStyle = muted;
            ctx.font = '800 24px "DM Sans", system-ui, sans-serif';
            ctx.fillText(m.l, mx + mW / 2, my + 22);
            ctx.fillStyle = ink;
            ctx.font = '900 42px "DM Sans", system-ui, sans-serif';
            ctx.fillText(m.v, mx + mW / 2, my + 58);
          });

          // Recommended For Plan & Vitamins Card
          ctx.fillStyle = dark ? '#112A20' : '#ECFDF5';
          drawRoundedRectPath(ctx, cardX, 1344, cardW, 290, 34);
          ctx.fill();
          ctx.strokeStyle = '#86EFAC';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.textAlign = 'left';
          ctx.fillStyle = dark ? '#86EFAC' : '#065F46';
          ctx.font = '900 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText('✓ RECOMMENDED FOR YOUR PLAN', cardX + 30, 1374);
          ctx.fillStyle = ink;
          ctx.font = '700 32px "DM Sans", system-ui, sans-serif';
          drawWrapText(ctx, meal.recommendation, cardX + 30, 1430, cardW - 60, 44);
          ctx.fillStyle = dark ? '#A6EB67' : '#047857';
          ctx.font = '800 28px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`Vitamins: ${meal.vitamins.join(' · ')}`, cardX + 30, 1574);

          // Log Meal CTA + Retake
          ctx.fillStyle = hoveredZoneId === 'cam-log-meal' ? '#0D2F4F' : '#13EC37';
          drawRoundedRectPath(ctx, cardX, 1666, cardW, 134, 67);
          ctx.fill();
          ctx.fillStyle = hoveredZoneId === 'cam-log-meal' ? '#FFFFFF' : '#09101D';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 44px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`✓ Log Meal (+${meal.calories} kcal)`, TEX_W / 2, 1733);
          frontHitZones.push({
            id: 'cam-log-meal',
            x: cardX,
            y: 1656,
            w: cardW,
            h: 156,
            action: () => {
              appState.caloriesConsumed = Math.min(2600, appState.caloriesConsumed + meal.calories);
              appState.activeWidget = null;
              showToast(`Logged ${meal.name} (+${meal.calories} kcal)!`);
              drawFrontScreen();
              requestRender();
            },
          });

          ctx.fillStyle = muted;
          ctx.font = '800 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText('Tap to retake camera scan', TEX_W / 2, 1852);
          frontHitZones.push({
            id: 'cam-retake',
            x: cardX + 180,
            y: 1816,
            w: cardW - 360,
            h: 72,
            action: () => {
              appState.cameraStage = 'viewfinder';
              drawFrontScreen();
              requestRender();
            },
          });
        }
      }

      // =======================================================================
      // 2. BARCODE SCANNER -> PRODUCT DETAILS (ProductDetails.tsx from GitHub)
      // =======================================================================
      else if (wType === 'scanner') {
        const prod = SCANNER_PRODUCT_PRESETS[appState.scannerPresetIdx];

        if (appState.scannerStage !== 'analysis') {
          ctx.fillStyle = '#09101D';
          drawRoundedRectPath(ctx, cardX, 232, cardW, 1340, 48);
          ctx.fill();

          if (loadedImgs.foodAllergies) {
            ctx.save();
            drawRoundedRectPath(ctx, cardX, 232, cardW, 1340, 48);
            ctx.clip();
            drawCoverImage(ctx, loadedImgs.foodAllergies, cardX, 232, cardW, 1340);
            ctx.restore();
          }

          ctx.fillStyle = 'rgba(9,16,29,0.52)';
          drawRoundedRectPath(ctx, cardX, 232, cardW, 1340, 48);
          ctx.fill();

          // Red Barcode Laser Line
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(cardX + 90, 900);
          ctx.lineTo(cardX + cardW - 90, 900);
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.font = '900 44px monospace';
          ctx.fillText(prod.barcode, TEX_W / 2, 790);
          ctx.font = '800 34px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`Aligning barcode: ${prod.name}`, TEX_W / 2, 990);

          ctx.fillStyle = hoveredZoneId === 'scan-decode' ? '#A6EB67' : '#CBE8FF';
          drawRoundedRectPath(ctx, cardX, 1618, cardW, 152, 76);
          ctx.fill();
          ctx.fillStyle = '#09101D';
          ctx.font = '900 46px "DM Sans", system-ui, sans-serif';
          ctx.fillText('Decode Barcode  ▮▯▮', TEX_W / 2, 1694);
          frontHitZones.push({
            id: 'scan-decode',
            x: cardX,
            y: 1610,
            w: cardW,
            h: 170,
            action: () => {
              appState.scannerStage = 'analysis';
              drawFrontScreen();
              requestRender();
            },
          });
        } else {
          // ProductDetails.tsx Full Analysis
          const isFlagged = prod.isFlagged;
          ctx.fillStyle = isFlagged ? '#FEE2E2' : '#DCFCE7';
          drawRoundedRectPath(ctx, cardX, 232, 230, 64, 32);
          ctx.fill();
          ctx.fillStyle = isFlagged ? '#B91C1C' : '#15803D';
          ctx.textAlign = 'center';
          ctx.font = '900 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText(isFlagged ? 'AVOID / FLAGGED' : 'GOOD · SAFE', cardX + 115, 264);

          ctx.fillStyle = hoveredZoneId === 'scan-switch' ? '#A6EB67' : cardBg;
          drawRoundedRectPath(ctx, cardX + cardW - 380, 232, 380, 64, 32);
          ctx.fill();
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = ink;
          ctx.font = '900 27px "DM Sans", system-ui, sans-serif';
          ctx.fillText('↻ Test Next Barcode', cardX + cardW - 190, 264);
          frontHitZones.push({
            id: 'scan-switch',
            x: cardX + cardW - 388,
            y: 224,
            w: 396,
            h: 82,
            action: () => {
              appState.scannerPresetIdx =
                (appState.scannerPresetIdx + 1) % SCANNER_PRODUCT_PRESETS.length;
              appState.hasBoycottedProduct = false;
              drawFrontScreen();
              requestRender();
            },
          });

          // Product Banner
          const banY = 320;
          const banH = 340;
          ctx.fillStyle = '#0F172A';
          drawRoundedRectPath(ctx, cardX, banY, cardW, banH, 40);
          ctx.fill();
          if (loadedImgs.foodAllergies) {
            ctx.save();
            drawRoundedRectPath(ctx, cardX, banY, cardW, banH, 40);
            ctx.clip();
            drawCoverImage(ctx, loadedImgs.foodAllergies, cardX, banY, cardW, banH);
            ctx.restore();
          }
          const grad = ctx.createLinearGradient(0, banY + 60, 0, banY + banH);
          grad.addColorStop(0, 'rgba(9,16,29,0.2)');
          grad.addColorStop(1, 'rgba(9,16,29,0.92)');
          ctx.fillStyle = grad;
          drawRoundedRectPath(ctx, cardX, banY, cardW, banH, 40);
          ctx.fill();

          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#93C5FD';
          ctx.font = '800 28px monospace';
          ctx.fillText(`${prod.origin} · #${prod.barcode}`, cardX + 32, banY + 32);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 48px "DM Sans", system-ui, sans-serif';
          ctx.fillText(prod.name, cardX + 32, banY + 196);
          ctx.fillStyle = '#A6EB67';
          ctx.font = '800 32px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`Brand: ${prod.brand} · $${prod.price.toFixed(2)}`, cardX + 32, banY + 264);

          if (isFlagged) {
            // Ethical Solidarity / Boycott Card (ProductDetails.tsx lines 555-605)
            ctx.fillStyle = dark ? '#3B1117' : '#FFF1F2';
            drawRoundedRectPath(ctx, cardX, 688, cardW, 380, 36);
            ctx.fill();
            ctx.strokeStyle = '#FB7185';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#BE123C';
            ctx.font = '900 34px "DM Sans", system-ui, sans-serif';
            ctx.fillText('⚠ ETHICAL BOYCOTT ALERT', cardX + 32, 722);
            ctx.fillStyle = ink;
            ctx.font = '700 32px "DM Sans", system-ui, sans-serif';
            drawWrapText(ctx, prod.boycottReason, cardX + 32, 782, cardW - 64, 44);

            // Community Boycott Button
            ctx.fillStyle = appState.hasBoycottedProduct ? '#9F1239' : '#FFE4E6';
            drawRoundedRectPath(ctx, cardX + 32, 954, cardW - 64, 86, 26);
            ctx.fill();
            ctx.fillStyle = appState.hasBoycottedProduct ? '#FFFFFF' : '#9F1239';
            ctx.textAlign = 'center';
            ctx.font = '900 34px "DM Sans", system-ui, sans-serif';
            ctx.fillText(
              appState.hasBoycottedProduct
                ? `✊ Boycotted (${appState.boycottCount})`
                : `✊ Boycott This Product (${appState.boycottCount})`,
              TEX_W / 2,
              982
            );
            frontHitZones.push({
              id: 'scan-boycott',
              x: cardX + 26,
              y: 944,
              w: cardW - 52,
              h: 106,
              action: () => {
                if (!appState.hasBoycottedProduct) {
                  appState.hasBoycottedProduct = true;
                  appState.boycottCount += 1;
                  showToast('Marked as boycotted (+5 Pts)');
                }
                drawFrontScreen();
                requestRender();
              },
            });
          } else {
            // Goal Fit & Safety Card
            ctx.fillStyle = dark ? '#112A20' : '#ECFDF5';
            drawRoundedRectPath(ctx, cardX, 688, cardW, 232, 34);
            ctx.fill();
            ctx.strokeStyle = '#6EE7B7';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = dark ? '#86EFAC' : '#047857';
            ctx.font = '900 32px "DM Sans", system-ui, sans-serif';
            ctx.fillText(`✓ ${prod.goalHeadline.toUpperCase()}`, cardX + 30, 720);
            ctx.fillStyle = ink;
            ctx.font = '700 32px "DM Sans", system-ui, sans-serif';
            drawWrapText(ctx, prod.goalReason, cardX + 30, 780, cardW - 60, 44);
          }

          // Factory Ingredients Statement Box (ProductDetails.tsx lines 627-662)
          const ingY = isFlagged ? 1094 : 944;
          ctx.fillStyle = cardBg;
          drawRoundedRectPath(ctx, cardX, ingY, cardW, 380, 34);
          ctx.fill();
          ctx.strokeStyle = dark ? '#334155' : '#CBD5E1';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.fillStyle = muted;
          ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
          ctx.fillText('FACTORY INGREDIENTS STATEMENT · VERIFIED', cardX + 30, ingY + 28);
          ctx.fillStyle = ink;
          ctx.font = '700 27px monospace';
          drawWrapText(ctx, prod.ingredients, cardX + 30, ingY + 82, cardW - 60, 38);
          ctx.fillStyle = isFlagged ? '#E11D48' : '#0284C7';
          ctx.font = '900 26px monospace';
          ctx.fillText(prod.contains, cardX + 30, ingY + 318);

          // Nutrition Summary Strip
          const nutY = ingY + 402;
          const nW = (cardW - 36) / 3;
          [
            { l: 'CALORIES', v: `${prod.calories}` },
            { l: 'CARBS', v: `${prod.carbs}g` },
            { l: 'SUGAR', v: `${prod.sugar}g` },
          ].forEach((n, idx) => {
            const nx = cardX + idx * (nW + 18);
            ctx.fillStyle = cardBg;
            drawRoundedRectPath(ctx, nx, nutY, nW, 130, 26);
            ctx.fill();
            ctx.strokeStyle = dark ? '#334155' : '#E2E8F0';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.textAlign = 'center';
            ctx.fillStyle = muted;
            ctx.font = '800 24px "DM Sans", system-ui, sans-serif';
            ctx.fillText(n.l, nx + nW / 2, nutY + 24);
            ctx.fillStyle = ink;
            ctx.font = '900 44px "DM Sans", system-ui, sans-serif';
            ctx.fillText(n.v, nx + nW / 2, nutY + 62);
          });

          // Log & Deduct From Budget CTA (ProductDetails.tsx handleConfirmLog!)
          ctx.fillStyle = hoveredZoneId === 'scan-log-budget' ? '#0D2F4F' : '#13EC37';
          drawRoundedRectPath(ctx, cardX, 1666, cardW, 134, 67);
          ctx.fill();
          ctx.fillStyle = hoveredZoneId === 'scan-log-budget' ? '#FFFFFF' : '#09101D';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 42px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`Log Purchase (−$${prod.price.toFixed(2)} Budget)`, TEX_W / 2, 1733);
          frontHitZones.push({
            id: 'scan-log-budget',
            x: cardX,
            y: 1656,
            w: cardW,
            h: 156,
            action: () => {
              appState.budgetSpentToday = +(appState.budgetSpentToday + prod.price).toFixed(2);
              appState.monthlySpent = +(appState.monthlySpent + prod.price).toFixed(2);
              appState.recentExpenses.unshift({
                name: prod.name,
                time: 'Just now',
                amount: prod.price,
              });
              appState.activeWidget = 'budget';
              showToast(`Deducted $${prod.price.toFixed(2)} from Daily Budget`);
              drawFrontScreen();
              requestRender();
            },
          });

          ctx.fillStyle = muted;
          ctx.font = '800 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText('Tap to open barcode viewfinder', TEX_W / 2, 1852);
          frontHitZones.push({
            id: 'scan-retake',
            x: cardX + 160,
            y: 1816,
            w: cardW - 320,
            h: 72,
            action: () => {
              appState.scannerStage = 'reticle';
              drawFrontScreen();
              requestRender();
            },
          });
        }
      }

      // =======================================================================
      // 3. COOKBOOK -> RECIPE ANALYSIS & CHEF GUIDE (Cookbook.tsx & RecipeDetails.tsx)
      // =======================================================================
      else if (wType === 'cookbook' || wType === 'meal') {
        const meal = COOKBOOK_RECIPES[appState.mealIdx];

        if (appState.cookStage === 'browse') {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillStyle = ink;
          ctx.font = '900 62px "DM Sans", system-ui, sans-serif';
          ctx.fillText('Cookbook', cardX, 234);
          ctx.fillStyle = '#16A34A';
          ctx.font = '900 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText('FOR YOU · HALAL MEAL SUGGESTIONS', cardX, 314);

          COOKBOOK_RECIPES.forEach((rec, idx) => {
            const ry = 384 + idx * 430;
            const hov = hoveredZoneId === `cook-card-${idx}`;
            ctx.fillStyle = cardBg;
            drawRoundedRectPath(ctx, cardX, ry, cardW, 392, 36);
            ctx.fill();
            ctx.strokeStyle = hov ? '#13EC37' : dark ? '#334155' : '#CBD5E1';
            ctx.lineWidth = hov ? 5 : 3;
            ctx.stroke();

            const thumb = idx === 0 ? loadedImgs.chicken : loadedImgs.cookingWoman;
            if (thumb) {
              ctx.save();
              drawRoundedRectPath(ctx, cardX + 24, ry + 24, 240, 344, 26);
              ctx.clip();
              drawCoverImage(ctx, thumb, cardX + 24, ry + 24, 240, 344, true);
              ctx.restore();
            }

            ctx.textAlign = 'left';
            ctx.fillStyle = '#0D2F4F';
            if (dark) ctx.fillStyle = '#A6EB67';
            ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
            ctx.fillText(rec.session, cardX + 290, ry + 34);
            ctx.fillStyle = ink;
            ctx.font = '900 44px "DM Sans", system-ui, sans-serif';
            ctx.fillText(rec.title, cardX + 290, ry + 84);
            ctx.fillStyle = muted;
            ctx.font = '700 32px "DM Sans", system-ui, sans-serif';
            ctx.fillText(rec.macros, cardX + 290, ry + 150);
            ctx.fillText(`Est. $${rec.price.toFixed(2)} / serving`, cardX + 290, ry + 204);

            ctx.fillStyle = hov ? '#13EC37' : '#0D2F4F';
            drawRoundedRectPath(ctx, cardX + 290, ry + 276, 360, 82, 41);
            ctx.fill();
            ctx.fillStyle = hov ? '#09101D' : '#D9F7C4';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '900 32px "DM Sans", system-ui, sans-serif';
            ctx.fillText('Analyze & Cook  →', cardX + 470, ry + 317);

            frontHitZones.push({
              id: `cook-card-${idx}`,
              x: cardX,
              y: ry,
              w: cardW,
              h: 392,
              action: () => {
                appState.mealIdx = idx;
                appState.cookStepIdx = 0;
                appState.cookStage = 'details';
                drawFrontScreen();
                requestRender();
              },
            });
          });
        } else {
          // RecipeDetails.tsx Full Analysis & Step-by-Step AI Chef Breakdown
          ctx.fillStyle = '#FCE7F3';
          drawRoundedRectPath(ctx, cardX, 232, 260, 64, 32);
          ctx.fill();
          ctx.fillStyle = '#BE185D';
          ctx.textAlign = 'center';
          ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
          ctx.fillText('HALAL CHEF GUIDE', cardX + 130, 264);

          ctx.fillStyle = hoveredZoneId === 'cook-all' ? '#A6EB67' : cardBg;
          drawRoundedRectPath(ctx, cardX + cardW - 310, 232, 310, 64, 32);
          ctx.fill();
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = ink;
          ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
          ctx.fillText('All Recipes (3)', cardX + cardW - 155, 264);
          frontHitZones.push({
            id: 'cook-all',
            x: cardX + cardW - 318,
            y: 224,
            w: 326,
            h: 82,
            action: () => {
              appState.cookStage = 'browse';
              drawFrontScreen();
              requestRender();
            },
          });

          // Hero Recipe Photo
          const banY = 320;
          const banH = 380;
          ctx.fillStyle = '#0F172A';
          drawRoundedRectPath(ctx, cardX, banY, cardW, banH, 40);
          ctx.fill();
          const heroImg = appState.mealIdx === 0 ? loadedImgs.chicken : loadedImgs.cookingWoman;
          if (heroImg) {
            ctx.save();
            drawRoundedRectPath(ctx, cardX, banY, cardW, banH, 40);
            ctx.clip();
            drawCoverImage(ctx, heroImg, cardX, banY, cardW, banH, true);
            ctx.restore();
          }
          const grad = ctx.createLinearGradient(0, banY + 90, 0, banY + banH);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, 'rgba(0,0,0,0.9)');
          ctx.fillStyle = grad;
          drawRoundedRectPath(ctx, cardX, banY, cardW, banH, 40);
          ctx.fill();

          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#A6EB67';
          ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
          ctx.fillText(meal.prep.toUpperCase(), cardX + 32, banY + 194);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 50px "DM Sans", system-ui, sans-serif';
          ctx.fillText(meal.title, cardX + 32, banY + 240);
          ctx.fillStyle = '#E2E8F0';
          ctx.font = '700 32px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`${meal.macros} · Cost $${meal.price.toFixed(2)}`, cardX + 32, banY + 308);

          // Nutrition Breakdown Strip (RecipeDetails.tsx top macro cards)
          const nutY = 724;
          const nW = (cardW - 54) / 4;
          [
            { l: 'KCAL', v: `${meal.kcal}` },
            { l: 'PROTEIN', v: `${meal.protein}g` },
            { l: 'CARBS', v: `${meal.carbs}g` },
            { l: 'FAT', v: `${meal.fat}g` },
          ].forEach((m, i) => {
            const mx = cardX + i * (nW + 18);
            ctx.fillStyle = cardBg;
            drawRoundedRectPath(ctx, mx, nutY, nW, 134, 24);
            ctx.fill();
            ctx.strokeStyle = dark ? '#334155' : '#E2E8F0';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.textAlign = 'center';
            ctx.fillStyle = muted;
            ctx.font = '800 24px "DM Sans", system-ui, sans-serif';
            ctx.fillText(m.l, mx + nW / 2, nutY + 22);
            ctx.fillStyle = ink;
            ctx.font = '900 42px "DM Sans", system-ui, sans-serif';
            ctx.fillText(m.v, mx + nW / 2, nutY + 62);
          });

          // Interactive Step-by-Step Chef Instructions
          ctx.textAlign = 'left';
          ctx.fillStyle = ink;
          ctx.font = '900 40px "DM Sans", system-ui, sans-serif';
          ctx.fillText('Guided Cooking Steps', cardX, 892);

          meal.steps.forEach((step, idx) => {
            const sy = 964 + idx * 172;
            const active = appState.cookStepIdx === idx;
            ctx.fillStyle = active ? (dark ? '#1A3828' : '#ECFDF5') : cardBg;
            drawRoundedRectPath(ctx, cardX, sy, cardW, 152, 30);
            ctx.fill();
            ctx.strokeStyle = active ? '#13EC37' : dark ? '#334155' : '#E2E8F0';
            ctx.lineWidth = active ? 4.5 : 2.5;
            ctx.stroke();

            ctx.fillStyle = active ? '#13EC37' : '#0D2F4F';
            drawRoundedRectPath(ctx, cardX + 24, sy + 28, 62, 62, 18);
            ctx.fill();
            ctx.fillStyle = active ? '#09101D' : '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.font = '900 32px "DM Sans", system-ui, sans-serif';
            ctx.fillText(String(idx + 1), cardX + 55, sy + 42);

            ctx.textAlign = 'left';
            ctx.fillStyle = ink;
            ctx.font = '700 30px "DM Sans", system-ui, sans-serif';
            drawWrapText(ctx, step, cardX + 108, sy + 26, cardW - 134, 42);

            frontHitZones.push({
              id: `cook-step-${idx}`,
              x: cardX,
              y: sy,
              w: cardW,
              h: 152,
              action: () => {
                appState.cookStepIdx = idx;
                drawFrontScreen();
                requestRender();
              },
            });
          });

          // Cook & Log Meal CTA
          ctx.fillStyle = '#0D2F4F';
          drawRoundedRectPath(ctx, cardX, 1520, cardW, 132, 66);
          ctx.fill();
          ctx.fillStyle = '#D9F7C4';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 42px "DM Sans", system-ui, sans-serif';
          ctx.fillText(
            `Cook & Log (+${meal.kcal} kcal · $${meal.price.toFixed(2)})`,
            TEX_W / 2,
            1586
          );
          frontHitZones.push({
            id: 'cook-log-meal',
            x: cardX,
            y: 1510,
            w: cardW,
            h: 152,
            action: () => {
              appState.caloriesConsumed = Math.min(2600, appState.caloriesConsumed + meal.kcal);
              appState.budgetSpentToday = +(appState.budgetSpentToday + meal.price).toFixed(2);
              appState.recentExpenses.unshift({
                name: meal.title,
                time: 'Cooked now',
                amount: meal.price,
              });
              appState.activeWidget = null;
              showToast(`Logged ${meal.title} to Progress & Budget!`);
              drawFrontScreen();
              requestRender();
            },
          });
        }
      }

      // =======================================================================
      // 4. BUDGET DASHBOARD (Budget.tsx from GitHub)
      // =======================================================================
      else if (wType === 'budget') {
        const remaining = Math.max(0, appState.dailyBudgetAllowance - appState.budgetSpentToday);
        const isOver = appState.budgetSpentToday > appState.dailyBudgetAllowance;
        const pctUsed = Math.min(100, Math.round((appState.monthlySpent / appState.monthlyBudget) * 100));

        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = ink;
        ctx.font = '900 60px "DM Sans", system-ui, sans-serif';
        ctx.fillText('Food Budget', cardX, 234);

        // Exceeded Alert if spent > allowance (Budget.tsx lines 163-196)
        let cardStartY = 326;
        if (isOver) {
          ctx.fillStyle = '#FFF1F2';
          drawRoundedRectPath(ctx, cardX, 322, cardW, 140, 28);
          ctx.fill();
          ctx.strokeStyle = '#FB7185';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.fillStyle = '#BE123C';
          ctx.font = '900 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText('⚠ DAILY BUDGET ALERT · OVER ALLOWANCE', cardX + 28, 348);
          ctx.fillStyle = '#881337';
          ctx.font = '700 30px "DM Sans", system-ui, sans-serif';
          ctx.fillText(
            `Exceeded today by $${(appState.budgetSpentToday - appState.dailyBudgetAllowance).toFixed(2)}`,
            cardX + 28,
            396
          );
          cardStartY = 486;
        }

        // Daily Budget Gradient Card (Budget.tsx lines 202-238: from-vic-green to-teal-500!)
        const bgGrad = ctx.createLinearGradient(cardX, cardStartY, cardX + cardW, cardStartY + 500);
        bgGrad.addColorStop(0, '#A6EB67');
        bgGrad.addColorStop(1, '#14B8A6');
        ctx.fillStyle = bgGrad;
        drawRoundedRectPath(ctx, cardX, cardStartY, cardW, 500, 44);
        ctx.fill();

        ctx.fillStyle = 'rgba(9,16,29,0.78)';
        ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
        ctx.fillText('REMAINING TODAY', cardX + 36, cardStartY + 36);
        ctx.fillStyle = '#09101D';
        ctx.font = '900 104px "DM Sans", system-ui, sans-serif';
        ctx.fillText(`$${remaining.toFixed(2)}`, cardX + 36, cardStartY + 80);

        const subW = (cardW - 96) / 2;
        [
          { l: 'DAILY ALLOWANCE', v: `$${appState.dailyBudgetAllowance.toFixed(2)}` },
          { l: 'SPENT TODAY', v: `$${appState.budgetSpentToday.toFixed(2)}` },
        ].forEach((b, idx) => {
          const bx = cardX + 36 + idx * (subW + 24);
          ctx.fillStyle = 'rgba(255,255,255,0.45)';
          drawRoundedRectPath(ctx, bx, cardStartY + 216, subW, 134, 24);
          ctx.fill();
          ctx.fillStyle = 'rgba(9,16,29,0.75)';
          ctx.font = '900 24px "DM Sans", system-ui, sans-serif';
          ctx.fillText(b.l, bx + 22, cardStartY + 236);
          ctx.fillStyle = '#09101D';
          ctx.font = '900 44px "DM Sans", system-ui, sans-serif';
          ctx.fillText(b.v, bx + 22, cardStartY + 278);
        });

        // Monthly Cycle Overview Bar inside Card
        ctx.fillStyle = 'rgba(9,16,29,0.78)';
        ctx.font = '900 24px "DM Sans", system-ui, sans-serif';
        ctx.fillText('MONTHLY CYCLE OVERVIEW · 18 DAYS LEFT', cardX + 36, cardStartY + 378);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        drawRoundedRectPath(ctx, cardX + 36, cardStartY + 422, cardW - 72, 20, 10);
        ctx.fill();
        ctx.fillStyle = isOver ? '#EF4444' : '#09101D';
        drawRoundedRectPath(
          ctx,
          cardX + 36,
          cardStartY + 422,
          Math.max(40, ((cardW - 72) * pctUsed) / 100),
          20,
          10
        );
        ctx.fill();
        ctx.fillStyle = '#09101D';
        ctx.font = '800 26px "DM Sans", system-ui, sans-serif';
        ctx.fillText(
          `Spent: $${appState.monthlySpent.toFixed(0)} / Total: $${appState.monthlyBudget}`,
          cardX + 36,
          cardStartY + 456
        );

        // Recent Scanned Products Ledger (Budget.tsx lines 265-305)
        const listY = cardStartY + 534;
        ctx.fillStyle = ink;
        ctx.font = '900 38px "DM Sans", system-ui, sans-serif';
        ctx.fillText('Recent Scanned Products', cardX, listY);

        appState.recentExpenses.slice(0, 3).forEach((exp, idx) => {
          const ey = listY + 72 + idx * 144;
          ctx.fillStyle = cardBg;
          drawRoundedRectPath(ctx, cardX, ey, cardW, 124, 28);
          ctx.fill();
          ctx.strokeStyle = dark ? '#334155' : '#E2E8F0';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.fillStyle = '#FEE2E2';
          drawRoundedRectPath(ctx, cardX + 22, ey + 26, 72, 72, 20);
          ctx.fill();
          ctx.fillStyle = '#E11D48';
          ctx.textAlign = 'center';
          ctx.font = '900 42px "DM Sans", system-ui, sans-serif';
          ctx.fillText('−', cardX + 58, ey + 38);

          ctx.textAlign = 'left';
          ctx.fillStyle = ink;
          ctx.font = '900 33px "DM Sans", system-ui, sans-serif';
          ctx.fillText(exp.name, cardX + 114, ey + 26);
          ctx.fillStyle = muted;
          ctx.font = '700 26px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`Deducted today at ${exp.time}`, cardX + 114, ey + 72);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#E11D48';
          ctx.font = '900 36px "DM Sans", system-ui, sans-serif';
          ctx.fillText(`−$${exp.amount.toFixed(2)}`, cardX + cardW - 26, ey + 42);
        });

        // Quick Add Expense + Reset Day controls
        const btnY = 1666;
        const bW = (cardW - 24) / 2;
        ctx.fillStyle = '#0D2F4F';
        drawRoundedRectPath(ctx, cardX, btnY, bW, 126, 63);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 36px "DM Sans", system-ui, sans-serif';
        ctx.fillText('+ Log Grocery ($5.50)', cardX + bW / 2, btnY + 63);
        frontHitZones.push({
          id: 'budget-add',
          x: cardX,
          y: btnY - 8,
          w: bW,
          h: 142,
          action: () => {
            appState.budgetSpentToday = +(appState.budgetSpentToday + 5.5).toFixed(2);
            appState.monthlySpent = +(appState.monthlySpent + 5.5).toFixed(2);
            appState.recentExpenses.unshift({
              name: 'Halal Market Basket',
              time: 'Just now',
              amount: 5.5,
            });
            drawFrontScreen();
            requestRender();
          },
        });

        ctx.fillStyle = '#D9F7C4';
        drawRoundedRectPath(ctx, cardX + bW + 24, btnY, bW, 126, 63);
        ctx.fill();
        ctx.fillStyle = '#09101D';
        ctx.fillText('Reset Today ($4.20)', cardX + bW + 24 + bW / 2, btnY + 63);
        frontHitZones.push({
          id: 'budget-reset',
          x: cardX + bW + 24,
          y: btnY - 8,
          w: bW,
          h: 142,
          action: () => {
            appState.budgetSpentToday = 4.2;
            appState.recentExpenses = [{ name: 'Herb Chicken Bowl Prep', time: '12:18 PM', amount: 4.2 }];
            drawFrontScreen();
            requestRender();
          },
        });
      }

      // =======================================================================
      // 5. TODAY'S PROGRESS (ManualProgressInput.tsx + ProgressCard.tsx)
      // =======================================================================
      else if (wType === 'progress') {
        const pct = Math.min(100, Math.round((appState.caloriesConsumed / appState.caloriesGoal) * 100));
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = ink;
        ctx.font = '900 62px "DM Sans", system-ui, sans-serif';
        ctx.fillText("Today's Progress", cardX, 240);

        ctx.fillStyle = cardBg;
        drawRoundedRectPath(ctx, cardX, 344, cardW, 380, 40);
        ctx.fill();
        ctx.strokeStyle = '#13EC37';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = ink;
        ctx.font = '900 132px "DM Sans", system-ui, sans-serif';
        ctx.fillText(`${pct}%`, cardX + 38, 382);
        ctx.fillStyle = muted;
        ctx.font = '800 38px "DM Sans", system-ui, sans-serif';
        ctx.fillText(
          `${appState.caloriesConsumed.toLocaleString()} / ${appState.caloriesGoal.toLocaleString()} kcal`,
          cardX + 38,
          566
        );

        ctx.fillStyle = ink;
        ctx.font = '900 40px "DM Sans", system-ui, sans-serif';
        ctx.fillText('Mood Check-in', cardX, 772);
        const moods = ['Energized', 'Calm', 'Reflective', 'Tired'];
        const mW = (cardW - 24) / 2;
        moods.forEach((m, i) => {
          const mx = cardX + (i % 2) * (mW + 24);
          const my = 844 + Math.floor(i / 2) * 130;
          const active = appState.selectedMood === m;
          ctx.fillStyle = active ? '#A6EB67' : cardBg;
          drawRoundedRectPath(ctx, mx, my, mW, 108, 30);
          ctx.fill();
          ctx.strokeStyle = active ? '#0D2F4F' : '#CBD5E1';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = '#09101D';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 36px "DM Sans", system-ui, sans-serif';
          ctx.fillText(m, mx + mW / 2, my + 54);
          frontHitZones.push({
            id: `prog-mood-${m}`,
            x: mx,
            y: my,
            w: mW,
            h: 108,
            action: () => {
              appState.selectedMood = m;
              drawFrontScreen();
              requestRender();
            },
          });
        });

        // Quick Add / Reset Calories
        ctx.fillStyle = '#0D2F4F';
        drawRoundedRectPath(ctx, cardX, 1170, cardW, 134, 67);
        ctx.fill();
        ctx.fillStyle = '#D9F7C4';
        ctx.textAlign = 'center';
        ctx.font = '900 44px "DM Sans", system-ui, sans-serif';
        ctx.fillText('+ Log 250 kcal Meal', TEX_W / 2, 1237);
        frontHitZones.push({
          id: 'prog-add-kcal',
          x: cardX,
          y: 1162,
          w: cardW,
          h: 150,
          action: () => {
            appState.caloriesConsumed = Math.min(2600, appState.caloriesConsumed + 250);
            drawFrontScreen();
            requestRender();
          },
        });
      }

      // =======================================================================
      // 6. HIJRI MILESTONE MODAL (MilestoneModal.tsx)
      // =======================================================================
      else if (wType === 'milestone') {
        const mg = ctx.createLinearGradient(cardX, 240, cardX + cardW, 1450);
        mg.addColorStop(0, '#4F46E5');
        mg.addColorStop(1, '#312E81');
        ctx.fillStyle = mg;
        drawRoundedRectPath(ctx, cardX, 240, cardW, 1340, 44);
        ctx.fill();

        if (loadedImgs.calmRest) {
          ctx.save();
          drawRoundedRectPath(ctx, cardX + 34, 280, cardW - 68, 460, 32);
          ctx.clip();
          drawCoverImage(ctx, loadedImgs.calmRest, cardX + 34, 280, cardW - 68, 460, true);
          ctx.restore();
        }

        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#C7D2FE';
        ctx.font = '900 30px "DM Sans", system-ui, sans-serif';
        ctx.fillText('WK 2 HIJRI CHECKPOINT', cardX + 38, 774);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 58px "DM Sans", system-ui, sans-serif';
        ctx.fillText('Mindful Consistency', cardX + 38, 834);
        ctx.fillStyle = '#E0E7FF';
        ctx.font = '700 36px "DM Sans", system-ui, sans-serif';
        drawWrapText(
          ctx,
          'You stayed within budget & mindful hydration across 5 consecutive Hijri days. Keep nourishing body and soul.',
          cardX + 38,
          930,
          cardW - 76,
          52
        );
      }
    };

    // Interactive Dashboard Screen (app/_pages/Dashboard.tsx from GitHub)
    const drawDashboardScreen = (ctx: CanvasRenderingContext2D) => {
      const dark = appState.darkMode;
      const surface = dark ? '#0D1418' : '#F3F7F4';
      const cardBg = dark ? '#162229' : '#FFFFFF';
      const ink = dark ? '#FFFFFF' : '#09101D';
      const muted = dark ? '#CBD5E1' : '#334155';

      ctx.fillStyle = surface;
      ctx.fillRect(0, 0, TEX_W, TEX_H);
      drawStatusBar(ctx, TEX_W, dark);

      const cardX = 46;
      const cardW = TEX_W - 92;

      // Top Avatar + Return Landing + Dark Mode Toggle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cardX + 44, 158, 44, 0, Math.PI * 2);
      ctx.fillStyle = '#A6EB67';
      ctx.fill();
      ctx.clip();
      if (loadedImgs.landing) {
        drawCoverImage(ctx, loadedImgs.landing, cardX, 114, 88, 88, true);
      }
      ctx.restore();

      const backHov = hoveredZoneId === 'dash-back-landing';
      ctx.fillStyle = backHov ? '#A6EB67' : dark ? '#1F2937' : '#DCE4EC';
      drawRoundedRectPath(ctx, TEX_W - 392, 118, 224, 78, 39);
      ctx.fill();
      ctx.fillStyle = backHov ? '#09101D' : ink;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 32px "DM Sans", system-ui, sans-serif';
      ctx.fillText('↺ Landing', TEX_W - 280, 157);
      frontHitZones.push({
        id: 'dash-back-landing',
        x: TEX_W - 404,
        y: 108,
        w: 244,
        h: 98,
        action: () => {
          appState.screen = 'landing';
          appState.activeWidget = null;
          hoveredZoneId = null;
          drawFrontScreen();
          requestRender();
        },
      });

      const themeHov = hoveredZoneId === 'dash-toggle-dark';
      ctx.fillStyle = themeHov ? '#A6EB67' : dark ? '#1F2937' : '#DCE4EC';
      drawRoundedRectPath(ctx, TEX_W - 148, 118, 102, 78, 39);
      ctx.fill();
      ctx.fillStyle = themeHov ? '#09101D' : ink;
      ctx.font = '900 36px "DM Sans", system-ui, sans-serif';
      ctx.fillText(dark ? '☀' : '☾', TEX_W - 97, 158);
      frontHitZones.push({
        id: 'dash-toggle-dark',
        x: TEX_W - 154,
        y: 108,
        w: 114,
        h: 98,
        action: () => {
          appState.darkMode = !appState.darkMode;
          drawFrontScreen();
          requestRender();
        },
      });

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = ink;
      ctx.font = '900 66px "DM Sans", system-ui, sans-serif';
      ctx.fillText('Welcome, Yusuf', cardX, 232);
      ctx.fillStyle = muted;
      ctx.font = '700 34px "DM Sans", system-ui, sans-serif';
      ctx.fillText('Tap any feature below for live analysis', cardX, 314);

      // TODAY'S PROGRESS CARD
      const pct = Math.min(100, Math.round((appState.caloriesConsumed / appState.caloriesGoal) * 100));
      const leftKcal = Math.max(0, appState.caloriesGoal - appState.caloriesConsumed);
      const isExceeded = appState.caloriesConsumed > appState.caloriesGoal;
      const cardY = 392;
      const cardH = 486;
      const progHover = hoveredZoneId === 'dash-progress-card';

      ctx.save();
      ctx.shadowColor = isExceeded ? 'rgba(239,68,68,0.28)' : 'rgba(19,236,55,0.22)';
      ctx.shadowBlur = progHover ? 38 : 26;
      ctx.shadowOffsetY = 12;
      drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, 46);
      const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      if (dark) {
        cardGrad.addColorStop(0, '#1B3A26');
        cardGrad.addColorStop(0.55, '#132026');
        cardGrad.addColorStop(1, '#193524');
      } else {
        cardGrad.addColorStop(0, '#C7F5B6');
        cardGrad.addColorStop(0.52, '#FFFFFF');
        cardGrad.addColorStop(1, '#9FE85D');
      }
      ctx.fillStyle = cardGrad;
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = progHover ? '#0D2F4F' : 'rgba(9,16,29,0.16)';
      ctx.lineWidth = progHover ? 6 : 3;
      drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, 46);
      ctx.stroke();

      ctx.fillStyle = dark ? '#E2E8F0' : '#0D2F4F';
      ctx.font = '900 32px "DM Sans", system-ui, sans-serif';
      ctx.fillText("TODAY'S PROGRESS", cardX + 42, cardY + 38);

      ctx.fillStyle = ink;
      ctx.font = '900 140px "DM Sans", system-ui, sans-serif';
      const pctText = String(pct);
      ctx.fillText(pctText, cardX + 38, cardY + 84);
      const pctW = ctx.measureText(pctText).width;
      ctx.font = '900 72px "DM Sans", system-ui, sans-serif';
      ctx.fillText('%', cardX + 44 + pctW, cardY + 134);

      const ringCx = cardX + cardW - 134;
      const ringCy = cardY + 142;
      const ringR = 96;

      ctx.strokeStyle = 'rgba(15,23,42,0.14)';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = isExceeded ? '#EF4444' : '#13EC37';
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ringCx, ringCy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, pct / 100));
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(ringCx, ringCy, 76, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = '#D1F7C4';
      ctx.fill();
      ctx.clip();
      if (loadedImgs.landing) {
        drawCoverImage(ctx, loadedImgs.landing, ringCx - 76, ringCy - 76, 152, 152, true);
      }
      ctx.restore();

      const statsY = cardY + 286;
      const statW = (cardW - 112) / 3;
      const stats = [
        { val: appState.caloriesConsumed.toLocaleString(), label: 'EATEN' },
        { val: leftKcal.toLocaleString(), label: 'LEFT' },
        { val: appState.caloriesGoal.toLocaleString(), label: 'GOAL' },
      ];
      stats.forEach((st, idx) => {
        const sx = cardX + 34 + idx * (statW + 22);
        ctx.fillStyle = dark ? 'rgba(0,0,0,0.36)' : 'rgba(255,255,255,0.92)';
        drawRoundedRectPath(ctx, sx, statsY, statW, 174, 28);
        ctx.fill();
        ctx.strokeStyle = dark ? 'rgba(255,255,255,0.16)' : 'rgba(9,16,29,0.12)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = isExceeded && idx === 0 ? '#EF4444' : ink;
        ctx.font = '900 52px "DM Sans", system-ui, sans-serif';
        ctx.fillText(st.val, sx + statW / 2, statsY + 34);
        ctx.fillStyle = muted;
        ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
        ctx.fillText(st.label, sx + statW / 2, statsY + 112);
      });

      frontHitZones.push({
        id: 'dash-progress-card',
        x: cardX,
        y: cardY,
        w: cardW,
        h: cardH,
        action: () => {
          appState.activeWidget = 'progress';
          hoveredZoneId = null;
          drawFrontScreen();
          requestRender();
        },
      });

      // 4 Distinct Core Feature Action Tiles (CAMERA, SCANNER, COOK, BUDGET)
      const tileY = 934;
      const tileGap = 20;
      const tileSize = (cardW - tileGap * 3) / 4;
      const actions: Array<{
        id: Exclude<WidgetKey, null>;
        label: string;
        bg: string;
        border: string;
        img: HTMLImageElement | null;
      }> = [
        { id: 'camera', label: 'CAMERA', bg: '#FDE1C2', border: '#D97706', img: loadedImgs.camera },
        { id: 'scanner', label: 'SCANNER', bg: '#CBE8FF', border: '#0284C7', img: loadedImgs.scanner },
        { id: 'cookbook', label: 'COOK', bg: '#FFD6DF', border: '#E11D48', img: loadedImgs.cook },
        { id: 'budget', label: 'BUDGET', bg: '#D1F7C4', border: '#16A34A', img: loadedImgs.budget },
      ];
      actions.forEach((act, idx) => {
        const tx = cardX + idx * (tileSize + tileGap);
        const zId = `dash-tile-${act.id}`;
        const hovered = hoveredZoneId === zId;

        ctx.fillStyle = hovered ? '#A6EB67' : act.bg;
        drawRoundedRectPath(ctx, tx, tileY, tileSize, tileSize, 36);
        ctx.fill();
        ctx.strokeStyle = hovered ? '#09101D' : act.border;
        ctx.lineWidth = hovered ? 6 : 3.5;
        ctx.stroke();

        if (act.img) {
          ctx.drawImage(act.img, tx + 22, tileY + 22, tileSize - 44, tileSize - 44);
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = ink;
        ctx.font = '900 32px "DM Sans", system-ui, sans-serif';
        ctx.fillText(act.label, tx + tileSize / 2, tileY + tileSize + 20);

        frontHitZones.push({
          id: zId,
          x: tx - 6,
          y: tileY - 8,
          w: tileSize + 12,
          h: tileSize + 72,
          action: () => {
            appState.activeWidget = act.id;
            // Start Camera/Scanner on viewfinder/reticle -> auto-reveal rich GitHub Analysis cleanly, OR show instant analysis!
            if (act.id === 'camera') {
              appState.cameraStage = 'viewfinder';
              drawFrontScreen();
              requestRender();
              window.clearTimeout(scanTimeout);
              scanTimeout = window.setTimeout(() => {
                if (!disposed && appState.activeWidget === 'camera') {
                  appState.cameraStage = 'scanning';
                  drawFrontScreen();
                  requestRender();
                  scanTimeout = window.setTimeout(() => {
                    if (!disposed && appState.activeWidget === 'camera') {
                      appState.cameraStage = 'analysis';
                      drawFrontScreen();
                      requestRender();
                    }
                  }, 420);
                }
              }, 420);
              return;
            }
            if (act.id === 'scanner') {
              appState.scannerStage = 'reticle';
              drawFrontScreen();
              requestRender();
              window.clearTimeout(scanTimeout);
              scanTimeout = window.setTimeout(() => {
                if (!disposed && appState.activeWidget === 'scanner') {
                  appState.scannerStage = 'scanning';
                  drawFrontScreen();
                  requestRender();
                  scanTimeout = window.setTimeout(() => {
                    if (!disposed && appState.activeWidget === 'scanner') {
                      appState.scannerStage = 'analysis';
                      drawFrontScreen();
                      requestRender();
                    }
                  }, 420);
                }
              }, 420);
              return;
            }
            if (act.id === 'cookbook') {
              appState.cookStage = 'details';
            }
            hoveredZoneId = null;
            drawFrontScreen();
            requestRender();
          },
        });
      });

      // Hijri Checkpoint Calendar Strip
      const calY = 1244;
      ctx.textAlign = 'left';
      ctx.fillStyle = ink;
      ctx.font = '900 46px "DM Sans", system-ui, sans-serif';
      ctx.fillText('Hijri Calendar', cardX, calY);
      ctx.fillStyle = muted;
      ctx.font = '800 28px monospace';
      ctx.fillText(getHijriMonthHeader(), cardX, calY + 56);

      const days = getCalendarStripDays();
      const dW = (cardW - 56) / 5;
      days.forEach((day, idx) => {
        const dx = cardX + idx * (dW + 14);
        const dy = calY + 106;
        const zId = `dash-day-${idx}`;
        const hovered = hoveredZoneId === zId;
        const isSelected = appState.selectedDayIdx === idx;

        if (day.type === 'today') {
          ctx.fillStyle = '#13EC37';
        } else if (day.type === 'milestone') {
          const mg = ctx.createLinearGradient(dx, dy, dx + dW, dy + 170);
          mg.addColorStop(0, '#4F46E5');
          mg.addColorStop(1, '#312E81');
          ctx.fillStyle = mg;
        } else {
          ctx.fillStyle = cardBg;
        }
        drawRoundedRectPath(ctx, dx, dy, dW, 170, 30);
        ctx.fill();

        if (hovered || isSelected) {
          ctx.strokeStyle = day.type === 'milestone' ? '#A5B4FC' : '#09101D';
          ctx.lineWidth = hovered ? 6 : 4;
          ctx.stroke();
        } else if (day.type === 'normal') {
          ctx.strokeStyle = dark ? '#334155' : '#CBD5E1';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = day.type === 'milestone' ? '#FFFFFF' : dark && day.type === 'normal' ? '#FFFFFF' : '#09101D';
        ctx.font = '900 50px "DM Sans", system-ui, sans-serif';
        ctx.fillText(day.n, dx + dW / 2, dy + 34);
        ctx.font = '900 26px "DM Sans", system-ui, sans-serif';
        ctx.fillStyle =
          day.type === 'milestone' ? '#E0E7FF' : day.type === 'today' ? '#09101D' : muted;
        ctx.fillText(day.label, dx + dW / 2, dy + 112);

        frontHitZones.push({
          id: zId,
          x: dx,
          y: dy,
          w: dW,
          h: 170,
          action: () => {
            appState.selectedDayIdx = idx;
            if (day.type === 'milestone') {
              appState.activeWidget = 'milestone';
              hoveredZoneId = null;
            } else {
              showToast(`Selected Hijri day ${day.n} (${day.label})`);
            }
            drawFrontScreen();
            requestRender();
          },
        });
      });

      // FoodCarousel Card
      const meal = COOKBOOK_RECIPES[appState.mealIdx];
      const mealY = 1574;
      const mealHover = hoveredZoneId === 'dash-meal-open';
      ctx.save();
      ctx.shadowColor = 'rgba(9,16,29,0.12)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = cardBg;
      drawRoundedRectPath(ctx, cardX, mealY, cardW, 294, 38);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = mealHover ? '#13EC37' : dark ? '#334155' : '#CBD5E1';
      ctx.lineWidth = mealHover ? 5 : 3;
      drawRoundedRectPath(ctx, cardX, mealY, cardW, 294, 38);
      ctx.stroke();

      if (loadedImgs.chicken) {
        ctx.save();
        drawRoundedRectPath(ctx, cardX + 24, mealY + 24, 246, 246, 28);
        ctx.clip();
        drawCoverImage(ctx, loadedImgs.chicken, cardX + 24, mealY + 24, 246, 246);
        ctx.restore();
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = dark ? '#A6EB67' : '#0D2F4F';
      ctx.font = '900 28px "DM Sans", system-ui, sans-serif';
      ctx.fillText(meal.session, cardX + 292, mealY + 34);

      ctx.fillStyle = ink;
      ctx.font = '900 44px "DM Sans", system-ui, sans-serif';
      ctx.fillText(meal.title, cardX + 292, mealY + 80);
      ctx.fillStyle = muted;
      ctx.font = '700 34px "DM Sans", system-ui, sans-serif';
      ctx.fillText(meal.macros, cardX + 292, mealY + 138);

      ctx.fillStyle = hoveredZoneId === 'dash-meal-cycle' ? '#A6EB67' : '#DCE4EC';
      drawRoundedRectPath(ctx, cardX + 292, mealY + 198, 128, 68, 34);
      ctx.fill();
      ctx.fillStyle = '#09101D';
      ctx.textAlign = 'center';
      ctx.font = '900 32px "DM Sans", system-ui, sans-serif';
      ctx.fillText('Next ↻', cardX + 356, mealY + 216);
      frontHitZones.push({
        id: 'dash-meal-cycle',
        x: cardX + 286,
        y: mealY + 192,
        w: 140,
        h: 82,
        action: () => {
          appState.mealIdx = (appState.mealIdx + 1) % COOKBOOK_RECIPES.length;
          drawFrontScreen();
          requestRender();
        },
      });

      ctx.fillStyle = mealHover ? '#13EC37' : '#0D2F4F';
      drawRoundedRectPath(ctx, cardX + 436, mealY + 198, 258, 68, 34);
      ctx.fill();
      ctx.fillStyle = mealHover ? '#09101D' : '#D9F7C4';
      ctx.fillText('OPEN RECIPE', cardX + 565, mealY + 216);
      frontHitZones.push({
        id: 'dash-meal-open',
        x: cardX + 430,
        y: mealY + 192,
        w: 272,
        h: 82,
        action: () => {
          appState.activeWidget = 'cookbook';
          appState.cookStage = 'details';
          hoveredZoneId = null;
          drawFrontScreen();
          requestRender();
        },
      });

      // Home bar indicator
      ctx.fillStyle = dark ? '#64748B' : '#94A3B8';
      drawRoundedRectPath(ctx, TEX_W / 2 - 140, TEX_H - 52, 280, 12, 6);
      ctx.fill();
    };

    const drawFrontScreen = () => {
      frontHitZones.length = 0;
      if (appState.screen === 'landing') {
        drawLandingScreen(frontCtx);
      } else if (appState.activeWidget) {
        drawWidgetPreview(frontCtx);
      } else {
        drawDashboardScreen(frontCtx);
      }

      if (appState.toastText) {
        frontCtx.save();
        frontCtx.fillStyle = '#09101D';
        drawRoundedRectPath(frontCtx, 90, TEX_H - 196, TEX_W - 180, 90, 45);
        frontCtx.fill();
        frontCtx.strokeStyle = '#A6EB67';
        frontCtx.lineWidth = 4;
        frontCtx.stroke();
        frontCtx.fillStyle = '#FFFFFF';
        frontCtx.textAlign = 'center';
        frontCtx.textBaseline = 'middle';
        frontCtx.font = '800 32px "DM Sans", system-ui, sans-serif';
        frontCtx.fillText(appState.toastText, TEX_W / 2, TEX_H - 151);
        frontCtx.restore();
      }

      frontTexture.needsUpdate = true;
    };

    let disposed = false;
    drawFrontScreen();

    // Unwashed crisp OLED MeshBasicMaterial (toneMapped: false preserves crisp dark navy typography)
    const screenGeo = createRoundedScreenGeometry(W - 0.042, H - 0.042, R - 0.021);
    const frontMat = new THREE.MeshBasicMaterial({
      map: frontTexture,
      toneMapped: false,
    });
    const frontScreenMesh = new THREE.Mesh(screenGeo, frontMat);
    frontScreenMesh.position.z = halfThick + 0.0014;
    phoneGroup.add(frontScreenMesh);

    // Front iPhone 18 Pro Max micro Dynamic Pill & Front Camera Optic
    const islandGeo = createRoundedScreenGeometry(0.25, 0.068, 0.034);
    const islandMesh = new THREE.Mesh(islandGeo, obsidianGlassMat);
    islandMesh.position.set(0, H / 2 - 0.112, halfThick + 0.0021);
    phoneGroup.add(islandMesh);

    const lensRingGeo = new THREE.RingGeometry(0.012, 0.022, 24);
    const lensRing = new THREE.Mesh(lensRingGeo, opticLensMat);
    lensRing.position.set(0.066, H / 2 - 0.112, halfThick + 0.0025);
    phoneGroup.add(lensRing);

    // Preload real GitHub / App assets into textures
    const loadImg = (src: string, key: keyof typeof loadedImgs) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => {
        if (!disposed) {
          loadedImgs[key] = im;
          drawFrontScreen();
          requestRender();
        }
      };
      im.src = src;
    };

    loadImg(IMAGES.landingHero, 'landing');
    loadImg(IMAGES.grilledChicken, 'chicken');
    loadImg(IMAGES.cookingWoman, 'cookingWoman');
    loadImg(IMAGES.foodAllergies, 'foodAllergies');
    loadImg(IMAGES.calmRest, 'calmRest');
    loadImg(ICON_IMAGES.camera, 'camera');
    loadImg(ICON_IMAGES.scanner, 'scanner');
    loadImg(ICON_IMAGES.cookbook, 'cook');
    loadImg(ICON_IMAGES.budget, 'budget');

    // =========================================================================
    // RAYCAST INTERACTION ON FRONT OLED DISPLAY
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const _worldNormal = new THREE.Vector3();
    const _camDir = new THREE.Vector3();
    let downX = 0;
    let downY = 0;

    const pickFrontScreenHit = (clientX: number, clientY: number): HitZone | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObject(frontScreenMesh, false);
      if (hits.length === 0 || !hits[0].uv) return null;

      _worldNormal.set(0, 0, 1).applyQuaternion(phoneGroup.quaternion);
      _camDir.subVectors(camera.position, hits[0].point).normalize();
      if (_worldNormal.dot(_camDir) <= 0.1) return null;

      const cx = hits[0].uv.x * TEX_W;
      const cy = (1 - hits[0].uv.y) * TEX_H;
      return (
        frontHitZones.find(
          (z) => cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h
        ) || null
      );
    };

    const onCanvasPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onCanvasPointerMove = (e: PointerEvent) => {
      if (!prefersReduced) {
        const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
        const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
        targetPointerX = THREE.MathUtils.clamp(nx, -1, 1);
        targetPointerY = THREE.MathUtils.clamp(ny, -1, 1);
      }
      const hit = pickFrontScreenHit(e.clientX, e.clientY);
      const nextHover = hit?.id || null;
      renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
      if (nextHover !== hoveredZoneId) {
        hoveredZoneId = nextHover;
        drawFrontScreen();
      }
      requestRender();
    };

    const onCanvasPointerLeave = () => {
      renderer.domElement.style.cursor = 'default';
      if (hoveredZoneId !== null) {
        hoveredZoneId = null;
        drawFrontScreen();
        requestRender();
      }
    };

    const onCanvasClick = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 14) return;
      const hit = pickFrontScreenHit(e.clientX, e.clientY);
      if (hit) {
        hit.action();
      }
    };

    renderer.domElement.addEventListener('pointerdown', onCanvasPointerDown, { passive: true });
    renderer.domElement.addEventListener('pointermove', onCanvasPointerMove, { passive: true });
    renderer.domElement.addEventListener('pointerleave', onCanvasPointerLeave);
    renderer.domElement.addEventListener('click', onCanvasClick);

    // =========================================================================
    // CHOREOGRAPHED 180-DEG SCROLL TURN (FRONT SCREEN <-> IPHONE 18 PRO MAX BACK)
    // =========================================================================
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let targetPointerX = 0;
    let targetPointerY = 0;

    // Sculpted 3/4 Pinterest showcase pose revealing rose-burgundy side rail & camera control strip
    let currRotY = -0.34;
    let currRotX = 0.04;
    let currRotZ = -0.055;
    let currPosY = 0.0;
    let currPosZ = 0.0;
    let lastTime = performance.now();

    const applyPose = (dt: number) => {
      const p = prefersReduced ? 0 : Math.max(0, Math.min(1, progressRef.current));
      const interactStraighten = appState.screen === 'dashboard' && p < 0.12 ? 0.28 : 0;

      // Stage 1 (0.00 -> 0.12): Pinterest 3/4 sculpted burgundy titanium rail showcase
      // Stage 2 (0.12 -> 0.88): Unhurried 180-deg turn revealing Burgundy Camera Bar + Apple icon
      // Stage 3 (0.88 -> 1.00): Graceful 3/4 studio settle displaying Apple logo & Camera Bar
      const introT = smootherStep(p / 0.12);
      const turnT = smootherStep((p - 0.12) / 0.76);
      const settleT = smootherStep((p - 0.88) / 0.12);

      const yawBase =
        (-0.34 + interactStraighten) -
        introT * 0.08 +
        turnT * (Math.PI + 0.28) +
        settleT * 0.04;

      const midArc = Math.sin(turnT * Math.PI);
      const desiredRotY = yawBase + targetPointerX * 0.07;
      const desiredRotX = 0.04 + midArc * 0.14 - turnT * 0.025 + targetPointerY * 0.05;
      const desiredRotZ =
        (-0.055 + (interactStraighten > 0 ? 0.035 : 0)) + turnT * 0.105 - settleT * 0.015;
      const desiredPosY = 0.0 - turnT * 0.03;
      const desiredPosZ = introT * 0.08 + midArc * 0.38 - settleT * 0.04;

      const lambda = isSoftwareGl ? 100 : 7.5;
      currRotY = THREE.MathUtils.damp(currRotY, desiredRotY, lambda, dt);
      currRotX = THREE.MathUtils.damp(currRotX, desiredRotX, lambda, dt);
      currRotZ = THREE.MathUtils.damp(currRotZ, desiredRotZ, lambda, dt);
      currPosY = THREE.MathUtils.damp(currPosY, desiredPosY, lambda, dt);
      currPosZ = THREE.MathUtils.damp(currPosZ, desiredPosZ, lambda, dt);

      phoneGroup.rotation.set(currRotX, currRotY, currRotZ, 'YXZ');
      phoneGroup.position.set(0, currPosY, currPosZ);

      const settled =
        Math.abs(currRotY - desiredRotY) < 0.0018 &&
        Math.abs(currRotX - desiredRotX) < 0.0018 &&
        Math.abs(currRotZ - desiredRotZ) < 0.0018 &&
        Math.abs(currPosY - desiredPosY) < 0.0018 &&
        Math.abs(currPosZ - desiredPosZ) < 0.0018;
      return !settled;
    };

    function afterDraw(cb: () => void) {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        if (!sync) {
          frameId = window.setTimeout(cb, 80);
          return;
        }
        const poll = () => {
          if (disposed) return;
          const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } catch {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = window.requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        const needsMore = applyPose(dt);
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || needsMore)) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    registerRenderTrigger(requestRender);
    requestRender();

    const onWindowPointerMove = (e: PointerEvent) => {
      if (prefersReduced) return;
      const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      targetPointerX = THREE.MathUtils.clamp(nx, -1, 1);
      targetPointerY = THREE.MathUtils.clamp(ny, -1, 1);
      requestRender();
    };
    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });

    const onResize = () => {
      if (disposed || !container) return;
      const nextW = Math.max(260, container.clientWidth || 380);
      const nextH = Math.max(360, container.clientHeight || 580);
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(nextW, nextH);
      requestRender();
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      disposed = true;
      registerRenderTrigger(null);
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.clearTimeout(toastTimer);
      window.clearTimeout(scanTimeout);
      renderer.domElement.removeEventListener('pointerdown', onCanvasPointerDown);
      renderer.domElement.removeEventListener('pointermove', onCanvasPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onCanvasPointerLeave);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      window.removeEventListener('pointermove', onWindowPointerMove);
      ro.disconnect();

      chassisGeo.dispose();
      bezelGeo.dispose();
      appleBodyGeo.dispose();
      appleLeafGeo.dispose();
      actionBtnGeo.dispose();
      volBtnGeo.dispose();
      powerBtnGeo.dispose();
      camCtrlGeo.dispose();
      antennaGeo.dispose();
      usbcRingGeo.dispose();
      usbcCavityGeo.dispose();
      grilleDotGeo.dispose();
      plateauTrimGeo.dispose();
      plateauGlassGeo.dispose();
      lensRingOuterGeo.dispose();
      lensBarrelGeo.dispose();
      lensOpticGeo.dispose();
      flashCollarGeo.dispose();
      lidarGeo.dispose();
      micGeo.dispose();
      screenGeo.dispose();
      islandGeo.dispose();
      lensRingGeo.dispose();

      titaniumMat.dispose();
      polishedMetalMat.dispose();
      mirrorAppleMat.dispose();
      obsidianGlassMat.dispose();
      antennaMat.dispose();
      opticLensMat.dispose();
      flashLedMat.dispose();
      backGlassMat.dispose();
      plateauGlassMat.dispose();
      frontMat.dispose();

      frontTexture.dispose();
      backGlassTex.dispose();
      envTarget.dispose();

      if (areaLeft) scene.remove(areaLeft);
      if (areaRight) scene.remove(areaRight);

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [progressRef, registerRenderTrigger]);

  return <div ref={mountRef} className={className} />;
}
