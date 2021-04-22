$(()=>{

localStorage.clear();

//get data from #1 api
$.get('https://api.coingecko.com/api/v3/coins/list', (res)=>{
    //hide loading gif
    $('#load').hide();
    //creat cards of coins
    for (let i = 300; i < 324; i++) {
        $('#grid').append(`
            <div id="card" class="coinCard ${res[i].symbol} ${res[i].name} text-center lead">
                <p id="symbol">${res[i].symbol}</p>
                <P id="coinName">${res[i].name}</P>
                <div class="form-check form-switch">
                    <input id=${res[i].id} class="cardToggle form-check-input align-middle" type="checkbox">
                </div>
                <button id=${res[i].id} class="moreInfo btn btn-outline-light" type="button">
                    More Info
                </button>
            </div>
        `)
    }
})

//listen to 'more info' button
$(document).on('click', '.moreInfo', (e)=>{
    
    //check if data is stored in local storage
    if (localStorage.getItem(e.target.id)) { //data is stored
        //pull data from local storage
        const pricesData = JSON.parse(localStorage.getItem(e.target.id) || "[]");
        const IMG = pricesData[0];
        const USD = pricesData[1];
        const EUR = pricesData[2];
        const ILS = pricesData[3];
        //function: show info card
        moreInfo(e, IMG, USD, EUR, ILS);
    
    } else { // data not stored
        //show loading gif
        $(e.target).parent().append(`
            <div id="load" class="text-center">
                <img src="loading.gif" alt="loading">
            </div>    
        `)
        //get data from #2 api
        $.get('https://api.coingecko.com/api/v3/coins/'+e.target.id, (res)=>{
            //hide loading gif
            $(e.target).parent().children().last().remove();
            //set data in consts
            const IMG = res.image.small;
            const USD = res.market_data.current_price.usd;
            const EUR = res.market_data.current_price.eur;
            const ILS = res.market_data.current_price.ils;
            //function: show info card
            moreInfo(e, IMG, USD, EUR, ILS);
            //save data in local storage for 2min
            const prices = [IMG, USD, EUR, ILS];
            localStorage.setItem(e.target.id , JSON.stringify(prices));
            setTimeout(()=>{
                localStorage.removeItem(e.target.id);
            }, 120000)
        })
    }
})

//listen to toggle buttons
const toggleARR = [];
$(document).on('click', '.cardToggle', (e)=>{
    //check if toggle is switched on or off
    if ($(e.target).is(':checked')) { //toggle is switched on
        //check how many toggles are on
        if (toggleARR.length<5) { //les than 5 toggles are on
            //add coin to array and update local storage
            toggleARR.push(e.target.id);

        } else { //more than 5 toggles are on
            //switch off clicked toggle that opened the modal
            e.target.checked = !e.target.checked;
            //creat pop-up modal
            $('body').append(`
                <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h6 class="modal-title lead" id="staticBackdropLabel">You can only save five coins. <br> Please choose the coin you want to remove</h6>
                                <button id="closeModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div id="staticBackdropSwitches" class="modal-body"></div>
                            <div class="modal-footer">
                                <button id=${e.target.id} type="button" class="btn saveModal" data-bs-dismiss="modal" aria-label="Close">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            `)
            //insert selected coins
            insertSelectedCoins(toggleARR);
            //show pop-up modal
            $('#staticBackdrop').modal('show');
  
            //listen to modal 'close' button
            $(document).on('click', '#closeModal', ()=>{
                //clear modal body    
                $('#staticBackdrop').detach();
            })

            //listen to modal 'save changes' button
            $(document).on('click', '.saveModal', ()=>{
                //check which radio is checked
                for (let i = 0; i < toggleARR.length; i++) {
                    if($(`.modalToggle#${toggleARR[i]}`).is(':checked')) {
                        //turn off switch in card of selected radio
                        $(`.cardToggle#${toggleARR[i]}`).prop("checked", false);
                        //remove coin from array of selected coins
                        toggleARR.splice(i, 1);
                    }
                }
                //turn on switch in card that opened the modal, add it to array 
                $(e.target).prop("checked", true);
                toggleARR.push(e.target.id);
                //clear modal body    
                $('#staticBackdrop').detach();
            })
        }
    
    } else { //toggle is switched on
        const index = toggleARR.indexOf(e.target.id);
        if (index > -1) {
            //remove from array and uptade local storage
            toggleARR.splice(index, 1);
        }
    }    
})    

$('#search').click((e) => {
    e.preventDefault();
    const value = $('#input').val().toLowerCase();
    $('.coinCard').hide();
    $(`.coinCard.${value}`).show();
    $('#input').val("");
})


//listen to clear search button
$('#clearSearch').click((e) => {
    e.preventDefault();
    $('.coinCard').show();
})


//******functions******

//function- create more info card and listen to close button
const moreInfo = (e, IMG, USD, EUR, ILS) => {
    $(e.target).hide(); //hide more info button
    $(e.target).parent().append(`
    <div id=${e.target.id} class="Collapse collapsed">
        <img id="coinImg" src=${IMG} alt="Coin-Image">
        <p id="price">Current market price:</p>
        <p id="USD">USD = ${USD} \u0024</p>
        <p id="EUR">EUR = ${EUR} \u20AC</p>
        <p id="ILS">ILS = ${ILS} \u20AA</p>
        <button type="button" class="closeMoreInfo btn-close" aria-label="Close"></button>
    </div>
    `)

    //listen to 'close more info' button
    $(document).on('click', '.closeMoreInfo', (e)=>{
        $(e.target).parent().prev().show(); //show more info button
        $(e.target).parent().remove(); // remove more info area
    })
}

//function- insert five coins selected to pop-up modal
const insertSelectedCoins = (toggleARR) => {
    for (let i = 0; i < 5; i++) {
        $('#staticBackdropSwitches').append(`
            <div class="form-check">
                <input class="modalToggle form-check-input" type="radio" name="radio" id=${toggleARR[i]}>
                <h6 class="lead d-inline">${toggleARR[i]}</h6>
            </div>
        `)
    }
}

//******menu buttons******

//home button
$('#homeNav').click(()=>{
    $('#about').empty();
    $('#main').show();
})
//about button
$('#aboutNav').click(()=>{
    $('#main').hide();
    $('#about').empty();
    $('#about').append(`
        <br>
        <h1 class="text-center lead" id="hello">Hello!</h1><br><br>
        <h1 id="aboutText" class="text-center lead">
        I'm Einat, and i'm happy to introduce to you my digital wallet.<br>
        Here you can find the most updated Cryptocurrency prices.<br>
        Just look for what you need<br>
        And ENJOY!
        </h1>

        <img id="faceImg" src="face.png" alt="face">
        <h1 class="text-center lead">
            <br>
            Feel free to contact me at Einat@CryptoMarket.com
        <h1>
    `);
})
   
//END
})