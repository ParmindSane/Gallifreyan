// -----------------------------------------------------------------------------------------DECLARACIÓN
let texto, preTexto;
let theCanvas, canvasDiv, theInput;

let frase;

const vocales = ["A", "E", "I", "O", "U"];
const omega = ["B", "CH", "D", "F", "G", "H"];
const over = ["J", "K", "L", "M", "N", "P"];
const half = ["T", "SH", "R", "S", "V", "W"];
const cut = ["TH", "Y", "Z", "NG", "QU", "X"];

let tipuntos = [];
const NoPOINTS = 0;
const POINTS2 = 1;
const POINTS3 = 2;
const LINES3 = 3;
const LINES1 = 4;
const LINES2 = 5;
const VOCALINES = 6;

// -----------------------------------------------------------------------------------------SETUP
function setup() {
  let winTam = windowWidth / 3;
  theCanvas = createCanvas(winTam, winTam);
  canvasDiv = document.getElementById("canvas");
  theCanvas.parent(canvasDiv);

  theInput = document.getElementById("input");

  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  angleMode(DEGREES);

  frase = new Frase();
  texto = preTexto = theInput.value;

  for (let i = 0; i < 6; i++) {
    tipuntos[i] = [omega[i], over[i], half[i], cut[i]];
  }
  tipuntos[VOCALINES] = ["I", "U"];
}

// -----------------------------------------------------------------------------------------DRAW
function draw() {
  texto = theInput.value; //capturar el texto del input

  if (texto != preTexto) {
    frase.actualizar(texto); //si cambió el input, actualizar la traducción

    background(220);
    frase.dibujar();
  }

  preTexto = texto;

  // let diam = width * 0.6;
  // ellipse(width / 2, height / 2, diam);

  // translate(width / 2, height / 2);
  // rotate(map(mouseX, 0, width, 360, 0));
  // ellipse(0, diam / 2, diam / 2);

  // translate(0, diam / 2);
  // rotate(map(mouseY, 0, height, 360, 0));
  // ellipse(0, diam / 4, diam / 5);
}

// --------------------------------------------------------------------------TIPO DE LETRA
function isLetraType(l, a) {
  return a.indexOf(l) >= 0;
}
function isLetraLine(l) {
  for (let i = LINES3; i <= VOCALINES; i++) {
    if (isLetraType(l, tipuntos[i])) {
      return true;
    }
  }
}

//
// -----------------------------------------------------------------------------------------CLASES

// --------------------------------------------------------------------------CLASE FRASE
class Frase {
  // -----------------------------------------------------------CONSTRUCTOR
  constructor() {
    this.frase;

    this.cantPalabras = 0;
    this.palabras = [];

    this.espacio = 0;
    this.diam = width * 0.75;
    this.grosor = this.diam / 65;
    this.diam2 = this.diam + (width - this.diam) / 2;

    this.posX = width / 2;
    this.posY = height / 2;

    this.linePoints = [];
  }

  // -----------------------------------------------------------ACTUALIZAR
  actualizar(p) {
    console.log("-Nueva frase: " + p);

    this.frase = p;
    this.palabras = this.frase.split(" "); //separar una palabra de otra
    this.cantPalabras = this.palabras.length;

    for (let i = 0; i < this.cantPalabras; i++) {
      this.palabras[i] = new Palabra(
        this.palabras[i],
        map(this.cantPalabras, 1, 2, this.diam * 0.5, this.diam * 0.465),
        this.diam / 2
      );
    }
  }

