// ToDo: сделать объект конфетку
// ToDo: время отрисовки холста
// ToDo: смена цвета
// ToDo: гет список точек
// ToDo: Придумать что-то с рамкой?? Она влияет на позицию точки...
// ToDo: Возможность выбора цвета и размера точки
// ToDo: если действия в консоли налагаются, что делать??
// ToDo: перемещение точки
// ToDo: построение кривой безье по точкам, чтобы точки можно было двигать
// ToDo: удаление всех точек
// ToDo: события на mousemove по таймеру
// ToDo: Может двигать не за центральную точку?
// ToDo: Кривые Безье, на стыке что будет, если вот так .____{.}____. ?

function CanvasCore (canvasElem, gridElem) {
    var theCanvas = canvasElem;
    var context = theCanvas.getContext("2d");

    var message = [];
    var consoleText = [];

    var canvasHeight = 400;
    var canvasWidth = 900;

    var isDebug = false;
    var isGrid = false;

    var isDebugText = false;
    var gridSize = 0;

    var canvasX = 0;
    var canvasY = 0;

    var isMouseMove = false;
    var mouseX = 0;
    var mouseY = 0;

    var isMouseClick = false;
    var mouseXClick = 0;
    var mouseYClick = 0;

    var dotSize = 3;
    var isCreateDot = false;
    var isDeleteDot = false;
    var isMoveDot = false;

    Dots = (function(){
        var dots = {};
        var id = 0;
        var size = 30;
        var color = 'red';
        var dotOnMouse = null;

        function drawDot(id) {
            context.save();
            context.beginPath();
            context.arc(dots[id][0], dots[id][1], dots[id].size, 0, (Math.PI / 180) * 360 );
            context.fillStyle = dots[id].color;
            context.fill();
            context.restore();
        };

        function deleteDot(id) {
            if (id !== false){
                delete dots[id];
            }
        };

        function findDot(coord) {
            for (var i in dots) {
                if (Math.sqrt((coord[0] - dots[i][0]) * (coord[0] - dots[i][0]) + 
                        (coord[1] - dots[i][1]) * (coord[1] - dots[i][1])) <= dots[i].size) {
                    return i;
                }
            }
            return false;
        };

        return {
            add: function(dot) {
                dots[id] = dot;
                dots[id].color = color;
                dots[id].size = size;
                ++id;
                return this;
            },
            remove: function(dot) {
                deleteDot(findDot(dot));
                return this;
            },
            removeAll: function() {
                for (var i in dots) {
                    delete dots[i];
                }
            },
            getAll: function() {
                return dots;
            },
            setDot: function(id, dot) {
                var color = dots[id].color;
                var size = dots[id].size;

                dots[id] = dot;
                dots[id].color = color;
                dots[id].size = size;
            },
            getDot: function(id) {
                return dots[id];
            },
            draw: function(){
                if (dots.length == 0) return;
                for (var i in dots){
                    drawDot(i);
                }
                return this;
            },
            setColor: function(c) {
                color = c;
                return this;
            },
            getColor: function(c) {
                return color;
            },
            setSize: function(s) {
                size = s;
                return this;
            },
            getSize: function() {
                return size;
            },
            getDotOnMouse: function() {
                return dotOnMouse;
            },
            setDotOnMouse: function(dot) {
                var id = findDot(dot);
                if (id !== false) {
                    dotOnMouse = id;
                } else {
                    return false;
                }
                return this;
            }

        }
    }())

    // ToDo: Если несколько холстов, надобно вводить командочки в отдельный инпут иначе конфликты
    EventFull.add(window, 'keypress', consoleManager);
    function consoleManager(e) {
        if (consoleText.length == 0) {
            if (getChar(e) == ':') {
                consoleText.push('Ввод: ');
            }
        } else {
            EventFull.add(window, 'keydown', controlConsole);
            if (e.keyCode == 27) {
                consoleText = [];
                EventFull.remove(window, 'keydown', controlConsole);
            } else {
                if (e.keyCode == 13) {
                    consoleAction();
                    consoleText = [];
                    EventFull.remove(window, 'keydown', controlConsole);
                } else {
                    consoleText[0] += getChar(e);
                }
            }
        }
        drawScreen();
    }

    // event.type должен быть keypress
    // ToDo: в ивент засунуть...
    function getChar(event) {
        if (event.which == null) {  // IE
            if (event.keyCode < 32) return null; // спец. символ
                return String.fromCharCode(event.keyCode)
        }
     
        if (event.which!=0 && event.charCode!=0) { // все кроме IE
            if (event.which < 32) return null; // спец. символ
                return String.fromCharCode(event.which); // остальные
        } 
      return null; // спец. символ
    }

    function controlConsole(e) {
        if (e.keyCode == 8) {
            var temp = consoleText[0].split(':');
            temp[1] = temp[1].substring(0, temp[1].length - 1);
            consoleText[0] = temp.join(':');
        }
        drawScreen();
    }

    function consoleAction() {
        var command = consoleText[0].split(':')[1].replace(/^\s+/, '').replace(/\s+$/, '');

        switch (command) {
            case 'help':
                showHelp();
                break;
            case 'grid':
                gridAct();
                break;
            case 'info':
                infoAct();
                break;
            case 'mouse move':
                mouseMoveAct();
                break;
            case 'mouse click':
                mouseClickAct();
                break;
            case 'DEBUG':
                debugAct();
                break;
            case 'create dot':
                if (isDeleteDot) deleteDotAct();
                if (isMoveDot) moveDotAct();
                createDotAct();
                break;
            case 'delete dot':
                if (isCreateDot) createDotAct();
                if (isMoveDot) moveDotAct();
                deleteDotAct();
                break;
            case 'move dot':
                if (isDeleteDot) deleteDotAct();
                if (isCreateDot) createDotAct();
                moveDotAct();
                break;
        }
    }

    function debugAct() {
        isDebug == true ? isDebug = false : isDebug = true;
        gridAct();
        infoAct();
        mouseMoveAct();
        mouseClickAct();
    }

    function gridAct() {
        if (isGrid && gridElem) {
            isGrid = false;
            EventFull.remove(gridElem, 'change', changeGrid);
            gridSize = 0;
            gridElem.value = 0;
        } else {
            isGrid = true;
            EventFull.add(gridElem, 'change', changeGrid);
            gridSize = 2;
            gridElem.value = 2;
        }
    }

    function infoAct() {
        isDebugText == true ? isDebugText = false : isDebugText = true;

        if (isMouseMove) {
            EventFull.remove(theCanvas, 'mousemove', onMouseMove);
            isMouseMove = false;
        }

        if (isMouseClick) {
            EventFull.remove(theCanvas, 'click', onMouseClick);
            isMouseClick = false;
        }
    }

    function mouseMoveAct() {
        if (isMouseMove) {
            isMouseMove = false;
            EventFull.remove(theCanvas, 'mousemove', onMouseMove);
            mouseX = mouseY = 0;
        } else {
            isMouseMove = true;
            EventFull.add(theCanvas, 'mousemove', onMouseMove);
        }
    }

    function mouseClickAct() {
        if (isMouseClick) {
            isMouseClick = false;
            EventFull.remove(theCanvas, 'click', onMouseClick);
            mouseXClick = mouseYClick = 0;
        } else {
            isMouseClick = true;
            EventFull.add(theCanvas, 'click', onMouseClick);
        }
    }

    function showHelp () {
        // ?? Дивка по середине экрана со списком команд... 
        alert('пока ничего');
    }

    function createDotAct() {
        if (isCreateDot) {
            isCreateDot = false;
            EventFull.remove(theCanvas, 'click', dotAddOnClick);
        } else {
            isCreateDot = true;
            EventFull.add(theCanvas, 'click', dotAddOnClick);
        }
    }

    function deleteDotAct(){
        if (isDeleteDot) {
            isDeleteDot = false;
            EventFull.remove(theCanvas, 'click', delDotOnClick);
        } else {
            isDeleteDot = true;
            EventFull.add(theCanvas, 'click', delDotOnClick);
        }
    };

    function moveDotAct(){
        if (isMoveDot) {
            isMoveDot = false;
            EventFull.remove(theCanvas, 'mousedown', moveDotOnMouseDown);
        } else {
            isMoveDot = true;
            EventFull.add(theCanvas, 'mousedown', moveDotOnMouseDown);
        }
    }

    function moveDotOnMouseDown (e) {
        var x = e.clientX - canvasX;
        var y = e.clientY - canvasY;

        if (Dots.setDotOnMouse([x ,y]) !== false ){
            EventFull.add(theCanvas, 'mousemove', moveDotOnMouseMove);
            EventFull.add(theCanvas, 'mouseup', moveDotOnMouseUp);
        }
    }

    function moveDotOnMouseMove(e) {
        var x = e.clientX - canvasX;
        var y = e.clientY - canvasY;

        Dots.setDot(Dots.getDotOnMouse(), [x, y]);
        drawScreen();
    }

    function moveDotOnMouseUp(e) {
        EventFull.remove(theCanvas, 'mousemove', moveDotOnMouseMove);
        EventFull.remove(theCanvas, 'mouseup', moveDotOnMouseUp);
    }

    function delDotOnClick (e) {
        var x = e.clientX - canvasX;
        var y = e.clientY - canvasY;
        Dots.remove([x,y]);
        drawScreen();
    }

    function dotAddOnClick(e) {
        Dots.add([e.clientX-canvasX, e.clientY-canvasY]);
        drawScreen();
    }
    

    (function canvasPhoto() {
        if (document.all.canvashot) {
            EventFull.add(document.all.canvashot, 'click', createCanvashot);
        }
    })();

    (function canvasOnLoad() {
        canvasPositionOnDocument();
        //EventFull.add(window, 'scroll', canvasPositionOnDocument);
        EventFull.add(window, 'resize', canvasPositionOnDocument);
    })();

    function canvasPositionOnDocument() {
        var canvasPosition = new OffsetOfElement(theCanvas).getOffset();
        canvasX = canvasPosition.left;
        canvasY = canvasPosition.top;
    }

    function onMouseMove(e) {
        mouseX = e.clientX-canvasX;
        mouseY = e.clientY-canvasY;
        drawScreen();
    }

    function onMouseClick(e) {
        mouseXClick = e.clientX-canvasX;
        mouseYClick = e.clientY-canvasY;
        drawScreen();
    }

    function drawScreen() {
        init();

        if (isGrid) {
           drawGrid(gridSize);
        }

        Dots.draw();
        //image
        /*
        var helloWorldImage = new Image();
        helloWorldImage.onload = function () {
            context.drawImage(helloWorldImage, 155, 110);
        }
        helloWorldImage.src = "helloworld.gif";
        */

        var params = {
            lineWidth: 3,
            globalAlpha: 1,
            strokeStyle: 'red',
            lineCap: 'round',
            lineJoin: 'round'
        };
        //drawLine([[20, 20], [300,25], [60, 75], [400, 100], [100,270]], params);


        var funcParams = {
            /*    
            xStart : 0,
            yStart : 0,
            rotate : 0
            */
        }

        var funcLimits = {
            xStart : theCanvas.width/2 - 200,
            xEnd : theCanvas.width/2 + 200,
            yStart : theCanvas.height/2 -200,
            yEnd : theCanvas.height/2 + 200,
            step : 10
        }

        //drawLine(getCoordinates(funcRound, funcParams, funcLimits), params);

        //bezierCurve = new BezierCurve([[[20, 20], [150, 300], [300,20], [370, 80], [100, 100]],
        //    [[100, 100],[620, 180], [700, 170], [700, 350], [100, 20]]], 0.02);
        //drawLine(bezierCurve.getCurve(), params);
        
        //bezierCurve.setReference([[620, 180], [700, 170], [700, 350], [100, 20]]);
        //bezierCurve.setStep(0.02);
        //drawLine(bezierCurve.getCurve(), params); 

        if (isDebugText || isMouseMove || isMouseClick) {
           writeDebugText();
        }

        writeConsoleText();
    }

    //ToDo: Рисовалка градиентом с возвратом fill, возврат с картинкой на фоне

    drawScreen();

    function writeDebugText() {
        var text = [];
        text.push('Grid size = ' + gridSize);

        if (isMouseClick) { 
            text.push('MouseXClick = ' + mouseXClick);
            text.push('MouseYClick = ' + mouseYClick);
        }

        if (isMouseMove){
            text.push('MouseXPosition = ' + mouseX);
            text.push('MouseYPosition = ' + mouseY);
        }

        var textParams = {
            context: {
                fillStyle: 'black',
            },
            font : {
                style: 'normal',
                weight: 'normal',
                size: 20,
                face: 'Sans-Serif',
            },
            align: 'left',
            textSpace: 2,
        }
        
        var measures = textSize(text, textParams);
        drawText(text, textParams, theCanvas.width - measures.width - 5, textParams.font.size + 10);
    }

    function writeConsoleText() {
        var textParams = {
            context: {
                fillStyle: 'red',
            },
            font : {
                style: 'bold',
                weight: 'normal',
                size: 18,
                face: 'Sans-Serif',
            },
            align: 'left',
            textSpace: 2,
        }
        //var measures = textSize(text, textParams);
        drawText(consoleText, textParams, 20, theCanvas.height - textParams.font.size - 10);
    }

    /*
     *  reference = [[[x0, y0], [x1, y1], ... , [xn, yn]], [[], []]];
     *  this.getCurv returns [[x0, x0], ... , ]
     */
    function BezierCurve(reference, step) {
        this.reference = reference;
        this.step = step;

        this.setStep = function(s) {
            this.step = s;
        }

        this.addReference = function(c) {
            this.reference.push(c);
        }

        this.getReference = function(i) {
            return this.reference[i];
        }

        this.addDotInReference = function(i, dot) {
            this.reference[i].push(dot);
        }

        this.setReference = function(c) {
            this.reference = c;
        }

        this.resetReference = function() {
            this.reference = new Array();
        }

        this.repairCurve = function() {
            if (this.reference.length < 2) return;

            for (var i = 1; i < this.reference.length; ++i) {
                this.reference[i][1] = 
                    this.repairDotJoin(this.reference[i - 1][this.reference[i - 1].length - 2], this.reference[i][0]);
            }
        }

        this.repairDotJoin = function(f, c) {
            var x = f[0] > c[0] ? (f[0] - (f[0] - c[0]) * 2) : (f[0] + (c[0] - f[0]) * 2)
            var y = f[1] > c[1] ? (f[1] - (f[1] - c[1]) * 2) : (f[1] + (c[1] - f[1]) * 2);
            
            return [x, y];
        }

        this.factorial = function(x) {
            if (x < 2) {
                return 1;
            }
            var result = 1;
            for (var i = 2; i < x + 1; ++i) {
                result *= i;
            }
            return result;
        }

        this.basis = function(i, n, t) {
            if (t < 0) t = 0;
            if (t > 1) t = 1;
            if (n - i < 0) i = n;

            var result = this.factorial(n) / (this.factorial(i) * this.factorial(n-i))
            result *= Math.pow(t, i) * Math.pow((1 - t), (n - i));

            return result;
        }

        this.referenceFunc = function(num, t) {
            var x = 0;
            var y = 0;
            for (var i = 0; i < this.reference[num].length; ++i) {
                var basis = this.basis(i, this.reference[num].length - 1, t);
                x += this.reference[num][i][0] * basis;
                y += this.reference[num][i][1] * basis;
            }
            return [x, y];
        }


        this.getCurve = function() {
            var result = new Array();
            this.repairCurve();
            for (var i = 0; i < this.reference.length; ++i) {
                for (var t = 0; t < 1 + this.step ; t += this.step) {
                    if (t > 1) {
                        t = 1;
                    }
                    result.push(this.referenceFunc(i, t));
                }
            }

            return result;
        }
    }

    function appLoop(time) {
        window.setTimeout(appLoop, time);
        drawScreen();
    }

    /*
     *  params = {
     *      xStart = 0,
     *      yStart = 0,
     *      rotate = 0
     *  }
     *  limits = {
     *      xStart =
     *      xEnd =
     *      yStart = 
     *      yEnd = 
     *      step = 
     *  }
     *
     */
    function getCoordinates(func, params, limits) {
        params.rotate = params.rotate || 0;
        params.xStart = params.xStart || theCanvas.width/2;
        params.yStart = params.yStart || theCanvas.height/2;

        limits.xStart = params.xStart - limits.xStart || 0;
        limits.xEnd = limits.xEnd + params.xStart || theCanvas.width;
        limits.yStart = limits.yStart || 0;
        limits.yEnd = limits.yEnd || theCanvas.height;
        limits.step = limits.step || 1;

        var result = [];
        for (var i = -limits.xStart; i < limits.xEnd - limits.xStart; i += limits.step ) {
            var y = func(i);
            if (y < limits.yEnd - limits.yStart && y > -limits.yStart) {
                result.push([i + params.xStart,  (-y) + params.yStart]);
            }
        }

        return result;
    }

    /*  text = [];
        textParams: {
            context: {
                textAlign:
                textBaseline:
                textAlpha:
                fillStyle || strokeStyle:
            }
            font : {
                style:
                weight:
                size:
                face:
            }
            align: 'left'(default) | 'right' | 'center',
            textSpace: px
        }
    */
    function textSize(text, textParams) {
        var height = 0;
        var width = 0;

        context.save();

        setContext(textParams.context);
        context.font = textParams.font.weight + ' ' + textParams.font.style + ' ' + 
                            textParams.font.size + 'px ' + textParams.font.face;
                
        for (var i = 0; i < text.length; ++i) {
            var textMeasures = context.measureText(text[i]);
            if (textMeasures.width > width) {
                width = textMeasures.width;
            }
        }
        height = (text.length + textParams.textSpace) * text.length;

        context.restore();

        return {
            height: height, 
            width: width
        }
    }

    function drawText(text, textParams, x, y) {
        context.save();

        textParams.textSpace = textParams.textSpace || 2;
        setContext(textParams.context);
        context.font = textParams.font.weight + ' ' + textParams.font.style + ' ' + 
                            textParams.font.size + 'px ' + textParams.font.face;

        for (var i = 0; i < text.length; ++i){
            var textWidth = context.measureText(text[i]).width;

            switch (textParams.align) {
                case 'center':
                    textParams.context.fillStyle == 'undefined' ?
                                context.strokeText(text[i], x - Math.round(textWidth/2), y + (textParams.font.size + textParams.textSpace) * i) :
                                context.fillText(text[i], x - Math.round(textWidth/2), y + (textParams.font.size + textParams.textSpace) * i);
                    break;
                case 'right':
                    textParams.context.fillStyle == 'undefined' ?
                                context.strokeText(text[i], x - textWidth, y + (textParams.font.size + textParams.textSpace) * i) :
                                context.fillText(text[i], x - textWidth, y + (textParams.font.size + textParams.textSpace) * i);
                    break;
                default:
                    textParams.context.fillStyle == 'undefined' ?
                                context.strokeText(text[i], x, y + (textParams.font.size + textParams.textSpace) * i) :
                                context.fillText(text[i], x, y + (textParams.font.size + textParams.textSpace) * i);
                    break;
            }
        }

        context.restore();
    }

//---------------------------------------------------
    function drawGrid(number) {
        var x = 0;
        var y = 0;

        var params = {
            lineWidth: 1,
            globalAlpha: 1
        };

        var dWidth = theCanvas.width / number;
        for (var i = dWidth; i < theCanvas.width ; i += dWidth) {
            drawLine([[i, y], [i, y + theCanvas.height]], params);
        }
        
        var dHeight = theCanvas.height / number;
        for (var i = dHeight; i < theCanvas.height; i += dHeight) {
            drawLine([[x, i], [x + theCanvas.width, i]], params);
        }
    }

    function changeGrid (e) {
        var target = e.target;
        gridSize = target.value;
        drawScreen();
    }
//---------------------------------------------------

    function setDefaultContext() {
        var defaultParams = {
            globalCompositeOperation: 'sourse-over',
            globalAlpha: 1,
            lineWidth: 1,
            strokeStyle: 'black',
            lineCap: 'butt',
            lineJoin: 'miter',
            font: 'Sans-Serif 10px',
            textAlign: 'center',
            textBaseline: 'alphabetic'
        }

        for (var i in defaultParams ){
            context[i] = defaultParams[i];
        }
    }

    function setContext(params) {
        for (var i in params ){
            context[i] = params[i];
        }
    }

    function getContext() {
        return {
            globalAlpha: context.globalAlpha,
            lineWidth: context.lineWidth,
            strokeStyle: context.strokeStyle,
            lineCap: context.lineCap,
            lineJoin: context.lineJoin
        };
    }

    /*  
     *   path = [[0,1], [2,3], ...]
     *   params = {strokeStyle: ,lineCap:, lineWidth:, lineJoin: , globalAlpha:}
     */
    function drawLine(path, params) {
        context.save();

        setDefaultContext();
        setContext(params);

        context.beginPath();
        context.moveTo(path[0][0], path[0][1]);
        for (var i = 1; i < path.length; ++i) {        
            context.lineTo(path[i][0], path[i][1]);
        }
        context.stroke();
        context.closePath();

        context.restore();
    }

    function init(color) {
        //background
        setCanvasSize({width: canvasWidth, height: canvasHeight});

        if (typeof color == 'undefined') {
            context.fillStyle = 'white';
        } else {
            context.fillStyle = color;
        }
        context.fillRect(0, 0, theCanvas.width, theCanvas.height);
    }

    function setCanvasSize(size) {
        theCanvas.width = size.width || 0;
        theCanvas.height = size.height || 0;
    }

    function createCanvashot(e) {
        var params = {
            'scrollbars':'no',
            'resizable':'no',
            'status':'no',
            'location':'no',
            'toolbar':'no',
            'menubar':'no',
            'width':theCanvas.width + 5,
            'height':theCanvas.height + 5,
            'left':0,
            'top':0
        }

        windowOpen(theCanvas.toDataURL('image/jpeg', 1), "canvasImage", params);
    }
}