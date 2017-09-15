var services = {
    1: {id: "directory", label: "VA Directory"},
    2: {id: "mail", label: "VA Mail"},
    3: {id: "owncloud", label: "VA Owncloud"},
    4: {id: "monitoring", label: "VA Monitoring"},
    5: {id: "backup", label: "VA Backup"},
    6: {id: "proxy", label: "VA Proxy"},
    7: {id: "vpn", label: "VA VPN"},
    8: {id: "projects", label: "VA Projects (Redmine)"},
};

var klasi = ['onetime', 'monthly', 'afteryear', 'onetimeP', 'monthlyP', 'afteryearP'];

function getOneTimePrice(m){
    return m * 12 * 0.85;
}

function sumPrice(klasa){
    var sum = 0;
    var cols = $('.' + klasa);
    for(var i=0; i<cols.length; i++){
        sum += $(cols[i]).data("price");
    }
    return sum;
}

function changeAllPrices(numEmployees, kurs){
    for(var k=0; k<klasi.length; k++){
        var sum = 0, klasa = klasi[k];
        for(var i in services){
            var service = services[i].id;
            var p = prices[service], q = p['q'];
            var currentPrice = 0;
            var currentElem = $('#' + i + ' .' + klasa);
            if(klasa.indexOf('monthly') > -1){
                currentPrice = p['m'] + ((numEmployees - 20) * q);
            }else if(klasa.indexOf('onetime') > -1){
                currentPrice = getOneTimePrice(p['m']) + ((numEmployees - 20) * q * 12);
            }else if(klasa.indexOf('afteryear') > -1){
                currentPrice = (p['m'] / 2) + ((numEmployees - 20) * q);
            }
            if(klasa.slice(-1) === 'P')
                currentPrice *= discount;
            currentPrice *= kurs;
            if($('#' + i).data("checked") === 1){
                sum += currentPrice;
                currentElem.data("price", currentPrice);
            }
            currentElem.html(Math.round(currentPrice));
        }
        $('.price[data-klasa="'+ klasa +'"]').html(Math.round(sum));
    }
}


$(function(){
    $('.btn').button();
    var tbody = $('#price-tbl tbody');
    var keys = Object.keys(services);
    keys.sort();
    for(var i=0; i<keys.length; i++){
        var key = keys[i], service = services[key], id = service.id, p = prices[id];
        tbody.append(`
            <tr id=${key} data-checked=0><td>${key}</td>
            <td>
                <div class="checkbox">
                    <label><input type="checkbox" name="service" value=${service.id}><a href="${prices[service.id].brochure_url}" target="_blank"">${service.label}</a></label>
                </div>
            </td>
            <td class="onetime" data-price=0>${Math.round(getOneTimePrice(p.m))}</td>
            <td class="monthly" data-price=0>${Math.round(p.m)}</td>
            <td class="afteryear" data-price=0>${Math.round(p.m / 2)}</td>
            <td class="onetimeP highlight-col" data-price=0>${Math.round(getOneTimePrice(p.m) * discount)}</td>
            <td class="monthlyP" data-price=0>${Math.round(p.m * discount)}</td>
            <td class="afteryearP" data-price=0>${Math.round((p.m / 2) * discount)}</td></tr>
        `);
    }
    tbody.append(`
        <tr id="price-row">
            <td></td>
            <td>Sum</td>
            <td data-klasa='onetime' class='price'>0</td>
            <td data-klasa='monthly' class='price'>0</td>
            <td data-klasa='afteryear' class='price'>0</td>
            <td data-klasa='onetimeP' class='price highlight-col onetime-head'>0</td>
            <td data-klasa='monthlyP' class='price monthly-head'>0</td>
            <td data-klasa='afteryearP' class='price'>0</td>
        </tr>
    `);
    $('#numEmployees').focusout(function(){
        var numEmployees = parseInt($(this).val());
        changeAllPrices(numEmployees, 1);
    });
    $("#price-tbl").on("change", "[name='service']", function(){
        var me = $(this);
        var service = me.val();
        var p = prices[service];
        var q = p['q'];
        var numEmployees = parseInt($('#numEmployees').val());
        var checked = me.is(':checked');
        var parentRow = me.closest('tr');
        var serviceKey = Object.keys(services).filter(function(key) {return services[key].id === service})[0];
        var kurs = 1;
        if($('[name="currency"]:checked').val() === "mkd"){
            kurs = 61.695;
        }

        if(checked){
            parentRow.data("checked", 1);
            parentRow.attr("data-checked", 1);
        }else{
            parentRow.data("checked", 0);
            parentRow.attr("data-checked", 1);
        }

        for(var k=0; k<klasi.length; k++){
            var currentSum = 0, klasa = klasi[k];
            var rows = $('.' + klasa);
            var sumPrice = $('.price[data-klasa="'+ klasa +'"]');
            var checkedPrice = $('#' + serviceKey + ' .' + klasa);

            for(var i=0; i<rows.length; i++){
                var row = $(rows[i]);
                if(row.closest('tr').data("checked") === 1){
                    currentSum += parseFloat(row.data("price"));
                }
            }

            if(checked){
                var currentPrice = 0;
                if(klasa.indexOf('monthly') > -1){
                    currentPrice = p['m'] + ((numEmployees - 20) * q);
                }else if(klasa.indexOf('onetime') > -1){
                    currentPrice = getOneTimePrice(p['m']) + ((numEmployees - 20) * q * 12);
                }else if(klasa.indexOf('afteryear') > -1){
                    currentPrice = (p['m'] / 2) + ((numEmployees - 20) * q);
                }
                if(klasa.slice(-1) === 'P')
                    currentPrice *= discount;
                currentPrice *= kurs;
                checkedPrice.data("price", currentPrice);
                sumPrice.html(Math.round(currentSum + currentPrice));
            }
            else{
                checkedPrice.data("price", 0);
                sumPrice.html(Math.round(currentSum));
            }
        }
    });
    $('[name="payment"]').change(function(e){
        if(e.target.value === "monthly"){
            $('.onetimeP, .onetime-head').removeClass('highlight-col');
            $('.monthlyP, .monthly-head').addClass('highlight-col');
        }else{
            $('.monthlyP, .monthly-head').removeClass('highlight-col');
            $('.onetimeP, .onetime-head').addClass('highlight-col');
        }
    });
    $('[name="currency"]').change(function(e){
        if(e.target.value === "euro"){
            location.reload();
        }else{
            var kurs = 61.695;
            var numEmployees = parseInt($("#numEmployees").val());
            changeAllPrices(numEmployees, kurs);
        }
    });
    $('#export').click(function(evt){
        var checkedRows = $('tr[data-checked="1"]');
        var csv = "Product,Price\n";
        for(var i=0; i<checkedRows.length; i++){
            var checkedRow = $(checkedRows[i]);
            var price = checkedRow.find(".highlight-col");
            csv += services[checkedRow.attr('id')].label + "," + price.html() + "\n";
        }
        var check = $('.btn-group input:checked');
        var paymentType = check.val();
        csv += "Sum," + $('.price.' + paymentType + '-head').html();
        var blob = new Blob([csv], {type: "octet/stream"});
        var url = window.URL.createObjectURL(blob);
        var tempLink = document.createElement('a');
        tempLink.style = "display: none";
        tempLink.href = url;
        tempLink.setAttribute('download', 'va-prices.csv');
        document.body.appendChild(tempLink);
        tempLink.click();
        setTimeout(function(){
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(url);
        }, 100);
    });
});
