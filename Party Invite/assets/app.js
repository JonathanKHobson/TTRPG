(() => {
  // node_modules/canvas-confetti/dist/confetti.module.mjs
  var module = {};
  (function main(global, module2, isWorker, workerSize) {
    var canUseWorker = !!(global.Worker && global.Blob && global.Promise && global.OffscreenCanvas && global.OffscreenCanvasRenderingContext2D && global.HTMLCanvasElement && global.HTMLCanvasElement.prototype.transferControlToOffscreen && global.URL && global.URL.createObjectURL);
    var canUsePaths = typeof Path2D === "function" && typeof DOMMatrix === "function";
    var canDrawBitmap = (function() {
      if (!global.OffscreenCanvas) {
        return false;
      }
      try {
        var canvas = new OffscreenCanvas(1, 1);
        var ctx = canvas.getContext("2d");
        ctx.fillRect(0, 0, 1, 1);
        var bitmap = canvas.transferToImageBitmap();
        ctx.createPattern(bitmap, "no-repeat");
      } catch (e) {
        return false;
      }
      return true;
    })();
    function noop() {
    }
    function promise(func) {
      var ModulePromise = module2.exports.Promise;
      var Prom = ModulePromise !== void 0 ? ModulePromise : global.Promise;
      if (typeof Prom === "function") {
        return new Prom(func);
      }
      func(noop, noop);
      return null;
    }
    var bitmapMapper = /* @__PURE__ */ (function(skipTransform, map) {
      return {
        transform: function(bitmap) {
          if (skipTransform) {
            return bitmap;
          }
          if (map.has(bitmap)) {
            return map.get(bitmap);
          }
          var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          var ctx = canvas.getContext("2d");
          ctx.drawImage(bitmap, 0, 0);
          map.set(bitmap, canvas);
          return canvas;
        },
        clear: function() {
          map.clear();
        }
      };
    })(canDrawBitmap, /* @__PURE__ */ new Map());
    var raf = (function() {
      var TIME = Math.floor(1e3 / 60);
      var frame, cancel;
      var frames = {};
      var lastFrameTime = 0;
      if (typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function") {
        frame = function(cb) {
          var id = Math.random();
          frames[id] = requestAnimationFrame(function onFrame(time) {
            if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
              lastFrameTime = time;
              delete frames[id];
              cb();
            } else {
              frames[id] = requestAnimationFrame(onFrame);
            }
          });
          return id;
        };
        cancel = function(id) {
          if (frames[id]) {
            cancelAnimationFrame(frames[id]);
          }
        };
      } else {
        frame = function(cb) {
          return setTimeout(cb, TIME);
        };
        cancel = function(timer) {
          return clearTimeout(timer);
        };
      }
      return { frame, cancel };
    })();
    var getWorker = /* @__PURE__ */ (function() {
      var worker;
      var prom;
      var resolves = {};
      function decorate(worker2) {
        function execute(options, callback) {
          worker2.postMessage({ options: options || {}, callback });
        }
        worker2.init = function initWorker(canvas) {
          var offscreen = canvas.transferControlToOffscreen();
          worker2.postMessage({ canvas: offscreen }, [offscreen]);
        };
        worker2.fire = function fireWorker(options, size, done) {
          if (prom) {
            execute(options, null);
            return prom;
          }
          var id = Math.random().toString(36).slice(2);
          prom = promise(function(resolve) {
            function workerDone(msg) {
              if (msg.data.callback !== id) {
                return;
              }
              delete resolves[id];
              worker2.removeEventListener("message", workerDone);
              prom = null;
              bitmapMapper.clear();
              done();
              resolve();
            }
            worker2.addEventListener("message", workerDone);
            execute(options, id);
            resolves[id] = workerDone.bind(null, { data: { callback: id } });
          });
          return prom;
        };
        worker2.reset = function resetWorker() {
          worker2.postMessage({ reset: true });
          for (var id in resolves) {
            resolves[id]();
            delete resolves[id];
          }
        };
      }
      return function() {
        if (worker) {
          return worker;
        }
        if (!isWorker && canUseWorker) {
          var code = [
            "var CONFETTI, SIZE = {}, module = {};",
            "(" + main.toString() + ")(this, module, true, SIZE);",
            "onmessage = function(msg) {",
            "  if (msg.data.options) {",
            "    CONFETTI(msg.data.options).then(function () {",
            "      if (msg.data.callback) {",
            "        postMessage({ callback: msg.data.callback });",
            "      }",
            "    });",
            "  } else if (msg.data.reset) {",
            "    CONFETTI && CONFETTI.reset();",
            "  } else if (msg.data.resize) {",
            "    SIZE.width = msg.data.resize.width;",
            "    SIZE.height = msg.data.resize.height;",
            "  } else if (msg.data.canvas) {",
            "    SIZE.width = msg.data.canvas.width;",
            "    SIZE.height = msg.data.canvas.height;",
            "    CONFETTI = module.exports.create(msg.data.canvas);",
            "  }",
            "}"
          ].join("\n");
          try {
            worker = new Worker(URL.createObjectURL(new Blob([code])));
          } catch (e) {
            typeof console !== "undefined" && typeof console.warn === "function" ? console.warn("\u{1F38A} Could not load worker", e) : null;
            return null;
          }
          decorate(worker);
        }
        return worker;
      };
    })();
    var defaults = {
      particleCount: 50,
      angle: 90,
      spread: 45,
      startVelocity: 45,
      decay: 0.9,
      gravity: 1,
      drift: 0,
      ticks: 200,
      x: 0.5,
      y: 0.5,
      shapes: ["square", "circle"],
      zIndex: 100,
      colors: [
        "#26ccff",
        "#a25afd",
        "#ff5e7e",
        "#88ff5a",
        "#fcff42",
        "#ffa62d",
        "#ff36ff"
      ],
      // probably should be true, but back-compat
      disableForReducedMotion: false,
      scalar: 1
    };
    function convert(val, transform) {
      return transform ? transform(val) : val;
    }
    function isOk(val) {
      return !(val === null || val === void 0);
    }
    function prop(options, name, transform) {
      return convert(
        options && isOk(options[name]) ? options[name] : defaults[name],
        transform
      );
    }
    function onlyPositiveInt(number) {
      return number < 0 ? 0 : Math.floor(number);
    }
    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }
    function toDecimal(str) {
      return parseInt(str, 16);
    }
    function colorsToRgb(colors) {
      return colors.map(hexToRgb);
    }
    function hexToRgb(str) {
      var val = String(str).replace(/[^0-9a-f]/gi, "");
      if (val.length < 6) {
        val = val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
      }
      return {
        r: toDecimal(val.substring(0, 2)),
        g: toDecimal(val.substring(2, 4)),
        b: toDecimal(val.substring(4, 6))
      };
    }
    function getOrigin(options) {
      var origin = prop(options, "origin", Object);
      origin.x = prop(origin, "x", Number);
      origin.y = prop(origin, "y", Number);
      return origin;
    }
    function setCanvasWindowSize(canvas) {
      canvas.width = document.documentElement.clientWidth;
      canvas.height = document.documentElement.clientHeight;
    }
    function setCanvasRectSize(canvas) {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    function getCanvas(zIndex) {
      var canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.top = "0px";
      canvas.style.left = "0px";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = zIndex;
      return canvas;
    }
    function ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(radiusX, radiusY);
      context.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
      context.restore();
    }
    function randomPhysics(opts) {
      var radAngle = opts.angle * (Math.PI / 180);
      var radSpread = opts.spread * (Math.PI / 180);
      return {
        x: opts.x,
        y: opts.y,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
        velocity: opts.startVelocity * 0.5 + Math.random() * opts.startVelocity,
        angle2D: -radAngle + (0.5 * radSpread - Math.random() * radSpread),
        tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
        color: opts.color,
        shape: opts.shape,
        tick: 0,
        totalTicks: opts.ticks,
        decay: opts.decay,
        drift: opts.drift,
        random: Math.random() + 2,
        tiltSin: 0,
        tiltCos: 0,
        wobbleX: 0,
        wobbleY: 0,
        gravity: opts.gravity * 3,
        ovalScalar: 0.6,
        scalar: opts.scalar,
        flat: opts.flat
      };
    }
    function updateFetti(context, fetti) {
      fetti.x += Math.cos(fetti.angle2D) * fetti.velocity + fetti.drift;
      fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
      fetti.velocity *= fetti.decay;
      if (fetti.flat) {
        fetti.wobble = 0;
        fetti.wobbleX = fetti.x + 10 * fetti.scalar;
        fetti.wobbleY = fetti.y + 10 * fetti.scalar;
        fetti.tiltSin = 0;
        fetti.tiltCos = 0;
        fetti.random = 1;
      } else {
        fetti.wobble += fetti.wobbleSpeed;
        fetti.wobbleX = fetti.x + 10 * fetti.scalar * Math.cos(fetti.wobble);
        fetti.wobbleY = fetti.y + 10 * fetti.scalar * Math.sin(fetti.wobble);
        fetti.tiltAngle += 0.1;
        fetti.tiltSin = Math.sin(fetti.tiltAngle);
        fetti.tiltCos = Math.cos(fetti.tiltAngle);
        fetti.random = Math.random() + 2;
      }
      var progress = fetti.tick++ / fetti.totalTicks;
      var x1 = fetti.x + fetti.random * fetti.tiltCos;
      var y1 = fetti.y + fetti.random * fetti.tiltSin;
      var x2 = fetti.wobbleX + fetti.random * fetti.tiltCos;
      var y2 = fetti.wobbleY + fetti.random * fetti.tiltSin;
      context.fillStyle = "rgba(" + fetti.color.r + ", " + fetti.color.g + ", " + fetti.color.b + ", " + (1 - progress) + ")";
      context.beginPath();
      if (canUsePaths && fetti.shape.type === "path" && typeof fetti.shape.path === "string" && Array.isArray(fetti.shape.matrix)) {
        context.fill(transformPath2D(
          fetti.shape.path,
          fetti.shape.matrix,
          fetti.x,
          fetti.y,
          Math.abs(x2 - x1) * 0.1,
          Math.abs(y2 - y1) * 0.1,
          Math.PI / 10 * fetti.wobble
        ));
      } else if (fetti.shape.type === "bitmap") {
        var rotation = Math.PI / 10 * fetti.wobble;
        var scaleX = Math.abs(x2 - x1) * 0.1;
        var scaleY = Math.abs(y2 - y1) * 0.1;
        var width = fetti.shape.bitmap.width * fetti.scalar;
        var height = fetti.shape.bitmap.height * fetti.scalar;
        var matrix = new DOMMatrix([
          Math.cos(rotation) * scaleX,
          Math.sin(rotation) * scaleX,
          -Math.sin(rotation) * scaleY,
          Math.cos(rotation) * scaleY,
          fetti.x,
          fetti.y
        ]);
        matrix.multiplySelf(new DOMMatrix(fetti.shape.matrix));
        var pattern = context.createPattern(bitmapMapper.transform(fetti.shape.bitmap), "no-repeat");
        pattern.setTransform(matrix);
        context.globalAlpha = 1 - progress;
        context.fillStyle = pattern;
        context.fillRect(
          fetti.x - width / 2,
          fetti.y - height / 2,
          width,
          height
        );
        context.globalAlpha = 1;
      } else if (fetti.shape === "circle") {
        context.ellipse ? context.ellipse(fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI) : ellipse(context, fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI);
      } else if (fetti.shape === "star") {
        var rot = Math.PI / 2 * 3;
        var innerRadius = 4 * fetti.scalar;
        var outerRadius = 8 * fetti.scalar;
        var x = fetti.x;
        var y = fetti.y;
        var spikes = 5;
        var step = Math.PI / spikes;
        while (spikes--) {
          x = fetti.x + Math.cos(rot) * outerRadius;
          y = fetti.y + Math.sin(rot) * outerRadius;
          context.lineTo(x, y);
          rot += step;
          x = fetti.x + Math.cos(rot) * innerRadius;
          y = fetti.y + Math.sin(rot) * innerRadius;
          context.lineTo(x, y);
          rot += step;
        }
      } else {
        context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
        context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
        context.lineTo(Math.floor(x2), Math.floor(y2));
        context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
      }
      context.closePath();
      context.fill();
      return fetti.tick < fetti.totalTicks;
    }
    function animate(canvas, fettis, resizer, size, done) {
      var animatingFettis = fettis.slice();
      var context = canvas.getContext("2d");
      var animationFrame;
      var destroy;
      var prom = promise(function(resolve) {
        function onDone() {
          animationFrame = destroy = null;
          context.clearRect(0, 0, size.width, size.height);
          bitmapMapper.clear();
          done();
          resolve();
        }
        function update() {
          if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
            size.width = canvas.width = workerSize.width;
            size.height = canvas.height = workerSize.height;
          }
          if (!size.width && !size.height) {
            resizer(canvas);
            size.width = canvas.width;
            size.height = canvas.height;
          }
          context.clearRect(0, 0, size.width, size.height);
          animatingFettis = animatingFettis.filter(function(fetti) {
            return updateFetti(context, fetti);
          });
          if (animatingFettis.length) {
            animationFrame = raf.frame(update);
          } else {
            onDone();
          }
        }
        animationFrame = raf.frame(update);
        destroy = onDone;
      });
      return {
        addFettis: function(fettis2) {
          animatingFettis = animatingFettis.concat(fettis2);
          return prom;
        },
        canvas,
        promise: prom,
        reset: function() {
          if (animationFrame) {
            raf.cancel(animationFrame);
          }
          if (destroy) {
            destroy();
          }
        }
      };
    }
    function confettiCannon(canvas, globalOpts) {
      var isLibCanvas = !canvas;
      var allowResize = !!prop(globalOpts || {}, "resize");
      var hasResizeEventRegistered = false;
      var globalDisableForReducedMotion = prop(globalOpts, "disableForReducedMotion", Boolean);
      var shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, "useWorker");
      var worker = shouldUseWorker ? getWorker() : null;
      var resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize;
      var initialized = canvas && worker ? !!canvas.__confetti_initialized : false;
      var preferLessMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion)").matches;
      var animationObj;
      function fireLocal(options, size, done) {
        var particleCount = prop(options, "particleCount", onlyPositiveInt);
        var angle = prop(options, "angle", Number);
        var spread = prop(options, "spread", Number);
        var startVelocity = prop(options, "startVelocity", Number);
        var decay = prop(options, "decay", Number);
        var gravity = prop(options, "gravity", Number);
        var drift = prop(options, "drift", Number);
        var colors = prop(options, "colors", colorsToRgb);
        var ticks = prop(options, "ticks", Number);
        var shapes = prop(options, "shapes");
        var scalar = prop(options, "scalar");
        var flat = !!prop(options, "flat");
        var origin = getOrigin(options);
        var temp = particleCount;
        var fettis = [];
        var startX = canvas.width * origin.x;
        var startY = canvas.height * origin.y;
        while (temp--) {
          fettis.push(
            randomPhysics({
              x: startX,
              y: startY,
              angle,
              spread,
              startVelocity,
              color: colors[temp % colors.length],
              shape: shapes[randomInt(0, shapes.length)],
              ticks,
              decay,
              gravity,
              drift,
              scalar,
              flat
            })
          );
        }
        if (animationObj) {
          return animationObj.addFettis(fettis);
        }
        animationObj = animate(canvas, fettis, resizer, size, done);
        return animationObj.promise;
      }
      function fire(options) {
        var disableForReducedMotion = globalDisableForReducedMotion || prop(options, "disableForReducedMotion", Boolean);
        var zIndex = prop(options, "zIndex", Number);
        if (disableForReducedMotion && preferLessMotion) {
          return promise(function(resolve) {
            resolve();
          });
        }
        if (isLibCanvas && animationObj) {
          canvas = animationObj.canvas;
        } else if (isLibCanvas && !canvas) {
          canvas = getCanvas(zIndex);
          document.body.appendChild(canvas);
        }
        if (allowResize && !initialized) {
          resizer(canvas);
        }
        var size = {
          width: canvas.width,
          height: canvas.height
        };
        if (worker && !initialized) {
          worker.init(canvas);
        }
        initialized = true;
        if (worker) {
          canvas.__confetti_initialized = true;
        }
        function onResize() {
          if (worker) {
            var obj = {
              getBoundingClientRect: function() {
                if (!isLibCanvas) {
                  return canvas.getBoundingClientRect();
                }
              }
            };
            resizer(obj);
            worker.postMessage({
              resize: {
                width: obj.width,
                height: obj.height
              }
            });
            return;
          }
          size.width = size.height = null;
        }
        function done() {
          animationObj = null;
          if (allowResize) {
            hasResizeEventRegistered = false;
            global.removeEventListener("resize", onResize);
          }
          if (isLibCanvas && canvas) {
            if (document.body.contains(canvas)) {
              document.body.removeChild(canvas);
            }
            canvas = null;
            initialized = false;
          }
        }
        if (allowResize && !hasResizeEventRegistered) {
          hasResizeEventRegistered = true;
          global.addEventListener("resize", onResize, false);
        }
        if (worker) {
          return worker.fire(options, size, done);
        }
        return fireLocal(options, size, done);
      }
      fire.reset = function() {
        if (worker) {
          worker.reset();
        }
        if (animationObj) {
          animationObj.reset();
        }
      };
      return fire;
    }
    var defaultFire;
    function getDefaultFire() {
      if (!defaultFire) {
        defaultFire = confettiCannon(null, { useWorker: true, resize: true });
      }
      return defaultFire;
    }
    function transformPath2D(pathString, pathMatrix, x, y, scaleX, scaleY, rotation) {
      var path2d = new Path2D(pathString);
      var t1 = new Path2D();
      t1.addPath(path2d, new DOMMatrix(pathMatrix));
      var t2 = new Path2D();
      t2.addPath(t1, new DOMMatrix([
        Math.cos(rotation) * scaleX,
        Math.sin(rotation) * scaleX,
        -Math.sin(rotation) * scaleY,
        Math.cos(rotation) * scaleY,
        x,
        y
      ]));
      return t2;
    }
    function shapeFromPath(pathData) {
      if (!canUsePaths) {
        throw new Error("path confetti are not supported in this browser");
      }
      var path, matrix;
      if (typeof pathData === "string") {
        path = pathData;
      } else {
        path = pathData.path;
        matrix = pathData.matrix;
      }
      var path2d = new Path2D(path);
      var tempCanvas = document.createElement("canvas");
      var tempCtx = tempCanvas.getContext("2d");
      if (!matrix) {
        var maxSize = 1e3;
        var minX = maxSize;
        var minY = maxSize;
        var maxX = 0;
        var maxY = 0;
        var width, height;
        for (var x = 0; x < maxSize; x += 2) {
          for (var y = 0; y < maxSize; y += 2) {
            if (tempCtx.isPointInPath(path2d, x, y, "nonzero")) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }
        width = maxX - minX;
        height = maxY - minY;
        var maxDesiredSize = 10;
        var scale = Math.min(maxDesiredSize / width, maxDesiredSize / height);
        matrix = [
          scale,
          0,
          0,
          scale,
          -Math.round(width / 2 + minX) * scale,
          -Math.round(height / 2 + minY) * scale
        ];
      }
      return {
        type: "path",
        path,
        matrix
      };
    }
    function shapeFromText(textData) {
      var text, scalar = 1, color = "#000000", fontFamily = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';
      if (typeof textData === "string") {
        text = textData;
      } else {
        text = textData.text;
        scalar = "scalar" in textData ? textData.scalar : scalar;
        fontFamily = "fontFamily" in textData ? textData.fontFamily : fontFamily;
        color = "color" in textData ? textData.color : color;
      }
      var fontSize = 10 * scalar;
      var font = "" + fontSize + "px " + fontFamily;
      var canvas = new OffscreenCanvas(fontSize, fontSize);
      var ctx = canvas.getContext("2d");
      ctx.font = font;
      var size = ctx.measureText(text);
      var width = Math.ceil(size.actualBoundingBoxRight + size.actualBoundingBoxLeft);
      var height = Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent);
      var padding = 2;
      var x = size.actualBoundingBoxLeft + padding;
      var y = size.actualBoundingBoxAscent + padding;
      width += padding + padding;
      height += padding + padding;
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext("2d");
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      var scale = 1 / scalar;
      return {
        type: "bitmap",
        // TODO these probably need to be transfered for workers
        bitmap: canvas.transferToImageBitmap(),
        matrix: [scale, 0, 0, scale, -width * scale / 2, -height * scale / 2]
      };
    }
    module2.exports = function() {
      return getDefaultFire().apply(this, arguments);
    };
    module2.exports.reset = function() {
      getDefaultFire().reset();
    };
    module2.exports.create = confettiCannon;
    module2.exports.shapeFromPath = shapeFromPath;
    module2.exports.shapeFromText = shapeFromText;
  })((function() {
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof self !== "undefined") {
      return self;
    }
    return this || {};
  })(), module, false);
  var confetti_module_default = module.exports;
  var create = module.exports.create;

  // src/data/content.js
  var eventContent = {
    title: "March 21st TTRPG Madness",
    subtitle: "A quest scroll for one very real party.",
    hostName: "Kyle Hobson",
    hostHandle: "KyleH",
    hostPhone: "480-254-0268",
    dateLabel: "Saturday, March 21, 2026",
    officialStart: "3:00 PM",
    earlyArrival: "1:00-2:00 PM",
    campaignStart: "4:00 PM",
    address: {
      full: "8540 E McDowell Rd Lot 32, Mesa, AZ 85207",
      street: "8540 E. McDowell Rd, Lot 32",
      city: "Mesa, AZ 85207",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=8540%20E%20McDowell%20Rd%20Lot%2032%2C%20Mesa%2C%20AZ%2085207"
    },
    intro: "Your intel hub: travel details, grocery claims, side quests, and party chaos \u2014 all here.",
    sceneKicker: "RuneSpark Celebration Logistics",
    sceneHeadline: "Your scroll is standing by.",
    sceneCopy: "Pick your adventurer. We'll pull the right scroll \u2014 no paperwork sabotage, probably.",
    sceneSecondary: "March 21. Mesa. Daggerheart at 4 PM. Food, side quests, and procurement drama follow.",
    primaryCTA: "Issue Scroll",
    namePrompt: "Choose your adventurer record",
    inviteSelectHint: "Pick your name. Your scroll arrives pre-loaded with obligations.",
    scrollHeadline: "March 21 field notice",
    satireTagline: "Issued by RuneSpark Celebration Logistics. Applause doubles as legal consent.",
    personalizedLead: "Looks good? Dive in for travel info, grocery duty, side quests, and mandatory chaos.",
    acceptInviteLabel: "Accept the Quest",
    changeGuestLabel: "Not Me",
    transitionLabel: "Deploying your quest board\u2026",
    copyAddressLabel: "Copy Address",
    accommodation: "Out-of-town guests are welcome to stay at Kyle's house between March 15 and March 24.",
    safetyNote: "Allergy and dietary notes are stored here for coordination, but Kyle still needs direct confirmation for anything safety-critical.",
    syncLabels: {
      "apps-script": "Live coordination",
      emailjs: "Email notifications enabled",
      local: "Saved on this device"
    }
  };
  var schedule = [
    {
      time: "9:30 AM",
      title: "Airport pickup: Mitch",
      detail: "Mesa Gateway Airport (AZA)"
    },
    {
      time: "12:30 PM",
      title: "Pickup: June Alice",
      detail: "Tempe Marketplace area"
    },
    {
      time: "1:00-2:00 PM",
      title: "House opens for early arrivals",
      detail: "Kitchen setup, catch-up time, and low-pressure pregame hangout"
    },
    {
      time: "3:00 PM",
      title: "Official party start",
      detail: "Everyone gathers at Kyle's house in Mesa"
    },
    {
      time: "4:00 PM",
      title: "Main event: Daggerheart campaign",
      detail: "Kyle's original campaign with Jenga tension mechanics"
    },
    {
      time: "During breaks",
      title: "Food, cooking, and recovery",
      detail: "Carnitas tacos, charros, quiche, and an optional ice cream bar"
    }
  ];
  var foodContributors = [
    {
      guestId: "anne-sly",
      item: "Rainbow quiche",
      note: "Prepared on-site at Kyle's house"
    },
    {
      guestId: "june-alice",
      item: "Carnitas tacos and frijoles charros",
      note: "Prepared on-site with Kyle"
    },
    {
      guestId: "kyle",
      item: "Homemade ice cream bar",
      note: "Flavor spread TBD"
    }
  ];
  var partyTabs = [
    { id: "my-info", label: "My Info" },
    { id: "party-plan", label: "Party Plan" },
    { id: "groceries", label: "Groceries" },
    { id: "activities", label: "Activities" },
    { id: "my-details", label: "My Details" }
  ];
  var dietaryFlags = [
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Nut allergy",
    "Dairy-free"
  ];

  // src/data/guests.js
  var guests = [
    {
      id: "kyle",
      displayName: "Kyle Hobson",
      aliases: ["KyleH"],
      hiddenFromInvite: true,
      travelType: "host",
      pickup: null,
      flight: null,
      arrivalOptions: [
        "Host mode: all roads lead to your kitchen."
      ],
      foodRole: "Host and ice cream architect",
      notes: "Host and game master."
    },
    {
      id: "mitch",
      displayName: "Mitch",
      aliases: ["Crag", "Infinitely0"],
      travelType: "flight",
      pickup: {
        driver: "Kyle",
        time: "9:30 AM",
        date: "March 21, 2026",
        location: "Mesa Gateway Airport (AZA)"
      },
      flight: {
        inbound: {
          airline: "Allegiant Air",
          flightNumber: "G4 1715",
          departureAirport: "LAS",
          departureLabel: "Harry Reid International Airport, Las Vegas",
          departureTime: "8:00 AM",
          arrivalAirport: "AZA",
          arrivalLabel: "Mesa Gateway Airport",
          arrivalTime: "9:21 AM",
          date: "March 21, 2026"
        },
        outbound: {
          airline: "Frontier Airlines",
          flightNumber: "F9 1019",
          departureAirport: "PHX",
          departureLabel: "Phoenix Sky Harbor",
          departureTime: "2:28 PM",
          arrivalAirport: "LAS",
          arrivalLabel: "Harry Reid International Airport, Las Vegas",
          date: "March 23, 2026"
        }
      },
      arrivalOptions: [],
      foodRole: null,
      notes: "First pickup of the day."
    },
    {
      id: "brian",
      displayName: "Brian",
      aliases: ["Kosros", "idislikebannanas"],
      travelType: "flight",
      pickup: {
        driver: "Kyle",
        time: "2:55 PM",
        date: "March 19, 2026",
        location: "Phoenix Sky Harbor (PHX)"
      },
      flight: {
        inbound: {
          airline: "Southwest",
          flightNumber: "3163 -> 3162",
          flightNumberIata: "WN3163",
          departureAirport: "MCO",
          departureLabel: "Orlando International Airport",
          departureTime: "11:20 AM",
          arrivalAirport: "PHX",
          arrivalLabel: "Phoenix Sky Harbor",
          arrivalTime: "2:55 PM",
          date: "March 19, 2026",
          layover: "Austin-Bergstrom International Airport (AUS)"
        },
        outbound: {
          airline: "Southwest",
          flightNumber: "2697 -> 2226",
          flightNumberIata: "WN2697",
          departureAirport: "PHX",
          departureLabel: "Phoenix Sky Harbor",
          departureTime: "9:00 AM",
          arrivalAirport: "MCO",
          arrivalLabel: "Orlando International Airport",
          arrivalTime: "6:20 PM",
          date: "March 22, 2026",
          layover: "Dallas Love Field (DAL)"
        }
      },
      arrivalOptions: [
        "You are already at Kyle's house before event day."
      ],
      foodRole: null,
      notes: "Staying at Kyle's house starting March 19."
    },
    {
      id: "eleni",
      displayName: "Eleni",
      aliases: ["Lopchop", "Kiran", "Mycostar", "Bibble"],
      travelType: "onsite",
      pickup: null,
      flight: null,
      arrivalOptions: [
        "You are already at Kyle's house before event day."
      ],
      foodRole: null,
      notes: "Already at Kyle's house before the event."
    },
    {
      id: "june-alice",
      displayName: "June Alice",
      aliases: ["June Alice"],
      travelType: "pickup",
      pickup: {
        driver: "Kyle",
        time: "12:30 PM",
        date: "March 21, 2026",
        location: "Tempe Marketplace area"
      },
      flight: null,
      arrivalOptions: [
        "Meet Kyle near Tempe Marketplace around 12:30 PM."
      ],
      foodRole: "Carnitas tacos and frijoles charros",
      notes: "Second pickup of the day."
    },
    {
      id: "maddie",
      displayName: "Maddie",
      aliases: ["maddzasaur"],
      travelType: "driving",
      pickup: null,
      flight: null,
      arrivalOptions: [
        "Join the morning run near Tempe Marketplace around 12:30 PM.",
        "Come to the house early anytime after 1:00 PM.",
        "Arrive for the official 3:00 PM start."
      ],
      foodRole: null,
      notes: "Local guest with flexible arrival."
    },
    {
      id: "anne-sly",
      displayName: "Anne",
      aliases: ["Sly", "Anne"],
      travelType: "driving",
      pickup: null,
      flight: null,
      arrivalOptions: [
        "Drive in for the official 3:00 PM start."
      ],
      foodRole: "Rainbow quiche",
      notes: "Anne and Sly are the same person."
    }
  ];
  function getGuestById(guestId) {
    return guests.find((guest) => guest.id === guestId) ?? null;
  }
  function getInviteGuests() {
    return guests.filter((guest) => !guest.hiddenFromInvite);
  }

  // src/data/activities.js
  var locationFilterOptions = [
    "At the House",
    "Mesa / East Valley",
    "Tempe / Chandler / Gilbert",
    "Scottsdale / North Scottsdale",
    "Phoenix / Central City",
    "West Valley",
    "Day Trip / Out of Town"
  ];
  var travelFilterOptions = [
    "At the House",
    "Nearby",
    "Medium Drive",
    "Long Drive",
    "Varies / Unknown"
  ];
  var durationFilterOptions = [
    "Quick Stop",
    "Half Day",
    "Most of the Day",
    "Full Day",
    "Flexible / Unknown"
  ];
  var costFilterOptions = [
    "Included",
    "Free",
    "Low Cost",
    "Moderate Cost",
    "High Cost",
    "Varies / Unknown"
  ];
  var energyFilterOptions = [
    "Low",
    "Low-Medium",
    "Medium",
    "Medium-High",
    "High"
  ];
  var activityAdvancedFilters = {
    location: locationFilterOptions,
    travel: travelFilterOptions,
    duration: durationFilterOptions,
    cost: costFilterOptions,
    energy: energyFilterOptions
  };
  var durationBucketGroups = {
    "Quick Stop": [
      "hike-hole-rock",
      "hike-papago"
    ],
    "Half Day": [
      "animal-sea-life",
      "animal-butterfly",
      "animal-herp",
      "adrenaline-escape-room",
      "adrenaline-bam-kazam",
      "adrenaline-octane",
      "adrenaline-andretti",
      "adrenaline-topgolf",
      "adrenaline-ifly",
      "adrenaline-fatcats",
      "adrenaline-gamers-guild",
      "museum-art",
      "museum-heard",
      "museum-natural-history",
      "museum-mesa-contemporary",
      "museum-mesa-arts",
      "nature-tempe-town-lake",
      "nature-riparian",
      "nature-botanical",
      "nature-japanese-garden",
      "nature-downtown-strolls",
      "hike-wind-cave",
      "hike-gateway",
      "hike-camelback-cholla",
      "hike-toms-thumb",
      "hike-fremont",
      "hike-camelback-echo",
      "hike-pinnacle",
      "hike-piestewa",
      "hike-holbert",
      "hike-lost-dog",
      "hike-hieroglyphic",
      "hike-wave-cave",
      "hike-hidden-valley"
    ],
    "Most of the Day": [
      "featured-daggerheart",
      "animal-phoenix-zoo",
      "animal-odysea",
      "animal-wildlife-world",
      "museum-science-center",
      "museum-mim",
      "nature-salt-river",
      "nature-saguaro-lake",
      "nature-revel-surf",
      "hike-pass-mountain",
      "hike-flatiron",
      "hike-browns-ranch",
      "trip-tortilla-flat",
      "trip-boyce",
      "trip-tonto-bridge",
      "trip-montezuma"
    ],
    "Flexible / Unknown": [
      "adrenaline-gamers-guild",
      "museum-mesa-arts",
      "nature-downtown-strolls"
    ],
    "Full Day": [
      "trip-payson",
      "trip-prescott",
      "trip-jerome",
      "trip-sedona",
      "trip-tucson",
      "trip-kartchner",
      "trip-flagstaff",
      "trip-petrified",
      "trip-tombstone",
      "trip-bisbee",
      "trip-grand-canyon"
    ]
  };
  var durationBucketById = Object.fromEntries(
    Object.entries(durationBucketGroups).flatMap(
      ([bucket, ids]) => ids.map((activityId) => [activityId, bucket])
    )
  );
  function getLocationGroup(activity) {
    if (activity.locationGroup !== void 0) {
      return activity.locationGroup;
    }
    const location2 = activity.location?.toLowerCase() ?? "";
    if (!location2 || /tbd/.test(location2)) {
      return null;
    }
    if (activity.category === "Day Trips") {
      return "Day Trip / Out of Town";
    }
    if (location2.includes("kyle's house")) {
      return "At the House";
    }
    if (location2.includes("mesa / scottsdale / chandler")) {
      return "Mesa / East Valley";
    }
    if (/west valley|glendale/.test(location2)) {
      return "West Valley";
    }
    if (/scottsdale/.test(location2)) {
      return "Scottsdale / North Scottsdale";
    }
    if (/tempe|chandler|gilbert/.test(location2)) {
      return "Tempe / Chandler / Gilbert";
    }
    if (/mesa|east valley|near east mesa|peralta|coon bluff|phon d\. sutton|butcher jones/.test(location2)) {
      return "Mesa / East Valley";
    }
    if (/phoenix|papago park|downtown phoenix|central phoenix|south mountain/.test(location2)) {
      return "Phoenix / Central City";
    }
    return "Day Trip / Out of Town";
  }
  function getTravelBucket(activity) {
    if (activity.travelBucket !== void 0) {
      return activity.travelBucket;
    }
    const driveTime = activity.driveTime?.toLowerCase() ?? "";
    if (!driveTime || /tbd/.test(driveTime)) {
      return null;
    }
    if (/already there|at the house/.test(driveTime)) {
      return "At the House";
    }
    if (/varies/.test(driveTime)) {
      return "Varies / Unknown";
    }
    const values = [...driveTime.matchAll(/\d+(?:\.\d+)?/g)].map(([match]) => Number(match));
    const maxValue = values.length ? Math.max(...values) : null;
    if (driveTime.includes("hr")) {
      return "Long Drive";
    }
    if (driveTime.includes("min")) {
      if (maxValue !== null && maxValue <= 20) {
        return "Nearby";
      }
      if (maxValue !== null && maxValue <= 60) {
        return "Medium Drive";
      }
      return "Long Drive";
    }
    if (driveTime.includes("mi")) {
      if (maxValue !== null && maxValue <= 15) {
        return "Nearby";
      }
      if (maxValue !== null && maxValue <= 30) {
        return "Medium Drive";
      }
      return "Long Drive";
    }
    return "Varies / Unknown";
  }
  function getDurationBucket(activity) {
    if (activity.durationBucket !== void 0) {
      return activity.durationBucket;
    }
    if (activity.activityId in durationBucketById) {
      return durationBucketById[activity.activityId];
    }
    if (activity.category === "Games") {
      if (activity.subtype === "Tabletop RPGs") {
        return "Most of the Day";
      }
      return "Half Day";
    }
    return null;
  }
  function getCostBucket(activity) {
    if (activity.costBucket !== void 0) {
      return activity.costBucket;
    }
    const cost = activity.cost?.toLowerCase() ?? "";
    if (!cost || /tbd/.test(cost)) {
      return null;
    }
    if (cost.includes("included")) {
      return "Included";
    }
    if (cost === "free" || cost.includes("often free")) {
      return "Free";
    }
    if (cost.includes("varies")) {
      return "Varies / Unknown";
    }
    if (cost.includes("low cost")) {
      return "Low Cost";
    }
    const values = [...cost.matchAll(/\d+(?:\.\d+)?/g)].map(([match]) => Number(match));
    const maxValue = values.length ? Math.max(...values) : null;
    if (maxValue === null) {
      return "Varies / Unknown";
    }
    if (maxValue <= 20) {
      return "Low Cost";
    }
    if (maxValue <= 60) {
      return "Moderate Cost";
    }
    return "High Cost";
  }
  function getEnergyBucket(activity) {
    if (activity.energyBucket !== void 0) {
      return activity.energyBucket;
    }
    return energyFilterOptions.includes(activity.energy) ? activity.energy : null;
  }
  function normalizeActivityForFilters(activity) {
    return {
      ...activity,
      locationGroup: getLocationGroup(activity),
      travelBucket: getTravelBucket(activity),
      durationBucket: getDurationBucket(activity),
      costBucket: getCostBucket(activity),
      energyBucket: getEnergyBucket(activity)
    };
  }
  var activityCategories = [
    "All",
    "Featured",
    "Animals",
    "Adrenaline",
    "Museums",
    "Nature",
    "Hiking",
    "Day Trips",
    "Games"
  ];
  var baseFeaturedActivities = [
    {
      activityId: "featured-daggerheart",
      title: "Daggerheart campaign with Jenga tension",
      category: "Featured",
      subtype: "Primary activity",
      location: "Kyle's house",
      driveTime: "Already there",
      cost: "Included",
      energy: "Medium-High",
      description: "Kyle's original story-first TTRPG session. This is the anchor event for the day and it is not voteable.",
      voteable: false,
      featured: true
    }
  ];
  var baseActivities = [
    { activityId: "animal-phoenix-zoo", title: "Phoenix Zoo", category: "Animals", subtype: "Animal attraction", location: "Papago Park", driveTime: "~20-55 min", cost: "$39.95 adult", energy: "Medium", description: "Large zoo day with good shoulder-season weather.", voteable: true, featured: false },
    { activityId: "animal-odysea", title: "OdySea Aquarium", category: "Animals", subtype: "Animal attraction", location: "Scottsdale", driveTime: "~25-55 min", cost: "$35-$55", energy: "Low-Medium", description: "Aquarium and Arizona Boardwalk options in the same zone.", voteable: true, featured: false },
    { activityId: "animal-sea-life", title: "SEA LIFE Arizona", category: "Animals", subtype: "Animal attraction", location: "Tempe", driveTime: "~20-50 min", cost: "$18-$22", energy: "Low", description: "Shorter aquarium stop near Arizona Mills.", voteable: true, featured: false },
    { activityId: "animal-butterfly", title: "Butterfly Wonderland", category: "Animals", subtype: "Animal attraction", location: "Scottsdale", driveTime: "~25-55 min", cost: "Varies", energy: "Low", description: "Light, colorful indoor outing at Arizona Boardwalk.", voteable: true, featured: false },
    { activityId: "animal-wildlife-world", title: "Wildlife World Zoo + Aquarium", category: "Animals", subtype: "Animal attraction", location: "West Valley", driveTime: "~60-90 min", cost: "$49 adult", energy: "Medium", description: "A longer zoo day if the group wants something bigger.", voteable: true, featured: false },
    { activityId: "animal-herp", title: "Phoenix Herpetological Sanctuary", category: "Animals", subtype: "Animal attraction", location: "North Scottsdale", driveTime: "~40-70 min", cost: "$25 adult", energy: "Low-Medium", description: "Reptile tour option with a more niche feel.", voteable: true, featured: false },
    { activityId: "adrenaline-escape-room", title: "Escape room", category: "Adrenaline", subtype: "Venue", location: "Puzzle Effect, Phoenix", driveTime: "~35-60 min", cost: "$37.95/person", energy: "High", description: "Good fit for a coordinated group that wants a puzzle challenge.", voteable: true, featured: false },
    { activityId: "adrenaline-bam-kazam", title: "Bam Kazam", category: "Adrenaline", subtype: "Venue", location: "Scottsdale", driveTime: "~25-55 min", cost: "$36/person", energy: "High", description: "A human arcade with physical challenge rooms.", voteable: true, featured: false },
    { activityId: "adrenaline-octane", title: "Octane Raceway", category: "Adrenaline", subtype: "Venue", location: "Scottsdale", driveTime: "~25-55 min", cost: "$26-$28/race + membership", energy: "High", description: "Go-karts, arcade, and VR in one stop.", voteable: true, featured: false },
    { activityId: "adrenaline-andretti", title: "Andretti Indoor Karting", category: "Adrenaline", subtype: "Venue", location: "Chandler", driveTime: "~25-55 min", cost: "$29/race", energy: "High", description: "Karting-heavy option on the Chandler side.", voteable: true, featured: false },
    { activityId: "adrenaline-topgolf", title: "Topgolf", category: "Adrenaline", subtype: "Venue", location: "Scottsdale or Glendale", driveTime: "~25-70 min", cost: "$25-$45/hr per bay", energy: "Medium", description: "Easy group activity with a flexible pace.", voteable: true, featured: false },
    { activityId: "adrenaline-ifly", title: "Indoor skydiving", category: "Adrenaline", subtype: "Venue", location: "iFLY, Scottsdale area", driveTime: "~25-55 min", cost: "$100+/person", energy: "High", description: "High-cost, high-novelty option.", voteable: true, featured: false },
    { activityId: "adrenaline-fatcats", title: "FatCats Mesa or Dave & Buster's", category: "Adrenaline", subtype: "Venue", location: "Mesa", driveTime: "~5-20 min", cost: "Varies", energy: "Medium", description: "Bowling, arcade, and movies with low planning overhead.", voteable: true, featured: false },
    { activityId: "adrenaline-gamers-guild", title: "Gamers Guild", category: "Adrenaline", subtype: "Venue", location: "Tempe or North Phoenix", driveTime: "Varies", cost: "Low cost", energy: "Low-Medium", description: "Good backup if the group wants a dedicated board game venue.", voteable: true, featured: false },
    { activityId: "museum-science-center", title: "Arizona Science Center + Dome", category: "Museums", subtype: "Museum", location: "Downtown Phoenix", driveTime: "~35-60 min", cost: "$22.95 + $14 Dome", energy: "Medium", description: "Interactive museum day with an IMAX-style dome option.", voteable: true, featured: false },
    { activityId: "museum-mim", title: "Musical Instrument Museum", category: "Museums", subtype: "Museum", location: "North Phoenix", driveTime: "~45-75 min", cost: "$20 adult", energy: "Low", description: "Large, polished museum with broad appeal.", voteable: true, featured: false },
    { activityId: "museum-art", title: "Phoenix Art Museum", category: "Museums", subtype: "Museum", location: "Central Phoenix", driveTime: "~35-60 min", cost: "$28 adult", energy: "Low", description: "Straight art museum option with easy discussion fuel.", voteable: true, featured: false },
    { activityId: "museum-heard", title: "Heard Museum", category: "Museums", subtype: "Museum", location: "Central Phoenix", driveTime: "~35-60 min", cost: "$26 adult", energy: "Low", description: "High-value cultural museum stop.", voteable: true, featured: false },
    { activityId: "museum-natural-history", title: "AZ Museum of Natural History", category: "Museums", subtype: "Museum", location: "Downtown Mesa", driveTime: "~15-35 min", cost: "$16 adult", energy: "Low-Medium", description: "Close and easy if the group wants minimal travel.", voteable: true, featured: false },
    { activityId: "museum-mesa-contemporary", title: "Mesa Contemporary Arts Museum", category: "Museums", subtype: "Museum", location: "Mesa Arts Center", driveTime: "~15-35 min", cost: "Free", energy: "Low", description: "Fast and flexible arts stop.", voteable: true, featured: false },
    { activityId: "museum-mesa-arts", title: "Mesa Arts Center shows", category: "Museums", subtype: "Venue", location: "Downtown Mesa", driveTime: "~15-35 min", cost: "Varies", energy: "Low-Medium", description: "Event-dependent option if timing works.", voteable: true, featured: false },
    { activityId: "nature-salt-river", title: "Salt River wild horses", category: "Nature", subtype: "Scenic outing", location: "Coon Bluff / Phon D. Sutton", driveTime: "~25-55 min", cost: "$0-$8", energy: "Low-Medium", description: "Scenic desert river option with horse-spotting upside.", voteable: true, featured: false },
    { activityId: "nature-saguaro-lake", title: "Saguaro Lake beach day", category: "Nature", subtype: "Scenic outing", location: "Butcher Jones Day Use Area", driveTime: "~45-70 min", cost: "$8 day pass", energy: "Medium", description: "Easy beach-day energy if weather cooperates.", voteable: true, featured: false },
    { activityId: "nature-tempe-town-lake", title: "Tempe Town Lake walk and rentals", category: "Nature", subtype: "Scenic outing", location: "Tempe", driveTime: "~20-45 min", cost: "$0-$45+", energy: "Low-Medium", description: "Walk, pedal boats, kayaks, or SUP rentals.", voteable: true, featured: false },
    { activityId: "nature-riparian", title: "Riparian Preserve + stargazing", category: "Nature", subtype: "Scenic outing", location: "Gilbert", driveTime: "~20-40 min", cost: "Often free", energy: "Low", description: "Good slower option, especially later in the day.", voteable: true, featured: false },
    { activityId: "nature-botanical", title: "Desert Botanical Garden", category: "Nature", subtype: "Scenic outing", location: "Papago Park", driveTime: "~35-60 min", cost: "$33-$40", energy: "Low-Medium", description: "Reliable Arizona scenery with high hit rate for visitors.", voteable: true, featured: false },
    { activityId: "nature-japanese-garden", title: "Japanese Friendship Garden", category: "Nature", subtype: "Scenic outing", location: "Downtown Phoenix", driveTime: "~35-60 min", cost: "$14 adult", energy: "Low", description: "Calmer, lower-duration option.", voteable: true, featured: false },
    { activityId: "nature-revel-surf", title: "Revel Surf", category: "Nature", subtype: "Scenic outing", location: "Mesa", driveTime: "~10-35 min", cost: "Varies", energy: "Medium", description: "Surf park option close to base camp.", voteable: true, featured: false },
    { activityId: "nature-downtown-strolls", title: "Downtown strolls", category: "Nature", subtype: "Scenic outing", location: "Mesa / Scottsdale / Chandler", driveTime: "Varies", cost: "$0+", energy: "Low", description: "Flexible low-stakes wandering with food and shops.", voteable: true, featured: false },
    { activityId: "hike-pass-mountain", title: "Pass Mountain Loop", category: "Hiking", subtype: "Trail", location: "Near East Mesa", driveTime: "2.7 mi", cost: "Free", energy: "Medium", description: "7.5 miles, 1,200 ft gain, moderate loop.", voteable: true, featured: false },
    { activityId: "hike-wind-cave", title: "Wind Cave Trail", category: "Hiking", subtype: "Trail", location: "Near East Mesa", driveTime: "2.7 mi", cost: "Free", energy: "Medium", description: "3.2 miles, 1,043 ft gain, moderate out-and-back.", voteable: true, featured: false },
    { activityId: "hike-hole-rock", title: "Hole-in-the-Rock", category: "Hiking", subtype: "Trail", location: "Papago Park", driveTime: "16.8 mi", cost: "Free", energy: "Low", description: "0.3 miles, easy, quick iconic Phoenix stop.", voteable: true, featured: false },
    { activityId: "hike-papago", title: "Papago Park Nature Trail", category: "Hiking", subtype: "Trail", location: "Papago Park", driveTime: "17 mi", cost: "Free", energy: "Low", description: "0.5 miles, easy loop.", voteable: true, featured: false },
    { activityId: "hike-gateway", title: "Gateway Loop Trail", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "17.3 mi", cost: "Free", energy: "Medium", description: "4.4 miles, 718 ft gain, moderate loop.", voteable: true, featured: false },
    { activityId: "hike-camelback-cholla", title: "Camelback (Cholla)", category: "Hiking", subtype: "Trail", location: "Phoenix", driveTime: "17.3 mi", cost: "Free", energy: "High", description: "3 miles, 984 ft gain, hard out-and-back.", voteable: true, featured: false },
    { activityId: "hike-toms-thumb", title: "Tom's Thumb", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "17.6 mi", cost: "Free", energy: "High", description: "4 miles, 1,214 ft gain, hard out-and-back.", voteable: true, featured: false },
    { activityId: "hike-fremont", title: "Fremont Saddle", category: "Hiking", subtype: "Trail", location: "Peralta", driveTime: "18.3 mi", cost: "Free", energy: "Medium-High", description: "4.6 miles, 1,338 ft gain, moderate out-and-back.", voteable: true, featured: false },
    { activityId: "hike-camelback-echo", title: "Camelback (Echo Canyon)", category: "Hiking", subtype: "Trail", location: "Phoenix", driveTime: "18.9 mi", cost: "Free", energy: "High", description: "2.1 miles, 1,281 ft gain, extreme out-and-back.", voteable: true, featured: false },
    { activityId: "hike-pinnacle", title: "Pinnacle Peak Trail", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "21.7 mi", cost: "Free", energy: "Medium", description: "4.1 miles, 1,020 ft gain, moderate out-and-back.", voteable: true, featured: false },
    { activityId: "hike-piestewa", title: "Piestewa Peak #300", category: "Hiking", subtype: "Trail", location: "Phoenix", driveTime: "21.9 mi", cost: "Free", energy: "High", description: "2.4 miles, 1,208 ft gain, extreme.", voteable: true, featured: false },
    { activityId: "hike-holbert", title: "Holbert Trail to Dobbins", category: "Hiking", subtype: "Trail", location: "Phoenix", driveTime: "25.4 mi", cost: "Free", energy: "Medium", description: "4.6 miles, 1,000 ft gain, moderate.", voteable: true, featured: false },
    { activityId: "hike-flatiron", title: "Flatiron via Siphon Draw", category: "Hiking", subtype: "Trail", location: "East Valley", driveTime: "10 mi", cost: "Free", energy: "High", description: "6.6 miles, 3,000 ft gain, hard scramble.", voteable: true, featured: false },
    { activityId: "hike-lost-dog", title: "Lost Dog Trail", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "13 mi", cost: "Free", energy: "Medium", description: "4.2 miles, 413 ft gain, moderate out-and-back.", voteable: true, featured: false },
    { activityId: "hike-hieroglyphic", title: "Hieroglyphic Trail", category: "Hiking", subtype: "Trail", location: "East Valley", driveTime: "14.3 mi", cost: "Free", energy: "Medium", description: "3 miles, moderate, good seasonal water payoff.", voteable: true, featured: false },
    { activityId: "hike-browns-ranch", title: "Brown's Ranch Loop", category: "Hiking", subtype: "Trail", location: "Scottsdale", driveTime: "23.1 mi", cost: "Free", energy: "Low-Medium", description: "~6 miles, 400 ft gain, easy-moderate loop.", voteable: true, featured: false },
    { activityId: "hike-wave-cave", title: "Wave Cave Trail", category: "Hiking", subtype: "Trail", location: "East Valley", driveTime: "~30 mi", cost: "Free", energy: "Medium-High", description: "3.2 miles, 872 ft gain, moderate-hard.", voteable: true, featured: false },
    { activityId: "hike-hidden-valley", title: "Hidden Valley / Fat Man's Pass", category: "Hiking", subtype: "Trail", location: "South Mountain", driveTime: "22.8 mi", cost: "Free", energy: "Medium", description: "4 miles, 1,017 ft gain, moderate loop.", voteable: true, featured: false },
    { activityId: "trip-tortilla-flat", title: "Tortilla Flat + Canyon Lake", category: "Day Trips", subtype: "Day trip", location: "Apache Trail", driveTime: "~50-60 min", cost: "$0-$60", energy: "Medium", description: "Five-star scenic drive and desert lake option.", voteable: true, featured: false },
    { activityId: "trip-boyce", title: "Boyce Thompson Arboretum", category: "Day Trips", subtype: "Day trip", location: "Superior", driveTime: "~50-60 min", cost: "$50-$120", energy: "Low-Medium", description: "One of the best out-of-town options in the guide.", voteable: true, featured: false },
    { activityId: "trip-payson", title: "Payson / Rim Country", category: "Day Trips", subtype: "Day trip", location: "Rim Country", driveTime: "~1 hr 20 min", cost: "$0-$80", energy: "Medium", description: "Cooler pine-country reset.", voteable: true, featured: false },
    { activityId: "trip-tonto-bridge", title: "Tonto Natural Bridge", category: "Day Trips", subtype: "Day trip", location: "State park", driveTime: "~1 hr 30-45 min", cost: "$20-$100", energy: "Medium", description: "Big natural feature with steep trails.", voteable: true, featured: false },
    { activityId: "trip-montezuma", title: "Montezuma Castle + Well", category: "Day Trips", subtype: "Day trip", location: "Camp Verde area", driveTime: "~1 hr 40-2 hr", cost: "$20-$110", energy: "Low-Medium", description: "Cliff dwelling and museum paths.", voteable: true, featured: false },
    { activityId: "trip-prescott", title: "Prescott / Watson Lake", category: "Day Trips", subtype: "Day trip", location: "Prescott", driveTime: "~2 hr", cost: "$0-$90", energy: "Medium", description: "Lakes, boulders, and Whiskey Row.", voteable: true, featured: false },
    { activityId: "trip-jerome", title: "Jerome", category: "Day Trips", subtype: "Day trip", location: "Jerome", driveTime: "~2 hr 15 min", cost: "$0-$135", energy: "Low-Medium", description: "Wild hillside mining town.", voteable: true, featured: false },
    { activityId: "trip-sedona", title: "Sedona Red Rocks", category: "Day Trips", subtype: "Day trip", location: "Sedona", driveTime: "~2 hr 10-30 min", cost: "$0-$135", energy: "Medium", description: "Iconic views and short hikes.", voteable: true, featured: false },
    { activityId: "trip-tucson", title: "Tucson: Saguaro National Park", category: "Day Trips", subtype: "Day trip", location: "Tucson", driveTime: "~2 hr 10-40 min", cost: "$25-$145", energy: "Medium", description: "Strong first-time Arizona desert day.", voteable: true, featured: false },
    { activityId: "trip-kartchner", title: "Kartchner Caverns", category: "Day Trips", subtype: "Day trip", location: "State park", driveTime: "~2 hr 40 min", cost: "$20-$150", energy: "Low-Medium", description: "Cave tour plus visitor center.", voteable: true, featured: false },
    { activityId: "trip-flagstaff", title: "Flagstaff", category: "Day Trips", subtype: "Day trip", location: "Flagstaff", driveTime: "~2 hr 25-45 min", cost: "$0-$130", energy: "Medium", description: "Mountain town reset with cooler weather.", voteable: true, featured: false },
    { activityId: "trip-petrified", title: "Petrified Forest", category: "Day Trips", subtype: "Day trip", location: "National park", driveTime: "~3 hr 50-4 hr 15 min", cost: "$25-$185", energy: "Medium", description: "Long drive but memorable desert geology.", voteable: true, featured: false },
    { activityId: "trip-tombstone", title: "Tombstone", category: "Day Trips", subtype: "Day trip", location: "Tombstone", driveTime: "~2 hr 50-3 hr 15 min", cost: "$0-$155", energy: "Low-Medium", description: "Tourist old-west town energy.", voteable: true, featured: false },
    { activityId: "trip-bisbee", title: "Bisbee", category: "Day Trips", subtype: "Day trip", location: "Bisbee", driveTime: "~3 hr 15-45 min", cost: "$0-$145", energy: "Low-Medium", description: "Quirky mining town, best paired with Tombstone.", voteable: true, featured: false },
    { activityId: "trip-grand-canyon", title: "Grand Canyon South Rim", category: "Day Trips", subtype: "Day trip", location: "Grand Canyon", driveTime: "~3 hr 50-4 hr 30 min", cost: "$35-$210", energy: "Medium", description: "The obvious epic option, but also the longest day.", voteable: true, featured: false },
    { activityId: "game-custom-ttrpg", title: "Custom narrative tower system", category: "Games", subtype: "Tabletop RPGs", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Daggerheart plus Jenga tower plus Scrabble-style spellcraft hybrid.", voteable: true, featured: false },
    { activityId: "game-dnd", title: "Dungeons & Dragons", category: "Games", subtype: "Tabletop RPGs", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "Classic structured TTRPG fallback.", voteable: true, featured: false },
    { activityId: "game-ps4", title: "PlayStation 4", category: "Games", subtype: "Video Games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Console gaming with multiplayer options.", voteable: true, featured: false },
    { activityId: "game-wii", title: "Wii", category: "Games", subtype: "Video Games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Motion-based party-friendly console games.", voteable: true, featured: false },
    { activityId: "game-streaming", title: "Netflix or digital party games", category: "Games", subtype: "Video Games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Low-lift wind-down option.", voteable: true, featured: false },
    { activityId: "game-pool", title: "Swimming pool", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Pool time if March weather cooperates.", voteable: true, featured: false },
    { activityId: "game-croquet", title: "Croquet set", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Classic backyard pacing.", voteable: true, featured: false },
    { activityId: "game-badminton", title: "Badminton set", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Easy pairs activity.", voteable: true, featured: false },
    { activityId: "game-tennis", title: "Tennis equipment", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Casual tennis or hit-around.", voteable: true, featured: false },
    { activityId: "game-soccer", title: "Soccer balls and sports balls", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium-High", description: "Open-format outdoor play.", voteable: true, featured: false },
    { activityId: "game-bikes", title: "Bikes", category: "Games", subtype: "Outdoor", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Casual neighborhood riding.", voteable: true, featured: false },
    { activityId: "game-catan", title: "Settlers of Catan (+ expansions)", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Reliable strategy board game staple.", voteable: true, featured: false },
    { activityId: "game-risk", title: "Risk / Risk LoTR / Risk Battlefield", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Longer-form conquest options.", voteable: true, featured: false },
    { activityId: "game-ticket", title: "Ticket to Ride", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Friendly route-building strategy.", voteable: true, featured: false },
    { activityId: "game-trekking", title: "Trekking National Parks / World", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Travel-themed point collection.", voteable: true, featured: false },
    { activityId: "game-pandemic", title: "Pandemic", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Co-op crisis-solving.", voteable: true, featured: false },
    { activityId: "game-forbidden-island", title: "Forbidden Island", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Co-op treasure recovery adventure.", voteable: true, featured: false },
    { activityId: "game-stargate", title: "Stargate SG-1 Board Game", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Territory and mission strategy.", voteable: true, featured: false },
    { activityId: "game-blockus", title: "Blockus", category: "Games", subtype: "Strategy board games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Spatial tile placement strategy.", voteable: true, featured: false },
    { activityId: "game-command-nature", title: "Command of Nature", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Creature-based card battles.", voteable: true, featured: false },
    { activityId: "game-mtg", title: "Magic: The Gathering (Fallout deck)", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "One deck available.", voteable: true, featured: false },
    { activityId: "game-uno", title: "UNO (multiple versions)", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Standard, team, and revenge variants.", voteable: true, featured: false },
    { activityId: "game-good", title: "We're So Good", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Humorous social card game.", voteable: true, featured: false },
    { activityId: "game-dots", title: "Dots puzzle card game", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Quiet dot-alignment puzzle game.", voteable: true, featured: false },
    { activityId: "game-poker", title: "Texas Hold'em poker set", category: "Games", subtype: "Card games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Classic poker setup with chips.", voteable: true, featured: false },
    { activityId: "game-burrito", title: "Throw Throw Burrito", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "High-chaos foam dodgeball card hybrid.", voteable: true, featured: false },
    { activityId: "game-beat-that", title: "Beat That!", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "Stacking, flipping, and balancing challenges.", voteable: true, featured: false },
    { activityId: "game-herd", title: "Herd Mentality", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Match the group's answer to score.", voteable: true, featured: false },
    { activityId: "game-loaded-questions", title: "Loaded Questions", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Revealing question-driven party game.", voteable: true, featured: false },
    { activityId: "game-would-you-rather", title: "Would You Rather?", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Low-friction social game.", voteable: true, featured: false },
    { activityId: "game-things", title: "Game of Things", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Anonymous answer guessing game.", voteable: true, featured: false },
    { activityId: "game-gestures", title: "Gestures (charades)", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "Timed charades competition.", voteable: true, featured: false },
    { activityId: "game-headbands", title: "Headbands for Adults", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Guess the word on your head.", voteable: true, featured: false },
    { activityId: "game-campfire", title: "Campfire Stories Deck", category: "Games", subtype: "Party games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Storytelling prompt cards.", voteable: true, featured: false },
    { activityId: "game-pictionary", title: "Pictionary / Quickdraw", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "High", description: "Drawing and guessing with faster variant support.", voteable: true, featured: false },
    { activityId: "game-pie-face", title: "Pie Face", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Whipped-cream surprise game.", voteable: true, featured: false },
    { activityId: "game-dinosaurs", title: "Happy Little Dinosaurs", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Light strategy survival card game.", voteable: true, featured: false },
    { activityId: "game-candy-land", title: "Candy Land", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Classic children's board game.", voteable: true, featured: false },
    { activityId: "game-greedy-granny", title: "Greedy Granny", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Sneak treats without waking granny.", voteable: true, featured: false },
    { activityId: "game-guess-10", title: "Guess in 10", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Ask up to ten questions to guess right.", voteable: true, featured: false },
    { activityId: "game-freeze-frame", title: "Freeze Frame", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Freeze-in-place party game.", voteable: true, featured: false },
    { activityId: "game-paper-sumo", title: "Paper Sumo", category: "Games", subtype: "Drawing games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Paper-based tabletop pushing duel.", voteable: true, featured: false },
    { activityId: "game-trivial-pursuit", title: "Trivial Pursuit: Family Edition", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "General knowledge trivia.", voteable: true, featured: false },
    { activityId: "game-harry-potter", title: "Harry Potter Trivia", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "HP universe trivia game.", voteable: true, featured: false },
    { activityId: "game-hues", title: "Hues and Cues", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Guess colors from word clues.", voteable: true, featured: false },
    { activityId: "game-scrabble", title: "Scrabble (multiple versions)", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Classic word-building board game.", voteable: true, featured: false },
    { activityId: "game-bananagrams", title: "Bananagrams", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Fast-paced word tile game.", voteable: true, featured: false },
    { activityId: "game-pairs-pears", title: "Pairs to Pears", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Word comparison and association game.", voteable: true, featured: false },
    { activityId: "game-music-maestro", title: "Music Maestro", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Music-themed trivia.", voteable: true, featured: false },
    { activityId: "game-geography", title: "Name the State / Name That Country", category: "Games", subtype: "Trivia and word games", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Geography trivia options.", voteable: true, featured: false },
    { activityId: "game-chess", title: "Chess (standard and no stress)", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Classic strategy with a beginner-friendly version.", voteable: true, featured: false },
    { activityId: "game-checkers", title: "Checkers and multi-game set", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Traditional board game collection.", voteable: true, featured: false },
    { activityId: "game-dominoes", title: "Dominoes", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Traditional tile-based number game.", voteable: true, featured: false },
    { activityId: "game-parcheesi", title: "Parcheesi", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low-Medium", description: "Classic roll-and-race game.", voteable: true, featured: false },
    { activityId: "game-battleship", title: "Battleship", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Low", description: "Hidden-ship guessing game.", voteable: true, featured: false },
    { activityId: "game-clue", title: "Clue", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Mystery deduction board game.", voteable: true, featured: false },
    { activityId: "game-monopoly", title: "Monopoly (multiple versions)", category: "Games", subtype: "Classic and dexterity", location: "Kyle's house", driveTime: "At the house", cost: "Included", energy: "Medium", description: "Property trading and negotiation.", voteable: true, featured: false }
  ];
  var featuredActivities = baseFeaturedActivities.map(normalizeActivityForFilters);
  var activities = baseActivities.map(normalizeActivityForFilters);

  // src/views/activitiesView.js
  var filterGroups = [
    {
      label: "Location",
      optionKey: "location",
      stateKey: "activityLocations"
    },
    {
      label: "Travel time",
      optionKey: "travel",
      stateKey: "activityTravelTimes"
    },
    {
      label: "Activity time",
      optionKey: "duration",
      stateKey: "activityDurations"
    },
    {
      label: "Cost",
      optionKey: "cost",
      stateKey: "activityCosts"
    },
    {
      label: "Intensity",
      optionKey: "energy",
      stateKey: "activityEnergies"
    }
  ];
  function matchesTagGroup(selectedValues, activityValue) {
    if (!selectedValues.length) {
      return true;
    }
    return Boolean(activityValue) && selectedValues.includes(activityValue);
  }
  function matchesFilters(activity, filters) {
    const category = filters.activityCategory;
    const query = filters.activityQuery;
    const categoryMatch = category === "All" || activity.category === category || category === "Featured" && activity.featured;
    const haystack = [
      activity.title,
      activity.category,
      activity.subtype,
      activity.location,
      activity.description
    ].join(" ").toLowerCase();
    const queryMatch = !query || haystack.includes(query.toLowerCase());
    return categoryMatch && queryMatch && matchesTagGroup(filters.activityLocations, activity.locationGroup) && matchesTagGroup(filters.activityTravelTimes, activity.travelBucket) && matchesTagGroup(filters.activityDurations, activity.durationBucket) && matchesTagGroup(filters.activityCosts, activity.costBucket) && matchesTagGroup(filters.activityEnergies, activity.energyBucket);
  }
  function renderVoterList(voters) {
    if (!voters.length) {
      return "";
    }
    return `<p class="muted">Voters: ${voters.map((voterId) => getGuestById(voterId)?.displayName ?? "Guest").join(", ")}</p>`;
  }
  function renderFilterChip(group, option, isActive) {
    return `
    <button
      class="chip-button activity-filter-chip ${isActive ? "chip-active" : ""}"
      type="button"
      data-action="toggle-activity-filter"
      data-filter-group="${group.optionKey}"
      data-filter-value="${option}"
      aria-pressed="${isActive ? "true" : "false"}"
    >
      ${option}
    </button>
  `;
  }
  function renderFilterGroup(group, filters) {
    const selectedValues = filters[group.stateKey] ?? [];
    return `
    <fieldset class="activity-filter-group">
      <legend>${group.label}</legend>
      <div class="chip-row activity-filter-chip-row">
        ${activityAdvancedFilters[group.optionKey].map((option) => renderFilterChip(group, option, selectedValues.includes(option))).join("")}
      </div>
    </fieldset>
  `;
  }
  function renderActivityMeta(activity) {
    const durationLabel = activity.durationBucket ?? "TBD timing";
    return `
    <div class="meta-strip activity-meta">
      <span>${activity.location}</span>
      <span>${activity.driveTime}</span>
      <span>${durationLabel}</span>
      <span>${activity.cost}</span>
      <span>${activity.energy}</span>
    </div>
  `;
  }
  function renderRegularActivityCard(activity, guest, voteMap) {
    const voters = voteMap[activity.activityId] ?? [];
    const hasVoted = guest?.id ? voters.includes(guest.id) : false;
    return `
    <article class="card activity-card">
      <div class="activity-header">
        <div class="activity-heading">
          <p class="section-kicker">${activity.category}${activity.subtype ? ` | ${activity.subtype}` : ""}</p>
          <h3>${activity.title}</h3>
        </div>
      </div>
      <p class="activity-copy">${activity.description}</p>
      ${renderActivityMeta(activity)}
      ${activity.voteable ? `
            <div class="button-row activity-actions">
              <button
                class="button ${hasVoted ? "button-secondary" : "button-primary"}"
                data-action="vote-activity"
                data-activity-id="${activity.activityId}"
                ${hasVoted ? "disabled" : ""}
              >
                ${hasVoted ? "Vote locked" : "Vote"}
              </button>
              <span class="status-line">${voters.length} vote${voters.length === 1 ? "" : "s"}</span>
            </div>
            ${renderVoterList(voters)}
          ` : `
            <p class="status-line">Confirmed main event</p>
          `}
    </article>
  `;
  }
  function renderFeaturedActivityCard(activity, guest, voteMap) {
    const voters = voteMap[activity.activityId] ?? [];
    const hasVoted = guest?.id ? voters.includes(guest.id) : false;
    return `
    <article class="card activity-featured-card">
      <div class="activity-featured-main">
        <div class="activity-featured-header">
          <div class="activity-heading">
            <p class="section-kicker">${activity.category}${activity.subtype ? ` | ${activity.subtype}` : ""}</p>
            <h3>${activity.title}</h3>
          </div>
          <span class="featured-pill">Featured</span>
        </div>
        <p class="activity-featured-copy">${activity.description}</p>
        ${renderActivityMeta(activity)}
      </div>
      <div class="activity-featured-rail">
        <div class="activity-featured-status">
          <p class="section-kicker">Board status</p>
          ${activity.voteable ? `
                <strong>${voters.length} vote${voters.length === 1 ? "" : "s"}</strong>
                <p class="muted">Vote for side adventures without affecting the locked-in main session.</p>
              ` : `
                <strong>Confirmed main event</strong>
                <p class="muted">This is the anchor activity for the gathering and stays pinned at the top.</p>
              `}
        </div>
        ${activity.voteable ? `
              <div class="button-row activity-actions activity-featured-actions">
                <button
                  class="button ${hasVoted ? "button-secondary" : "button-primary"}"
                  data-action="vote-activity"
                  data-activity-id="${activity.activityId}"
                  ${hasVoted ? "disabled" : ""}
                >
                  ${hasVoted ? "Vote locked" : "Vote"}
                </button>
                <span class="status-line">${hasVoted ? "Your vote is counted" : "Open for voting"}</span>
              </div>
              ${renderVoterList(voters)}
            ` : `
              <p class="status-line">Locked as the main session</p>
            `}
      </div>
    </article>
  `;
  }
  function renderActivitiesView({ state, guest }) {
    const suggestions = (state.shared.activities.suggestions ?? []).map(normalizeActivityForFilters);
    const voteMap = state.shared.activities.votes ?? {};
    const filters = state.filters;
    const allActivities = [...featuredActivities, ...activities, ...suggestions];
    const filteredActivities = allActivities.filter((activity) => matchesFilters(activity, filters));
    const featuredResults = filteredActivities.filter((activity) => activity.featured);
    const regularResults = filteredActivities.filter((activity) => !activity.featured);
    const hasActiveFilters = filters.activityCategory !== "All" || Boolean(filters.activityQuery) || filterGroups.some((group) => (filters[group.stateKey] ?? []).length);
    return `
    <section class="tab-section">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">Activities board</p>
          <h2>Vote on what happens around the main event</h2>
          <p class="section-copy">A tighter board for browsing lots of options quickly without losing the event context.</p>
        </div>
        <div class="page-header-side">
          <div class="callout-badge">Primary TTRPG session stays locked in</div>
        </div>
      </header>

      <section class="card filters-card">
        <form class="activity-filters-form" data-form="activity-filters">
          <div class="filters-row">
            <label class="field">
              <span>Category</span>
              <select name="activityCategory">
                ${activityCategories.map(
      (option) => `
                      <option value="${option}" ${option === filters.activityCategory ? "selected" : ""}>${option}</option>
                    `
    ).join("")}
              </select>
            </label>
            <label class="field field-grow">
              <span>Search</span>
              <input type="search" name="activityQuery" value="${filters.activityQuery}" placeholder="Search by title, category, location, or vibe" />
            </label>
            <div class="activity-filter-actions">
              <button
                class="button button-secondary"
                type="button"
                data-action="clear-activity-filters"
                ${hasActiveFilters ? "" : "disabled"}
              >
                Clear filters
              </button>
            </div>
          </div>
          <div class="activity-filter-groups">
            ${filterGroups.map((group) => renderFilterGroup(group, filters)).join("")}
          </div>
        </form>
      </section>

      <section class="activities-board">
        ${featuredResults.length ? `
              <div class="activity-featured-stack">
                ${featuredResults.map((activity) => renderFeaturedActivityCard(activity, guest, voteMap)).join("")}
              </div>
            ` : ""}
        ${regularResults.length ? `
              <div class="activity-grid">
                ${regularResults.map((activity) => renderRegularActivityCard(activity, guest, voteMap)).join("")}
              </div>
            ` : ""}
        ${!filteredActivities.length ? `
              <article class="card activity-empty-state">
                <p class="section-kicker">No matches</p>
                <h3>No activities fit that filter</h3>
                <p class="muted">Try another category, search term, or clear the advanced filters to reopen the board.</p>
              </article>
            ` : ""}
      </section>

      <section class="card add-card">
        <div class="section-block-head">
          <div>
            <p class="section-kicker">Suggest something new</p>
            <h3>Add an activity idea</h3>
          </div>
          <p class="muted">Keep new ideas lightweight and easy to scan with the rest of the board.</p>
        </div>
        <form class="inline-form two-col" data-form="suggest-activity">
          <label class="field">
            <span>Activity</span>
            <input type="text" name="title" required placeholder="Example: Desert Botanical Garden at sunset" />
          </label>
          <label class="field">
            <span>Category</span>
            <select name="category" required>
              ${activityCategories.filter((option) => option !== "All" && option !== "Featured").map((option) => `<option value="${option}">${option}</option>`).join("")}
            </select>
          </label>
          <label class="field field-span">
            <span>Why it belongs on the board</span>
            <textarea name="note" rows="2" placeholder="Context, location, cost, or why the group would like it"></textarea>
          </label>
          <button class="button button-primary" type="submit">Submit activity</button>
        </form>
      </section>
    </section>
  `;
  }

  // src/views/detailsView.js
  function renderDetailsView({ state, guest }) {
    const existingDetails = state.shared.guestDetails[guest.id] ?? {
      dietaryFlags: [],
      dietaryNotes: "",
      allergyNotes: "",
      messageToKyle: ""
    };
    return `
    <section class="tab-section">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">My details</p>
          <h2>Dietary restrictions, allergies, and notes</h2>
          <p class="section-copy">Important info stays prominent without the old oversized form chrome.</p>
        </div>
        <div class="page-header-side">
          <div class="callout-badge">Shared with Kyle through the sync layer</div>
        </div>
      </header>

      <section class="card">
        <p class="muted">${eventContent.safetyNote}</p>
        <form class="inline-form" data-form="save-guest-details">
          <fieldset class="checkbox-grid">
            <legend>Dietary flags</legend>
            ${dietaryFlags.map(
      (flag) => `
                  <label class="check-pill">
                    <input
                      type="checkbox"
                      name="dietaryFlags"
                      value="${flag}"
                      ${existingDetails.dietaryFlags.includes(flag) ? "checked" : ""}
                    />
                    <span>${flag}</span>
                  </label>
                `
    ).join("")}
          </fieldset>

          <label class="field">
            <span>Dietary notes</span>
            <textarea name="dietaryNotes" rows="3" placeholder="Preferences, sensitivities, or what you would like Kyle to plan around">${existingDetails.dietaryNotes}</textarea>
          </label>

          <label class="field">
            <span>Allergies (anything that could make you sick)</span>
            <textarea name="allergyNotes" rows="3" placeholder="Be specific so this is not missed">${existingDetails.allergyNotes}</textarea>
          </label>

          <label class="field">
            <span>Anything else Kyle should know?</span>
            <textarea name="messageToKyle" rows="3" placeholder="Travel changes, timing, sleeping arrangements, or general notes">${existingDetails.messageToKyle}</textarea>
          </label>

          <div class="button-row">
            <button class="button button-primary" type="submit">Save my details</button>
            ${existingDetails.updatedAt ? `<span class="status-line">Last updated ${new Date(existingDetails.updatedAt).toLocaleString()}</span>` : ""}
          </div>
        </form>
      </section>
    </section>
  `;
  }

  // src/data/groceries.js
  var grocerySections = [
    {
      id: "hosting-basics",
      title: "Hosting Basics",
      source: "Safeway, Trader Joe's, Costco",
      subtitle: "Guest breakfasts, lunches, snacks, and fire night"
    },
    {
      id: "birthday-party",
      title: "Birthday Party",
      source: "Mexican market, Costco, Safeway",
      subtitle: "Carne asada tacos and frijoles charros for seven people"
    },
    {
      id: "ice-cream-bar",
      title: "Homemade Ice Cream Bar",
      source: "Safeway, Trader Joe's, Any",
      subtitle: "Vanilla, chocolate, and cookie butter"
    },
    {
      id: "party-extras",
      title: "Party Extras and Placeholders",
      source: "Flexible",
      subtitle: "Dessert, wine, and backup snacks"
    }
  ];
  var groceries = [
    { itemId: "eggs", section: "hosting-basics", label: "Eggs - cage-free (2 dozen)", defaultSource: "Costco", budgetNote: "" },
    { itemId: "sandwich-bread", section: "hosting-basics", label: "Sandwich bread (2 loaves)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "bagels", section: "hosting-basics", label: "Bagels or English muffins", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "cream-cheese", section: "hosting-basics", label: "Cream cheese", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "fruit", section: "hosting-basics", label: "Bananas or easy fruit", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "deli-turkey", section: "hosting-basics", label: "Deli turkey (2 packs)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "sliced-cheese", section: "hosting-basics", label: "Sliced cheese (2 packs)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "mayo-mustard", section: "hosting-basics", label: "Mayo and mustard", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "lettuce", section: "hosting-basics", label: "Lettuce or romaine", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "pasta", section: "hosting-basics", label: "Pasta (2 boxes)", defaultSource: "Trader Joe's", budgetNote: "" },
    { itemId: "marinara", section: "hosting-basics", label: "Marinara sauce (2 jars)", defaultSource: "Trader Joe's", budgetNote: "" },
    { itemId: "frozen-backup", section: "hosting-basics", label: "Frozen emergency item (2)", defaultSource: "Costco", budgetNote: "" },
    { itemId: "marshmallows", section: "hosting-basics", label: "Marshmallows", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "graham-crackers", section: "hosting-basics", label: "Graham crackers", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "chocolate-bars", section: "hosting-basics", label: "Chocolate bars (6)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "sparkling-water", section: "hosting-basics", label: "Sparkling water (case)", defaultSource: "Costco", budgetNote: "" },
    { itemId: "coke", section: "hosting-basics", label: "Coke 12-pack (optional)", defaultSource: "Costco", budgetNote: "Optional" },
    { itemId: "carne-asada", section: "birthday-party", label: "Carne asada (~4.5 lb)", defaultSource: "Mexican market", budgetNote: "$40-$58" },
    { itemId: "corn-tortillas", section: "birthday-party", label: "Corn tortillas (3 packs)", defaultSource: "Mexican market", budgetNote: "" },
    { itemId: "cilantro", section: "birthday-party", label: "Cilantro (4 bunches)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "white-onions", section: "birthday-party", label: "White onions (3)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "limes", section: "birthday-party", label: "Limes (12)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "avocados", section: "birthday-party", label: "Avocados (6)", defaultSource: "Costco", budgetNote: "$5-$12" },
    { itemId: "salsa", section: "birthday-party", label: "Salsa (2 tubs or jars)", defaultSource: "Trader Joe's", budgetNote: "" },
    { itemId: "chips", section: "birthday-party", label: "Tortilla chips (2 bags)", defaultSource: "Costco", budgetNote: "" },
    { itemId: "sour-cream", section: "birthday-party", label: "Sour cream", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "hot-sauce", section: "birthday-party", label: "Hot sauce (Cholula or Valentina)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "ham-hot-dogs", section: "birthday-party", label: "Ham and hot dogs", defaultSource: "Safeway", budgetNote: "Mentioned elsewhere on the list" },
    { itemId: "cotija", section: "birthday-party", label: "Cotija or shredded cheese", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "jalapenos", section: "birthday-party", label: "Jalapenos (fresh or pickled)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "roma-tomatoes", section: "birthday-party", label: "Roma tomatoes and 3 lbs of tomatoes (4)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "pinto-beans", section: "birthday-party", label: "Pinto beans (dried, 1.5 lb)", defaultSource: "Safeway", budgetNote: "$3-$6" },
    { itemId: "mexican-chorizo", section: "birthday-party", label: "Mexican chorizo (1 pkg)", defaultSource: "Mexican market", budgetNote: "" },
    { itemId: "bacon", section: "birthday-party", label: "Bacon (1/2 lb, smoked)", defaultSource: "Safeway", budgetNote: "$3-$6" },
    { itemId: "serranos", section: "birthday-party", label: "Serrano peppers (4)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "chicken-broth", section: "birthday-party", label: "Chicken broth (1 carton)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "charcoal", section: "birthday-party", label: "Charcoal or grill supplies", defaultSource: "Costco", budgetNote: "" },
    { itemId: "rainbow-quiche", section: "birthday-party", label: "Rainbow quiche", defaultSource: "Anne's contribution", budgetNote: "Pre-assigned contribution", lockedClaimBy: "anne-sly" },
    { itemId: "whole-milk", section: "ice-cream-bar", label: "Whole milk (1/2 gal)", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "heavy-cream", section: "ice-cream-bar", label: "Heavy whipping cream", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "sugar", section: "ice-cream-bar", label: "Granulated sugar (2 lb)", defaultSource: "Any", budgetNote: "" },
    { itemId: "vanilla", section: "ice-cream-bar", label: "Pure vanilla extract", defaultSource: "Any", budgetNote: "" },
    { itemId: "cocoa", section: "ice-cream-bar", label: "Cocoa powder", defaultSource: "Any", budgetNote: "" },
    { itemId: "cookie-butter", section: "ice-cream-bar", label: "Cookie butter or Biscoff", defaultSource: "Trader Joe's", budgetNote: "" },
    { itemId: "toppings", section: "ice-cream-bar", label: "Toppings bundle (4 items)", defaultSource: "Any", budgetNote: "$12-$24" },
    { itemId: "cones", section: "ice-cream-bar", label: "Ice cream cones or cups", defaultSource: "Safeway", budgetNote: "" },
    { itemId: "misc-snacks", section: "party-extras", label: "Misc snacks (chips, cookies, extras)", defaultSource: "Any", budgetNote: "$20-$35" },
    { itemId: "dessert", section: "party-extras", label: "Dessert - Costco cake or Craves cookies", defaultSource: "Costco or Craves", budgetNote: "$25-$55" },
    { itemId: "party-wine", section: "party-extras", label: "Party wine (2-3 bottles)", defaultSource: "Trader Joe's", budgetNote: "$20-$45" }
  ];

  // src/views/groceriesView.js
  function renderSummaryStat(label, value) {
    return `
    <article class="summary-card">
      <span class="label">${label}</span>
      <strong>${value}</strong>
    </article>
  `;
  }
  function renderGroceriesView({ state, guest }) {
    const sharedGroceries = state.shared.groceries;
    const additions = sharedGroceries.additions ?? [];
    const selectedSection = state.filters.grocerySection ?? "all";
    const expandedItemId = state.ui?.expandedGroceryItemId ?? null;
    const itemsBySection = grocerySections.map((section) => ({
      ...section,
      items: [
        ...groceries.filter((item) => item.section === section.id),
        ...additions.filter((item) => item.section === section.id)
      ]
    }));
    const visibleSections = selectedSection === "all" ? itemsBySection : itemsBySection.filter((section) => section.id === selectedSection);
    let claimedCount = 0;
    let payHelpCount = 0;
    let requestCount = 0;
    for (const section of itemsBySection) {
      for (const item of section.items) {
        const claimGuestId = item.lockedClaimBy ?? sharedGroceries.claims[item.itemId];
        const payHelpers = sharedGroceries.payHelpers[item.itemId] ?? [];
        const editRequests = sharedGroceries.editRequests[item.itemId] ?? [];
        if (claimGuestId) {
          claimedCount += 1;
        }
        if (payHelpers.length) {
          payHelpCount += 1;
        }
        requestCount += editRequests.length;
      }
    }
    const totalCount = itemsBySection.reduce((sum, section) => sum + section.items.length, 0);
    const unclaimedCount = totalCount - claimedCount;
    return `
    <section class="tab-section groceries-page">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">Groceries</p>
          <h2>Claim what you can and keep the board moving</h2>
          <p class="section-copy">The grocery board is now optimized for quick claiming on desktop, with deeper notes tucked away until someone needs them.</p>
        </div>
        <div class="page-header-side">
          <div class="callout-badge">Shared across guests when live sync is enabled</div>
        </div>
      </header>

      <section class="summary-row" aria-label="Groceries summary">
        ${renderSummaryStat("Total items", totalCount)}
        ${renderSummaryStat("Claimed", claimedCount)}
        ${renderSummaryStat("Unclaimed", unclaimedCount)}
        ${renderSummaryStat("Pay help active", payHelpCount)}
        ${renderSummaryStat("Requests", requestCount)}
      </section>

      <section class="card chips-card">
        <div class="chip-row" role="tablist" aria-label="Grocery sections">
          <button
            class="chip-button ${selectedSection === "all" ? "chip-active" : ""}"
            type="button"
            data-action="set-grocery-section"
            data-section-id="all"
          >
            All sections
          </button>
          ${itemsBySection.map(
      (section) => `
                <button
                  class="chip-button ${selectedSection === section.id ? "chip-active" : ""}"
                  type="button"
                  data-action="set-grocery-section"
                  data-section-id="${section.id}"
                >
                  ${section.title}
                </button>
              `
    ).join("")}
        </div>
      </section>

      <div class="groceries-sections">
        ${visibleSections.map((section) => {
      const claimedInSection = section.items.filter((item) => {
        const claimGuestId = item.lockedClaimBy ?? sharedGroceries.claims[item.itemId];
        return Boolean(claimGuestId);
      }).length;
      return `
              <section class="card grocery-section">
                <div class="grocery-section-header">
                  <div>
                    <p class="section-kicker">${section.source}</p>
                    <h3>${section.title}</h3>
                    <p class="muted">${section.subtitle}</p>
                  </div>
                  <div class="grocery-section-meta">
                    <span>${section.items.length} items</span>
                    <span>${claimedInSection} claimed</span>
                  </div>
                </div>

                <div class="grocery-items-grid">
                  ${section.items.map((item) => {
        const claimGuestId = item.lockedClaimBy ?? sharedGroceries.claims[item.itemId];
        const claimGuest = claimGuestId ? getGuestById(claimGuestId) : null;
        const payHelpers = sharedGroceries.payHelpers[item.itemId] ?? [];
        const hasCurrentGuestHelper = payHelpers.includes(guest.id);
        const editRequests = sharedGroceries.editRequests[item.itemId] ?? [];
        const isClaimedByCurrentGuest = claimGuestId === guest.id;
        const isLocked = Boolean(item.lockedClaimBy);
        const isExpanded = expandedItemId === item.itemId;
        const statusLabel = isLocked ? `Assigned to ${claimGuest?.displayName ?? "Guest"}` : claimGuest ? `Claimed by ${claimGuest.displayName}` : "Open to claim";
        return `
                        <article class="grocery-item-card ${claimGuestId ? "grocery-item-claimed" : "grocery-item-open"} ${isLocked ? "grocery-item-locked" : ""}">
                          <div class="grocery-item-top">
                            <div class="grocery-item-copy">
                              <h4>${item.label}</h4>
                              <p class="muted">
                                ${item.defaultSource || "Source TBD"}
                                ${item.budgetNote ? ` \xB7 ${item.budgetNote}` : ""}
                              </p>
                            </div>
                            <span class="status-pill ${claimGuestId ? "status-pill-active" : ""}">${statusLabel}</span>
                          </div>

                          <div class="grocery-item-footer">
                            <div class="grocery-actions">
                              <button
                                class="button ${claimGuestId ? "button-secondary" : "button-primary"}"
                                data-action="${isClaimedByCurrentGuest ? "unclaim-grocery" : "claim-grocery"}"
                                data-item-id="${item.itemId}"
                                ${isLocked || !!claimGuestId && !isClaimedByCurrentGuest ? "disabled" : ""}
                              >
                                ${isLocked ? "Assigned" : isClaimedByCurrentGuest ? "Release" : "Bring it"}
                              </button>
                              <button
                                class="button button-secondary"
                                data-action="toggle-pay"
                                data-item-id="${item.itemId}"
                              >
                                ${hasCurrentGuestHelper ? "Undo pay help" : "Help pay"}
                              </button>
                              <button
                                class="button button-ghost"
                                type="button"
                                data-action="toggle-grocery-details"
                                data-item-id="${item.itemId}"
                                aria-expanded="${isExpanded ? "true" : "false"}"
                              >
                                ${isExpanded ? "Hide details" : `Details${editRequests.length ? ` (${editRequests.length})` : ""}`}
                              </button>
                            </div>

                            <div class="helper-strip">
                              <span>Pay helpers</span>
                              <strong>${payHelpers.length ? payHelpers.map((helperId) => getGuestById(helperId)?.displayName ?? "Guest").join(", ") : "None yet"}</strong>
                            </div>
                          </div>

                          ${isExpanded ? `
                                <div class="grocery-item-details">
                                  <form class="inline-form" data-form="edit-grocery-request">
                                    <input type="hidden" name="itemId" value="${item.itemId}" />
                                    <label class="field">
                                      <span>Add note or change request</span>
                                      <textarea name="note" rows="2" placeholder="Brand swap, quantity change, or note for Kyle"></textarea>
                                    </label>
                                    <button class="button button-secondary" type="submit">Send request</button>
                                  </form>

                                  ${editRequests.length ? `
                                        <div class="request-history">
                                          <span class="label">Existing requests</span>
                                          <ul class="compact-list">
                                            ${editRequests.map((request) => `<li><strong>${getGuestById(request.guestId)?.displayName ?? "Guest"}:</strong> ${request.note}</li>`).join("")}
                                          </ul>
                                        </div>
                                      ` : ""}
                                </div>
                              ` : ""}
                        </article>
                      `;
      }).join("")}
                </div>
              </section>
            `;
    }).join("")}
      </div>

      <section class="card add-card">
        <div class="section-block-head">
          <div>
            <p class="section-kicker">Add something new</p>
            <h3>Guest item suggestion</h3>
          </div>
          <p class="muted">Add missing items without turning the main board into a wall of form fields.</p>
        </div>
        <form class="inline-form two-col" data-form="add-grocery-item">
          <label class="field">
            <span>Section</span>
            <select name="section" required>
              ${grocerySections.map((section) => `<option value="${section.id}">${section.title}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>Item</span>
            <input type="text" name="label" required placeholder="Example: Extra salsa" />
          </label>
          <label class="field field-span">
            <span>Note for Kyle</span>
            <textarea name="note" rows="2" placeholder="Why this item matters, quantity, or preferred store"></textarea>
          </label>
          <button class="button button-primary" type="submit">Add item</button>
        </form>
      </section>
    </section>
  `;
  }

  // src/lib/flightStatus.js
  var RAPIDAPI_KEY = "YOUR_KEY_HERE";
  var CACHE_PREFIX = "ttrpg-flight-v1-";
  var CACHE_TTL_MS = 10 * 60 * 1e3;
  function normalizeFlightNumber(raw) {
    const first = raw.split(/\s*[-–>]+\s*/)[0].trim();
    return first.replace(/\s+/g, "");
  }
  function parseDateToIso(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return d.toISOString().slice(0, 10);
  }
  function formatLocalTime(isoStr) {
    if (!isoStr) return null;
    const d = new Date(isoStr);
    if (isNaN(d)) return isoStr;
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  function cacheKey(flightNum, dateIso) {
    return `${CACHE_PREFIX}${flightNum}-${dateIso}`;
  }
  function readCache(key) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const { timestamp, data } = JSON.parse(raw);
      if (Date.now() - timestamp > CACHE_TTL_MS) {
        window.localStorage.removeItem(key);
        return null;
      }
      return { data, timestamp };
    } catch {
      return null;
    }
  }
  function writeCache(key, data) {
    try {
      window.localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
    } catch {
    }
  }
  function parseResponse(raw) {
    if (!raw || !Array.isArray(raw) || raw.length === 0) return null;
    const f = raw[0];
    const dep = f.departure ?? {};
    const arr = f.arrival ?? {};
    const scheduledDep = dep.scheduledTime?.local ?? null;
    const actualDep = dep.actualTime?.local ?? dep.revisedTime?.local ?? null;
    const scheduledArr = arr.scheduledTime?.local ?? null;
    const actualArr = arr.actualTime?.local ?? arr.revisedTime?.local ?? null;
    const delayMinutes = dep.delay ?? arr.delay ?? null;
    return {
      status: f.status ?? "Unknown",
      scheduledDeparture: formatLocalTime(scheduledDep),
      actualDeparture: formatLocalTime(actualDep),
      scheduledArrival: formatLocalTime(scheduledArr),
      actualArrival: formatLocalTime(actualArr),
      delayMinutes: typeof delayMinutes === "number" ? Math.round(delayMinutes) : null,
      departureGate: dep.gate ?? null,
      arrivalGate: arr.gate ?? null
    };
  }
  async function fetchFlightStatus(rawFlightNumber, rawDateStr) {
    if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "YOUR_KEY_HERE") {
      return null;
    }
    const flightNum = normalizeFlightNumber(rawFlightNumber);
    const dateIso = parseDateToIso(rawDateStr);
    if (!flightNum || !dateIso) return null;
    const flightDate = /* @__PURE__ */ new Date(dateIso + "T00:00:00");
    const hoursUntilFlight = (flightDate - Date.now()) / (1e3 * 60 * 60);
    if (hoursUntilFlight > 26) {
      return { status: "TooEarly", scheduledDeparture: null, actualDeparture: null, scheduledArrival: null, actualArrival: null, delayMinutes: null, departureGate: null, arrivalGate: null };
    }
    const key = cacheKey(flightNum, dateIso);
    const cached = readCache(key);
    if (cached) {
      return { ...cached.data, _cachedAt: cached.timestamp };
    }
    try {
      const url = `https://aerodatabox.p.rapidapi.com/flights/number/${encodeURIComponent(flightNum)}/${dateIso}?withAircraftImage=false&withLocation=false`;
      const response = await fetch(url, {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com"
        }
      });
      if (!response.ok) {
        return null;
      }
      const json = await response.json();
      const parsed = parseResponse(json);
      if (parsed) {
        writeCache(key, parsed);
        return { ...parsed, _cachedAt: Date.now() };
      }
      return null;
    } catch {
      return null;
    }
  }
  function flightStatusKey(rawFlightNumber, rawDateStr) {
    const flightNum = normalizeFlightNumber(rawFlightNumber);
    const dateIso = parseDateToIso(rawDateStr);
    return `${flightNum}:${dateIso}`;
  }

  // src/views/myInfoView.js
  function formatCacheAge(cachedAt) {
    const ageMs = Date.now() - cachedAt;
    const mins = Math.floor(ageMs / 6e4);
    if (mins < 1) return "Updated just now";
    if (mins === 1) return "Updated 1 min ago";
    return `Updated ${mins} min ago`;
  }
  function isWithin26Hours(rawDateStr) {
    const d = new Date(rawDateStr);
    if (isNaN(d)) return false;
    return (d - Date.now()) / (1e3 * 60 * 60) <= 26;
  }
  function renderFlightStatusBadge(statusData, flightDate) {
    if (statusData === void 0) {
      return isWithin26Hours(flightDate) ? `<span class="status-badge status-loading">Checking status\u2026</span>` : "";
    }
    if (!statusData || statusData.status === "TooEarly") {
      return "";
    }
    const { status, delayMinutes } = statusData;
    if (status === "Landed") {
      return `<span class="status-badge status-ok">Landed \u2713</span>`;
    }
    if (status === "Cancelled") {
      return `<span class="status-badge status-err">Cancelled</span>`;
    }
    if (status === "Delayed") {
      const suffix = delayMinutes ? ` ${delayMinutes} min` : "";
      return `<span class="status-badge status-warn">Delayed${suffix}</span>`;
    }
    if (status === "EnRoute") {
      const suffix = delayMinutes > 0 ? ` \xB7 ${delayMinutes} min delay` : "";
      return `<span class="status-badge ${delayMinutes > 0 ? "status-warn" : "status-ok"}">In flight${suffix}</span>`;
    }
    if (status === "Scheduled") {
      return `<span class="status-badge status-ok">On time</span>`;
    }
    return `<span class="status-badge status-loading">${status}</span>`;
  }
  function renderFlightCard(label, flight, statusData) {
    if (!flight) {
      return "";
    }
    const badge = renderFlightStatusBadge(statusData, flight.date);
    const cacheAge = statusData?._cachedAt ? formatCacheAge(statusData._cachedAt) : null;
    const scheduledDep = statusData?.scheduledDeparture ?? flight.departureTime;
    const actualDep = statusData?.actualDeparture;
    const hasDeptRevision = actualDep && actualDep !== scheduledDep;
    const deptTimeDisplay = hasDeptRevision ? `<span class="time-revised">${scheduledDep}</span> \u2192 ${actualDep}` : scheduledDep;
    const scheduledArr = statusData?.scheduledArrival ?? flight.arrivalTime ?? "";
    const actualArr = statusData?.actualArrival;
    const hasArrRevision = actualArr && actualArr !== scheduledArr;
    const arrTimeDisplay = hasArrRevision ? `<span class="time-revised">${scheduledArr}</span> \u2192 ${actualArr}` : scheduledArr;
    const departureGate = statusData?.departureGate ? `<p class="muted">Gate ${statusData.departureGate}</p>` : "";
    const arrivalGate = statusData?.arrivalGate ? `<p class="muted">Arrival gate ${statusData.arrivalGate}</p>` : "";
    return `
    <article class="card">
      <p class="section-kicker">${label}</p>
      <h3>${flight.airline} ${flight.flightNumber}</h3>
      ${badge}
      ${cacheAge ? `<p class="status-updated">${cacheAge}</p>` : ""}
      <div class="key-value-grid">
        <div>
          <span class="label">Date</span>
          <strong>${flight.date}</strong>
        </div>
        <div>
          <span class="label">Departure</span>
          <strong>${flight.departureAirport} at ${deptTimeDisplay}</strong>
          <p>${flight.departureLabel}</p>
          ${departureGate}
        </div>
        <div>
          <span class="label">Arrival</span>
          <strong>${flight.arrivalAirport ?? ""}${arrTimeDisplay ? ` at ${arrTimeDisplay}` : ""}</strong>
          <p>${flight.arrivalLabel}</p>
          ${arrivalGate}
        </div>
        ${flight.layover ? `<div><span class="label">Layover</span><strong>${flight.layover}</strong></div>` : ""}
      </div>
    </article>
  `;
  }
  function renderMyInfoView({ guest, state }) {
    const hasFlight = guest.travelType === "flight" && guest.flight;
    const hasPickup = Boolean(guest.pickup);
    const flightStatuses = state.flightStatuses ?? {};
    const inbound = hasFlight ? guest.flight.inbound : null;
    const outbound = hasFlight ? guest.flight.outbound : null;
    const inboundStatus = inbound ? flightStatuses[flightStatusKey(inbound.flightNumberIata ?? inbound.flightNumber, inbound.date)] : void 0;
    const outboundStatus = outbound ? flightStatuses[flightStatusKey(outbound.flightNumberIata ?? outbound.flightNumber, outbound.date)] : void 0;
    return `
    <section class="tab-section">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">Travel and arrival</p>
          <h2>${guest.displayName}, here is your route plan</h2>
          <p class="section-copy">Key logistics first, with the same tighter dashboard system used across the board.</p>
        </div>
        <div class="section-actions page-header-side">
          <a class="button button-secondary" href="${eventContent.address.mapsUrl}" target="_blank" rel="noreferrer">
            Directions
          </a>
          <button class="button button-secondary" data-action="copy-address">
            ${eventContent.copyAddressLabel}
          </button>
        </div>
      </header>

      <div class="dashboard-grid">
        <article class="card accent-card">
          <p class="section-kicker">Base camp</p>
          <h3>${eventContent.hostName}'s house</h3>
          <p>${eventContent.address.full}</p>
          <p class="muted">Official start: ${eventContent.officialStart}. Early arrivals are welcome from ${eventContent.earlyArrival}.</p>
          <p class="muted">Phone: <a href="tel:${eventContent.hostPhone}">${eventContent.hostPhone}</a></p>
        </article>

        ${hasPickup ? `
              <article class="card">
                <p class="section-kicker">Pickup</p>
                <h3>${guest.pickup.time}</h3>
                <p>${guest.pickup.location}</p>
                <p class="muted">${guest.pickup.date} with ${guest.pickup.driver}</p>
              </article>
            ` : `
              <article class="card">
                <p class="section-kicker">Arrival</p>
                <h3>${guest.travelType === "driving" ? "Drive in when ready" : "On-site already"}</h3>
                <ul class="compact-list">
                  ${guest.arrivalOptions.map((option) => `<li>${option}</li>`).join("")}
                </ul>
              </article>
            `}

        ${guest.foodRole ? `
              <article class="card">
                <p class="section-kicker">Food role</p>
                <h3>${guest.foodRole}</h3>
                <p class="muted">${guest.notes}</p>
              </article>
            ` : ""}

        ${guest.travelType === "driving" ? `
              <article class="card">
                <p class="section-kicker">Morning logistics</p>
                <h3>Flexible arrival works</h3>
                <ul class="compact-list">
                  ${guest.arrivalOptions.map((option) => `<li>${option}</li>`).join("")}
                </ul>
              </article>
            ` : ""}
      </div>

      ${hasFlight ? renderFlightCard("Inbound flight", guest.flight.inbound, inboundStatus) : ""}
      ${hasFlight ? renderFlightCard("Return flight", guest.flight.outbound, outboundStatus) : ""}
    </section>
  `;
  }

  // src/views/partyPlanView.js
  function renderPartyPlanView() {
    return `
    <section class="tab-section">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">Party plan</p>
          <h2>The campaign is the main event</h2>
          <p class="section-copy">The schedule and food lineup now sit in a lighter, denser planning view.</p>
        </div>
        <div class="page-header-side">
          <div class="callout-badge">Campaign start target: ${eventContent.campaignStart}</div>
        </div>
      </header>

      <div class="dashboard-grid">
        <article class="card accent-card">
          <p class="section-kicker">Main activity</p>
          <h3>Daggerheart with a Jenga twist</h3>
          <p>Kyle is running an original Daggerheart session. Food breaks happen around the game, not instead of it.</p>
        </article>
        <article class="card">
          <p class="section-kicker">Event framing</p>
          <h3>Celebration first, spreadsheet never</h3>
          <p>${eventContent.intro}</p>
          <p class="muted">${eventContent.accommodation}</p>
        </article>
      </div>

      <div class="section-block-head">
        <div>
          <p class="section-kicker">Timeline</p>
          <h3>What happens when</h3>
        </div>
      </div>
      <div class="timeline">
        ${schedule.map(
      (step) => `
              <article class="timeline-row">
                <div class="timeline-time">${step.time}</div>
                <div class="timeline-content">
                  <h4>${step.title}</h4>
                  <p>${step.detail}</p>
                </div>
              </article>
            `
    ).join("")}
      </div>

      <div class="section-block-head">
        <div>
          <p class="section-kicker">Food lineup</p>
          <h3>Who is bringing what</h3>
        </div>
      </div>
      <div class="dashboard-grid">
        ${foodContributors.map((entry) => {
      const guest = getGuestById(entry.guestId);
      return `
              <article class="card">
                <p class="section-kicker">${guest?.displayName ?? "Guest"}</p>
                <h3>${entry.item}</h3>
                <p>${entry.note}</p>
              </article>
            `;
    }).join("")}
      </div>
    </section>
  `;
  }

  // src/views/dashboardView.js
  function renderActiveTab(context) {
    switch (context.state.currentTab) {
      case "party-plan":
        return renderPartyPlanView(context);
      case "groceries":
        return renderGroceriesView(context);
      case "activities":
        return renderActivitiesView(context);
      case "my-details":
        return renderDetailsView(context);
      case "my-info":
      default:
        return renderMyInfoView(context);
    }
  }
  function getCurrentTabLabel(tabId) {
    return partyTabs.find((tab) => tab.id === tabId)?.label ?? "Overview";
  }
  function renderDashboardCelebration(area) {
    const balloons = area === "header" ? ["a", "b", "c"] : ["d", "e"];
    const confetti = area === "header" ? ["a", "b", "c", "d", "e", "f"] : ["g", "h", "i", "j"];
    const sparkName = area === "header" ? "a" : "b";
    return `
    <div class="dashboard-celebration dashboard-celebration-${area}" aria-hidden="true">
      ${balloons.map((name) => `<span class="dashboard-balloon dashboard-balloon-${name}"></span>`).join("")}
      ${confetti.map((name) => `<span class="dashboard-confetti dashboard-confetti-${name}"></span>`).join("")}
      <span class="dashboard-spark dashboard-spark-${sparkName}"></span>
    </div>
  `;
  }
  function renderDashboardView(context) {
    const { guest, state } = context;
    const utilityRailCollapsed = state.ui?.utilityRailCollapsed ?? false;
    return `
    <main class="app-shell dashboard-app" id="main-content">
      <header class="top-bar dashboard-top-bar">
        ${renderDashboardCelebration("header")}
        <div class="dashboard-title-group">
          <p class="eyebrow">${eventContent.dateLabel}</p>
          <h1>${eventContent.title}</h1>
        </div>
        <div class="top-bar-actions">
          <div class="guest-chip">
            <span class="guest-chip-label">Adventurer</span>
            <strong>${guest.displayName}</strong>
          </div>
          <button class="button button-secondary" data-action="switch-guest">
            Switch adventurer
          </button>
        </div>
      </header>

      <section class="event-meta-strip card">
        ${renderDashboardCelebration("meta")}
        <div class="event-meta-summary">
          <p class="section-kicker">Quest board</p>
          <p class="event-meta-copy">${eventContent.intro}</p>
        </div>
        <div class="event-meta-pills">
          <span>${eventContent.officialStart} official start</span>
          <span>${eventContent.campaignStart} campaign target</span>
          <span>${eventContent.address.city}</span>
        </div>
      </section>

      <nav class="tab-nav" role="tablist" aria-label="Party tabs">
        ${partyTabs.map(
      (tab) => `
              <button
                class="tab-button ${tab.id === state.currentTab ? "tab-active" : ""}"
                role="tab"
                aria-selected="${tab.id === state.currentTab ? "true" : "false"}"
                aria-controls="tab-panel-${tab.id}"
                id="tab-btn-${tab.id}"
                data-action="set-tab"
                data-tab-id="${tab.id}"
              >
                ${tab.label}
              </button>
            `
    ).join("")}
      </nav>

      ${state.syncError ? `<section class="inline-alert" role="alert">${state.syncError}</section>` : ""}
      ${state.syncNotice ? `<section class="inline-note" role="status">${state.syncNotice}</section>` : ""}

      <div class="dashboard-layout ${utilityRailCollapsed ? "dashboard-layout-collapsed" : ""}">
        <aside class="dashboard-utility card">
          <div class="dashboard-utility-header">
            <div>
              <p class="section-kicker">Quest brief</p>
              <h2>${guest.displayName}'s board</h2>
            </div>
            <button
              class="utility-toggle"
              type="button"
              aria-expanded="${utilityRailCollapsed ? "false" : "true"}"
              aria-controls="dashboard-utility-body"
              data-action="toggle-utility-rail"
            >
              ${utilityRailCollapsed ? "Show" : "Hide"}
            </button>
          </div>

          <div class="dashboard-utility-body" id="dashboard-utility-body">
            <div class="utility-current-tab">
              <span class="label">Current stop</span>
              <strong>${getCurrentTabLabel(state.currentTab)}</strong>
            </div>
            <ul class="compact-list utility-list">
              <li>Hosted by ${eventContent.hostName}</li>
              <li>Early arrivals from ${eventContent.earlyArrival}</li>
              <li>Main campaign at ${eventContent.campaignStart}</li>
              <li>Use groceries, activities, and notes to coordinate fast.</li>
            </ul>
            <div class="utility-actions">
              <a class="button button-secondary" href="${eventContent.address.mapsUrl}" target="_blank" rel="noreferrer">
                Directions
              </a>
              <button class="button button-secondary" data-action="copy-address">
                ${eventContent.copyAddressLabel}
              </button>
            </div>
          </div>
        </aside>

        <section
          class="dashboard-main-panel"
          role="tabpanel"
          id="tab-panel-${state.currentTab}"
          aria-labelledby="tab-btn-${state.currentTab}"
        >
          ${renderActiveTab(context)}
        </section>
      </div>
    </main>
  `;
  }

  // src/views/splashView.js
  function renderCelebrationPieces(scope, { balloons = [], confetti = [], sparks = [] }) {
    return `
    <div class="celebration-layer celebration-layer-${scope}" aria-hidden="true">
      ${balloons.map((name) => `<span class="celebration-balloon ${scope}-balloon-${name}"></span>`).join("")}
      ${confetti.map((name) => `<span class="celebration-confetti ${scope}-confetti-${name}"></span>`).join("")}
      ${sparks.map((name) => `<span class="celebration-spark ${scope}-spark-${name}"></span>`).join("")}
    </div>
  `;
  }
  function renderAtmosphere() {
    return `
    <div class="landing-atmosphere" aria-hidden="true">
      ${renderCelebrationPieces("landing", {
      balloons: ["a", "b", "c", "d", "e", "f", "g"],
      confetti: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"],
      sparks: ["a", "b", "c", "d"]
    })}
    </div>
  `;
  }
  function renderInviteAtmosphere() {
    return `
    <div class="invite-atmosphere" aria-hidden="true">
      ${renderCelebrationPieces("invite", {
      balloons: ["a", "b", "c", "d"],
      confetti: ["a", "b", "c", "d", "e", "f", "g", "h"],
      sparks: ["a", "b"]
    })}
    </div>
  `;
  }
  function renderScrollBody({ stage, selectedGuest }) {
    if (stage === "scroll-reveal") {
      return `
      <div class="scroll-paper scroll-paper-loading">
        <p class="scroll-kicker">Processing Record</p>
        <h2>${selectedGuest?.displayName ?? "Adventurer"}</h2>
        <p class="scroll-copy">${eventContent.satireTagline}</p>
      </div>
    `;
    }
    return `
    <div class="scroll-paper scroll-paper-ready">
      <p class="scroll-kicker">${eventContent.scrollHeadline}</p>
      <h2>${selectedGuest?.displayName ?? "Adventurer"}</h2>
      <p class="scroll-copy">${eventContent.personalizedLead}</p>
      <div class="invite-highlights">
        <span>${eventContent.dateLabel}</span>
        <span>Hosted by ${eventContent.hostName}</span>
        <span>Daggerheart at ${eventContent.campaignStart}</span>
      </div>
      <p class="scroll-tagline">${eventContent.satireTagline}</p>
    </div>
  `;
  }
  function renderNameSelectScreen(state) {
    const guestOptions = getInviteGuests().map(
      (guest) => `
        <option value="${guest.id}" ${guest.id === state.selectedGuestId ? "selected" : ""}>
          ${guest.displayName}${guest.aliases.length ? ` (${guest.aliases.join(", ")})` : ""}
        </option>
      `
    ).join("");
    return `
    <main class="intro-shell intro-stage-landing" id="main-content">
      <section class="intro-scene-panel">
        <div class="scene-copy">
          <p class="eyebrow">${eventContent.sceneKicker}</p>
          <h1>${eventContent.title}</h1>
          <p class="scene-headline">${eventContent.sceneHeadline}</p>
          <p class="scene-copy-text">${eventContent.sceneCopy}</p>
          <p class="scene-support">${eventContent.sceneSecondary}</p>

          <form class="landing-form" data-form="issue-scroll">
            <label class="field">
              <span>${eventContent.namePrompt}</span>
              <select name="guestId" required>
                <option value="">Select your name</option>
                ${guestOptions}
              </select>
            </label>
            <p class="field-hint">${eventContent.inviteSelectHint}</p>
            <button class="button button-primary" type="submit">
              ${eventContent.primaryCTA}
            </button>
          </form>
        </div>
        ${renderAtmosphere()}
      </section>
    </main>
  `;
  }
  function renderInviteScreen(state, selectedGuest) {
    const isRevealStage = ["scroll-reveal", "personalized-card", "dashboard-transition"].includes(state.introStage);
    const isReadyStage = ["personalized-card", "dashboard-transition"].includes(state.introStage);
    const showReadyActions = state.introStage === "personalized-card";
    return `
    <main class="intro-shell intro-stage-${state.introStage}" id="main-content">
      <section class="intro-invite-panel">
        ${renderInviteAtmosphere()}
        <p class="scroll-adventurer" aria-label="Selected adventurer">
          <span class="scroll-adventurer-label">Adventurer</span>
          <strong>${selectedGuest?.displayName ?? "Adventurer"}</strong>
        </p>

        <div class="scroll-stage ${isRevealStage ? "scroll-stage-active" : ""} ${isReadyStage ? "scroll-stage-ready" : ""}">
          <div class="scroll-shadow"></div>
          <div class="scroll-shell ${isRevealStage ? "scroll-shell-open" : ""}">
            <span class="scroll-roller scroll-roller-left"></span>
            <span class="scroll-roller scroll-roller-right"></span>
            ${renderScrollBody({ stage: state.introStage, selectedGuest })}
          </div>
        </div>

        ${showReadyActions ? `
              <div class="scroll-actions">
                <button class="button button-secondary" type="button" data-action="change-name">
                  ${eventContent.changeGuestLabel}
                </button>
                <button class="button button-primary" type="button" data-action="accept-invitation">
                  ${eventContent.acceptInviteLabel}
                </button>
              </div>
            ` : ""}
      </section>
    </main>
  `;
  }
  function renderSplashView({ state, selectedGuest }) {
    if (state.introStage === "landing") {
      return renderNameSelectScreen(state);
    }
    return renderInviteScreen(state, selectedGuest);
  }

  // src/lib/state.js
  var LOCAL_STATE_KEY = "ttrpg-invite-local-state-v1";
  function safeParse(value, fallback) {
    if (!value) {
      return fallback;
    }
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  function loadLocalState() {
    const storedState = safeParse(window.localStorage.getItem(LOCAL_STATE_KEY), {});
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const launchMode = window.location.protocol === "file:" ? "file" : "web";
    const introStageMap = {
      scene: "landing",
      "envelope-arrival": "scroll-reveal",
      "envelope-open": "scroll-reveal",
      "name-select": "landing",
      "personalized-invite": "personalized-card"
    };
    const normalizedIntroStage = introStageMap[storedState.introStage] ?? storedState.introStage;
    return {
      guestId: storedState.guestId ?? null,
      selectedGuestId: storedState.selectedGuestId ?? storedState.guestId ?? null,
      introStage: storedState.guestId ? "dashboard" : normalizedIntroStage ?? "landing",
      currentTab: storedState.currentTab ?? "my-info",
      motionEnabled: storedState.motionEnabled ?? !prefersReducedMotion,
      launchMode,
      syncCapability: launchMode === "file" ? "local-only" : storedState.syncCapability ?? "hosted-optional",
      syncMode: storedState.syncMode ?? "local",
      syncNotice: storedState.syncNotice ?? "",
      syncError: storedState.syncError ?? "",
      lastSyncedAt: storedState.lastSyncedAt ?? null,
      filters: {
        activityCategory: storedState.filters?.activityCategory ?? "All",
        activityQuery: storedState.filters?.activityQuery ?? "",
        activityLocations: Array.isArray(storedState.filters?.activityLocations) ? storedState.filters.activityLocations : [],
        activityTravelTimes: Array.isArray(storedState.filters?.activityTravelTimes) ? storedState.filters.activityTravelTimes : [],
        activityDurations: Array.isArray(storedState.filters?.activityDurations) ? storedState.filters.activityDurations : [],
        activityCosts: Array.isArray(storedState.filters?.activityCosts) ? storedState.filters.activityCosts : [],
        activityEnergies: Array.isArray(storedState.filters?.activityEnergies) ? storedState.filters.activityEnergies : [],
        grocerySection: storedState.filters?.grocerySection ?? "all"
      },
      ui: {
        expandedGroceryItemId: storedState.ui?.expandedGroceryItemId ?? null,
        utilityRailCollapsed: storedState.ui?.utilityRailCollapsed ?? false
      },
      shared: {
        groceries: {
          claims: {
            ...storedState.shared?.groceries?.claims ?? {}
          },
          payHelpers: {
            ...storedState.shared?.groceries?.payHelpers ?? {}
          },
          editRequests: {
            ...storedState.shared?.groceries?.editRequests ?? {}
          },
          additions: [...storedState.shared?.groceries?.additions ?? []]
        },
        activities: {
          votes: {
            ...storedState.shared?.activities?.votes ?? {}
          },
          suggestions: [...storedState.shared?.activities?.suggestions ?? []]
        },
        guestDetails: {
          ...storedState.shared?.guestDetails ?? {}
        }
      }
    };
  }
  function persistLocalState(state) {
    window.localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
  }

  // node_modules/@emailjs/browser/es/models/EmailJSResponseStatus.js
  var EmailJSResponseStatus = class {
    constructor(_status = 0, _text = "Network Error") {
      this.status = _status;
      this.text = _text;
    }
  };

  // node_modules/@emailjs/browser/es/utils/createWebStorage/createWebStorage.js
  var createWebStorage = () => {
    if (typeof localStorage === "undefined")
      return;
    return {
      get: (key) => Promise.resolve(localStorage.getItem(key)),
      set: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
      remove: (key) => Promise.resolve(localStorage.removeItem(key))
    };
  };

  // node_modules/@emailjs/browser/es/store/store.js
  var store = {
    origin: "https://api.emailjs.com",
    blockHeadless: false,
    storageProvider: createWebStorage()
  };

  // node_modules/@emailjs/browser/es/utils/buildOptions/buildOptions.js
  var buildOptions = (options) => {
    if (!options)
      return {};
    if (typeof options === "string") {
      return {
        publicKey: options
      };
    }
    if (options.toString() === "[object Object]") {
      return options;
    }
    return {};
  };

  // node_modules/@emailjs/browser/es/methods/init/init.js
  var init = (options, origin = "https://api.emailjs.com") => {
    if (!options)
      return;
    const opts = buildOptions(options);
    store.publicKey = opts.publicKey;
    store.blockHeadless = opts.blockHeadless;
    store.storageProvider = opts.storageProvider;
    store.blockList = opts.blockList;
    store.limitRate = opts.limitRate;
    store.origin = opts.origin || origin;
  };

  // node_modules/@emailjs/browser/es/api/sendPost.js
  var sendPost = async (url, data, headers = {}) => {
    const response = await fetch(store.origin + url, {
      method: "POST",
      headers,
      body: data
    });
    const message = await response.text();
    const responseStatus = new EmailJSResponseStatus(response.status, message);
    if (response.ok) {
      return responseStatus;
    }
    throw responseStatus;
  };

  // node_modules/@emailjs/browser/es/utils/validateParams/validateParams.js
  var validateParams = (publicKey, serviceID, templateID) => {
    if (!publicKey || typeof publicKey !== "string") {
      throw "The public key is required. Visit https://dashboard.emailjs.com/admin/account";
    }
    if (!serviceID || typeof serviceID !== "string") {
      throw "The service ID is required. Visit https://dashboard.emailjs.com/admin";
    }
    if (!templateID || typeof templateID !== "string") {
      throw "The template ID is required. Visit https://dashboard.emailjs.com/admin/templates";
    }
  };

  // node_modules/@emailjs/browser/es/utils/validateTemplateParams/validateTemplateParams.js
  var validateTemplateParams = (templateParams) => {
    if (templateParams && templateParams.toString() !== "[object Object]") {
      throw "The template params have to be the object. Visit https://www.emailjs.com/docs/sdk/send/";
    }
  };

  // node_modules/@emailjs/browser/es/utils/isHeadless/isHeadless.js
  var isHeadless = (navigator2) => {
    return navigator2.webdriver || !navigator2.languages || navigator2.languages.length === 0;
  };

  // node_modules/@emailjs/browser/es/errors/headlessError/headlessError.js
  var headlessError = () => {
    return new EmailJSResponseStatus(451, "Unavailable For Headless Browser");
  };

  // node_modules/@emailjs/browser/es/utils/validateBlockListParams/validateBlockListParams.js
  var validateBlockListParams = (list, watchVariable) => {
    if (!Array.isArray(list)) {
      throw "The BlockList list has to be an array";
    }
    if (typeof watchVariable !== "string") {
      throw "The BlockList watchVariable has to be a string";
    }
  };

  // node_modules/@emailjs/browser/es/utils/isBlockedValueInParams/isBlockedValueInParams.js
  var isBlockListDisabled = (options) => {
    return !options.list?.length || !options.watchVariable;
  };
  var getValue = (data, name) => {
    return data instanceof FormData ? data.get(name) : data[name];
  };
  var isBlockedValueInParams = (options, params) => {
    if (isBlockListDisabled(options))
      return false;
    validateBlockListParams(options.list, options.watchVariable);
    const value = getValue(params, options.watchVariable);
    if (typeof value !== "string")
      return false;
    return options.list.includes(value);
  };

  // node_modules/@emailjs/browser/es/errors/blockedEmailError/blockedEmailError.js
  var blockedEmailError = () => {
    return new EmailJSResponseStatus(403, "Forbidden");
  };

  // node_modules/@emailjs/browser/es/utils/validateLimitRateParams/validateLimitRateParams.js
  var validateLimitRateParams = (throttle, id) => {
    if (typeof throttle !== "number" || throttle < 0) {
      throw "The LimitRate throttle has to be a positive number";
    }
    if (id && typeof id !== "string") {
      throw "The LimitRate ID has to be a non-empty string";
    }
  };

  // node_modules/@emailjs/browser/es/utils/isLimitRateHit/isLimitRateHit.js
  var getLeftTime = async (id, throttle, storage) => {
    const lastTime = Number(await storage.get(id) || 0);
    return throttle - Date.now() + lastTime;
  };
  var isLimitRateHit = async (defaultID, options, storage) => {
    if (!options.throttle || !storage) {
      return false;
    }
    validateLimitRateParams(options.throttle, options.id);
    const id = options.id || defaultID;
    const leftTime = await getLeftTime(id, options.throttle, storage);
    if (leftTime > 0) {
      return true;
    }
    await storage.set(id, Date.now().toString());
    return false;
  };

  // node_modules/@emailjs/browser/es/errors/limitRateError/limitRateError.js
  var limitRateError = () => {
    return new EmailJSResponseStatus(429, "Too Many Requests");
  };

  // node_modules/@emailjs/browser/es/methods/send/send.js
  var send = async (serviceID, templateID, templateParams, options) => {
    const opts = buildOptions(options);
    const publicKey = opts.publicKey || store.publicKey;
    const blockHeadless = opts.blockHeadless || store.blockHeadless;
    const storageProvider = opts.storageProvider || store.storageProvider;
    const blockList = { ...store.blockList, ...opts.blockList };
    const limitRate = { ...store.limitRate, ...opts.limitRate };
    if (blockHeadless && isHeadless(navigator)) {
      return Promise.reject(headlessError());
    }
    validateParams(publicKey, serviceID, templateID);
    validateTemplateParams(templateParams);
    if (templateParams && isBlockedValueInParams(blockList, templateParams)) {
      return Promise.reject(blockedEmailError());
    }
    if (await isLimitRateHit(location.pathname, limitRate, storageProvider)) {
      return Promise.reject(limitRateError());
    }
    const params = {
      lib_version: "4.4.1",
      user_id: publicKey,
      service_id: serviceID,
      template_id: templateID,
      template_params: templateParams
    };
    return sendPost("/api/v1.0/email/send", JSON.stringify(params), {
      "Content-type": "application/json"
    });
  };

  // node_modules/@emailjs/browser/es/utils/validateForm/validateForm.js
  var validateForm = (form) => {
    if (!form || form.nodeName !== "FORM") {
      throw "The 3rd parameter is expected to be the HTML form element or the style selector of the form";
    }
  };

  // node_modules/@emailjs/browser/es/methods/sendForm/sendForm.js
  var findHTMLForm = (form) => {
    return typeof form === "string" ? document.querySelector(form) : form;
  };
  var sendForm = async (serviceID, templateID, form, options) => {
    const opts = buildOptions(options);
    const publicKey = opts.publicKey || store.publicKey;
    const blockHeadless = opts.blockHeadless || store.blockHeadless;
    const storageProvider = store.storageProvider || opts.storageProvider;
    const blockList = { ...store.blockList, ...opts.blockList };
    const limitRate = { ...store.limitRate, ...opts.limitRate };
    if (blockHeadless && isHeadless(navigator)) {
      return Promise.reject(headlessError());
    }
    const currentForm = findHTMLForm(form);
    validateParams(publicKey, serviceID, templateID);
    validateForm(currentForm);
    const formData = new FormData(currentForm);
    if (isBlockedValueInParams(blockList, formData)) {
      return Promise.reject(blockedEmailError());
    }
    if (await isLimitRateHit(location.pathname, limitRate, storageProvider)) {
      return Promise.reject(limitRateError());
    }
    formData.append("lib_version", "4.4.1");
    formData.append("service_id", serviceID);
    formData.append("template_id", templateID);
    formData.append("user_id", publicKey);
    return sendPost("/api/v1.0/email/send-form", formData);
  };

  // node_modules/@emailjs/browser/es/index.js
  var es_default = {
    init,
    send,
    sendForm,
    EmailJSResponseStatus
  };

  // src/lib/sync.js
  var import_meta = {};
  var SHARED_CACHE_KEY = "ttrpg-shared-cache-v1";
  var PENDING_MUTATIONS_KEY = "ttrpg-shared-pending-mutations-v1";
  var BACKFILL_COMPLETED_KEY = "ttrpg-shared-backfill-completed-v1";
  var ENV = (() => {
    try {
      return import_meta.env ?? {};
    } catch {
      return {};
    }
  })();
  function safeParse2(value, fallback) {
    if (!value) {
      return fallback;
    }
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function getDefaultSharedState() {
    return {
      groceries: {
        claims: {},
        payHelpers: {},
        editRequests: {},
        additions: []
      },
      activities: {
        votes: {},
        suggestions: []
      },
      guestDetails: {}
    };
  }
  function loadSharedCache() {
    return safeParse2(window.localStorage.getItem(SHARED_CACHE_KEY), getDefaultSharedState());
  }
  function saveSharedCache(sharedState) {
    window.localStorage.setItem(SHARED_CACHE_KEY, JSON.stringify(sharedState));
  }
  function loadPendingMutations() {
    return safeParse2(window.localStorage.getItem(PENDING_MUTATIONS_KEY), []);
  }
  function savePendingMutations(mutations) {
    if (!mutations.length) {
      window.localStorage.removeItem(PENDING_MUTATIONS_KEY);
      return;
    }
    window.localStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(mutations));
  }
  function queuePendingMutation(type, payload) {
    const queued = mergePendingMutations(loadPendingMutations(), [{ type, payload }]);
    savePendingMutations(queued);
    return queued.length;
  }
  function hasCompletedBackfill() {
    return window.localStorage.getItem(BACKFILL_COMPLETED_KEY) === "true";
  }
  function markBackfillCompleted() {
    window.localStorage.setItem(BACKFILL_COMPLETED_KEY, "true");
  }
  function getRuntimeConfig() {
    if (typeof window === "undefined") {
      return {};
    }
    return window.PARTY_INVITE_CONFIG && typeof window.PARTY_INVITE_CONFIG === "object" ? window.PARTY_INVITE_CONFIG : {};
  }
  function getConfigValue(runtimeKey, envKey) {
    const runtimeValue = getRuntimeConfig()[runtimeKey];
    if (typeof runtimeValue === "string") {
      const trimmed = runtimeValue.trim();
      if (trimmed) {
        return trimmed;
      }
    } else if (runtimeValue) {
      return runtimeValue;
    }
    return ENV[envKey];
  }
  function getConfiguredAppsScriptUrl() {
    return getConfigValue("appsScriptUrl", "VITE_APPS_SCRIPT_URL");
  }
  function createMutationId(type) {
    const randomPart = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${type}-${randomPart}`;
  }
  function enrichPayload(type, payload) {
    const guest = payload.guestId ? getGuestById(payload.guestId) : null;
    return {
      ...payload,
      mutationId: payload.mutationId ?? createMutationId(type),
      guestName: payload.guestName ?? guest?.displayName ?? "Guest",
      pageUrl: payload.pageUrl ?? window.location.href,
      submittedAt: payload.submittedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      source: payload.source ?? "party-invite"
    };
  }
  function getMutationKey(entry) {
    if (entry.payload?.mutationId) {
      return entry.payload.mutationId;
    }
    return `${entry.type}:${JSON.stringify(entry.payload)}`;
  }
  function mergePendingMutations(...groups) {
    const merged = [];
    const seen = /* @__PURE__ */ new Set();
    for (const group of groups) {
      for (const entry of group) {
        if (!entry?.type || !entry.payload) {
          continue;
        }
        const key = getMutationKey(entry);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        merged.push(entry);
      }
    }
    return merged;
  }
  function makeEntry(type, payload) {
    return {
      type,
      payload: enrichPayload(type, payload)
    };
  }
  function getComparableKey(record, fields) {
    return fields.map((field) => {
      const value = record?.[field];
      return `${field}:${typeof value === "string" ? value : JSON.stringify(value)}`;
    }).join("|");
  }
  function createBackfillMutations(localSharedState, remoteSharedState = getDefaultSharedState()) {
    const mutations = [];
    const local = reconcileSharedState(localSharedState);
    const remote = reconcileSharedState(remoteSharedState);
    for (const [itemId, guestId] of Object.entries(local.groceries.claims ?? {})) {
      if (!guestId || remote.groceries.claims[itemId]) {
        continue;
      }
      mutations.push(
        makeEntry("claimGrocery", {
          guestId,
          itemId,
          action: "claim",
          source: "cached-backfill"
        })
      );
    }
    for (const [itemId, helperIds] of Object.entries(local.groceries.payHelpers ?? {})) {
      const remoteHelpers = new Set(remote.groceries.payHelpers[itemId] ?? []);
      for (const guestId of helperIds ?? []) {
        if (!guestId || remoteHelpers.has(guestId)) {
          continue;
        }
        mutations.push(
          makeEntry("groceryContribution", {
            guestId,
            itemId,
            helpingPay: true,
            source: "cached-backfill"
          })
        );
      }
    }
    for (const [itemId, requests] of Object.entries(local.groceries.editRequests ?? {})) {
      const remoteKeys = new Set(
        (remote.groceries.editRequests[itemId] ?? []).map(
          (request) => getComparableKey(request, ["guestId", "note", "createdAt"])
        )
      );
      for (const request of requests ?? []) {
        const key = getComparableKey(request, ["guestId", "note", "createdAt"]);
        if (remoteKeys.has(key) || !request?.guestId || !request?.note) {
          continue;
        }
        mutations.push(
          makeEntry("groceryEditRequest", {
            guestId: request.guestId,
            itemId,
            note: request.note,
            submittedAt: request.createdAt,
            source: "cached-backfill"
          })
        );
      }
    }
    const remoteAdditions = new Set(
      (remote.groceries.additions ?? []).map(
        (item) => getComparableKey(item, ["section", "label", "note", "createdBy", "createdAt"])
      )
    );
    for (const item of local.groceries.additions ?? []) {
      const key = getComparableKey(item, ["section", "label", "note", "createdBy", "createdAt"]);
      if (remoteAdditions.has(key) || !item?.createdBy || !item?.label) {
        continue;
      }
      mutations.push(
        makeEntry("addGroceryItem", {
          guestId: item.createdBy,
          section: item.section,
          label: item.label,
          note: item.note ?? "",
          submittedAt: item.createdAt,
          source: "cached-backfill"
        })
      );
    }
    for (const [activityId, voterIds] of Object.entries(local.activities.votes ?? {})) {
      const remoteVoters = new Set(remote.activities.votes[activityId] ?? []);
      for (const guestId of voterIds ?? []) {
        if (!guestId || remoteVoters.has(guestId)) {
          continue;
        }
        mutations.push(
          makeEntry("voteActivity", {
            guestId,
            activityId,
            source: "cached-backfill"
          })
        );
      }
    }
    const remoteSuggestions = new Set(
      (remote.activities.suggestions ?? []).map(
        (activity) => getComparableKey(activity, ["title", "category", "description", "createdBy", "createdAt"])
      )
    );
    for (const activity of local.activities.suggestions ?? []) {
      const description = activity.note || activity.description || "";
      const key = getComparableKey(
        {
          title: activity.title,
          category: activity.category,
          description,
          createdBy: activity.createdBy,
          createdAt: activity.createdAt
        },
        ["title", "category", "description", "createdBy", "createdAt"]
      );
      if (remoteSuggestions.has(key) || !activity?.createdBy || !activity?.title) {
        continue;
      }
      mutations.push(
        makeEntry("suggestActivity", {
          guestId: activity.createdBy,
          title: activity.title,
          category: activity.category,
          note: description,
          submittedAt: activity.createdAt,
          source: "cached-backfill"
        })
      );
    }
    for (const [guestId, details] of Object.entries(local.guestDetails ?? {})) {
      const remoteDetails = remote.guestDetails[guestId];
      const localUpdatedAt = Date.parse(details?.updatedAt ?? "") || 0;
      const remoteUpdatedAt = Date.parse(remoteDetails?.updatedAt ?? "") || 0;
      if (!guestId || localUpdatedAt <= remoteUpdatedAt) {
        continue;
      }
      mutations.push(
        makeEntry("saveGuestDetails", {
          guestId,
          dietaryFlags: details.dietaryFlags ?? [],
          dietaryNotes: details.dietaryNotes ?? "",
          allergyNotes: details.allergyNotes ?? "",
          messageToKyle: details.messageToKyle ?? "",
          submittedAt: details.updatedAt,
          source: "cached-backfill"
        })
      );
    }
    return mutations;
  }
  async function flushPendingMutations(request, initialSharedState, pendingMutations) {
    let sharedState = reconcileSharedState(initialSharedState);
    const remaining = [];
    let flushedCount = 0;
    for (const entry of pendingMutations) {
      try {
        const result = await request(entry.type, entry.payload, "POST");
        sharedState = reconcileSharedState(result.sharedState ?? sharedState);
        if (String(result.emailStatus ?? "").startsWith("failed")) {
          remaining.push(entry);
          continue;
        }
        flushedCount += 1;
      } catch {
        remaining.push(entry);
      }
    }
    return {
      sharedState,
      flushedCount,
      remaining
    };
  }
  function mergeSharedState(sharedState) {
    return {
      groceries: {
        claims: {
          ...sharedState.groceries?.claims
        },
        payHelpers: {
          ...sharedState.groceries?.payHelpers
        },
        editRequests: {
          ...sharedState.groceries?.editRequests
        },
        additions: [...sharedState.groceries?.additions ?? []]
      },
      activities: {
        votes: {
          ...sharedState.activities?.votes
        },
        suggestions: [...sharedState.activities?.suggestions ?? []]
      },
      guestDetails: {
        ...sharedState.guestDetails
      }
    };
  }
  function normalizeActivityVotes(votes) {
    const normalized = {};
    for (const activity of activities) {
      normalized[activity.activityId] = Array.isArray(votes?.[activity.activityId]) ? votes[activity.activityId] : [];
    }
    return normalized;
  }
  function normalizePayHelpers(payHelpers) {
    const normalized = {};
    for (const item of groceries) {
      normalized[item.itemId] = Array.isArray(payHelpers?.[item.itemId]) ? payHelpers[item.itemId] : [];
    }
    return normalized;
  }
  function normalizeEditRequests(editRequests) {
    const normalized = {};
    for (const item of groceries) {
      normalized[item.itemId] = Array.isArray(editRequests?.[item.itemId]) ? editRequests[item.itemId] : [];
    }
    return normalized;
  }
  function reconcileSharedState(sharedState) {
    const merged = mergeSharedState({
      ...getDefaultSharedState(),
      ...sharedState
    });
    merged.activities.votes = normalizeActivityVotes(merged.activities.votes);
    merged.groceries.payHelpers = normalizePayHelpers(merged.groceries.payHelpers);
    merged.groceries.editRequests = normalizeEditRequests(merged.groceries.editRequests);
    for (const item of groceries) {
      if (item.lockedClaimBy) {
        merged.groceries.claims[item.itemId] = item.lockedClaimBy;
      }
    }
    return merged;
  }
  function applyMutation(sharedState, type, payload) {
    const next = deepClone(reconcileSharedState(sharedState));
    switch (type) {
      case "claimGrocery": {
        const { guestId, itemId, action } = payload;
        if (action === "unclaim") {
          if (next.groceries.claims[itemId] === guestId) {
            delete next.groceries.claims[itemId];
          }
          return next;
        }
        if (next.groceries.claims[itemId] && next.groceries.claims[itemId] !== guestId) {
          throw new Error("That item is already claimed by someone else.");
        }
        next.groceries.claims[itemId] = guestId;
        return next;
      }
      case "groceryContribution": {
        const { guestId, itemId, helpingPay } = payload;
        const helpers = new Set(next.groceries.payHelpers[itemId] ?? []);
        if (helpingPay) {
          helpers.add(guestId);
        } else {
          helpers.delete(guestId);
        }
        next.groceries.payHelpers[itemId] = [...helpers];
        return next;
      }
      case "groceryEditRequest": {
        const { guestId, itemId, note } = payload;
        next.groceries.editRequests[itemId].push({
          guestId,
          note,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        return next;
      }
      case "addGroceryItem": {
        const { guestId, section, label, note } = payload;
        next.groceries.additions.unshift({
          itemId: `guest-${Date.now()}`,
          section,
          label,
          note,
          guestAdded: true,
          createdBy: guestId,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          defaultSource: "Guest suggestion",
          budgetNote: ""
        });
        return next;
      }
      case "voteActivity": {
        const { guestId, activityId } = payload;
        const voters = new Set(next.activities.votes[activityId] ?? []);
        if (voters.has(guestId)) {
          throw new Error("You already voted for that activity.");
        }
        voters.add(guestId);
        next.activities.votes[activityId] = [...voters];
        return next;
      }
      case "suggestActivity": {
        const { guestId, title, category, note } = payload;
        next.activities.suggestions.unshift({
          activityId: `suggested-${Date.now()}`,
          title,
          category,
          subtype: "Guest suggestion",
          location: "TBD",
          driveTime: "TBD",
          cost: "TBD",
          energy: "Unknown",
          description: note || "Guest-suggested activity",
          voteable: true,
          featured: false,
          createdBy: guestId,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        return next;
      }
      case "saveGuestDetails": {
        const { guestId, dietaryFlags: dietaryFlags2, dietaryNotes, allergyNotes, messageToKyle } = payload;
        next.guestDetails[guestId] = {
          dietaryFlags: dietaryFlags2,
          dietaryNotes,
          allergyNotes,
          messageToKyle,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        return next;
      }
      default:
        return next;
    }
  }
  function getConfiguredMode() {
    if (window.location.protocol === "file:") {
      return "local";
    }
    const forcedMode = getConfigValue("syncMode", "VITE_SYNC_MODE");
    if (forcedMode) {
      return forcedMode;
    }
    if (getConfiguredAppsScriptUrl()) {
      return "apps-script";
    }
    if (getConfigValue("emailjsPublicKey", "VITE_EMAILJS_PUBLIC_KEY") && getConfigValue("emailjsServiceId", "VITE_EMAILJS_SERVICE_ID") && getConfigValue("emailjsTemplateId", "VITE_EMAILJS_TEMPLATE_ID")) {
      return "emailjs";
    }
    return "local";
  }
  function createAppsScriptClient(baseUrl) {
    async function request(action, payload = {}, method = "POST") {
      const requestUrl = method === "GET" ? `${baseUrl}?action=${encodeURIComponent(action)}` : baseUrl;
      const response = await fetch(requestUrl, {
        method,
        body: method === "GET" ? void 0 : JSON.stringify({ action, ...payload })
      });
      if (!response.ok) {
        throw new Error(`Sync request failed (${response.status})`);
      }
      return response.json();
    }
    return {
      mode: "apps-script",
      async bootstrap() {
        const localSharedState = reconcileSharedState(loadSharedCache());
        const result = await request("bootstrap", {}, "GET");
        let sharedState = reconcileSharedState(result.sharedState ?? getDefaultSharedState());
        let pendingMutations = loadPendingMutations();
        if (!hasCompletedBackfill()) {
          pendingMutations = mergePendingMutations(
            createBackfillMutations(localSharedState, sharedState),
            pendingMutations
          );
          savePendingMutations(pendingMutations);
          markBackfillCompleted();
        }
        let flushedCount = 0;
        if (pendingMutations.length) {
          const flushResult = await flushPendingMutations(request, sharedState, pendingMutations);
          sharedState = flushResult.sharedState;
          flushedCount = flushResult.flushedCount;
          savePendingMutations(flushResult.remaining);
          pendingMutations = flushResult.remaining;
        }
        saveSharedCache(sharedState);
        return {
          mode: "apps-script",
          sharedState,
          flushedCount,
          pendingCount: pendingMutations.length
        };
      },
      async mutate(type, payload, optimisticSharedState) {
        const enrichedPayload = enrichPayload(type, payload);
        const sharedState = reconcileSharedState(optimisticSharedState);
        try {
          const result = await request(type, enrichedPayload, "POST");
          const nextSharedState = reconcileSharedState(result.sharedState ?? optimisticSharedState);
          const emailFailed = String(result.emailStatus ?? "").startsWith("failed");
          if (emailFailed) {
            const pendingCount = queuePendingMutation(type, enrichedPayload);
            saveSharedCache(nextSharedState);
            return {
              sharedState: nextSharedState,
              queued: true,
              pendingCount,
              queuedMessage: "Saved and queued. We'll keep retrying until the email goes through."
            };
          }
          saveSharedCache(nextSharedState);
          return { sharedState: nextSharedState };
        } catch (error) {
          saveSharedCache(sharedState);
          const pendingCount = queuePendingMutation(type, enrichedPayload);
          return {
            sharedState,
            queued: true,
            pendingCount,
            queuedMessage: "Saved on this device. We'll retry live sync automatically.",
            queueReason: error.message
          };
        }
      }
    };
  }
  function createEmailClient() {
    const publicKey = getConfigValue("emailjsPublicKey", "VITE_EMAILJS_PUBLIC_KEY");
    const serviceId = getConfigValue("emailjsServiceId", "VITE_EMAILJS_SERVICE_ID");
    const templateId = getConfigValue("emailjsTemplateId", "VITE_EMAILJS_TEMPLATE_ID");
    const notificationEmail = getConfigValue("notificationEmail", "VITE_NOTIFICATION_EMAIL");
    es_default.init({
      publicKey
    });
    async function sendEmail(entry) {
      await es_default.send(serviceId, templateId, {
        action: entry.type,
        guest_name: entry.payload.guestName,
        guest_id: entry.payload.guestId ?? "",
        message: JSON.stringify(entry.payload, null, 2),
        payload: JSON.stringify(entry.payload, null, 2),
        email: entry.payload.email ?? "",
        page: entry.payload.pageUrl,
        ua: navigator.userAgent,
        ts: entry.payload.submittedAt,
        submitted_at: entry.payload.submittedAt,
        source: entry.payload.source,
        to_email: notificationEmail ?? "",
        recipient_email: notificationEmail ?? ""
      });
    }
    return {
      mode: "emailjs",
      async bootstrap() {
        const localSharedState = reconcileSharedState(loadSharedCache());
        let sharedState = localSharedState;
        let pendingMutations = loadPendingMutations();
        if (!hasCompletedBackfill()) {
          pendingMutations = mergePendingMutations(
            createBackfillMutations(localSharedState),
            pendingMutations
          );
          savePendingMutations(pendingMutations);
          markBackfillCompleted();
        }
        let flushedCount = 0;
        const remaining = [];
        for (const entry of pendingMutations) {
          try {
            await sendEmail(entry);
            flushedCount += 1;
          } catch {
            remaining.push(entry);
          }
        }
        savePendingMutations(remaining);
        saveSharedCache(sharedState);
        return {
          mode: "emailjs",
          sharedState,
          flushedCount,
          pendingCount: remaining.length
        };
      },
      async mutate(type, payload, optimisticSharedState) {
        const enrichedPayload = enrichPayload(type, payload);
        const sharedState = reconcileSharedState(optimisticSharedState);
        const entry = { type, payload: enrichedPayload };
        saveSharedCache(sharedState);
        try {
          await sendEmail(entry);
          return { sharedState };
        } catch (error) {
          const pendingCount = queuePendingMutation(type, enrichedPayload);
          return {
            sharedState,
            queued: true,
            pendingCount,
            queuedMessage: "Saved and queued. We'll retry the email automatically.",
            queueReason: error.message
          };
        }
      }
    };
  }
  function createLocalClient() {
    return {
      mode: "local",
      async bootstrap() {
        const sharedState = reconcileSharedState(loadSharedCache());
        saveSharedCache(sharedState);
        return {
          mode: "local",
          sharedState
        };
      },
      async mutate(type, payload, optimisticSharedState) {
        const sharedState = reconcileSharedState(
          applyMutation(optimisticSharedState, type, payload)
        );
        saveSharedCache(sharedState);
        return { sharedState };
      }
    };
  }
  function createSyncClient() {
    const mode = getConfiguredMode();
    const appsScriptUrl = getConfiguredAppsScriptUrl();
    if (mode === "apps-script" && appsScriptUrl) {
      return createAppsScriptClient(appsScriptUrl);
    }
    if (mode === "emailjs" && getConfigValue("emailjsPublicKey", "VITE_EMAILJS_PUBLIC_KEY") && getConfigValue("emailjsServiceId", "VITE_EMAILJS_SERVICE_ID") && getConfigValue("emailjsTemplateId", "VITE_EMAILJS_TEMPLATE_ID")) {
      return createEmailClient();
    }
    return createLocalClient();
  }
  function applyOptimisticMutation(sharedState, type, payload) {
    return reconcileSharedState(applyMutation(sharedState, type, payload));
  }

  // src/app.js
  function serializeForm(form) {
    return new FormData(form);
  }
  function fireCelebration() {
    confetti_module_default({
      particleCount: 110,
      spread: 90,
      startVelocity: 24,
      origin: { y: 0.68 }
    });
  }
  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
  var ACTIVITY_FILTER_GROUPS = {
    location: "activityLocations",
    travel: "activityTravelTimes",
    duration: "activityDurations",
    cost: "activityCosts",
    energy: "activityEnergies"
  };
  var EMPTY_ACTIVITY_FILTERS = {
    activityCategory: "All",
    activityQuery: "",
    activityLocations: [],
    activityTravelTimes: [],
    activityDurations: [],
    activityCosts: [],
    activityEnergies: []
  };
  async function initApp(root) {
    const syncClient = createSyncClient();
    let state = { ...loadLocalState(), flightStatuses: {} };
    let stageTimer = null;
    let noticeTimer = null;
    function clearStageTimer() {
      if (stageTimer) {
        window.clearTimeout(stageTimer);
        stageTimer = null;
      }
    }
    function clearNoticeTimer() {
      if (noticeTimer) {
        window.clearTimeout(noticeTimer);
        noticeTimer = null;
      }
    }
    function commit(nextState) {
      state = nextState;
      persistLocalState(state);
      render();
    }
    function patch(partial) {
      commit({
        ...state,
        ...partial
      });
    }
    function patchActivityFilters(partial) {
      patch({
        filters: {
          ...state.filters,
          ...partial
        }
      });
    }
    function syncActivityFilterForm(form) {
      const data = serializeForm(form);
      patchActivityFilters({
        activityCategory: String(data.get("activityCategory") ?? "All"),
        activityQuery: String(data.get("activityQuery") ?? "")
      });
    }
    function toggleActivityFilter(filterKey, value) {
      const currentValues = state.filters[filterKey] ?? [];
      const nextValues = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value];
      patchActivityFilters({
        [filterKey]: nextValues
      });
    }
    function queueStagePatch(partial, delayMs) {
      clearStageTimer();
      stageTimer = window.setTimeout(() => {
        stageTimer = null;
        patch(partial);
      }, delayMs);
    }
    function setEphemeralNotice(message, delayMs = 2200) {
      clearNoticeTimer();
      patch({ syncNotice: message });
      noticeTimer = window.setTimeout(() => {
        noticeTimer = null;
        patch({ syncNotice: "" });
      }, delayMs);
    }
    function updateShared(sharedState, extra = {}) {
      commit({
        ...state,
        ...extra,
        shared: reconcileSharedState(sharedState)
      });
    }
    function getSelectedGuest() {
      return getGuestById(state.selectedGuestId) ?? getGuestById(state.guestId) ?? null;
    }
    function getContext() {
      return {
        state,
        guest: getGuestById(state.guestId) ?? getSelectedGuest(),
        selectedGuest: getSelectedGuest()
      };
    }
    async function loadFlightStatuses(flight) {
      if (!flight) return;
      const legs = [
        flight.inbound,
        flight.outbound
      ].filter(Boolean);
      for (const leg of legs) {
        const lookupNumber = leg.flightNumberIata ?? leg.flightNumber;
        const key = flightStatusKey(lookupNumber, leg.date);
        const result = await fetchFlightStatus(lookupNumber, leg.date);
        patch({ flightStatuses: { ...state.flightStatuses, [key]: result } });
      }
    }
    function maybeLoadFlightStatuses() {
      const guest = getGuestById(state.guestId);
      if (state.introStage === "dashboard" && state.currentTab === "my-info" && guest?.flight) {
        loadFlightStatuses(guest.flight);
      }
    }
    function render() {
      const context = getContext();
      root.innerHTML = state.guestId && state.introStage === "dashboard" ? renderDashboardView(context) : renderSplashView(context);
    }
    async function bootstrap() {
      try {
        const result = await syncClient.bootstrap();
        const syncNotice = result.flushedCount && result.pendingCount ? `Recovered ${result.flushedCount} cached updates. ${result.pendingCount} still waiting to sync.` : result.flushedCount ? `Recovered ${result.flushedCount} cached updates.` : result.pendingCount ? `${result.pendingCount} cached updates are still waiting to sync.` : "";
        commit({
          ...state,
          syncMode: result.mode,
          syncNotice,
          syncError: "",
          lastSyncedAt: (/* @__PURE__ */ new Date()).toISOString(),
          shared: result.sharedState
        });
      } catch (error) {
        commit({
          ...state,
          syncMode: "local",
          syncError: `Sync bootstrap failed. Using this device's saved data instead. ${error.message}`,
          shared: reconcileSharedState(state.shared)
        });
      }
    }
    async function mutateShared(type, payload, successMessage) {
      const optimisticSharedState = applyOptimisticMutation(state.shared, type, payload);
      const previousSharedState = state.shared;
      updateShared(optimisticSharedState, {
        syncError: ""
      });
      try {
        const result = await syncClient.mutate(type, payload, optimisticSharedState);
        if (result.queued) {
          updateShared(result.sharedState, {
            syncError: "",
            syncNotice: ""
          });
          setEphemeralNotice(result.queuedMessage);
          return;
        }
        updateShared(result.sharedState, {
          syncError: "",
          lastSyncedAt: (/* @__PURE__ */ new Date()).toISOString(),
          syncNotice: ""
        });
        if (successMessage) {
          setEphemeralNotice(successMessage);
        }
      } catch (error) {
        updateShared(previousSharedState, {
          syncError: error.message
        });
      }
    }
    root.addEventListener("click", async (event) => {
      const actionTarget = event.target.closest("[data-action]");
      if (!actionTarget) {
        return;
      }
      const action = actionTarget.dataset.action;
      if (action === "change-name") {
        clearStageTimer();
        patch({
          introStage: "landing"
        });
        return;
      }
      if (action === "accept-invitation") {
        if (!state.selectedGuestId) {
          return;
        }
        clearStageTimer();
        if (state.motionEnabled) {
          fireCelebration();
          patch({ introStage: "dashboard-transition" });
          queueStagePatch(
            {
              guestId: state.selectedGuestId,
              introStage: "dashboard"
            },
            650
          );
        } else {
          patch({
            guestId: state.selectedGuestId,
            introStage: "dashboard"
          });
        }
        return;
      }
      if (action === "switch-guest") {
        clearStageTimer();
        patch({
          guestId: null,
          selectedGuestId: state.guestId,
          introStage: "landing",
          currentTab: "my-info"
        });
        return;
      }
      if (action === "copy-address") {
        try {
          await copyText(eventContent.address.full);
          setEphemeralNotice("Address copied.");
        } catch {
          setEphemeralNotice("Couldn't copy the address. You can still copy it manually.");
        }
        return;
      }
      if (action === "set-tab") {
        const newTab = actionTarget.dataset.tabId;
        patch({
          currentTab: newTab,
          ui: {
            ...state.ui,
            expandedGroceryItemId: newTab === "groceries" ? state.ui.expandedGroceryItemId : null
          }
        });
        if (newTab === "my-info") {
          const guest = getGuestById(state.guestId);
          if (guest?.flight) loadFlightStatuses(guest.flight);
        }
        return;
      }
      if (action === "toggle-utility-rail") {
        patch({
          ui: {
            ...state.ui,
            utilityRailCollapsed: !state.ui.utilityRailCollapsed
          }
        });
        return;
      }
      if (action === "set-grocery-section") {
        patchActivityFilters({
          grocerySection: actionTarget.dataset.sectionId ?? "all"
        });
        return;
      }
      if (action === "toggle-activity-filter") {
        const filterKey = ACTIVITY_FILTER_GROUPS[actionTarget.dataset.filterGroup];
        const value = actionTarget.dataset.filterValue;
        if (!filterKey || !value) {
          return;
        }
        toggleActivityFilter(filterKey, value);
        return;
      }
      if (action === "clear-activity-filters") {
        patchActivityFilters(EMPTY_ACTIVITY_FILTERS);
        return;
      }
      if (action === "toggle-grocery-details") {
        const itemId = actionTarget.dataset.itemId;
        patch({
          ui: {
            ...state.ui,
            expandedGroceryItemId: state.ui.expandedGroceryItemId === itemId ? null : itemId
          }
        });
        return;
      }
      if (action === "claim-grocery") {
        await mutateShared(
          "claimGrocery",
          {
            guestId: state.guestId,
            itemId: actionTarget.dataset.itemId,
            action: "claim"
          },
          "Claim updated."
        );
        return;
      }
      if (action === "unclaim-grocery") {
        await mutateShared(
          "claimGrocery",
          {
            guestId: state.guestId,
            itemId: actionTarget.dataset.itemId,
            action: "unclaim"
          },
          "Claim released."
        );
        return;
      }
      if (action === "toggle-pay") {
        const itemId = actionTarget.dataset.itemId;
        const helpers = state.shared.groceries.payHelpers[itemId] ?? [];
        const helpingPay = !helpers.includes(state.guestId);
        await mutateShared(
          "groceryContribution",
          {
            guestId: state.guestId,
            itemId,
            helpingPay
          },
          helpingPay ? "Marked as helping pay." : "Removed pay helper."
        );
        return;
      }
      if (action === "vote-activity") {
        await mutateShared(
          "voteActivity",
          {
            guestId: state.guestId,
            activityId: actionTarget.dataset.activityId
          },
          "Vote submitted."
        );
      }
    });
    root.addEventListener("submit", async (event) => {
      const form = event.target;
      const formName = form.dataset.form;
      if (!formName) {
        return;
      }
      event.preventDefault();
      const data = serializeForm(form);
      if (formName === "issue-scroll") {
        const selectedGuestId = String(data.get("guestId") ?? "");
        if (!selectedGuestId) {
          return;
        }
        clearStageTimer();
        if (state.motionEnabled) {
          patch({
            selectedGuestId,
            introStage: "scroll-reveal"
          });
          queueStagePatch(
            {
              selectedGuestId,
              introStage: "personalized-card"
            },
            950
          );
        } else {
          patch({
            selectedGuestId,
            introStage: "personalized-card"
          });
        }
        return;
      }
      if (formName === "edit-grocery-request") {
        const note = String(data.get("note") ?? "").trim();
        if (!note) {
          return;
        }
        await mutateShared(
          "groceryEditRequest",
          {
            guestId: state.guestId,
            itemId: data.get("itemId"),
            note
          },
          "Edit request sent."
        );
        form.reset();
        return;
      }
      if (formName === "add-grocery-item") {
        const label = String(data.get("label") ?? "").trim();
        if (!label) {
          return;
        }
        await mutateShared(
          "addGroceryItem",
          {
            guestId: state.guestId,
            section: data.get("section"),
            label,
            note: String(data.get("note") ?? "").trim()
          },
          "Item added."
        );
        form.reset();
        return;
      }
      if (formName === "suggest-activity") {
        const title = String(data.get("title") ?? "").trim();
        if (!title) {
          return;
        }
        await mutateShared(
          "suggestActivity",
          {
            guestId: state.guestId,
            title,
            category: data.get("category"),
            note: String(data.get("note") ?? "").trim()
          },
          "Activity suggestion added."
        );
        form.reset();
        return;
      }
      if (formName === "save-guest-details") {
        await mutateShared(
          "saveGuestDetails",
          {
            guestId: state.guestId,
            dietaryFlags: data.getAll("dietaryFlags"),
            dietaryNotes: String(data.get("dietaryNotes") ?? "").trim(),
            allergyNotes: String(data.get("allergyNotes") ?? "").trim(),
            messageToKyle: String(data.get("messageToKyle") ?? "").trim()
          },
          "Details saved."
        );
        return;
      }
      if (formName === "activity-filters") {
        syncActivityFilterForm(form);
      }
    });
    root.addEventListener("change", (event) => {
      const form = event.target.closest("[data-form='activity-filters']");
      if (!form) {
        return;
      }
      syncActivityFilterForm(form);
    });
    root.addEventListener("input", (event) => {
      const form = event.target.closest("[data-form='activity-filters']");
      if (!form) {
        return;
      }
      syncActivityFilterForm(form);
    });
    render();
    maybeLoadFlightStatuses();
    await bootstrap();
    maybeLoadFlightStatuses();
  }

  // src/main.js
  initApp(document.querySelector("#app"));
})();