  // -----------------------------------------------------------DIBUJAR
  dibujar() {
    let linePoints = [];

    // -----------------------------------------------CONTORNO
    push();
    {
      noFill();
      stroke(0);
      strokeWeight(this.grosor);
      ellipse(this.posX, this.posY, this.diam);
      ellipse(this.posX, this.posY, this.diam2);
    }
    pop();

    // rotate(90);
    // -----------------------------------------------PALABRAS
    for (let i = 0; i < this.cantPalabras; i++) {
      this.palabras[i].dibujar(
        this.posX,
        this.posY,
        map(i, 0, this.cantPalabras, 360 + 90, 90)
      );

      linePoints = concat(linePoints, this.palabras[i].getLinePoints());
    }

    // -----------------------------------------------LÍNEAS
    push();

    for (let i = 0; i < linePoints.length; i++) {
      let p1 = linePoints[i];
      strokeWeight(p1.diam);

      if (!p1.lined) {
        // -----------------------------------------------VINCULAR CON OTRO PUNTO
        if (linePoints.length > 1) {
          for (let j = 0; j < linePoints.length; j++) {
            let p2 = linePoints[j];

            let diferente = p2 != p1;
            let disponible = !p2.lined;

            if (diferente && disponible) {
              let a1 = atan2(p2.posY - p1.posY, p2.posX - p1.posX);
              let enRangoDe1 =
                a1 >= p1.angle - p1.rango && a1 <= p1.angle + p1.rango;

              let a2 = atan2(p1.posY - p2.posY, p1.posX - p2.posX);
              let enRangoDe2 =
                a2 >= p2.angle - p2.rango && a2 <= p2.angle + p2.rango;

              if (enRangoDe1 && enRangoDe2) {
                console.log("conectando " + i + " con " + j);

                p1.conectar(p2);
                line(p1.posX, p1.posY, p2.posX, p2.posY);

                break;
              }
            }
          }
        }

        // -----------------------------------------------VINCULAR CON PUNTO RANDOM DEL PERÍMETRO
        if (!p1.lined) {
          let a = random(p1.angle - p1.rango, p1.angle + p1.rango);
          let x = this.posX + (this.diam2 / 2) * cos(a);
          let y = this.posY + (this.diam2 / 2) * sin(a);

          p1.lined = true;
          line(p1.posX, p1.posY, x, y);
        }
      }
    }

    pop();
  }
}

//
// --------------------------------------------------------------------------CLASE PALABRA
class Palabra {
  // -----------------------------------------------------------CONSTRUCTOR
  constructor(p, d, c) {
    console.log("--Nueva palabra: " + p);

    this.posX = 0;
    this.posY = 0;

    this.diam = d;
    this.rad = this.diam / 2;
    this.pos = c - this.rad;

    this.palabra = p;
    this.letras = this.palabra.split(""); //separar una letra de otra

    // -----------------------------------------------EXCEPCIONES DE LETRAS
    for (let i = 0; i < this.letras.length; i++) {
      let l = this.letras[i].toUpperCase();

      if (l == "Ñ") {
        l = "N";
      }

      if (i < this.letras.length - 1) {
        let n = this.letras[i + 1].toUpperCase();

        if (l == "C" && n == "H") {
          l = "CH";
          this.letras.splice(i + 1, 1);
        } else if (l == "S" && n == "H") {
          l = "SH";
          this.letras.splice(i + 1, 1);
        } else if (l == "T" && n == "H") {
          l = "TH";
          this.letras.splice(i + 1, 1);
        } else if (l == "N" && n == "G") {
          l = "NG";
          this.letras.splice(i + 1, 1);
        } else if (l == "Q" && n == "U") {
          l = "QU";
          this.letras.splice(i + 1, 1);
        } else if (l == "C") {
          if (n == "E" || n == "I") {
            l = "S";
          } else {
            l = "K";
          }
        }
      } else {
        if (l == "Q") {
          l = "QU";
        } else if (l == "C") {
          l = "K";
        }
      }

      this.letras[i] = l;
    }

    this.cantLetras = this.letras.length;
    this.cantLetrasPropias = 0;

    // -----------------------------------------------CREAR OBJETOS LETRA
    for (let i = 0; i < this.cantLetras; i++) {
      let l = this.letras[i];

      let esVocal = isLetraType(l, vocales);
      let esVocalInicial = i === 0 && esVocal;
      let esVocalSinPrevia =
        i > 0
          ? esVocal && isLetraType(this.letras[i - 1].letra, vocales)
          : false;
      let esVocalRara = esVocalInicial || esVocalSinPrevia;
      let esPropia = esVocalRara || !esVocal;

      if (esPropia === true) {
        this.cantLetrasPropias++;
      }

      this.letras[i] = new Letra(this.letras[i], esPropia);
    }
    let m = map(
      this.cantLetrasPropias / 2,
      1,
      2,
      this.rad * 0.95,
      this.rad * 0.725
    );
    for (let i = 0; i < this.cantLetras; i++) {
      this.letras[i].setTam(this.rad, m);
    }
  }

