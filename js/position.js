/* Полностью кроссбраузерный объект для определения позиции элемента
 * основано на http://javascript.ru/ui/offset
 *      OffsetOfElement(elem) входной параметр - элемент у которого замеряем позицию
 *      this.getOffset()  -  возвращает множество {top:, left:}, которое является позицией элемента
 *      this.setElem(elem) - изменяет элемент, за которым следим
 */
function OffsetOfElement(elem) {
    this.elem = elem;

    this.setElem = function (elem) {
        this.elem = elem;
    }

    this.getOffsetSum = function () {
        // Двигаемся вверх по цепочке родителей elem, останавливаясь на следующих элементах, 
        // которые являются offsetParent. У body никогда нет offsetParent.
        // Так же нет offsetParent:
        //   - в IE 7+/Opera у элементов с elem.position='fixed';
        //   - элемент, у которого position - не static(значение по умолчанию);
        //   - элементы table,th,td - если elem.position='static'.

        var top = 0;
        var left = 0;
        while (this.elem) {
            top = top + parseFloat(this.elem.offsetTop);
            left = left + parseFloat(this.elem.offsetLeft);
            this.elem = this.elem.offsetParent;
        }
        return { top: Math.round(top), left: Math.round(left) };
    }

    this.getOffsetRect = function () {
        // Метод getBoundingClientRect() возвращает один (минимальный) прямоугольник, который включает в себя все прямоугольники getClientRects() с содержимым элемента.
        // Вычисляем прокрутку документа и суммируем с полученным значением.

        var box = this.elem.getBoundingClientRect();
        var body = document.body;
        var docElem = document.documentElement;

        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;

        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left) };
    }

    this.getOffset = function () {
        if (this.elem.getBoundingClientRect) {
            return this.getOffsetRect(this.elem);
        } else {
            return this.getOffsetSum(this.elem);
        }
    }
}