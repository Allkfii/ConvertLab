// Intercept native select value assignment to keep custom UI in sync
(function () {
  var originalValueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  if (originalValueDescriptor && originalValueDescriptor.set) {
    Object.defineProperty(HTMLSelectElement.prototype, 'value', {
      get: function () {
        return originalValueDescriptor.get.call(this);
      },
      set: function (val) {
        originalValueDescriptor.set.call(this, val);
        var event = new Event('change', { bubbles: true });
        this.dispatchEvent(event);
      }
    });
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  // Custom Select Dropdown Initializer
  function initCustomSelects() {
    var selectElements = document.querySelectorAll('select.ascii-select, select.pdf-select, select.row-format-select');
    selectElements.forEach(function (select) {
      if (select.nextElementSibling && select.nextElementSibling.classList.contains('custom-select-wrapper')) {
        return; // Already initialized
      }
      
      select.classList.add('custom-select-hidden');
      
      var wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper ' + select.className.replace('custom-select-hidden', '');
      if (select.disabled) {
        wrapper.classList.add('disabled');
      }
      wrapper.style.width = select.style.width || '100%';
      
      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select-trigger';
      if (select.disabled) {
        trigger.disabled = true;
      }
      
      var triggerText = document.createElement('span');
      var selectedOption = select.options[select.selectedIndex];
      triggerText.textContent = selectedOption ? selectedOption.textContent : '';
      trigger.appendChild(triggerText);
      
      var arrowSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      arrowSvg.setAttribute("viewBox", "0 0 12 8");
      arrowSvg.setAttribute("width", "12");
      arrowSvg.setAttribute("height", "8");
      arrowSvg.innerHTML = "<path d='M1.5 2L6 6L10.5 2' stroke='#080808' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/>";
      trigger.appendChild(arrowSvg);
      
      wrapper.appendChild(trigger);
      
      var optionsContainer = document.createElement('div');
      optionsContainer.className = 'custom-select-options';
      
      Array.from(select.options).forEach(function (option) {
        var optDiv = document.createElement('div');
        optDiv.className = 'custom-select-option' + (option.selected ? ' selected' : '');
        optDiv.setAttribute('data-value', option.value);
        optDiv.textContent = option.textContent;
        
        optDiv.addEventListener('click', function (e) {
          e.stopPropagation();
          select.value = option.value;
          triggerText.textContent = option.textContent;
          optionsContainer.querySelectorAll('.custom-select-option').forEach(function (o) {
            o.classList.remove('selected');
          });
          optDiv.classList.add('selected');
          wrapper.classList.remove('open');
        });
        
        optionsContainer.appendChild(optDiv);
      });
      
      wrapper.appendChild(optionsContainer);
      select.parentNode.insertBefore(wrapper, select.nextSibling);
      
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelectorAll('.custom-select-wrapper').forEach(function (w) {
          if (w !== wrapper) {
            w.classList.remove('open');
          }
        });
        wrapper.classList.toggle('open');
      });
      
      select.addEventListener('change', function () {
        var newSelected = select.options[select.selectedIndex];
        if (newSelected) {
          triggerText.textContent = newSelected.textContent;
          optionsContainer.querySelectorAll('.custom-select-option').forEach(function (o) {
            if (o.getAttribute('data-value') === newSelected.value) {
              o.classList.add('selected');
            } else {
              o.classList.remove('selected');
            }
          });
        }
      });
    });
    
    document.addEventListener('click', function () {
      document.querySelectorAll('.custom-select-wrapper').forEach(function (w) {
        w.classList.remove('open');
      });
    });
  }

  initCustomSelects();

  // Premium Smooth Scroll (Inertial scrolling)
  (function () {
    var targetScrollY = window.scrollY;
    var currentScrollY = window.scrollY;
    var isMoving = false;
    var speed = 0.08;

    window.addEventListener('wheel', function (e) {
      var path = e.composedPath ? e.composedPath() : [];
      for (var i = 0; i < path.length; i++) {
        var el = path[i];
        if (el === document.body || el === document.documentElement) break;
        if (el.scrollHeight > el.clientHeight) {
          var style = window.getComputedStyle(el);
          if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
            return;
          }
        }
      }

      e.preventDefault();
      targetScrollY += e.deltaY;
      targetScrollY = Math.max(0, Math.min(targetScrollY, document.documentElement.scrollHeight - window.innerHeight));

      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(updateScroll);
      }
    }, { passive: false });

    window.addEventListener('scroll', function () {
      if (!isMoving) {
        targetScrollY = window.scrollY;
        currentScrollY = window.scrollY;
      }
    });

    function updateScroll() {
      currentScrollY += (targetScrollY - currentScrollY) * speed;
      window.scrollTo(0, currentScrollY);

      if (Math.abs(targetScrollY - currentScrollY) > 0.5) {
        requestAnimationFrame(updateScroll);
      } else {
        window.scrollTo(0, targetScrollY);
        currentScrollY = targetScrollY;
        isMoving = false;
      }
    }
  })();

  function showToast(message, type) {
    var existingToast = document.querySelector('.cl-toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
    
    var toast = document.createElement('div');
    toast.className = 'cl-toast ' + (type || 'success');
    
    var iconSvg = '';
    if (type === 'error') {
      iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    }
    
    toast.innerHTML = 
      '<div class="cl-toast-icon">' + iconSvg + '</div>' +
      '<div class="cl-toast-message">' + message + '</div>';
      
    document.body.appendChild(toast);
    
    setTimeout(function () {
      toast.classList.add('active');
    }, 10);
    
    setTimeout(function () {
      toast.classList.remove('active');
      setTimeout(function () {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3500);
  }

  // Dropdown Tools Menu
  var toolsButton = document.getElementById('toolsButton');
  var toolsMenu = document.getElementById('toolsMenu');

  if (toolsButton && toolsMenu) {
    toolsButton.addEventListener('click', function (event) {
      event.stopPropagation();
      toolsMenu.classList.toggle('open');
      toolsButton.setAttribute('aria-expanded', toolsMenu.classList.contains('open'));
    });

    document.addEventListener('click', function () {
      if (toolsMenu.classList.contains('open')) {
        toolsMenu.classList.remove('open');
        toolsButton.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toolsMenu.classList.contains('open')) {
        toolsMenu.classList.remove('open');
        toolsButton.setAttribute('aria-expanded', 'false');
      }
    });

    document.querySelectorAll('.open-tools-menu').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        toolsMenu.classList.add('open');
        toolsButton.setAttribute('aria-expanded', 'true');
      });
    });

    toolsMenu.addEventListener('click', function (event) {
      event.stopPropagation();
    });
  }

  // Intersection Observer for scroll animation (Features Section)
  var featuresSection = document.getElementById('features');
  if (featuresSection) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          featuresSection.classList.add('visible');
        } else {
          featuresSection.classList.remove('visible');
        }
      });
    }, {
      threshold: 0.15
    });
    observer.observe(featuresSection);
  }

  // Intersection Observer for scroll animation (Hero Section)
  var heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          heroContent.classList.add('visible');
        } else {
          heroContent.classList.remove('visible');
        }
      });
    }, {
      threshold: 0.15
    });
    heroObserver.observe(heroContent);
  }

  // Scroll-Pinned Ticker Section Logic
  var freeSection = document.getElementById('free-section');
  if (freeSection) {
    var tickerItems = freeSection.querySelectorAll('.ticker-item');
    
    function updateTicker() {
      var rect = freeSection.getBoundingClientRect();
      var totalScroll = freeSection.scrollHeight - window.innerHeight;
      var progress = 0;
      
      if (totalScroll > 0) {
        var scrolled = -rect.top;
        progress = Math.max(0, Math.min(1, scrolled / totalScroll));
      }
      
      // Map progress to item index (0 to tickerItems.length - 1)
      var index = Math.floor(progress * tickerItems.length);
      if (index >= tickerItems.length) {
        index = tickerItems.length - 1;
      }
      
      tickerItems.forEach(function (item, i) {
        if (i < index) {
          item.classList.add('exit');
          item.classList.remove('active');
        } else if (i === index) {
          item.classList.add('active');
          item.classList.remove('exit');
        } else {
          item.classList.remove('active', 'exit');
        }
      });
    }
    
    window.addEventListener('scroll', updateTicker);
    window.addEventListener('resize', updateTicker);
    updateTicker(); // Initialize state
  }

  // --- RC4 Encryption/Decryption Helpers ---
  function rc4(bytes, keyStr) {
    if (!keyStr) return bytes;
    var S = [];
    for (var i = 0; i < 256; i++) {
      S[i] = i;
    }
    
    var j = 0;
    for (var i = 0; i < 256; i++) {
      j = (j + S[i] + keyStr.charCodeAt(i % keyStr.length)) % 256;
      var temp = S[i];
      S[i] = S[j];
      S[j] = temp;
    }
    
    var i = 0;
    var j = 0;
    var result = [];
    for (var k = 0; k < bytes.length; k++) {
      i = (i + 1) % 256;
      j = (j + S[i]) % 256;
      var temp = S[i];
      S[i] = S[j];
      S[j] = temp;
      
      var t = (S[i] + S[j]) % 256;
      result.push(bytes[k] ^ S[t]);
    }
    return result;
  }

  function hexToBytes(hex) {
    hex = hex.replace(/[^0-9a-fA-F]/g, '');
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hex string length");
    }
    var bytes = [];
    for (var i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  function bytesToString(bytes) {
    var str = '';
    for (var i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return str;
  }

  // --- RC4 DOM Event Listeners ---
  var messageInput = document.getElementById('messageInput');
  var keyInput = document.getElementById('keyInput');
  var ciphertextInput = document.getElementById('ciphertextInput');
  var plaintextInput = document.getElementById('plaintextInput');
  var encryptBtn = document.getElementById('encryptBtn');
  var decryptBtn = document.getElementById('decryptBtn');

  if (encryptBtn && decryptBtn) {
    encryptBtn.addEventListener('click', function () {
      var msg = messageInput.value;
      var key = keyInput.value;
      
      if (!msg) {
        showToast('Please enter a message to encrypt.', 'error');
        return;
      }
      if (!key) {
        showToast('Please enter a key.', 'error');
        return;
      }
      
      var msgBytes = [];
      for (var i = 0; i < msg.length; i++) {
        msgBytes.push(msg.charCodeAt(i));
      }
      
      var encryptedBytes = rc4(msgBytes, key);
      
      var hexResult = '';
      for (var i = 0; i < encryptedBytes.length; i++) {
        var h = encryptedBytes[i].toString(16);
        if (h.length < 2) h = '0' + h;
        hexResult += h;
      }
      
      ciphertextInput.value = hexResult;
      plaintextInput.value = msg;
    });

    decryptBtn.addEventListener('click', function () {
      var cipherHex = ciphertextInput.value.trim();
      var key = keyInput.value;
      
      if (!cipherHex) {
        showToast('Please enter ciphertext (hex) to decrypt.', 'error');
        return;
      }
      if (!key) {
        showToast('Please enter a key.', 'error');
        return;
      }
      
      try {
        var cipherBytes = hexToBytes(cipherHex);
        var decryptedBytes = rc4(cipherBytes, key);
        var decryptedText = bytesToString(decryptedBytes);
        
        plaintextInput.value = decryptedText;
        messageInput.value = decryptedText;
      } catch (err) {
        showToast('Invalid Hexadecimal string in ciphertext field.', 'error');
      }
    });
  }

  // --- ASCII Converter Logic ---
  var fromSelect = document.getElementById('fromSelect');
  var toSelect = document.getElementById('toSelect');
  var asciiInput = document.getElementById('asciiInput');
  var asciiInputLabel = document.getElementById('asciiInputLabel');
  var asciiSwapBtn = document.getElementById('asciiSwapBtn');
  var asciiResetBtn = document.getElementById('asciiResetBtn');
  var asciiConvertBtn = document.getElementById('asciiConvertBtn');

  // Map options to friendly display labels
  var labelMap = {
    'decimal': 'Decimal Number',
    'binary': 'Binary Number',
    'hex': 'Hexadecimal Number',
    'text': 'Text'
  };

  function updateInputLabel() {
    if (fromSelect && asciiInputLabel) {
      var selectedVal = fromSelect.value;
      var text = labelMap[selectedVal] || 'Value';
      asciiInputLabel.textContent = 'Enter ' + text + ' :';
    }
  }

  if (fromSelect) {
    fromSelect.addEventListener('change', function () {
      updateInputLabel();
      if (asciiInput) {
        asciiInput.value = '';
      }
    });
  }

  if (asciiSwapBtn && fromSelect && toSelect) {
    asciiSwapBtn.addEventListener('click', function () {
      var tempVal = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = tempVal;
      
      updateInputLabel();
      if (asciiInput) {
        asciiInput.value = '';
      }
    });
  }

  if (asciiResetBtn && asciiInput) {
    asciiResetBtn.addEventListener('click', function () {
      asciiInput.value = '';
      updateInputLabel();
    });
  }

  // Conversion core logic
  function convertASCIIValue(value, fromMode, toMode) {
    value = value.trim();
    if (!value) return "";
    
    var charCodes = [];
    var i;
    
    if (fromMode === 'text') {
      for (i = 0; i < value.length; i++) {
        charCodes.push(value.charCodeAt(i));
      }
    } else if (fromMode === 'decimal') {
      var parts = value.split(/\s+/);
      for (i = 0; i < parts.length; i++) {
        if (!parts[i]) continue;
        var num = parseInt(parts[i], 10);
        if (isNaN(num) || num < 0 || num > 65535) {
          throw new Error("Invalid decimal number: " + parts[i]);
        }
        charCodes.push(num);
      }
    } else if (fromMode === 'binary') {
      var parts = value.split(/\s+/);
      for (i = 0; i < parts.length; i++) {
        if (!parts[i]) continue;
        var binaryStr = parts[i];
        if (!/^[01]+$/.test(binaryStr)) {
          throw new Error("Invalid binary string: " + binaryStr);
        }
        var num = parseInt(binaryStr, 2);
        charCodes.push(num);
      }
    } else if (fromMode === 'hex') {
      var parts = value.split(/\s+/);
      for (i = 0; i < parts.length; i++) {
        if (!parts[i]) continue;
        var hexStr = parts[i];
        if (!/^[0-9a-fA-F]+$/.test(hexStr)) {
          throw new Error("Invalid hex string: " + hexStr);
        }
        var num = parseInt(hexStr, 16);
        charCodes.push(num);
      }
    }
    
    var resultParts = [];
    if (toMode === 'text') {
      for (i = 0; i < charCodes.length; i++) {
        resultParts.push(String.fromCharCode(charCodes[i]));
      }
      return resultParts.join('');
    } else if (toMode === 'decimal') {
      for (i = 0; i < charCodes.length; i++) {
        resultParts.push(charCodes[i].toString(10));
      }
    } else if (toMode === 'binary') {
      for (i = 0; i < charCodes.length; i++) {
        var b = charCodes[i].toString(2);
        if (charCodes[i] < 256) {
          while (b.length < 8) {
            b = '0' + b;
          }
        }
        resultParts.push(b);
      }
    } else if (toMode === 'hex') {
      for (i = 0; i < charCodes.length; i++) {
        var h = charCodes[i].toString(16).toUpperCase();
        if (h.length % 2 !== 0 && charCodes[i] < 256) {
          h = '0' + h;
        }
        resultParts.push(h);
      }
    }
    
    return resultParts.join(' ');
  }

  if (asciiConvertBtn && asciiInput && fromSelect && toSelect) {
    asciiConvertBtn.addEventListener('click', function () {
      var val = asciiInput.value;
      var fromVal = fromSelect.value;
      var toVal = toSelect.value;
      
      if (!val) {
        showToast('Please enter a value to convert.', 'error');
        return;
      }
      
      try {
        var result = convertASCIIValue(val, fromVal, toVal);
        asciiInput.value = result;
        
        // Dynamically update label to reflect result format
        if (asciiInputLabel) {
          var labelText = labelMap[toVal] || 'Result';
          asciiInputLabel.textContent = labelText + ' Result :';
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // --- Steganography Logic ---
  var cryptoPass = document.getElementById('cryptoPass');
  var scramblePass = document.getElementById('scramblePass');
  var stegoTarget = document.getElementById('stegoTarget');
  var stegoSize = document.getElementById('stegoSize');
  var browseBtn = document.getElementById('browseBtn');
  var addCarriersBtn = document.getElementById('addCarriersBtn');
  var carrierFileInput = document.getElementById('carrierFileInput');
  var stegoCarriersList = document.getElementById('stegoCarriersList');
  var stegoOptionsBox = document.getElementById('stegoOptionsBox');
  var stegoTotalBytes = document.getElementById('stegoTotalBytes');
  var stegoResetBtn = document.getElementById('stegoResetBtn');
  var stegoConvertBtn = document.getElementById('stegoConvertBtn');

  // Initial mockup data
  var defaultCarriers = [];

  var carriers = JSON.parse(JSON.stringify(defaultCarriers));
  var activeCarrierIndex = -1;

  function renderCarriers() {
    if (!stegoCarriersList) return;
    stegoCarriersList.innerHTML = '';
    
    carriers.forEach(function (carrier, index) {
      var item = document.createElement('div');
      item.className = 'stego-carrier-item' + (index === activeCarrierIndex ? ' active' : '');
      item.setAttribute('data-index', index);
      
      item.innerHTML = 
        '<input type="text" class="carrier-name-input" value="' + carrier.name + '" readonly />' +
        '<span class="carrier-bytes">' + carrier.bytes + '</span>' +
        '<div class="carrier-actions">' +
          '<button type="button" class="carrier-action-btn gear-btn" title="Settings">' +
            '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
          '</button>' +
          '<button type="button" class="carrier-action-btn delete-btn" title="Remove">' +
            '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>';
        
      // Select carrier item on click
      item.addEventListener('click', function (e) {
        if (e.target.closest('.carrier-action-btn')) return;
        activeCarrierIndex = index;
        updateStegoState();
      });
      
      // Gear Settings action
      item.querySelector('.gear-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        var lsb = prompt("Enter LSB bits allocation (1-4 bits):", "1");
        if (lsb) {
          var val = parseInt(lsb, 10);
          if (val >= 1 && val <= 4) {
            showToast("LSB allocation for " + carrier.name + " set to " + val + " bits.", "success");
          } else {
            showToast("Invalid bits allocation. Please enter a value between 1 and 4.", "error");
          }
        }
      });
      
      // Delete action
      item.querySelector('.delete-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        carriers.splice(index, 1);
        if (activeCarrierIndex >= carriers.length) {
          activeCarrierIndex = carriers.length - 1;
        }
        updateStegoState();
      });
      
      stegoCarriersList.appendChild(item);
    });
  }

  function createRC4PRNG(keyStr) {
    var S = [];
    for (var i = 0; i < 256; i++) {
      S[i] = i;
    }
    var j = 0;
    for (var i = 0; i < 256; i++) {
      j = (j + S[i] + keyStr.charCodeAt(i % keyStr.length)) % 256;
      var temp = S[i];
      S[i] = S[j];
      S[j] = temp;
    }
    var iState = 0;
    var jState = 0;
    return function () {
      iState = (iState + 1) % 256;
      jState = (jState + S[iState]) % 256;
      var temp = S[iState];
      S[iState] = S[jState];
      S[jState] = temp;
      var t = (S[iState] + S[jState]) % 256;
      return S[t];
    };
  }

  function getScrambledIndices(totalBits, maxChannels, passB) {
    var indices = [];
    if (passB) {
      var prng = createRC4PRNG(passB);
      var visited = new Set();
      var idx = 0;
      for (var b = 0; b < totalBits; b++) {
        var step = (prng() << 8) | prng();
        if (step === 0) step = 1;
        idx = (idx + step) % maxChannels;
        while (visited.has(idx)) {
          idx = (idx + 1) % maxChannels;
        }
        visited.add(idx);
        indices.push(idx);
      }
    } else {
      for (var b = 0; b < totalBits; b++) {
        indices.push(b);
      }
    }
    return indices;
  }

  function hideMessageInImage(file, message, passA, passB, callback) {
    createImageBitmap(file, { colorSpaceConversion: "none" }).then(function (img) {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = imgData.data;
      
      // Force alpha to 255 for all pixels to prevent premultiplied alpha artifacts
      for (var p = 3; p < data.length; p += 4) {
        data[p] = 255;
      }
      
      // 1. Prepare raw payload bytes: Magic Header ("CL") + original message
      var rawBytes = ['C'.charCodeAt(0), 'L'.charCodeAt(0)];
      for (var i = 0; i < message.length; i++) {
        rawBytes.push(message.charCodeAt(i));
      }
      
      // 2. Encrypt using Cryptography Password A if provided
      var payloadBytes = rawBytes;
      if (passA) {
        payloadBytes = rc4(rawBytes, passA);
      }
      
      // 3. Length-prefixed final bytes: 4 bytes length + payload
      var finalBytes = [];
      var len = payloadBytes.length;
      finalBytes.push((len >> 24) & 0xFF);
      finalBytes.push((len >> 16) & 0xFF);
      finalBytes.push((len >> 8) & 0xFF);
      finalBytes.push(len & 0xFF);
      for (var i = 0; i < payloadBytes.length; i++) {
        finalBytes.push(payloadBytes[i]);
      }
      
      var totalBitsRequired = finalBytes.length * 8;
      var totalPixelsAvailable = canvas.width * canvas.height;
      var maxChannelsAvailable = totalPixelsAvailable * 3;
      if (totalBitsRequired > maxChannelsAvailable) {
        callback(new Error("Message is too long for this carrier image size."));
        return;
      }
      
      // 4. Scramble write indices using Scrambling Password B if provided
      var indices = getScrambledIndices(totalBitsRequired, maxChannelsAvailable, passB);
      
      // 5. Write bits to pixels
      for (var b = 0; b < totalBitsRequired; b++) {
        var idx = indices[b];
        var p = Math.floor(idx / 3) * 4 + (idx % 3);
        
        var byteIdx = Math.floor(b / 8);
        var bitIdx = b % 8;
        var bit = (finalBytes[byteIdx] >> (7 - bitIdx)) & 1;
        
        data[p] = (data[p] & 0xFE) | bit;
      }
      
      ctx.putImageData(imgData, 0, 0);
      var pngDataUrl = canvas.toDataURL("image/png");
      callback(null, pngDataUrl);
    }).catch(function (err) {
      callback(err);
    });
  }

  function extractMessageFromImage(file, passA, passB, callback) {
    createImageBitmap(file, { colorSpaceConversion: "none" }).then(function (img) {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = imgData.data;
      
      // Force alpha to 255 to ensure consistency with encoding
      for (var p = 3; p < data.length; p += 4) {
        data[p] = 255;
      }
      
      var totalPixels = canvas.width * canvas.height;
      var maxChannelsAvailable = totalPixels * 3;
      
      // Internal decode logic with specific passwords
      function tryDecode(pA, pB) {
        // Read length (first 32 bits)
        var lenIndices = getScrambledIndices(32, maxChannelsAvailable, pB);
        var lenBytes = [0, 0, 0, 0];
        for (var i = 0; i < 32; i++) {
          var idx = lenIndices[i];
          var p = Math.floor(idx / 3) * 4 + (idx % 3);
          var bit = data[p] & 1;
          var byteIdx = Math.floor(i / 8);
          lenBytes[byteIdx] = (lenBytes[byteIdx] << 1) | bit;
        }
        var payloadLen = (lenBytes[0] << 24) | (lenBytes[1] << 16) | (lenBytes[2] << 8) | lenBytes[3];
        
        if (payloadLen < 2 || payloadLen > maxChannelsAvailable / 8) {
          return null; // Invalid length
        }
        
        // Read payload
        var allIndices = getScrambledIndices(32 + payloadLen * 8, maxChannelsAvailable, pB);
        var payloadBytes = [];
        for (var i = 0; i < payloadLen; i++) {
          var currentByte = 0;
          for (var bitIdx = 0; bitIdx < 8; bitIdx++) {
            var idx = allIndices[32 + i * 8 + bitIdx];
            var p = Math.floor(idx / 3) * 4 + (idx % 3);
            var bit = data[p] & 1;
            currentByte = (currentByte << 1) | bit;
          }
          payloadBytes.push(currentByte);
        }
        
        // Decrypt payload using pA if provided
        var decryptedBytes = payloadBytes;
        if (pA) {
          decryptedBytes = rc4(payloadBytes, pA);
        }
        
        // Check magic header "CL" (67 and 76)
        if (decryptedBytes[0] === 67 && decryptedBytes[1] === 76) {
          var str = '';
          for (var i = 2; i < decryptedBytes.length; i++) {
            str += String.fromCharCode(decryptedBytes[i]);
          }
          return { message: str, success: true };
        }
        
        return { success: false, rawPayload: payloadBytes };
      }
      
      var activePassB = passB;
      var result = tryDecode(passA, activePassB);
      
      if (!result) {
        var promptB = prompt("This carrier image might be scrambled. Please enter Scrambling Password (B) if applicable:", "");
        if (promptB === null) {
          callback(new Error("Extraction cancelled."));
          return;
        }
        activePassB = promptB;
        result = tryDecode(passA, activePassB);
        if (!result) {
          callback(new Error("No hidden message found or incorrect Scrambling Password (B)."));
          return;
        }
      }
      
      if (result && !result.success) {
        var promptA = prompt("This message is encrypted. Please enter Cryptography Password (A):", "");
        if (promptA === null) {
          callback(new Error("Extraction cancelled."));
          return;
        }
        var secondResult = tryDecode(promptA, activePassB);
        if (!secondResult || !secondResult.success) {
          callback(new Error("Incorrect Cryptography Password (A) or corrupt data."));
          return;
        }
        result = secondResult;
      }
      
      callback(null, result.message);
    }).catch(function (err) {
      callback(err);
    });
  }

  function updateStegoState() {
    renderCarriers();
    
    // Update active details
    if (stegoOptionsBox) {
      stegoOptionsBox.innerHTML = '';
      if (activeCarrierIndex >= 0 && activeCarrierIndex < carriers.length) {
        var carrier = carriers[activeCarrierIndex];
        var detail = document.createElement('div');
        detail.className = 'stego-option-detail';
        detail.innerHTML = 
          '<span class="detail-name">' + carrier.name + '</span>' +
          '<span class="detail-bytes">' + carrier.bytes + '</span>';
        stegoOptionsBox.appendChild(detail);
        
        // If real fileObject is selected, add Extract Data button
        if (carrier.fileObject) {
          var btnDiv = document.createElement('div');
          btnDiv.style.marginTop = '16px';
          btnDiv.style.display = 'flex';
          btnDiv.style.justifyContent = 'center';
          
          var extBtn = document.createElement('button');
          extBtn.type = 'button';
          extBtn.className = 'stego-mini-btn';
          extBtn.style.width = '100%';
          extBtn.textContent = 'Extract hidden message';
          extBtn.addEventListener('click', function () {
            var passA = cryptoPass ? cryptoPass.value : '';
            var passB = scramblePass ? scramblePass.value : '';
            extractMessageFromImage(carrier.fileObject, passA, passB, function (err, secretMessage) {
              if (err) {
                showToast(err.message, 'error');
              } else {
                if (stegoTarget) {
                  stegoTarget.value = secretMessage;
                  updateSizeLabel();
                }
                showToast("Decrypted secret message extracted successfully from '" + carrier.name + "'! The content has been loaded into the Message text field.", 'success');
              }
            });
          });
          btnDiv.appendChild(extBtn);
          stegoOptionsBox.appendChild(btnDiv);
        }
      } else {
        stegoOptionsBox.innerHTML = '<div style="color: #97999f; font-size: 14px; text-align: center; padding-top: 20px;">No carrier selected</div>';
      }
    }
    
    // Update total bytes
    if (stegoTotalBytes) {
      var total = 0;
      carriers.forEach(function (c) {
        total += c.bytes;
      });
      stegoTotalBytes.textContent = total + ' bytes';
    }
    
    updateSizeLabel();
  }

  function updateSizeLabel() {
    if (!stegoSize) return;
    var targetText = stegoTarget ? stegoTarget.value : '';
    if (!targetText) {
      stegoSize.value = '';
      return;
    }
    var dataLen = targetText.length;
    var nameLen = (activeCarrierIndex >= 0 && activeCarrierIndex < carriers.length) ? carriers[activeCarrierIndex].name.length : 0;
    var totalLen = 12 + nameLen + dataLen;
    stegoSize.value = '12 + name (' + nameLen + ') + data (' + dataLen + ') bytes = ' + totalLen + ' bytes';
  }

  // Browse action (selects and uploads a secret .txt file)
  var stegoSecretFileInput = document.getElementById('stegoSecretFileInput');
  if (browseBtn && stegoSecretFileInput && stegoTarget) {
    browseBtn.addEventListener('click', function () {
      stegoSecretFileInput.click();
    });

    stegoSecretFileInput.addEventListener('change', function () {
      var file = stegoSecretFileInput.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
          stegoTarget.value = e.target.result;
          updateSizeLabel();
        };
        reader.readAsText(file);
      }
    });
  }

  // Target input change
  if (stegoTarget) {
    stegoTarget.addEventListener('input', updateSizeLabel);
  }

  // Add carriers button action
  if (addCarriersBtn && carrierFileInput) {
    addCarriersBtn.addEventListener('click', function () {
      carrierFileInput.click();
    });
    
    carrierFileInput.addEventListener('change', function () {
      var files = carrierFileInput.files;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        carriers.push({
          name: file.name,
          bytes: file.size,
          fileObject: file
        });
      }
      activeCarrierIndex = carriers.length - 1;
      updateStegoState();
    });
  }

  // Reset stego action
  if (stegoResetBtn) {
    stegoResetBtn.addEventListener('click', function () {
      if (cryptoPass) cryptoPass.value = '';
      if (scramblePass) scramblePass.value = '';
      if (stegoTarget) stegoTarget.value = '';
      carriers = JSON.parse(JSON.stringify(defaultCarriers));
      activeCarrierIndex = 0;
      updateStegoState();
    });
  }

  // Convert stego action (hide/extract simulation and LSB steganography)
  if (stegoConvertBtn) {
    stegoConvertBtn.addEventListener('click', function () {
      var targetMsg = stegoTarget ? stegoTarget.value : '';
      var passA = cryptoPass ? cryptoPass.value : '';
      var passB = scramblePass ? scramblePass.value : '';
      
      if (carriers.length === 0 || activeCarrierIndex < 0) {
        showToast('Please add and select at least one carrier image.', 'error');
        return;
      }
      
      if (!targetMsg) {
        showToast('Please enter a message or hidden data.', 'error');
        return;
      }
      
      if (passA && (passA.length < 8 || passA.length > 32)) {
        showToast('Cryptography password (A) must be between 8 and 32 characters.', 'error');
        return;
      }

      if (passB && (passB.length < 8 || passB.length > 32)) {
        showToast('Scrambling password (B) must be between 8 and 32 characters.', 'error');
        return;
      }
      
      var activeCarrier = carriers[activeCarrierIndex];
      if (activeCarrier.fileObject) {
        hideMessageInImage(activeCarrier.fileObject, targetMsg, passA, passB, function (err, pngDataUrl) {
          if (err) {
            showToast(err.message, 'error');
          } else {
            var link = document.createElement('a');
            link.download = 'stego_' + activeCarrier.name.replace(/\.[^/.]+$/, "") + '.png';
            link.href = pngDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Steganography complete! Lossless PNG download started. To extract this message, please upload the downloaded 'stego_...' image.", 'success');
          }
        });
      } else {
        showToast("Steganography complete! Successfully embedded hidden data inside '" + activeCarrier.name + "' using LSB encoding. File compiled and ready.", 'success');
      }
    });
  }

  // Initialize stego state if elements are present on load
  if (stegoCarriersList) {
    updateStegoState();
  }

  // --- JPG to PDF Page Logic ---
  var pdfInitialView = document.getElementById('pdfInitialView');
  var pdfPreviewView = document.getElementById('pdfPreviewView');
  var pdfDropZone = document.getElementById('pdfDropZone');
  var pdfSelectFileBtn = document.getElementById('pdfSelectFileBtn');
  var pdfDropdownBtn = document.getElementById('pdfDropdownBtn');
  var pdfOptionsMenu1 = document.getElementById('pdfOptionsMenu1');
  
  var pdfAddMoreBtn = document.getElementById('pdfAddMoreBtn');
  var pdfDropdownBtn2 = document.getElementById('pdfDropdownBtn2');
  var pdfOptionsMenu2 = document.getElementById('pdfOptionsMenu2');
  var pdfFileList = document.getElementById('pdfFileList');
  var pdfConvertBtn = document.getElementById('pdfConvertBtn');
  var pdfFileInput = document.getElementById('pdfFileInput');

  if (pdfDropZone && pdfSelectFileBtn) {
    var pdfFiles = [];
    var isExtractMode = false;
    var currentPdfDocument = null;

    // Sync options between Menu 1 and Menu 2
    function syncOptions(id1, id2) {
      var el1 = document.getElementById(id1);
      var el2 = document.getElementById(id2);
      if (el1 && el2) {
        el1.addEventListener('change', function () {
          el2.value = el1.value;
        });
        el2.addEventListener('change', function () {
          el1.value = el2.value;
        });
      }
    }
    syncOptions('pdfPageSize1', 'pdfPageSize2');
    syncOptions('pdfOrientation1', 'pdfOrientation2');
    syncOptions('pdfMargin1', 'pdfMargin2');

    // Menu 1 Toggle
    if (pdfDropdownBtn && pdfOptionsMenu1) {
      pdfDropdownBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        pdfOptionsMenu1.classList.toggle('open');
        pdfDropdownBtn.classList.toggle('open');
        if (pdfOptionsMenu2) {
          pdfOptionsMenu2.classList.remove('open');
          pdfDropdownBtn2.classList.remove('open');
        }
      });
    }

    // Menu 2 Toggle
    if (pdfDropdownBtn2 && pdfOptionsMenu2) {
      pdfDropdownBtn2.addEventListener('click', function (e) {
        e.stopPropagation();
        pdfOptionsMenu2.classList.toggle('open');
        pdfDropdownBtn2.classList.toggle('open');
        if (pdfOptionsMenu1) {
          pdfOptionsMenu1.classList.remove('open');
          if (pdfDropdownBtn) pdfDropdownBtn.classList.remove('open');
        }
      });
    }

    // Close all menus on click outside
    document.addEventListener('click', function () {
      if (pdfOptionsMenu1) {
        pdfOptionsMenu1.classList.remove('open');
        if (pdfDropdownBtn) pdfDropdownBtn.classList.remove('open');
      }
      if (pdfOptionsMenu2) {
        pdfOptionsMenu2.classList.remove('open');
        pdfDropdownBtn2.classList.remove('open');
      }
    });

    if (pdfOptionsMenu1) {
      pdfOptionsMenu1.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
    if (pdfOptionsMenu2) {
      pdfOptionsMenu2.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    // File selection triggers
    pdfSelectFileBtn.addEventListener('click', function () {
      pdfFileInput.click();
    });

    if (pdfAddMoreBtn) {
      pdfAddMoreBtn.addEventListener('click', function () {
        pdfFileInput.click();
      });
    }

    pdfFileInput.addEventListener('change', function () {
      addPDFFiles(pdfFileInput.files);
      pdfFileInput.value = '';
    });

    // Drag and drop event listeners on drop zone
    pdfDropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      pdfDropZone.classList.add('dragover');
    });

    pdfDropZone.addEventListener('dragleave', function () {
      pdfDropZone.classList.remove('dragover');
    });

    pdfDropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      pdfDropZone.classList.remove('dragover');
      addPDFFiles(e.dataTransfer.files);
    });

    // Drag and drop on the preview view to drop more files anywhere
    if (pdfPreviewView) {
      pdfPreviewView.addEventListener('dragover', function (e) {
        e.preventDefault();
      });
      pdfPreviewView.addEventListener('drop', function (e) {
        e.preventDefault();
        addPDFFiles(e.dataTransfer.files);
      });
    }

    function formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes';
      var k = 1024;
      var sizes = ['Bytes', 'KB', 'MB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function renderSinglePDFPage(pdf, pageNum, quality, format) {
      return pdf.getPage(pageNum).then(function (page) {
        var scale = (quality === 'high') ? 3.0 : 1.5;
        var viewport = page.getViewport({ scale: scale });
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        return page.render(renderContext).promise.then(function () {
          var mimeType = (format === 'png') ? 'image/png' : 'image/jpeg';
          var imgQuality = (format === 'png') ? undefined : ((quality === 'high') ? 0.95 : 0.85);
          var imgDataUrl = canvas.toDataURL(mimeType, imgQuality);
          return {
            dataUrl: imgDataUrl,
            size: Math.round(imgDataUrl.length * 3/4)
          };
        });
      });
    }

    function showQualitySettingsModal(item, el) {
      var overlay = document.createElement('div');
      overlay.className = 'pdf-modal-overlay';
      
      var modal = document.createElement('div');
      modal.className = 'pdf-modal-card';
      
      modal.innerHTML = 
        '<h3 class="modal-title">Page Settings</h3>' +
        '<p class="modal-subtitle">Configure extraction options for <strong>' + item.name + '</strong></p>' +
        '<div class="modal-body">' +
          '<div class="option-item">' +
            '<label>Image Quality :</label>' +
            '<div class="quality-radio-group">' +
              '<label class="quality-radio-label">' +
                '<input type="radio" name="pageQuality" value="normal"' + (item.quality === 'normal' ? ' checked' : '') + ' />' +
                '<span>Normal (1.5x scale, optimized size)</span>' +
              '</label>' +
              '<label class="quality-radio-label">' +
                '<input type="radio" name="pageQuality" value="high"' + (item.quality === 'high' ? ' checked' : '') + ' />' +
                '<span>High (3.0x scale, high definition)</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button type="button" class="modal-btn cancel-btn">Cancel</button>' +
          '<button type="button" class="modal-btn save-btn">Save Settings</button>' +
        '</div>';
        
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      // Animations
      setTimeout(function () {
        overlay.classList.add('active');
      }, 10);
      
      // Events
      overlay.querySelector('.cancel-btn').addEventListener('click', function () {
        overlay.classList.remove('active');
        setTimeout(function () {
          document.body.removeChild(overlay);
        }, 300);
      });
      
      overlay.querySelector('.save-btn').addEventListener('click', function () {
        var selectedQuality = overlay.querySelector('input[name="pageQuality"]:checked').value;
        
        if (selectedQuality !== item.quality) {
          item.quality = selectedQuality;
          
          if (currentPdfDocument) {
            var loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'pdf-row-loading';
            loadingOverlay.textContent = 'Updating...';
            el.appendChild(loadingOverlay);
            
            renderSinglePDFPage(currentPdfDocument, item.pageNum, item.quality, item.outputFormat).then(function (res) {
              item.dataUrl = res.dataUrl;
              item.size = res.size;
              
              overlay.classList.remove('active');
              setTimeout(function () {
                document.body.removeChild(overlay);
                renderPDFPreview();
              }, 300);
            }).catch(function (err) {
              showToast("Error re-rendering page: " + err.message, 'error');
              el.removeChild(loadingOverlay);
              overlay.classList.remove('active');
              setTimeout(function () {
                document.body.removeChild(overlay);
              }, 300);
            });
          } else {
            overlay.classList.remove('active');
            setTimeout(function () {
              document.body.removeChild(overlay);
              renderPDFPreview();
            }, 300);
          }
        } else {
          overlay.classList.remove('active');
          setTimeout(function () {
            document.body.removeChild(overlay);
          }, 300);
        }
      });
    }

    function addPDFFiles(filesList) {
      // 1. Check if there's a PDF file
      var pdfFile = Array.prototype.find.call(filesList, function (file) {
        return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      });

      if (pdfFile) {
        isExtractMode = true;
        
        // Show indicator that we are loading/parsing
        pdfInitialView.style.display = 'none';
        pdfPreviewView.style.display = 'block';
        if (pdfFileList) {
          pdfFileList.innerHTML = '<div style="text-align:center; padding:40px; font-size:18px; font-weight:500; color:var(--muted);">Loading and rendering PDF pages, please wait...</div>';
        }
        
        var reader = new FileReader();
        reader.onload = function (e) {
          var typedarray = new Uint8Array(e.target.result);
          
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          
          pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
            currentPdfDocument = pdf;
            var numPages = pdf.numPages;
            pdfFiles = [];
            
            var renderPagePromises = [];
            
            for (var p = 1; p <= numPages; p++) {
              (function (pageNum) {
                var promise = renderSinglePDFPage(pdf, pageNum, 'normal', 'jpg').then(function (res) {
                  return {
                    id: pageNum,
                    pageNum: pageNum,
                    name: pdfFile.name.replace(/\.[^/.]+$/, "") + '_Page_' + pageNum + '.jpg',
                    size: res.size,
                    dataUrl: res.dataUrl,
                    file: { type: 'image/jpeg' },
                    outputFormat: 'jpg',
                    quality: 'normal'
                  };
                });
                renderPagePromises.push(promise);
              })(p);
            }
            
            Promise.all(renderPagePromises).then(function (pages) {
              pdfFiles = pages;
              renderPDFPreview();
            }).catch(function (err) {
              showToast("Error parsing PDF pages: " + err.message, 'error');
              pdfFiles = [];
              renderPDFPreview();
            });
            
          }).catch(function (err) {
            showToast("Error loading PDF: " + err.message, 'error');
            pdfFiles = [];
            renderPDFPreview();
          });
        };
        reader.readAsArrayBuffer(pdfFile);
        return;
      }

      // 2. Otherwise, treat as images (Convert mode)
      var imageFiles = Array.prototype.filter.call(filesList, function (file) {
        return file.type.indexOf('image/') === 0;
      });

      if (imageFiles.length === 0) return;

      isExtractMode = false;
      var loadedCount = 0;
      imageFiles.forEach(function (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
          pdfFiles.push({
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            dataUrl: e.target.result
          });
          loadedCount++;
          if (loadedCount === imageFiles.length) {
            renderPDFPreview();
          }
        };
        reader.readAsDataURL(file);
      });
    }

    var dragIndex = null;

    function renderPDFPreview() {
      if (pdfFiles.length === 0) {
        currentPdfDocument = null;
        if (pdfPreviewView.style.display !== 'block') {
          pdfInitialView.style.display = 'block';
          pdfPreviewView.style.display = 'none';
          return;
        }
      } else {
        pdfInitialView.style.display = 'none';
        pdfPreviewView.style.display = 'block';
      }

      if (!pdfFileList) return;
      pdfFileList.innerHTML = '';

      var optionsRow = document.querySelector('.pdf-card-header-row .upload-btn-row');
      if (optionsRow) {
        optionsRow.style.display = (pdfFiles.length === 0 || !isExtractMode) ? 'flex' : 'none';
      }
      if (pdfFiles.length === 0) {
        if (pdfAddMoreBtn) pdfAddMoreBtn.textContent = 'Add files';
        if (pdfDropdownBtn2) pdfDropdownBtn2.style.display = 'none';
        pdfConvertBtn.style.display = 'none';
      } else {
        if (pdfAddMoreBtn) pdfAddMoreBtn.textContent = 'Add more files';
        if (pdfDropdownBtn2) pdfDropdownBtn2.style.display = 'inline-flex';
        pdfConvertBtn.style.display = 'inline-flex';
        pdfConvertBtn.textContent = isExtractMode ? 'Extract Pages' : 'Convert';
        pdfConvertBtn.disabled = false;
      }

      if (pdfFiles.length === 0) {
        var emptyMsg = document.createElement('div');
        emptyMsg.className = 'pdf-empty-row-message';
        emptyMsg.innerHTML = '<p>No files selected. Click <strong>Add files</strong> or drag and drop files here to start.</p>';
        pdfFileList.appendChild(emptyMsg);
        return;
      }

      pdfFiles.forEach(function (item, index) {
        var el = document.createElement('div');
        el.className = 'pdf-file-row';
        el.setAttribute('draggable', isExtractMode ? 'false' : 'true');
        
        var selectHtml = '';
        if (isExtractMode) {
          selectHtml = 
            '<select class="row-format-select">' +
              '<option value="jpg"' + (item.outputFormat === 'jpg' ? ' selected' : '') + '>JPG</option>' +
              '<option value="png"' + (item.outputFormat === 'png' ? ' selected' : '') + '>PNG</option>' +
            '</select>';
        } else {
          selectHtml = 
            '<select disabled class="row-format-select">' +
              '<option value="pdf">PDF</option>' +
            '</select>';
        }

        var gearHtml = '';
        if (isExtractMode) {
          gearHtml = 
            '<button type="button" class="row-btn-gear" title="Settings">' +
              '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
            '</button>';
        }

        el.innerHTML = 
          '<div class="pdf-row-left">' +
            '<span class="pdf-row-title">' + item.name + '</span>' +
            '<span class="pdf-row-subtitle">' + formatBytes(item.size) + '</span>' +
          '</div>' +
          '<div class="pdf-row-right">' +
            '<div class="row-output-wrapper">' +
              '<span>Output :</span>' +
              '<div class="pdf-format-select">' +
                selectHtml +
              '</div>' +
            '</div>' +
            gearHtml +
            '<button type="button" class="row-btn-delete" title="Remove">' +
              '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>' +
            '</button>' +
          '</div>';

        // Gear Settings Alert / Modal
        var gearBtn = el.querySelector('.row-btn-gear');
        if (gearBtn) {
          gearBtn.addEventListener('click', function () {
            if (isExtractMode) {
              showQualitySettingsModal(item, el);
            }
          });
        }

        // Handle format selection change
        if (isExtractMode) {
          var formatSelect = el.querySelector('.row-format-select');
          if (formatSelect) {
            formatSelect.addEventListener('change', function (e) {
              var newFormat = e.target.value;
              item.outputFormat = newFormat;
              var oldName = item.name;
              var baseName = oldName.replace(/\.[^/.]+$/, "");
              item.name = baseName + '.' + newFormat;
              
              var titleEl = el.querySelector('.pdf-row-title');
              if (titleEl) {
                titleEl.textContent = item.name;
              }

              if (currentPdfDocument) {
                var loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'pdf-row-loading';
                loadingOverlay.textContent = 'Updating...';
                el.appendChild(loadingOverlay);
                
                renderSinglePDFPage(currentPdfDocument, item.pageNum, item.quality, item.outputFormat).then(function (res) {
                  item.dataUrl = res.dataUrl;
                  item.size = res.size;
                  renderPDFPreview();
                }).catch(function (err) {
                  showToast("Error updating format: " + err.message, 'error');
                  el.removeChild(loadingOverlay);
                });
              }
            });
          }
        }

        // Delete Row
        el.querySelector('.row-btn-delete').addEventListener('click', function () {
          pdfFiles.splice(index, 1);
          renderPDFPreview();
        });

        // Drag to Reorder events
        if (!isExtractMode) {
          el.addEventListener('dragstart', function () {
            dragIndex = index;
          });

          el.addEventListener('dragover', function (e) {
            e.preventDefault();
          });

          el.addEventListener('drop', function () {
            if (dragIndex !== null && dragIndex !== index) {
              var draggedItem = pdfFiles[dragIndex];
              pdfFiles.splice(dragIndex, 1);
              pdfFiles.splice(index, 0, draggedItem);
              renderPDFPreview();
            }
          });
        }

        pdfFileList.appendChild(el);
      });

      initCustomSelects();
    }

    pdfConvertBtn.addEventListener('click', function () {
      if (pdfFiles.length === 0) {
        pdfFileInput.click();
        return;
      }
      
      var origText = pdfConvertBtn.textContent;
      pdfConvertBtn.disabled = true;
      pdfConvertBtn.textContent = isExtractMode ? 'Extracting...' : 'Converting...';

      if (isExtractMode) {
        var zip = new JSZip();
        pdfFiles.forEach(function (item) {
          var base64Data = item.dataUrl.split(',')[1];
          zip.file(item.name, base64Data, { base64: true });
        });
        
        zip.generateAsync({ type: 'blob' }).then(function (content) {
          var link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = 'extracted_pages.zip';
          link.click();
          
          pdfConvertBtn.disabled = false;
          pdfConvertBtn.textContent = origText;
          showToast('Successfully extracted ' + pdfFiles.length + ' page(s) to ZIP archive!');
        }).catch(function (err) {
          showToast('Error generating ZIP: ' + err.message, 'error');
          pdfConvertBtn.disabled = false;
          pdfConvertBtn.textContent = origText;
        });
        return;
      }

      var pageSize = document.getElementById('pdfPageSize2').value;
      var orientationSetting = document.getElementById('pdfOrientation2').value;
      var marginSetting = document.getElementById('pdfMargin2').value;
      
      var margin = 0;
      if (marginSetting === 'small') margin = 10;
      else if (marginSetting === 'medium') margin = 20;

      var { jsPDF } = window.jspdf;
      var doc = null;

      var loadPromises = pdfFiles.map(function (item) {
        return new Promise(function (resolve) {
          var img = new Image();
          img.onload = function () {
            resolve({
              item: item,
              imgElement: img,
              w: img.naturalWidth,
              h: img.naturalHeight
            });
          };
          img.src = item.dataUrl;
        });
      });

      Promise.all(loadPromises).then(function (loadedImages) {
        loadedImages.forEach(function (loaded, i) {
          var w = loaded.w;
          var h = loaded.h;
          var isLandscape = w > h;
          
          var orient = 'p';
          if (orientationSetting === 'auto') {
            orient = isLandscape ? 'l' : 'p';
          } else {
            orient = orientationSetting === 'landscape' ? 'l' : 'p';
          }
          
          var pageW, pageH;
          if (pageSize === 'fit') {
            pageW = w;
            pageH = h;
          } else if (pageSize === 'a4') {
            pageW = orient === 'p' ? 595.28 : 841.89;
            pageH = orient === 'p' ? 841.89 : 595.28;
          } else if (pageSize === 'letter') {
            pageW = orient === 'p' ? 612 : 792;
            pageH = orient === 'p' ? 792 : 612;
          }

          if (i === 0) {
            doc = new jsPDF({
              orientation: orient,
              unit: 'pt',
              format: pageSize === 'fit' ? [pageW, pageH] : pageSize
            });
          } else {
            doc.addPage(pageSize === 'fit' ? [pageW, pageH] : pageSize, orient);
          }

          var targetW = pageW - margin * 2;
          var targetH = pageH - margin * 2;
          
          var scale = 1;
          if (pageSize !== 'fit') {
            scale = Math.min(targetW / w, targetH / h);
          }
          
          var drawW = w * scale;
          var drawH = h * scale;
          
          var x = margin + (targetW - drawW) / 2;
          var y = margin + (targetH - drawH) / 2;

          var format = loaded.item.file.type.indexOf('png') !== -1 ? 'PNG' : 'JPEG';
          doc.addImage(loaded.item.dataUrl, format, x, y, drawW, drawH);
        });

        if (doc) {
          doc.save('convertlab_images.pdf');
          showToast('Successfully converted ' + pdfFiles.length + ' image(s) to PDF!');
        }
        
        pdfConvertBtn.disabled = false;
        pdfConvertBtn.textContent = origText;
      }).catch(function (err) {
        showToast('Error generating PDF: ' + err.message, 'error');
        pdfConvertBtn.disabled = false;
        pdfConvertBtn.textContent = origText;
      });
    });
  }
});
