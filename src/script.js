const key = 'fca_live_vTAMK8GWzhVEKytKhGpILc2g8yjwVXihxcsGIL4l';

// state

const state = {
    openedDrawer: null,
    currencies: [],
    filteredCurrency: [],
    base: 'USD',
    target: 'EUR', 
    rates: {},
    baseValue: 1,
}

// selectors
const ui = {
    constrols: document.getElementById('controls'),
    drawer: document.getElementById('drawer'),
    dismissBtn: document.getElementById('dismiss-btn'),
    currencyList: document.getElementById('currency-list'),
    searchInput: document.getElementById('search'),
    baseBtn: document.getElementById('base'),
    targetBtn: document.getElementById('target'),
    exchangeRate: document.getElementById('exchange-rate'),
    baseInput: document.getElementById('base-input'),
    targetInput: document.getElementById('target-input'),
    swapBtn: document.getElementById('swap-btn'),


};

// event listeners
const setupEventListeners = () => {
    document.addEventListener('DOMContentLoaded', initApp);
    ui.constrols.addEventListener( 'click', showDrawer );
    ui.dismissBtn.addEventListener( 'click', hideDrawer );
    ui.searchInput.addEventListener('input', filterCurrency);
    ui.currencyList.addEventListener('click', selectPair );
    ui.baseInput.addEventListener('change', covertInput);
    ui.swapBtn.addEventListener('click', switchPair);

}

// event handlers 

const initApp = () => {
    fetchCurrencies();
    fetchExchangeRate();
    // updateButtons();
}



const showDrawer = (event) => {
    if(event.target.hasAttribute('data-drawer')){
        state.openedDrawer = event.target.id;    
        ui.drawer.classList.add('show')
        console.log(state, ui.drawer.attributes);
        fetchCurrencies();
    }
}
const hideDrawer = () => {
    clearSearchInput();
    state.openedDrawer = null;
    ui.drawer.classList.remove('show')
}



const filterCurrency = () => {
    const keyword = ui.searchInput.value.trim().toLowerCase();


    state.filteredCurrency = getAvailableCurrencies().filter(({code, name}) => {
        return (
            code.toLowerCase().includes(keyword) ||
            name.toLowerCase().includes(keyword)
        );
    }
);
    displayCurrencies();
};

const selectPair = (e) => {
    if(e.target.hasAttribute('data-code')){
        const { openedDrawer } = state;

        // update the base or target in the state
        state[openedDrawer] = e.target.dataset.code;

        // load the btn then update the buttons
        // What we do here is that for each button, accensing them through the object id and then 
        // the respective button, we iterate over them and say that the code
        // will be equal to the state at the position of the btn . id, btn
        // will be either base or target
       loadExchangeRate();
         // close drawer after selection 
         hideDrawer();
    }
}

const covertInput = () => { 
    state.baseValue = parseFloat(ui.baseInput.value) || 1;
    // displayConversion();
    loadExchangeRate();
 }

 
 const switchPair = () => { 
    const { base, target } = state;

    state.base = target;
    state.target = base;

    state.baseValue = parseFloat( ui.targetInput.value ) || 1;
    loadExchangeRate();
  }


// render fucntions

const displayCurrencies = () => {
    ui.currencyList.innerHTML = state.filteredCurrency.map(({code, name}) => {
        return ` 
    <li data-code='${code}'>
        <img src="${getImageURL(code)}" alt="${name}">
        <div>
            <h4>${code}</h4>
            <p>${name}</p>
        </div>
    </li>`
    }).join('')
}

// api functions
// helper functions

const updateButtons = () => { 
    [ui.baseBtn, ui.targetBtn].forEach((btn) => {
        const buttonName = state[btn.id];

        btn.textContent = buttonName;
        btn.style.setProperty('--image', `url(${getImageURL(buttonName)})`)
    });
 }

const displayConversion = () => {
    updateButtons();
    updateInputs();
    updateExchangeRate();
};

const showLoading = () => {
    ui.constrols.classList.add('skeleton');
    ui.exchangeRate.classList.add('skeleton');
}
const hideLoading = () => {
    ui.constrols.classList.remove('skeleton');
    ui.exchangeRate.classList.remove('skeleton');
}


 
const updateInputs = () => {
    const { base, target, rates, baseValue } = state;

    const result = baseValue * rates[base][target];

    ui.targetInput.value = result.toFixed(4);
    ui.baseInput.value = baseValue;
}

const updateExchangeRate = () => {
    const { base, target, rates } = state;

    const rate = rates[base][target].toFixed(4);

    ui.exchangeRate.textContent = `1 ${base} = ${rate} ${target}`
}


const getAvailableCurrencies = () => {
    return state.currencies.filter(({ code }) => {
        return state.base !== code && state.target !== code;
    })
}

const clearSearchInput = () => {
    ui.searchInput.value = "";
    ui.searchInput.dispatchEvent(new Event('input'));
}

const getImageURL = (code) => {
    const flag = 'https://wise.com/public-resources/assets/flags/rectangle/{code}.png';

    return flag.replace("{code}", code.toLowerCase());

}

const loadExchangeRate = () => { 
    const { base, rates } = state;
    if(typeof rates[base] !== 'undefined'){
        // If the base rates are in state, then show it 
        displayConversion()
    }else{
        // else fetch the exchange rate first
        fetchExchangeRate()
    }
 }

const fetchExchangeRate = () => {
    const { base } = state;
    showLoading();
    fetch(
        `https://api.freecurrencyapi.com/v1/latest?apikey=${key}&base_currency=${base}`)
        .then((response) => response.json())
        .then( ({data}) => {
        state.rates[base] = data;

        displayConversion();
    })
    .catch(console.error)
    .finally(hideLoading);
}

const fetchCurrencies = () => {

    const apiUrl = `https://api.freecurrencyapi.com/v1/currencies?apikey=${key}`;
    fetch(apiUrl)
  .then(response => {
    // Check if the response status is okay (status code 200)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    // Parse the response as JSON
     return response.json();
  })
  .then(({data}) => {
    // Handle the data from the response
    state.currencies = Object.values(data);
    state.filteredCurrency = getAvailableCurrencies();
    displayCurrencies();
  })
  .catch(error => {
    // Handle any errors that occurred during the fetch operation
    console.error('There was a problem with the fetch operation:', error);
  });
}

//Initialization
setupEventListeners();