  // -----------------------------------------------------------DIBUJAR
  dibujar(x, y, r) {
    push();
    {
      this.posX = x + this.pos * cos(r);
      this.posY = y + this.pos * sin(r);
      // translate(x, y);
      // rotate(r);

      stroke(0);
      // ellipse(0, this.pos, this.diam);
      ellipse(this.posX, this.posY, this.diam);

      let _i = 0;
      for (let i = 0; i < this.cantLetras; i++) {
        if (i > 0 && this.letras[i].esPropia === true) {
          _i++;
        }
        let m = map(_i, 0, this.cantLetrasPropias, r, r - 360);

        this.letras[i].dibujar(this.posX, this.posY, m);
      }
    }
    pop();
  }

  // -----------------------------------------------------------DEVOLVER PUNTOS PARA LÍNEAS
  getLinePoints() {
    let linePoints = [];

    for (let l of this.letras) {
      linePoints = concat(linePoints, l.getLinePoints());
    }

    return linePoints;
  }

  // // -----------------------------------------------------------DEVOLVER PUNTOS LIBRES DEL PERÍMETRO
  // getPerimetroPoints() {
  //   let pp = [];

  //   for (let i = 1; i < this.letras.length; i++) {
  //     let l1 = this.letras[i];
  //     let l0 = this.letras[i - 1];

  //     let a0 = atan2(l0.posY - this.posY, l0.posX - this.posX);
  //     let a1 = atan2(l1.posY - this.posY, l1.posX - this.posX);
  //     let a = a0 + (a1 - a0) / 2;

  //     pp.push(a);
  //   }

  //   return pp;

  //   // let a = random(360);
  //   // let x = this.posX + (this.diam / 2) * cos(a);
  //   // let y = this.posY + (this.diam / 2) * sin(a);

  //   // return { x: x, y: y };
  // }
}

//
// --------------------------------------------------------------------------CLASE LETRA
class Letra {
  // -----------------------------------------------------------CONSTRUCTOR
  constructor(l, e) {
    console.log("---Nueva letra: " + l);

    this.letra = l;
    this.esPropia = e;
    this.angleRange = 40;

    this.distan = 0;
    this.tam = 0;
  }
  setTam(d, t) {
    this.distan = d;
    this.tam = t;
    // -----------------------------------------------DISTANCIA AL BORDE
    if (
      this.soyLetraType(tipuntos[POINTS2]) ||
      this.soyLetraType(tipuntos[POINTS3])
    ) {
      this.tam *= 0.85;
    }

    if (this.soyLetraType(omega)) {
      this.distan -= this.tam * 0.475;
    } else if (this.soyLetraType(over)) {
      this.tam *= 0.85;
      this.distan -= this.tam * 0.6;
    }

    // -----------------------------------------------CREAR PUNTITOS
    this.points = [];
    this.createPoints(POINTS2, 2, -this.tam * (2 / 3));
    this.createPoints(POINTS3, 3, -this.tam * (2 / 3));
    this.createPoints(LINES3, 3, -this.tam / 2);
    this.createPoints(LINES1, 1, -this.tam / 2);
    this.createPoints(LINES2, 2, -this.tam / 2);

    // -----------------------------------------------VOCALES
    if (this.soyLetraType(vocales)) {
      this.tam *= 0.375;

      let disDif = this.tam * (2 / 3);

      if (this.letra === "A") {
        this.distan += disDif;
      }
      if (this.letra === "I") {
        this.points.push(new Points(this, VOCALINES, -this.tam / 2));
      }
      if (this.letra === "O") {
        this.distan -= disDif + this.tam * 2;
      }
      if (this.letra === "U") {
        this.points.push(new Points(this, VOCALINES, this.tam / 2));
      }
    }
  }

