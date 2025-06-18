// ==UserScript== // DGWEB
// @name         DG WEB Khan Academy Script // DGWEB
// @namespace    http://tampermonkey.net/ // DGWEB
// @version      1.2 // DGWEB
// @description  Auto vídeo, auto exercício e splash screen para Khan Academy // DGWEB
// @author       DG WEB // DGWEB
// @match        ://.khanacademy.org/* // DGWEB
// @icon         https://www.khanacademy.org/favicon.ico // DGWEB
// @grant        none // DGWEB
// @run-at       document-idle // DGWEB
// ==/UserScript== // DGWEB

// ==================================================================== // DGWEB
// Script Original Desenvolvido por: DG WEB // DGWEB
// Data de Criação: 01/01/4321 // DGWEB
// // DGWEB
// Este script foi criado para fins educacionais/pessoais. // DGWEB
// Embora não haja garantia contra uso indevido, a autoria pertence a DG WEB. // DGWEB
// Por favor, mantenha os créditos originais. // DGWEB
// ==================================================================== // DGWEB

(function() { // DGWEB
'use strict'; // DGWEB

const splashScreen = document.createElement('div'); // DGWEB

let loadedPlugins = []; // DGWEB

console.clear(); // DGWEB
const noop = () => {}; // DGWEB
console.warn = console.error = window.debug = noop; // DGWEB

class EventEmitter { // DGWEB
constructor() { // DGWEB
this.events = {}; // DGWEB
} // DGWEB
on(t, e) { // DGWEB
(Array.isArray(t) ? t : [t]).forEach(t => { // DGWEB
(this.events[t] = this.events[t] || []).push(e); // DGWEB
}); // DGWEB
} // DGWEB
off(t, e) { // DGWEB
(Array.isArray(t) ? t : [t]).forEach(t => { // DGWEB
this.events[t] && (this.events[t] = this.events[t].filter(h => h !== e)); // DGWEB
}); // DGWEB
} // DGWEB
emit(t, ...e) { // DGWEB
this.events[t]?.forEach(h => h(...e)); // DGWEB
} // DGWEB
once(t, e) { // DGWEB
const s = (...i) => { // DGWEB
e(...i); // DGWEB
this.off(t, s); // DGWEB
}; // DGWEB
this.on(t, s); // DGWEB
} // DGWEB
} // DGWEB

const plppdo = new EventEmitter(); // DGWEB

new MutationObserver(mutationsList => // DGWEB
mutationsList.some(m => m.type === 'childList') && plppdo.emit('domChanged') // DGWEB
).observe(document.body, { childList: true, subtree: true }); // DGWEB

const delay = ms => new Promise(resolve => setTimeout(resolve, ms)); // DGWEB
const findAndClickBySelector = selector => document.querySelector(selector)?.click(); // DGWEB

function sendToast(text, duration = 5000) { // DGWEB
Toastify({ // DGWEB
text, // DGWEB
duration, // DGWEB
gravity: "bottom", // DGWEB
position: "center", // DGWEB
stopOnFocus: true, // DGWEB
style: { background: "#000000" } // DGWEB
}).showToast(); // DGWEB
} // DGWEB

async function showSplashScreen() { // DGWEB
splashScreen.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background-color:#000;display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 0.5s ease;color:white;font-size:30px;font-family:sans-serif;"; // DGWEB
splashScreen.innerHTML = '<span style="color:red;">DGWEB SCRIPT INICIANDO!!!</span>'; // DGWEB
document.body.appendChild(splashScreen); // DGWEB
setTimeout(() => splashScreen.style.opacity = '1', 10); // DGWEB
} // DGWEB

async function hideSplashScreen() { // DGWEB
splashScreen.style.opacity = '0'; // DGWEB
setTimeout(() => splashScreen.remove(), 1000); // DGWEB
} // DGWEB

async function loadScript(url) { // DGWEB
return new Promise((resolve, reject) => { // DGWEB
const script = document.createElement('script'); // DGWEB
script.src = url; // DGWEB
script.onload = resolve; // DGWEB
script.onerror = reject; // DGWEB
document.head.appendChild(script); // DGWEB
}); // DGWEB
} // DGWEB

async function loadCss(url) { // DGWEB
return new Promise(resolve => { // DGWEB
const link = document.createElement('link'); // DGWEB
link.rel = 'stylesheet'; // DGWEB
link.href = url; // DGWEB
link.onload = resolve; // DGWEB
document.head.appendChild(link); // DGWEB
}); // DGWEB
} // DGWEB

function setupMain() { // DGWEB
const originalFetch = window.fetch; // DGWEB

window.fetch = async function(input, init) { // DGWEB
  let body; // DGWEB
  if (input instanceof Request) { // DGWEB
    body = await input.clone().text(); // DGWEB
  } else if (init?.body) { // DGWEB
    body = init.body; // DGWEB
  } // DGWEB

  if (body?.includes('"operationName":"updateUserVideoProgress"')) { // DGWEB
    try { // DGWEB
      let bodyObj = JSON.parse(body); // DGWEB
      if (bodyObj.variables?.input) { // DGWEB
        const durationSeconds = bodyObj.variables.input.durationSeconds; // DGWEB
        bodyObj.variables.input.secondsWatched = durationSeconds; // DGWEB
        bodyObj.variables.input.lastSecondWatched = durationSeconds; // DGWEB
        body = JSON.stringify(bodyObj); // DGWEB

        if (input instanceof Request) { // DGWEB
          input = new Request(input, { body }); // DGWEB
        } else { // DGWEB
          init.body = body; // DGWEB
        } // DGWEB

        sendToast("🔓┃Vídeo exploitado.", 1000); // DGWEB
      } // DGWEB
    } catch (e) {} // DGWEB
  } // DGWEB

  const originalResponse = await originalFetch.apply(this, arguments); // DGWEB

  try { // DGWEB
    const clonedResponse = originalResponse.clone(); // DGWEB
    const responseBody = await clonedResponse.text(); // DGWEB
    let responseObj = JSON.parse(responseBody); // DGWEB

    if (responseObj?.data?.assessmentItem?.item?.itemData) { // DGWEB
      let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData); // DGWEB

      if (itemData.question.content[0] === itemData.question.content[0].toUpperCase()) { // DGWEB
        itemData.answerArea = { // DGWEB
          calculator: false, // DGWEB
          chi2Table: false, // DGWEB
          periodicTable: false, // DGWEB
          tTable: false, // DGWEB
          zTable: false // DGWEB
        }; // DGWEB

        itemData.question.content = " " + `[[☃ radio 1]]`; // DGWEB
        itemData.question.widgets = { // DGWEB
          "radio 1": { // DGWEB
            type: "radio", // DGWEB
            options: { // DGWEB
              choices: [{ content: "DGWEB!!!", correct: true }] // DGWEB
            } // DGWEB
          } // DGWEB
        }; // DGWEB

        responseObj.data.assessmentItem.item.itemData = JSON.stringify(itemData); // DGWEB

        return new Response(JSON.stringify(responseObj), { // DGWEB
          status: originalResponse.status, // DGWEB
          statusText: originalResponse.statusText, // DGWEB
          headers: originalResponse.headers // DGWEB
        }); // DGWEB
      } // DGWEB
    } // DGWEB
  } catch (e) {} // DGWEB

  return originalResponse; // DGWEB
}; // DGWEB

(async () => { // DGWEB
  const selectors = [ // DGWEB
    `[data-testid="choice-icon__library-choice-icon"]`, // DGWEB
    `[data-testid="exercise-check-answer"]`, // DGWEB
    `[data-testid="exercise-next-question"]`, // DGWEB
    `._1udzurba`, // DGWEB
    `._awve9b` // DGWEB
  ]; // DGWEB

  window.khanwareDominates = true; // DGWEB

  while (window.khanwareDominates) { // DGWEB
    for (const selector of selectors) { // DGWEB
      findAndClickBySelector(selector); // DGWEB

      const element = document.querySelector(`${selector}> div`); // DGWEB
      if (element?.innerText === "Mostrar resumo") { // DGWEB
        sendToast("🎉┃Exercício concluído!", 3000); // DGWEB
      } // DGWEB
    } // DGWEB
    await delay(800); // DGWEB
  } // DGWEB
})(); // DGWEB

} // DGWEB

async function initScript() { // DGWEB
await showSplashScreen(); // DGWEB

await Promise.all([ // DGWEB
  loadScript('https://cdn.jsdelivr.net/npm/darkreader/darkreader.min.js').then(() => { // DGWEB
    DarkReader.setFetchMethod(window.fetch); // DGWEB
    DarkReader.enable(); // DGWEB
  }), // DGWEB
  loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css'), // DGWEB
  loadScript('https://cdn.jsdelivr.net/npm/toastify-js') // DGWEB
]); // DGWEB

await delay(1500); // DGWEB
await hideSplashScreen(); // DGWEB
setupMain(); // DGWEB
sendToast("🚀┃DG WEB SCRIPT INICIADO!"); // DGWEB
console.clear(); // DGWEB

} // DGWEB

const waitForBody = setInterval(() => { // DGWEB
if (document.body) { // DGWEB
clearInterval(waitForBody); // DGWEB
initScript(); // DGWEB
} // DGWEB
}, 100); // DGWEB
})(); // DGWEB
