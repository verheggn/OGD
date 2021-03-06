// voegt een submit event handler toe aan het form
document.getElementById('ibanForm').addEventListener('submit', genereerIBAN);

// Hiermee kan je string de bank code ophalen
var bankIdentificatie = [
        ['ABNAMRO', 'ABNA'],
        ['INGBANK', 'INGB'],
        ['RABOBANK', 'RABO'],
        ['LANSCHOT', 'FVLB'],
        ['SNSBANK', 'SNSB'],
        ['DEMIR', 'DHBN']
];

function genereerIBAN(oEvent) {
    oEvent.preventDefault();
    
    // Een IBAN bestaat uit een aantal onderdelen:
    // (1) een Landcode, bestaande uit twee letters. We doen in deze opdracht alleen Nederlandse rekeningen,
    //    dus je kunt 'NL' gebruiken.
    // (2) een controlegetal bestaande uit twee cijfers.   
    // (3) de rekeningidentificatie 
    //    Dit onderdeel bestaat uit het relevante deel uit de globale variabele 'bankIdentificatie' en het rekeningnummer.
    //    Het rekeningnummer moet 10 tekens lang zijn. Is het korter, zet er dan nullen voor.    
    var landCode = 'NL';
    var rekeningNummer = document.getElementById('rekeningnummer').value;
    var bankSelect = document.getElementById('bankSelect');
    var gekozenBank = bankSelect.options[bankSelect.selectedIndex].value;
    
    var bankCode           = bepaalBankCode(gekozenBank);    
    rekeningNummer         = bepaalHeleRekeningNummer(rekeningNummer);
    
    var controleGetal      = bepaalControleGetal(bankCode, landCode, rekeningNummer);
    
    document.getElementById("iban").innerHTML = 'Je IBAN is: ' + landCode + controleGetal + bankCode + rekeningNummer;    
}

// de bankCode kun je halen uit de globale 'bankIdentificatie' array.
// We zouden de bankCode natuurlijk ook gewoon in de <option>s van de <select> kunnen plaatsen.. 
// maar dan hoef je niet te oefenen met arrays :)
function bepaalBankCode(gekozenBank) {
    var bankCode = '';
    
    // haal hier de bankCode op uit 'bankIdentificatie'
    // Voor elke Bank kijk of het overeen komt met de geselecteerde bank en geef de bankIdentificatie(bankCode) terug.
    for (var i=0; i < bankIdentificatie.length; i++){
       if (gekozenBank == bankIdentificatie[i][0]){
           bankCode += bankIdentificatie[i][1];
       }
    }
    return bankCode;
}

// Maak van het 7- of 9-cijferige nummer een 10-cijferig rekeningnummer
function bepaalHeleRekeningNummer(rekeningNummer) {
    // rekeningnummer variabele moet 10 tekens lang zijn, voor aanpasbaarheid is het gebruiken van een variabele wenselijk, 
     var oLengte = 10;
    
    // zorg er hier voor dat het rekeningnummer altijd 10 cijfers lang is, eventueel met nullen ervoor
    // lengte controleren

    // Voor het schakelen tussen Error messages heb ik twee arrays in het leven geroepen, voor Overshot en Tekort.
    // Tijdens het commenten in mijn code bedenk ik mij dat dit ook in één array had gekund...
    var overshot = [(rekeningNummer.length - oLengte),false];
    var teKort = [(oLengte- rekeningNummer.length),false];

    
    // voeg nullen toe bij een te kort, trim het overschot van oLengte
    while(rekeningNummer.length != oLengte){
        if (rekeningNummer.length > oLengte){
            rekeningNummer = rekeningNummer.substring(0, rekeningNummer.length -1);
            overshot[1] = true;
        } else if(rekeningNummer.length < oLengte){
            var nulToevoegen = '0';
            rekeningNummer = nulToevoegen+rekeningNummer;  
            teKort[1] = true;  
        }
    }

    // controleer of er een overshot of tekort heeft plaats gevonden, is dit niet het geval of is dit gecorrigeerd en bestaat het niet meer, verwijder de vorige foutmelding.
    if (overshot[1] === true){
        document.getElementById("error").innerHTML = 'Let op: u heeft een te lang rekeningnummer opgegeven, de laatste '+ overshot[0] +' tekens zijn verwijderd!';
        overshot[1] = false;
    } else if (teKort[1] === true){
        document.getElementById("error").innerHTML = 'Let op: u heeft een te kort rekeningnummer opgegeven, er zijn '+ teKort[0] +' tekens toegevoegd';
        teKort[1] = false;
    } else {
        document.getElementById("error").innerHTML = null;
    }

    return rekeningNummer;    
}

// bereken nu het controlegetal
//    Neem de rekeningidentificatie, plaats de landcode daarachter
//    Vervang alle letters door twee cijfers gebaseerd op de volgorde in het alfabet (A=10, B=11, C=12, ..., Z=35)
//    Voeg twee nullen toe aan het einde
//    Deel dit door 97 en neem de rest (mod97)
//    Het controlegetal is nu 98 - <deze rest>
//    Is het controlegetal kleiner dan 10? Zet er dan een 0 voor. (2 wordt dus 02)
//    Zie http://nl.wikipedia.org/wiki/International_Bank_Account_Number#Controlegetal
function bepaalControleGetal(bankCode, landCode, rekeningNummer) {
    var controleGetal = 0;
    var nummerAlsString = bankCode + rekeningNummer + landCode;
    // In de geconverteerdeString zijn letters vervangen door hun getalwaarde
    // Hierbij moet A de waarde 10 krijgen, B wordt 11, C = 12, etc)

    var geconverteerdeString = '';

        // Voor elke character in de string, controleer of het om een letter gaat of een cijfer. Wijzig dit naar een controlegetal met behulp van de unicode
        for (var i=0; i < nummerAlsString.length; i++){
            if (isNaN(nummerAlsString[i])){                        
                var charNaarNummer = (nummerAlsString[i].charCodeAt() - 'A'.charCodeAt()) + 10;
                geconverteerdeString += charNaarNummer;

            } else {
                geconverteerdeString += nummerAlsString[i];
            }
        };
      
    // Voeg nu twee nullen toe aan het einde en gebruik mod97 i.p.v. %97
    geconverteerdeString += "00" 
    var iban = geconverteerdeString;
    var controleGetal = mod97(iban);
    
    // bepaal het controlegetal en return dit (98 - het resultaat van de mod97, altijd twee cijfers)
    controleGetal = 98 - controleGetal;
    
    if (controleGetal < 9){
        controleGetal = '0'+ controleGetal;
    }
     
    return controleGetal;    
}

// mod97 zorgt ervoor dat we ook grote getallen kunnen delen
// Zie ook http://stackoverflow.com/questions/307179/what-is-javascripts-max-int-whats-the-highest-integer-value-a-number-can-go-t
function mod97(iban) {
    var remainder = iban;
    var block;
   
    while (remainder.length > 2) {
        block = remainder.slice(0, 9);
        remainder = parseInt(block, 10) % 97 + remainder.slice(block.length);
    }

    return parseInt(remainder, 10) % 97;
}
