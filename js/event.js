// Thank you, Dean Edwards and Tino Zeidel!
// ToDo: Статейки
// ToDo: Свои собития на массивчике, с созданием гловальной функцийки
// ToDo: Грамотное декорирование

EventFull = (function() {
    var guid = 0;

    function fixEvent(event) {
      // Правим поля событий под общий вид
      // event.target = event.target || event.srcElement - нельзя, т.к. target - readOnly поле, крах
      // Не исправляет несовместимости событий клавиатуры (коды клавиш в разных браузерах отличаются).
      
      // Получаем объект события
      event = event || window.event;

      // Один объект события может передаваться по цепочке разным обработчикам
      // при этом кроссбраузерная обработка будет вызвана только 1 раз
      if ( event.isFixed ) {
        return event;
      }
      event.isFixed = true;

      // добавить preventDefault/stopPropagation для IE старых
      event.preventDefault = event.preventDefault || function(){this.returnValue = false}
      event.stopPropagation = event.stopPropagaton || function(){this.cancelBubble = true}

      // добавить target для IE
      if (!event.target) {
        event.target = event.srcElement;
      }

      // добавить relatedTarget в IE
      if (!event.relatedTarget && event.fromElement) {
        event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
      }

      // вычислить pageX/pageY для IE
      if ( event.pageX == null && event.clientX != null ) {
        var html = document.documentElement, body = document.body;
        event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
        event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
      }

      // записать нажатую кнопку мыши в which для IE
      // 1 == левая; 2 == средняя; 3 == правая
      if ( !event.which && event.button ) {
        event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
      }

      return event
    }  

    //Вызывается в контексте элемента всегда this = element 
    function commonHandle(event) {
      event = fixEvent(event);

      var handlers = this.events[event.type];

      // Одна ошибка может повалить все, так их хранят в Mochikit
      var errors = [];

      for ( var g in handlers ) {
        var handler = handlers[g];

        try {
          // Запуск обработчиков
          var ret = handler.call(this, event)
          // Предотвращает действие браузера по умолчанию и всплытие. Если return не false - сохраняет его
          if ( ret === false ) {
            event.preventDefault();
            event.stopPropagation();
          } else if ( ret !== undefined) {
            event.result = ret;
          }

          //Если обработчик хочет предотвратить запуск следующих за ним обработчиков события в этом же элементе
          if (event.stopNow) break
        } catch(e) {
          errors.push(e)
        }
      }

      if (errors.length == 1) {
          throw errors[0];
      } else if (errors.length > 1) {
          var e = new Error("Multiple errors thrown in handling 'sig', see errors property");
          e.errors = errors;
          throw e;
      } 
      // http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/
      // Другой подход - использовать dispatchEvent (fireEvent для IE), т.е. декорировать вызов.
      // Таким образом, события вызываются в независимых потоках выполнения и инициируют ошибки независимо.
    }

  return {
    add: function(elem, type, handler) {
      // В старых IE, дабы можно было передать window, window.window === window
      // Подробнее про проблемы в старых эксплоерах с window:
      // http://www.cappuccino-project.org/blog/2010/03/internet-explorer-global-variables-and-stack-overflows.html
      if (elem.setInterval && ( elem != window && !elem.frameElement ) ) {
        elem = window;
      }

      // Задаём idшник событию, сквозной нумерацией, чтобы обработчику передать свой номер
      if (!handler.guid) {
          handler.guid = ++guid;
      }

      // Обработчик handle фильтрует редко возникающую ошибку, когда событие отрабатывает после unload'а страницы.
      if (!elem.events) {
        elem.events = {}
        
        // Декорируем обработчик
        elem.handle = function(event) {
          if (typeof Event !== "undefined") {
            return commonHandle.call(elem, event);
          }
        }
      }

      // если обработчиков еще нет
      if (!elem.events[type]) {
        elem.events[type] = {};

        if (elem.addEventListener)
          elem.addEventListener(type, elem.handle, false);
        else if (elem.attachEvent)
          elem.attachEvent("on" + type, elem.handle);
      }

      elem.events[type][handler.guid] = handler;
    },

    remove: function(elem, type, handler) {
      // Получаем обработчики
      var handlers = elem.events && elem.events[type];

      if (!handlers) return;

      // Если не указан хэндлер удаляем все события такого типа
      if (!handler) {
        for ( var handle in handlers ) {
          delete events[type][handle];
        }
        return
      }

      // Удаляем обработчик по его номеру
      delete handlers[handler.guid];

      for(var any in handlers) return 
      
      if (elem.removeEventListener)
        elem.removeEventListener(type, elem.handle, false)
      else if (elem.detachEvent)
        elem.detachEvent("on" + type, elem.handle)

      delete elem.events[type]

      // Если событий не осталось совсем
      for (var any in elem.events) return
      try {
        delete elem.handle
        delete elem.events 
      } catch(e) { // IE
        elem.removeAttribute("handle")
        elem.removeAttribute("events")
      }
    } 
  }
}())

// Обработчик handler должен самостоятельно производить кросс-браузерную предобработку события
// Просто быстро
EventSimply = {
  addEvent: function(elem, type, handler){
    if (elem.addEventListener){
      elem.addEventListener(type, handler, false)
    } else {
      elem.attachEvent("on"+type, function() { handler.call(elem) })
    }
  },

  removeEvent: function(elem, type, handler){
    if (elem.removeEventListener){
      elem.removeEventListener(type, handler, false)
    } else {
      elem.detachEvent("on"+type, function() { handler.call(elem) })
    }
  }
}