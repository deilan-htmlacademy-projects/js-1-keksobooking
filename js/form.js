'use strict';

(function () {
  // «Лачуга» — минимальная цена 0
  // «Квартира» — минимальная цена 1000
  // «Дом» — минимальная цена 5000
  // «Дворец» — минимальная цена 10000
  var TYPE_TO_MIN_PRICE_MAP = {
    'bungalo': 0,
    'flat': 1000,
    'house': 5000,
    'palace': 10000
  };

  // 1 комната — «для одного гостя»
  // 2 комнаты — «для 2-х или 1-го гостя»
  // 3 комнаты — «для 2-х, 1-го или 3-х гостей»
  // 100 комнат — «не для гостей»
  var ROOM_NUMBER_TO_CAPACITIES_MAP = {
    1: [1],
    2: [2, 1],
    3: [2, 1, 3],
    100: [0]
  };

  var CHECKIN_CHECKOUT_MAP = {
    '12:00': '12:00',
    '13:00': '13:00',
    '14:00': '14:00'
  };

  window.form = {
    init: initForm
  };

  function initForm(els, onLoad, onError) {
    enableFormFields(els.noticeForm);
    initSyncTimeInAndTimeOut(els.timeIn, els.timeOut, Object.keys(CHECKIN_CHECKOUT_MAP), Object.values(CHECKIN_CHECKOUT_MAP));
    initSyncTypeWithMinPrice(els.type, els.price, Object.keys(TYPE_TO_MIN_PRICE_MAP), Object.values(TYPE_TO_MIN_PRICE_MAP));
    initSyncRoomNumberWithCapacity(els.roomNumber, els.capacity, Object.keys(ROOM_NUMBER_TO_CAPACITIES_MAP), Object.values(ROOM_NUMBER_TO_CAPACITIES_MAP));
    initNotifyOnInvalidInput(els.noticeForm);
    initFormSubmission(els.noticeForm, onLoad, onError);
  }

  function enableFormFields(form) {
    var disabledEls = form.querySelectorAll('[disabled]');
    disabledEls.forEach(function (disabledEl) {
      disabledEl.disabled = false;
    });
  }

  function initFormSubmission(form) {
    var restArgs = Array.prototype.slice.call(arguments, 1);
    var onFormSubmit = onFormSubmitFactory.apply(null, restArgs);
    form.addEventListener('submit', onFormSubmit);
  }

  function onFormSubmitFactory(onLoad, onError) {
    return function (evt) {
      evt.preventDefault();
      var formEl = evt.target;
      window.backend.save(new FormData(formEl), onLoad, onError);
    };
  }

  function initNotifyOnInvalidInput(formEl) {
    formEl.addEventListener('invalid', function (evt) {
      evt.target.style.borderColor = 'red';
    });
  }

  function initSyncRoomNumberWithCapacity(roomNumberInput, capacityInput, roomNumberValues, capacityValues) {
    var currentValueIndex = roomNumberValues.indexOf(roomNumberInput.value);
    initSelect(capacityInput, capacityValues[currentValueIndex]);
    window.synchronizeFields(roomNumberInput, capacityInput, roomNumberValues, capacityValues, initSelect);
  }

  function initSyncTypeWithMinPrice(typeInput, priceInput, typeValues, priceValues) {
    window.synchronizeFields(typeInput, priceInput, typeValues, priceValues, syncMin);
  }

  function initSyncTimeInAndTimeOut(timeInInput, timeOutInput, timeInValues, timeOutValues) {
    window.synchronizeFields(timeInInput, timeOutInput, timeInValues, timeOutValues, syncValue);
    window.synchronizeFields(timeOutInput, timeInInput, timeOutValues, timeInValues, syncValue);
  }

  function initSelect(select, optionsValues) {
    for (var i = 0; i < select.childElementCount; i++) {
      var optionValue = parseInt(select.children[i].value, 10);
      select.children[i].disabled = !~optionsValues.indexOf(optionValue);
    }
    if (select.children[select.selectedIndex].hasAttribute('disabled')) {
      var enabledOptionEl = select.querySelector('option:not([disabled])');
      select.selectedIndex = Array.prototype.indexOf.call(select.children, enabledOptionEl);
    }
  }

  function syncValue(el, value) {
    el.value = value;
  }

  function syncMin(el, value) {
    el.min = value;
    el.value = Math.max(el.value, el.min);
  }
})();
