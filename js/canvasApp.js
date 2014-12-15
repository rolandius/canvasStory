var app;
window.onload = function () {
    if (Modernizr.canvas && Modernizr.canvastext) {
        app = new CanvasCore(document.all.canvas, document.all.gridFrequency);
    } else {
        alert('Увы, никаких тебе сплайнов Безье-Бернштейна!');
    }
}