  // -----------------------------------------------------------DIBUJAR
  dibujar(x, y, r) {
    push();
    {
      this.posX = x + this.distan * cos(r);
      this.posY = y + this.distan * sin(r);

      stroke(0);
      text(this.letra, this.posX, this.posY);

      noFill();
      if (!this.soyLetraType(half)) {
        ellipse(this.posX, this.posY, this.tam);
      }
    }
    pop();

    // -----------------------------------------------TIPO DE ARCO
    push();
    if (this.soyLetraType(omega) || this.soyLetraType(half)) {
      if (this.soyLetraType(omega)) {
        let newX = this.posX + this.tam * 0.475 * cos(r);
        let newY = this.posY + this.tam * 0.475 * sin(r);
        translate(newX, newY);
        rotate(r);
        fill(360);
        noStroke();
        ellipse(0, 0, this.tam / 3);
      } else if (this.soyLetraType(half)) {
        let newX = this.posX + cos(r);
        let newY = this.posY + sin(r);
        translate(newX, newY);
        rotate(r);

        let ang = 107;
        noFill();
        stroke(0);
        arc(0, 0, this.tam, this.tam, ang, -ang, OPEN);

        let newTam = this.tam * 0.975;
        fill(360);
        noStroke();
        arc(0, 0, newTam, newTam, ang * 0.8, -ang * 0.8, OPEN);
      }
    }
    pop();

    // -----------------------------------------------PUNTOS
    if (!this.soyLetraType(tipuntos[NoPOINTS])) {
      this.setPoints(this.posX, this.posY, r);
    }
  }

  // -----------------------------------------------------------SABER TIPO DE LETRA
  soyLetraType(a) {
    return isLetraType(this.letra, a);
  }

  // -----------------------------------------------------------CREAR PUNTOS
  createPoints(tipo, cant, distan) {
    if (this.soyLetraType(tipuntos[tipo])) {
      for (let i = 0; i < cant; i++) {
        this.points.push(new Points(this, tipo, distan)); //asigna la cantidad de líneas según el tipo de letra
      }
    }
  }

  // -----------------------------------------------------------PONER PUNTOS
  setPoints(x, y, r) {
    let n = this.points.length;
    for (let i = 0; i < n; i++) {
      this.points[i].ubicar(
        x,
        y,
        n === 1
          ? r
          : map(
              i,
              0,
              this.points.length - 1,
              r - this.angleRange,
              r + this.angleRange
            )
      );
    }
  }

  // -----------------------------------------------------------DEVOLVER PUNTOS PARA LÍNEAS
  getLinePoints() {
    let linePoints = [];

    for (let p of this.points) {
      if (p.isLine) {
        linePoints.push(p);
      }
    }

    return linePoints;
  }
}

// --------------------------------------------------------------------------CLASE PUNTO PARA LÍNEA
class Points {
  // -----------------------------------------------------------CONSTRUCTOR
  constructor(l, t, d) {
    this.posX = 0;
    this.posY = 0;

    this.distan = d;

    this.tipo = t;
    this.isLine = false;
    if (this.tipo >= LINES3 && this.tipo <= VOCALINES) {
      this.isLine = true;
    }

    this.letra = l;
    this.lineTo;
    this.lined = false;

    this.angle = 0;
    this.rango = 45;

    this.diam = 5 / 2;
  }

  // -----------------------------------------------------------ACTUALIZAR
  ubicar(x, y, r) {
    this.posX = x + this.distan * cos(r);
    this.posY = y + this.distan * sin(r);

    this.angle = atan2(
      this.posY - this.letra.posY,
      this.posX - this.letra.posX
    );

    push();
    noStroke();
    fill(0);
    ellipse(this.posX, this.posY, this.diam);

    // stroke(180, 100, 100);
    // line(
    //   this.posX + -this.distan * cos(r),
    //   this.posY + -this.distan * sin(r),
    //   this.posX + this.distan * cos(r),
    //   this.posY + this.distan * sin(r)
    // );
    pop();
  }

  conectar(p) {
    if (!this.lined && !p.lined) {
      this.lineTo = p;
      this.lined = true;

      p.lineTo = this;
      p.lined = true;
    }
  }
}
