
var zona = "";
var Acogido = "";
var nSimulador = 2;
var anterior = 0;

//Limita en los input el numero de decimales a dos
$(':input[type="number"]').change(function () {
    this.value = parseFloat(this.value).toFixed(2);
});

// Primera vez que se carga la página
$(document).ready(function () {
    // Limpamos los datos para volver a simular
    volverempezar();
    // Leemos la url actual para saber si estamos en vista previa o no
    var URLactual = window.location.toString();
    var datos = "";
    if (URLactual.includes("VistaPrevia")) {
        datos = datosUsuario();        
        var pos = datos.indexOf("$");        
        var remi = datos.substring(0, pos);
        var ofi = datos.substring(pos+1);
        document.getElementById("remitente").textContent = remi;
        document.getElementById("oficina").textContent = ofi;
                
        var cuenta = document.getElementById("cuenta1").innerHTML.trim() + document.getElementById("cuenta2").innerHTML.trim() + document.getElementById("cuenta3").innerHTML.trim() + document.getElementById("cuenta4").innerHTML.trim();
        var iban = calculoIBAN(cuenta);
        var bic = calculoBIC(cuenta);
        var indice = 0;
        var indice_resto = 0;
        var nombre = '';
        //Monto el IBAN y el BIC
        //BIC        
        if (bic != "") {
            var arrBic = bic.split('');
            for (var i = 0; i < arrBic.length; i++) {
                indice++;
                nombre = "BIC" + indice;
                document.getElementById(nombre).innerHTML = arrBic[i];
            }
        }
        indice = 0;
        //IBAN
        if (iban != "") {
            var arrIBAN = iban.split('');
            for (var i = 0; i < arrIBAN.length; i++) {
                indice++;
                nombre = "CTA" + indice;
                document.getElementById(nombre).innerHTML = arrIBAN[i];
            }
            indice_resto = indice--;
            indice = indice_resto;
            for (var i = indice_resto; i < 35; i++) {
                indice++;
                nombre = "CTA" + indice;
                document.getElementById(nombre).innerHTML = "&nbsp;&nbsp;&nbsp;";
            }
        }
    }
})

// Se valida el nº de acuerdo
$(".nacuerdo").blur(function () {
    var actual = this.value;
    if ((actual.length > 0) && (actual.length < 10)) {
        this.style.borderColor = "red";        
        bootbox.alert({
            message: 'El número de acuerdo tiene que ser de 10 dígitos'
        });
    } else {
        if ((actual.length == 10) || (actual.length == 0)) 
            this.style.borderColor = "#ccd6e6";
    }
});

// Se valida el teléfono
$(".telefono").blur(function () {
    var actual = this.value;
    if ((actual.length > 0) && (actual.length < 9)) {
        this.style.borderColor = "red";        
        bootbox.alert({
            message: 'Teléfono incorrecto'
        });
    } else {
        if(actual.length <= 9)
            this.style.borderColor = "#ccd6e6";
    }
});

// Controles superiores que son comunes para todas las simulaciones

$('#acoLey').on('change', function () {

    Acogido = this.value;
    // Según acogido o no a la ley de crédito se muestra leyenda
    if (this.value === "Si") {
        $("#textoAC").removeClass("hidden");
    } else {
        $("#textoAC").addClass("hidden");
    }

    // Vaciamos todos los datos
    var i = 1;
    $(".classdocu").each(function () {
        vaciarCambioBI(i);
        mostrarTabla(i, 0);
        mostrarTablaCRN(i, 0);
        i = i + 1;
    });
})

// Si han escrito el nif comprobamos que está bien.
jQuery("#dniSoli").blur(function () {           
    // Comprueba si el valor introducido es un DNI válido (estructura y número con letra correctos etc)
    var dni_nif = document.getElementById("dniSoli").value.trim();
    var res = false;
    if (dni_nif !== "") {        
        res = ValidateSpanishID(dni_nif);
        if (res.valid === false) {
            document.getElementById("dniSoli").style.borderColor = "red";
            bootbox.alert({ message: "NIF Incorrecto." });
        }
        else
            document.getElementById("dniSoli").style.borderColor = "";
    }
    else {        
        document.getElementById("dniSoli").style.borderColor = "";
        bootbox.alert({ message: "El NIF es obligatorio." });
    }    
}); 

// Zona
$('#selectZona').on('change', function () {    

    // Oculto toda la parte de cálculos
    var i = 1;
    $(".classdocu").each(function () {
        vaciarCalculo(i);
        i = i + 1;
    });

    var dni_ok = 0;
    // Validamos el DNI y la CTA        
    if ($("#dniSoli").val().length > 0) {
        var URLactual = window.location.toString();
        // Comprueba si el valor introducido es un DNI válido (estructura y número con letra correctos etc)
        var dni_nif = document.getElementById("dniSoli").value.trim();
        var res = false;       
        res = ValidateSpanishID(dni_nif);        
        if (res.valid === false) {
            dni_ok++;
            $("#selectZona").val("");
            document.getElementById("dniSoli").style.borderColor = "red";
            bootbox.alert({ message: "NIF Incorrecto." });
        }
        else {
            document.getElementById("dniSoli").style.borderColor = "";
            // CTA
            if ($("#cuenta1").val().length == 4 && $("#cuenta2").val().length == 4 && $("#cuenta3").val().length == 2 && $("#cuenta4").val().length == 10) {
                var DC = calculoDigitoControl($("#cuenta1").val(), $("#cuenta2").val(), $("#cuenta4").val())
                if ($("#cuenta3").val() == DC) {       
                    if ($("#cuenta1").val() != "0000" && $("#cuenta2").val() != "0000" && $("#cuenta3").val() != "00" && $("#cuenta4").val() != "0000") {
                        document.getElementById("cuenta1").style.borderColor = "";
                        document.getElementById("cuenta2").style.borderColor = "";
                        document.getElementById("cuenta3").style.borderColor = "";
                        document.getElementById("cuenta4").style.borderColor = "";
                    } else {
                        dni_ok++;
                        $("#selectZona").val("");
                        document.getElementById("cuenta1").style.borderColor = "red";
                        document.getElementById("cuenta2").style.borderColor = "red";
                        document.getElementById("cuenta3").style.borderColor = "red";
                        document.getElementById("cuenta4").style.borderColor = "red";
                        bootbox.alert({ message: "Número de cuenta Incorrecto." });
                    }                                        
                } else {
                    dni_ok++;
                    $("#selectZona").val("");
                    document.getElementById("cuenta3").style.borderColor = "red";
                    bootbox.alert({ message: "Número de cuenta Incorrecto." });
                }               
            }
            else {
                dni_ok++;
                $("#selectZona").val("");
                if ($("#cuenta1").val().length != 4)
                    document.getElementById("cuenta1").style.borderColor = "red";
                if ($("#cuenta2").val().length != 4)
                    document.getElementById("cuenta2").style.borderColor = "red";
                if ($("#cuenta3").val().length != 2)
                    document.getElementById("cuenta3").style.borderColor = "red";
                if ($("#cuenta4").val().length != 10)
                    document.getElementById("cuenta4").style.borderColor = "red";                
                bootbox.alert({ message: "Número de cuenta Incorrecto." });
            }
        }
    }    

    if ($("#nomSoli").val().length >= 0 && $("#dniSoli").val().length >= 0 && $("#nomNota").val().length >= 0 && $("#acoLey").val().length > 0 && $("#cuenta1").val().length >= 0 && $("#cuenta2").val().length >= 0 && $("#cuenta3").val().length >= 0 && $("#cuenta4").val().length >= 0 && dni_ok == 0) {
        // Hacer algo
        // Sección de cálculo de provisión de fondos nº1        
        $("#tabcalculos").removeClass("hidden");
        $("#calculos1").removeClass("hidden");
        var i = 1;
        $(".classdocu").each(function () {
            if (i !== 1) {
                borroelemento("#calculos" + i);
            }
            i = i + 1;
        });
        zona = $("#selectZona").val();
    } else {
        $("#selectZona").val("");
        bootbox.alert({
            message: 'El Nombre del solicitante, el DNI, Acogido o no a Ley, la Notaría y la cuenta bancaria son datos obligatorios. '
        });
    }
})

// Esto lo vamos a utilizar para numerar las páginas de la vista previa
$("a[id=imprimir]").click(function () {       
    var mayor = 0;
    $("div").each(function () {
        if ($(this).attr("data-pagina") !== undefined) {
            if ($(this).attr("data-pagina") > mayor)
                mayor = $(this).attr("data-pagina");
        }
    });
    if (mayor !== 0) {        
        $(".npagina").each(function () {                        
            this.innerHTML = this.innerHTML.replace('total', mayor);
        });
    }
});

// Procedimiento que da un mensaje en caso de ser borrador, simulación
function darmensaje() {
    esborrador = document.getElementById("EsBorradorH").value.trim();
    if (esborrador === "SI")
        alert('Esta simulación no será válida para el envío de la operación a notaria');        
}

// Procedimiento que prepara los datos antes de la simulación
function preparo() {
    var dni_ok = 0;
    var dni_nif = document.getElementById("dniSoli").value.trim();
    var res = false;
    res = ValidateSpanishID(dni_nif);    
    if (res.valid === false)
        dni_ok++;
    if ($("#nomSoli").val().length > 0 && $("#dniSoli").val().length > 0 && $("#nomNota").val().length > 0 && $("#acoLey").val().length > 0 && $("#cuenta1").val().length > 0 && $("#cuenta2").val().length > 0 && $("#cuenta3").val().length > 0 && $("#cuenta4").val().length > 0 && dni_ok == 0) {
        // CTA
        if ($("#cuenta1").val().length == 4 && $("#cuenta2").val().length == 4 && $("#cuenta3").val().length == 2 && $("#cuenta4").val().length == 10) {
            var DC = calculoDigitoControl($("#cuenta1").val(), $("#cuenta2").val(), $("#cuenta4").val())
            if ($("#cuenta3").val() == DC) {
                document.getElementById("cuenta1").style.borderColor = "";
                document.getElementById("cuenta2").style.borderColor = "";
                document.getElementById("cuenta3").style.borderColor = "";
                document.getElementById("cuenta4").style.borderColor = "";
                $('#esBorrador').val("NO");
            } else {
                dni_ok++;
                $("#selectZona").val("");
                document.getElementById("cuenta3").style.borderColor = "red";
                bootbox.alert({ message: "Número de cuenta Incorrecto." });
                $('#esBorrador').val("SI");
            }
        }
        else {
            $('#esBorrador').val("SI");
        }
    }
    else {
        // CTA
        if ($("#cuenta1").val().length == 4 && $("#cuenta2").val().length == 4 && $("#cuenta3").val().length == 2 && $("#cuenta4").val().length == 10) {
            var DC = calculoDigitoControl($("#cuenta1").val(), $("#cuenta2").val(), $("#cuenta4").val())
            if ($("#cuenta3").val() == DC) {
                document.getElementById("cuenta1").style.borderColor = "";
                document.getElementById("cuenta2").style.borderColor = "";
                document.getElementById("cuenta3").style.borderColor = "";
                document.getElementById("cuenta4").style.borderColor = "";
                if ($("#nomSoli").val().length > 0 && $("#dniSoli").val().length > 0 && $("#nomNota").val().length > 0 && $("#acoLey").val().length > 0 && dni_ok == 0)
                    $('#esBorrador').val("NO");
                else
                    $('#esBorrador').val("SI");
            } else {                
                document.getElementById("cuenta3").style.borderColor = "red";
                bootbox.alert({ message: "Número de cuenta Incorrecto." });
                $('#esBorrador').val("SI");
            }
        }
        else
            $('#esBorrador').val("SI");
    }        
    $('#verAdjunto').val("NO");
    $('#queAdjunto').val("");
}

// Pulsan el botón adjunto del documento que sea
function hacerAdjunto(i) {

    $('#verAdjunto').val("SI");    

    var ExisteTP = $("#selectTransPrev" + i + " option:selected").text();
    var TramitaI = $("#selectTramINGSA" + i + " option:selected").text();
    if (ExisteTP === "Si") {
        if (TramitaI === "Si")
            $('#queAdjunto').val("3");
        else
            $('#queAdjunto').val("1");
    }
    else
        $('#queAdjunto').val("2");
        
    $('#queNumero').val(i);
    
}

// Controles que se van a duplicar

// Tipo de documento (NO DEPENDE DE ZONA GEOGRÁFICA)
function cambiarDocu(i) {

    // Oculto el botón de Adjunto
    verBotonAdjunto(i, 0);

    // La Cancelación Notarial solo va con una simulación, tiene que ser simulada sola
    if ((i > 1) && ($("#selectDocu" + i).val() === "19")) // CANCELACIÓN NOTARIAL
    {                
        $("#selectDocu" + i).val("0");
        $("#selectDocu" + i + " option[value='0']").attr("selected", true);        
        $("#selectDocuH" + i).val(" - Selecciona un tipo de documento -");
        vaciarCalculo(i);
        bootbox.alert({
            message: 'El tipo de documento CANCELACIÓN NOTARIAL debe ir solo en la simulación'
        });
    } else {
        // Si cambia el tipo de documento, tengo que ocultar todo previamente    
        var tipoDocu = $("#selectDocu" + i).val();

        $("#selectDocuH" + i).val($("#selectDocu" + i + " option:selected").text());

        vaciarCambioTipoDocumento(i);
        // Mostramos u ocultamos los datos según el tipo de documento
        montarPorTipoDocumento(i, zona, tipoDocu);
        // 12 CANCELACIÓN DE HIPOTECA CRN, 13 SUBROGACIÓN DE HIPOTECA, 14 CANCELACIÓN DE EMBARGO, 17 FIN DE OBRA
        // En estos tipos de documentos se podrá directamente calcular y simular, en el resto habrá que 
        // rellenar o seleccionar algo antes de poder hacerlo
        if ((tipoDocu === "12") || (tipoDocu === "13") || (tipoDocu === "14") || (tipoDocu === "17"))
            verBotonCalcular(i, 1);        
    }   
}

// Según el Tipo de base imponible veremos unos datos u otros
function cambiarBI(i) {

    var tipoBase = $("#selectTipoBI" + i).val();
    var tipoDocu = $("#selectDocu" + i).val();

    // Guardo el tipo de Base Imponible
    $("#selectTipoBIH" + i).val($("#selectTipoBI" + i + " option:selected").text());

    // Limpio los datos
    vaciarCambioBI(i);
    mostrarTabla(i, 0);
    mostrarTablaCRN(i, 0);

    //Tipo de documento
    switch (tipoDocu) {
        case "1": // 1 COMPRA 1ª TRANSMISIÓN (IVA)
        case "2": // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)         
        case "5": // 5 OBRA NUEVA
        case "6": // 6 COMPRA 2ª TRANSMISIÓN (USADA)                
        case "7": // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA)
        case "8": // 8 EXTINCIÓN DE CONDOMINIO(VIVIENDA)
            verUnicaVivienda(i, 1);
            verNumeroFincas(i, 1);
            switch (tipoBase) {
                case "1": // 1 Valor de compra
                    // Ocultamos Base Imponible
                    verBaseImponible(i, 0);
                    break;
                case "2": // 2 Valor mínimo atribuible                        
                case "3": // 3 Valor de tasación
                case "4": // 4 Valor catastral
                case "5": // 5 Precio medio mercado
                case "6": // 6 Otra
                    // Mostramos Base imponible
                    verBaseImponible(i, 1);
                    break;
                default:
                case "0":
                    verBaseImponible(i, 0);
                    verUnicaVivienda(i, 0);
                    verNumeroFincas(i, 0);
                    break;
            }
            // Si se ha seleccionado un tipo de base imponible dejamos calcular y simular
            if (tipoBase !== "0")
                verBotonCalcular(i, 1);                
            else // Si NO se ha seleccionado un tipo de base imponible NO dejamos calcular y simular
                verBotonCalcular(i, 0);                            
            break;
        case "3": // 3 COMPRA VPO 1ª TRANSMISIÓN(IVA)
            break;
        case "4": // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)  
            switch (tipoBase) {
                case "1": // 1 Valor de compra
                    // Ocultamos Base Impobible y mostramos NºFincas
                    verBaseImponible(i, 0);
                    verNumeroFincas(i, 1);
                    break;
                case "2": // 2 Valor mínimo atribuible                        
                case "3": // 3 Valor de tasación
                case "4": // 4 Valor catastral
                case "5": // 5 Precio medio mercado
                case "6": // 6 Otra
                    // Mostramos Base Impobible y NºFincas
                    verBaseImponible(i, 1);
                    verNumeroFincas(i, 1);
                    break;
                default:
                case "0":
                    verBaseImponible(i, 0);
                    verUnicaVivienda(i, 0);
                    verNumeroFincas(i, 0);
                    break;
            }
            // Si se ha seleccionado un tipo de base imponible dejamos calcular y simular
            if (tipoBase !== "0")
                verBotonCalcular(i, 1);                
            else // Si NO se ha seleccionado un tipo de base imponible NO dejamos calcular y simular
                verBotonCalcular(i, 0);                            
            break;
        case "9": // 9 PRÉSTAMO                
            break;
        case "10": // 10 PRÉSTAMO CON AVALISTA
            break;
        case "11": // 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD
            break;
        case "12": // 12 CANCELACIÓN DE HIPOTECA CRN
            break;
        case "13": // 13 SUBROGACIÓN DE HIPOTECA
            break;
        case "14": // 14 CANCELACIÓN DE EMBARGO
            break;
        case "15": // 15 NOVACIÓN DE PRÉSTAMO
            break;
        case "16": // 16 NOVACIÓN DE PRÉSTAMO CON AMPLIACIÓN
            break;
        case "17": // 17 FIN DE OBRA
            break;
        case "18": // 18 PÓLIZA PRÉSTAMO / AFIANZAMIENTO
            break;
        case "19": // 19 CANCELACIÓN NOTARIAL
            break;
        default:
    }

    // Nuevo requisito de Maite, en estos casos aparecerá marcado Vivienda habitual y no se podrá desmarcar    
    if ($("#valUniVivH" + i).val() == "visible") {
        var tipoImpo = $("#selectTipoIM" + i).val();
        var aplico = 0;
        // 20.03.23 Nuevo cambio para vivienda habitual
        // NAVARRA y 6 COMPRA 2ª TRANSMISIÓN (USADA) o 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA)
        // y Tipo impositivo Tipo reducido 5% o Tipo reducido 4%
        if (zona === "NA" && (tipoDocu === "6" || tipoDocu === "7") && (tipoImpo === "5" || tipoImpo === "4"))        
            aplico++;
        // LA RIOJA y 1 COMPRA 1ª TRANSMISIÓN (IVA) o 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA) 
        // y Tipo impositivo Tipo reducido 0.5% o Tipo reducido 0.4%
        if (zona === "LR" && (tipoDocu === "1" || tipoDocu === "2") && (tipoImpo === "0.5" || tipoImpo === "0.4"))
            aplico++;
        // LA RIOJA y 6 COMPRA 2ª TRANSMISIÓN (USADA) o 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA)
        // y Tipo impositivo Tipo reducido 5% o Tipo reducido 3%
        if (zona === "LR" && (tipoDocu === "6" || tipoDocu === "7") && (tipoImpo === "5" || tipoImpo === "3"))
            aplico++;
        // ALAVA, VIZCAYA O GUIPUZCOA y 1 COMPRA 1ª TRANSMISIÓN (IVA) o 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
        // y Tipo impositivo Exento
        if ((zona === "AL" || zona === "GI" || zona === "BI") && (tipoDocu === "1" || tipoDocu === "2") && tipoImpo === "-1")
            aplico++;
        // ALAVA, VIZCAYA O GUIPUZCOA y 6 COMPRA 2ª TRANSMISIÓN (USADA) o 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA)
        // y Tipo impositivo Tipo reducido 2.5%
        if ((zona === "AL" || zona === "GI" || zona === "BI") && (tipoDocu === "6" || tipoDocu === "7") && tipoImpo === "2.5")
            aplico++;
        // ALAVA, VIZCAYA O GUIPUZCOA y 9 PRÉSTAMO o 10 PRÉSTAMO CON AVALISTA o 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD o 12 CANCELACIÓN DE HIPOTECA CRN
        // y Tipo impositivo Exento
        if ((zona === "AL" || zona === "GI" || zona === "BI") && (tipoDocu === "9" || tipoDocu === "10" || tipoDocu === "11" || tipoDocu === "12") && tipoImpo === "-1")
            aplico++;
        // Si hay que aplicarlo lo marco y bloqueo
        if (aplico > 0) {
            $("#valUniViv" + i).parent().addClass("checked");
            $("#valUniViv" + i).parent().addClass("sinpuntero");
        }        
    }
}

// Tipo Impositivo
function cambiarTipoImp(i) {
    // Primero oculto todos los campos relacionados
    verValorCompra(i, 0);
    verValorMinimo(i, 0);
    verSubrogación(i, 0);
    verAmpliación(i, 0);
    verFianza(i, 0);
    verLabelTipoImpositivo(i, 0, "");
    verTipoBaseImponible(i, 0);
    verImportePrestamo(i, 0);
    verDestinadoVH(i, 0);
    verNumeroFincas(i, 0);    
    verUnicaVivienda(i, 0);

    // Leemos el tipo de documento y el tipo impositivo
    var tipoImpo = $("#selectTipoIM" + i).val();
    var tipoDocu = $("#selectDocu" + i).val();

    $("#selectTipoIMH" + i).val($("#selectTipoIM" + i + " option:selected").text());

    // Según lo seleccionado muestramos unos datos u otros
    var aux = "";
    switch (tipoImpo) {
        case "6": // 6 Tipo general 6%
        case "5": // 5 Tipo reducido 5%
        case "1": // 1 Tipo reducido 1%
            // NAVARRA
            if (zona === "NA") {
                // 6 COMPRA 2ª TRANSMISIÓN (USADA) O 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN(USADA)
                if ((tipoDocu === "6") || (tipoDocu === "7")) {
                    // Muestro valor Compra y Base imponible
                    verValorCompra(i, 1);
                    verTipoBaseImponible(i, 1);
                    // Si tipo impositivo reducido 1% muestro una etiquet con un texto
                    if (tipoImpo === "1") {
                        aux = "Renuncia a la exención del IVA";
                        verLabelTipoImpositivo(i, 1, aux);
                    }
                    // Si tipo impositivo reducido 4% muestro una etiqueta con un texto
                    if (tipoImpo === "4") {
                        aux = "Vivienda habitual. Orden Foral 8/2023 de 15 de febrero. Municipios en Riesgo de Despoblación.";
                        verLabelTipoImpositivo(i, 1, aux);
                    }
                    // 6 COMPRA 2ª TRANSMISIÓN (USADA) Y Tipo Impositivo es reducido 5% muestro una etiqueta con un texto
                    if (tipoDocu === "6") {
                        if (tipoImpo === "5") {
                            aux = "Hasta 180.303,63 € al 5%, resto de la base al 6% (Familia superior a más de 3 miembros, vivienda habitual y no propietario de otra vivienda en un porcentaje superior al 25% en la Comunidad Foral de Navarra)";
                            verLabelTipoImpositivo(i, 1, aux);
                        }
                    }
                    // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA) Y Tipo Impositivo es reducido 5% muestro una etiqueta con un texto
                    // La Subrogación, Apliación y Fianza
                    if (tipoDocu === "7") {
                        if (tipoImpo === "5") {
                            aux = "Hasta 180.303,63 € al 5%, resto de la base al 6% (Familia superior a más de 3 miembros, vivienda habitual y única en el termino municipal)";
                            verLabelTipoImpositivo(i, 1, aux);
                        }
                        verSubrogación(i, 1);
                        verAmpliación(i, 1);
                        verFianza(i, 1);
                    }
                }                                
            }
            // LA RIOJA
            if (zona === "LR") {
                // 1 COMPRA 1ª TRANSMISIÓN (IVA) mostramos Compra y Tipo Base Imponible
                if ((tipoDocu === "1")) {
                    verValorCompra(i, 1);
                    verTipoBaseImponible(i, 1);
                }
                // 2 COMPRA CON SUBROGACIÓN 1ª TRANSMISIÓN (IVA) y Tipo Impositivo es el general 1% 
                // mostramos Compra, Tipo Base Imponible, Subrogación, Ampliación y Fianza
                if ((tipoDocu === "2") && (tipoImpo === "1")) {
                    verValorCompra(i, 1);
                    verTipoBaseImponible(i, 1);                    
                    verSubrogación(i, 1);
                    verAmpliación(i, 1);
                    verFianza(i, 1);                    
                }
                // 6 COMPRA 2ª TRANSMISIÓN (USADA) y Tipo Impositivo es el reducido 5%
                // O 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN(USADA) y Tipo Impositivo es el reducido 5%
                // mostramos Compra, Tipo Base Imponible y un texto para el tipo impositivo
                if (((tipoDocu === "6") && (tipoImpo === "5")) || ((tipoDocu === "7") && (tipoImpo === "5"))) {
                    verValorCompra(i, 1);
                    verTipoBaseImponible(i, 1);
                    aux = "Vivienda habitual: familias numerosas o minusválidos con un grado igual o superior al 33%. Viviendas VPO - (Vivienda habitual + Base liquidable a tributación (IRPF....) no exceda de 18.030€ individual o de 30.50€ conjunta y la base liquidable del ahorro sometida a tributación no supere los 1.800€).Menores 36 años - (Vivienda habitual + Menor de 36 años + Base liquidable a tributación (IRPF....) no exceda de 18.030€ individual o de 30.50€ conjunta y la base liquidable del ahorro sometida a tributación no supere los 1.800€).";
                    verLabelTipoImpositivo(i, 1, aux);
                    // En caso de ser 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN(USADA)
                    // también mostramos Subrogación, Ampliación y Fianza
                    if (tipoDocu === "7") {
                        verSubrogación(i, 1);
                        verAmpliación(i, 1);
                        verFianza(i, 1);
                    }
                }                
                // 9 PRÉSTAMO O 10 PRÉSTAMO CON AVALISTA
                // mostramos Importe prestamo, Destinado a Vvienda Habitual y Nº Fincas
                if ((tipoDocu === "9") || (tipoDocu === "10")) {
                    verImportePrestamo(i, 1);
                    verDestinadoVH(i, 1);
                    verNumeroFincas(i, 1);
                }
                // En todos estos casos de tipo impositivo, 6 Tipo general, 5% 6 Tipo general 5% y 1 Tipo general 1%
                // Ya podremos mostrar el botón de Calcular y Simulación
                verBotonCalcular(i, 1);                
            }
            break;
        case "3": // 3 Tipo reducido 3% solo en La Rioja            
            // 6 COMPRA 2ª TRANSMISIÓN (USADA) O 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN(USADA)
            // Mostramos valor compra, Tipo Base Imponible y la etiqueta con el texto correspondiente
            if ((tipoDocu === "6") || (tipoDocu === "7")) {
                verValorCompra(i, 1);
                verTipoBaseImponible(i, 1);
                aux = "Vivienda habitual familias numerosas que cumplan: adquisición dentro de los 5 años a la consideración de familia numerosa o nacimiento último hijo; venta en el mismo plazo de su vivienda anterior; superficie útil de la nueva vivienda 10% superior a la anterior; bases imponibles IRPF inferior a 30.600 €.Menores 36 años - (Vivienda habitual + Menor de 36 años + Base liquidable a tributación (IRPF....) no exceda de 18.030€ individual o de 30.50€ conjunta y la base liquidable del ahorro sometida a tributación no supere los 1.800€ + Municipios del anexo I).";
                verLabelTipoImpositivo(i, 1, aux);
                // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN(USADA)
                // Mostramos además Subrogación, Ampliación y Fianza
                if (tipoDocu === "7") {
                    verSubrogación(i, 1);
                    verAmpliación(i, 1);
                    verFianza(i, 1);
                }
            }            
            break;
        case "0.4": // 0.4 Tipo reducido 0.4% solo en La Rioja
            // 1 COMPRA 1ª TRANSMISIÓN (IVA) O 2 COMPRA CON SUBROGACIÓN 1ª TRANSMISIÓN (IVA)
            // Mostramos Valor Compra, tipo Base Impponible y etiqueta con texto
            if ((tipoDocu === "1") || (tipoDocu === "2")) {
                verValorCompra(i, 1);
                verTipoBaseImponible(i, 1);
                aux = "Supuestos previstos en el tipo reducido del 0,5% cuando el valor de la vivienda sea inferior a 150.253 €."
                verLabelTipoImpositivo(i, 1, aux);
                // Si es 2 COMPRA CON SUBROGACIÓN 1ª TRANSMISIÓN (IVA)
                // Mostramos además Subrogación, Ampliación y Fianza
                if (tipoDocu === "2") {
                    verSubrogación(i, 1);
                    verAmpliación(i, 1);
                    verFianza(i, 1);
                }
            }            
            break;
        case "0.5": // 0.5 Tipo reducido 0.5% Todas
        case "-1":  // Exento Álava, Guipúzcoa o Vizcaya
            if ((zona === "NA") || (((zona === "AL") || (zona === "GI") || (zona === "VI")) && ((tipoDocu === "9") || (tipoDocu === "10")))) {
                // 9 PRÉSTAMO o 10 PRÉSTAMO CON AVALISTA veo importe préstamo, destinado a vivienda habitual y número de fincas
                if ((tipoDocu === "9") || (tipoDocu === "10")) {
                    verImportePrestamo(i, 1);
                    verDestinadoVH(i, 1);
                    verNumeroFincas(i, 1);
                }
            } else {
                // Álava, Guipúzcoa, Vizcaya o La Rioja
                if ((zona === "AL") || (zona === "GI") || (zona === "VI") || (zona === "LR")) // Resto de zonas aparece Tipo impositivo
                {
                    // 1 COMPRA 1ª TRANSMISIÓN (IVA) o 2 COMPRA CON SUBROGACIÓN 1ª TRANSMISIÓN (IVA)
                    if ((tipoDocu === "1") || (tipoDocu === "2")) {
                        verValorCompra(i, 1);
                        verTipoBaseImponible(i, 1);
                        if (zona === "LR")
                            aux = "Vivienda habitual: familias numerosas o minusvalidos con un grado igual o superior al 33 %."
                        else {
                            if (zona === "AL" && tipoDocu === "1" && tipoImpo === "-1")
                                aux = "Únicamente adquisición de viviendas.";
                            else {
                                if (zona === "GI" && tipoDocu === "1" && tipoImpo === "-1")
                                    aux = "Únicamente adquisición de viviendas.";
                                else
                                    aux = "Locales, naves, terrenos,... (NO viviendas)";
                            }
                        }
                        verLabelTipoImpositivo(i, 1, aux);
                        if (tipoDocu === "2") {
                            verSubrogación(i, 1);
                            verAmpliación(i, 1);
                            verFianza(i, 1);
                            if (zona !== "LR")
                                verViviendaHabitual(i, 1);
                        }
                    }
                    // 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD o 12 CANCELACIÓN DE HIPOTECA CRN
                    if ((tipoDocu === "11") || (tipoDocu === "12")) {
                        if (tipoImpo === "-1") { // Exento
                            if (zona === "AL") {
                                aux = "Destino adquisición o rehabilitación de la vivienda habitual (con expediente de rehabilitación) y esta radique en territorio alavés o refinanciación del préstamo con tal fin (hasta el saldo vivo del préstamo original).";
                            } else { aux = "Vivienda habitual."; }
                            verLabelTipoImpositivo(i, 1, aux);
                        }
                        verImporteCancelacion(i, 1);
                        verNumeroFincas(i, 1);
                        if (tipoDocu === "11")
                            verExisteTransmision(i, 1);
                    }
                }
            }
            break;
        case "2": // 2 Exento en LR           
            // 1 COMPRA 1ª TRANSMISIÓN (IVA) O 2 COMPRA CON SUBROGACIÓN 1ª TRANSMISIÓN (IVA)
            if ((tipoDocu === "1") || (tipoDocu === "2")) {
                verValorCompra(i, 1);
                verTipoBaseImponible(i, 1);
                aux = "Únicamente adquisición de viviendas.";
                verLabelTipoImpositivo(i, 1, aux);
                if (tipoDocu === "2") {
                    verSubrogación(i, 1);
                    verAmpliación(i, 1);
                    verFianza(i, 1);
                    verViviendaHabitual(i, 1);
                }
            }
            // 9 PRÉSTAMO, 10 PRÉSTAMO CON AVALISTA, 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD o 12 CANCELACIÓN DE HIPOTECA CRN
            if ((tipoDocu === "9") || (tipoDocu === "10") || (tipoDocu === "11") || (tipoDocu === "12")) {                
                aux = "Destino adquisición de vivienda de protección oficial (VPO) o préstamos del SAREB.";
                verLabelTipoImpositivo(i, 1, aux);
                verImportePrestamo(i, 1);
                if ((tipoDocu === "9") || (tipoDocu === "10"))
                    verDestinadoVH(i, 1);
                if (tipoDocu === "11")
                    verExisteTransmision(i, 1);
                verNumeroFincas(i, 1);
            }            
            break;
        case "4":
            // En Navarra
            if (zona === "NA") {
                // 6 COMPRA 2ª TRANSMISIÓN (USADA) o 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN(USADA)
                if ((tipoDocu === "6") || (tipoDocu === "7")) {
                    verValorCompra(i, 1);
                    verTipoBaseImponible(i, 1);                    
                }                
                // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA) 6, 5
                if (tipoDocu === "7") {                 
                    verSubrogación(i, 1);
                    verAmpliación(i, 1);
                    verFianza(i, 1);
                }
            }
            // En La Rioja
            if (zona === "LR") {
                // 1 COMPRA 1ª TRANSMISIÓN (IVA)
                if ((tipoDocu === "1")) {
                    verValorCompra(i, 1);
                    verTipoBaseImponible(i, 1);
                }                
                // 9 PRÉSTAMO o 10 PRÉSTAMO CON AVALISTA
                if ((tipoDocu === "9") || (tipoDocu === "10")) {
                    verImportePrestamo(i, 1);
                    verDestinadoVH(i, 1);
                    verNumeroFincas(i, 1);
                }
                verBotonCalcular(i, 1);                
            }
            if ((zona === "AL") || (zona === "GI") || (zona === "VI")) // Resto de zonas aparece Tipo impositivo
            {
                verValorCompra(i, 1);
                // 6 COMPRA 2ª TRANSMISIÓN (USADA)
                if (tipoDocu === "6") {
                    aux = "Tipo General 4 % transmision de viviendas (incluido maximo dos plazas de garaje).";
                    verLabelTipoImpositivo(i, 1, aux);
                    // En Vizcaya mostramos valor mínimo
                    if (zona === "VI")
                        verValorMinimo(i, 1);
                } else {
                    verSubrogación(i, 1);
                    verAmpliación(i, 1);
                    verFianza(i, 1);
                    verTipoBaseImponible(i, 1);
                    aux = "Transmisión de viviendas (incluido máximo dos plazas de garaje).";
                    verLabelTipoImpositivo(i, 1, aux);
                }
            }                            
            break;
        case "1.5":
            if (zona === "LR") {
                if (tipoDocu === "6") { // 6 COMPRA 2ª TRANSMISIÓN (USADA)
                    verValorCompra(i, 1);
                    verTipoBaseImponible(i, 1);
                    aux = "Renuncia a la exencion del IVA. En las que se haya procedido a renunciar a la exención del Impuesto sobre el Valor Añadido, tal y como se contiene en el artículo 20. 2 de la Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido.";
                    verLabelTipoImpositivo(i, 1, aux);
                }
                // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN(USADA)
                if (tipoDocu === "7") {
                    verValorCompra(i, 1);
                    verTipoBaseImponible(i, 1);
                    aux = "Renuncia a la exencion del IVA. En las que se haya procedido a renunciar a la exención del Impuesto sobre el Valor Añadido, tal y como se contiene en el artículo 20. 2 de la Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido.";
                    verLabelTipoImpositivo(i, 1, aux);
                    verSubrogación(i, 1);
                    verAmpliación(i, 1);
                    verFianza(i, 1);
                }
            }
            break;
        case "2.5":
            if ((zona === "AL") || (zona === "GI") || (zona === "VI")) // Resto de zonas aparece Tipo impositivo
            {
                verValorCompra(i, 1);
                if (tipoDocu === "6") {
                    aux = "Tipo reducido 2,5 % * Vivienda habitual * Superficie construida no superior a 120 m2, así como sus garajes (maximo 2) y anexos, viviendas unifamiliares parcela maxima de 300 m2 o *Familias numerosas.";
                    if (zona === "GI")
                        aux = aux + " Imprescindible no haber aplicado el tipo reducido del 2,5% con anterioridad.";
                    if (zona === "VI")
                        verValorMinimo(i, 1);
                    verLabelTipoImpositivo(i, 1, aux);
                } else {
                    verSubrogación(i, 1);
                    verAmpliación(i, 1);
                    verFianza(i, 1);
                    verTipoBaseImponible(i, 1);
                    if (zona === "AL")
                        aux = "Vivienda habitual. Superficie construida no superior a 120 m² según catastro, así como sus garajes (máximo 2) y anexos, viviendas unifamiliares parcela máxima de 300 m², o Familias numerosas.";
                    if (zona === "GI")
                        aux = "Vivienda habitual. Superficie construida no superior a 120 m² ó 96 m² útiles, así como sus garajes (máximo 2) y anexos, viviendas unifamiliares parcela máxima de 300 m², o Familias numerosas. Imprescindible no haber aplicado el tipo reducido del 2,5% con anterioridad.";
                    if (zona === "VI")
                        aux = "Vivienda habitual. Superficie construida no superior a 120 m² ó 96 m² útiles, así como sus garajes (máximo 2) y anexos, viviendas unifamiliares parcela máxima de 300 m², o Familias numerosas. Imprescindible no haber aplicado el tipo reducido del 2,5% con anterioridad.";
                    verLabelTipoImpositivo(i, 1, aux);
                }
            }
            break;
        case "7":
            // ALAVA, GUIPUZCOA, VIZCAYA O LA RIOJA
            if ((zona === "AL") || (zona === "GI") || (zona === "VI") || (zona === "LR")) {
                verValorCompra(i, 1);
                // 6 COMPRA 2ª TRANSMISIÓN (USADA)
                if (tipoDocu === "6") {
                    aux = "Tipo General 7 % transmision de inmuebles ( locales, solares, etc) excepto viviendas.";
                    verLabelTipoImpositivo(i, 1, aux);
                    if (zona === "VI")
                        verValorMinimo(i, 1);
                } else { // Resto de documentos
                    verSubrogación(i, 1);
                    verAmpliación(i, 1);
                    verFianza(i, 1);
                    verTipoBaseImponible(i, 1);
                    aux = "Transmisión de inmuebles (locales, solares, etc.) excepto viviendas.";
                    verLabelTipoImpositivo(i, 1, aux);
                }
            }
            // Para La Rioja
            if (zona === "LR") {
                verValorCompra(i, 1);
                verTipoBaseImponible(i, 1);
            }
            break;
        default:                        
    }    

    // Si hay tipo impositivo, para 12 CANCELACIÓN DE HIPOTECA CRN/RK y 19 CANCELACIÓN NOTARIAL muestro el acuerdo
    if ((tipoImpo !== "0") && ((tipoDocu === "12") || (tipoDocu === "19"))) {
        verNumeroAcuerdo(i, 1);        
    }

    // Si hay tipo impositivo, para 9 PRÉSTAMO, 10 PRÉSTAMO CON AVALISTA y 6 COMPRA 2ª TRANSMISIÓN (USADA) muestro el botón de calcular y el de simular
    if ((tipoImpo !== "0") && ((tipoDocu === "9") || (tipoDocu === "10") || (tipoDocu === "6"))) //9 PRÉSTAMO, 10 PRÉSTAMO CON AVALISTA    
        verBotonCalcular(i, 1);    
}

// ¿Existe Transmisión Previa?
function cambiarTransPrev(i) {

    transPrev = $("#selectTransPrev" + i).val();

    verTramitaIngsa(i, 0);
    verTitularCarga(i, 0);
    verDNICarga(i, 0);
    verEntidadFinanciera(i, 0);

    if (transPrev !== "") {
        // Si existe transmisión previa mostramos el desplegable de si ¿Tramita INGSA?
        // el dato Titular de la Carga y DNI de la Carga
        if (transPrev === "Si") {
            verTramitaIngsa(i, 1); // ¿Tramita INGSA? SI/NO No hace nada    
            verTitularCarga(i, 1);
            verDNICarga(i, 1);
        }
        // En ambos casos, seleccionen si tramita o no Mostraremos la entidad finaciera, el botón de calcular y de simular
        verEntidadFinanciera(i, 1);
        verBotonCalcular(i, 1);        
    }
}

// Han marcado Cancelación Parcial en el documento Cancelación Notarial
// Se mostrará o no el dato de Nº de Finca
function mostrarNfinca(i) {

    const tipoCancelacion = $("#selectTipoCancela" + i).val();        

    switch (tipoCancelacion) {
        case "0": // Sin seleccionar
            $("#selectTipoCancelaH" + i).val(" - Selecciona un tipo de documento -");
            verNFinca(i, 0);
            break;
        case "1": // Cancelación Total
            $("#selectTipoCancelaH" + i).val($("#selectTipoCancela" + i + " option:selected").text());
            verNFinca(i, 0);
            break;
        case "2": // Cancelación Parcial, aquí sería la única opción en la que se vería este dato
            $("#selectTipoCancelaH" + i).val($("#selectTipoCancela" + i + " option:selected").text());
            verNFinca(i, 1);
            break;        
    }    
}

// **** FUNCIONES ****

// Borra siulación dentro de la página
function borroelemento(a) {
    $(a).remove();
    nSimulador = nSimulador - 1;
}

// Limpa los datos para volver a simular
function volverempezar() {
    vaciarcabecera();
    $("#tabcalculos").addClass("hidden");
        
    for (var i = 1; i < 10; i += 1) {
        if ($("#calculos" + i).length > 0) {
            if(i==1)
                $("#calculos" + i).addClass("hidden");
            else
                $("#calculos" + i).remove();    
        }
    }

    document.getElementsByTagName("footer")[0].style.position = 'inherit';
    $("#selectZona").val("");
    for (var i = 1; i < 11; i += 1) {
        vaciarCalculo(i);
    }
    verImpCalculo(0);
}

// Limpia los datos de la cabecera de la simulación
function vaciarcabecera() {
    $("#nomSoli").val("");
    $("#dniSoli").val("");    
    $("#acoLey").val("");
    $("#textoAC").addClass("hidden");
    $("#nomNota").val("");
    $("#cuenta1").val("");
    $("#cuenta2").val("");
    $("#cuenta3").val("");
    $("#cuenta4").val("");
    $("#SelectZona").val("");
    $("#obsSimu").val("");
}

// Al pulsar el aspa en la simulación borrará la sección correspondiente
$('body #contenedorSecciones').on('click', 'a', function () {
    var ancla = $(this).attr('id');
    ancla = ancla.replace('aspa', 'calculos');
    ancla = '#' + ancla;
    $(ancla).remove();
    nSimulador = nSimulador - 1;
})

// Duplico la primera sección de simulación
// y añado la funcionalidad al botón de borrar

function nuevaSimulacion() {
    
    if (nSimulador - 1 > 0) {
        var ultima = nSimulador - 1;
        ultima = "#selectDocu" + ultima;
    }

    if (($(ultima).val() === "undefined") || ($(ultima).val() === "0")) {
        bootbox.alert({
            message: 'No puede añadir simulación sin haber realizado la anterior'
        });
    } else {
        // Si el documento es cancelación notarial no se podrá añadir otra simulación nueva
        // Si ya hay una simulación no se podrá añadir una de cancelación notarial
        //si selectDocu2
        //undefined o 0
        if ($(ultima).val() === "19") // CANCELACIÓN NOTARIAL       
            bootbox.alert({
                message: 'El tipo de documento CANCELACIÓN NOTARIAL debe ir solo en la simulación'
            });
        else {            

            var nombre = 'calculos' + nSimulador;
            var nombreid = '#calculos' + nSimulador;
            var etiqueta = '';

            // La primera no va a tener el botón de borrar visible
            $("#botoncerrar1").removeClass("novisible");
            $("#contenedorSecciones").append(
                $("#calculos1")
                    .clone()
                    .attr('id', nombre)
            );

            $("#botoncerrar1").addClass("novisible");

            //    alert($("#selectDocu2").val()); 
            // Modificamos el objeto *** botoncerrar ***    
            $(nombreid).find('#botoncerrar1').attr('id', 'botoncerrar' + nSimulador);


            // Modifico el nombre de los elementos a usar
            // Aspa botón de cerrar simulación
            var elemento = $(nombreid).find('a[name="aspa1"]');
            if (elemento.length)
                $(elemento).attr('id', 'aspa' + nSimulador);

            // Titulo de la simulación
            elemento = $(nombreid).find('h5[class="tituloPFv"]');
            if (elemento.length)
                $(elemento).text('Cálculo de provisión de fondos nº ' + nSimulador);

            // Modificamos el objeto *** Tipo de documento ***    
            $(nombreid).find(".classdocu").attr('id', 'selectDocu' + nSimulador);
            $(nombreid).find('#selectDocu' + nSimulador).attr('name', 'SelectDocu' + nSimulador);
            $(nombreid).find('#selectDocu' + nSimulador).attr('onchange', 'cambiarDocu(' + nSimulador + ');');
            $(nombreid).find('#selectDocuH1').attr('name', 'SelectDocuH' + nSimulador);
            $(nombreid).find("#selectDocuH1").attr('id', 'selectDocuH' + nSimulador);


            // Modificamos el objeto *** Importe Préstamo Original ***
            $(nombreid).find("#fgvalPreO1").attr('id', 'fgvalPreO' + nSimulador);
            $(nombreid).find('#valPreO1').attr('name', 'ValPreO' + nSimulador);
            $(nombreid).find("#valPreO1").attr('id', 'valPreO' + nSimulador);

            // Modificamos el objeto *** Tipo impositivo ***            
            $(nombreid).find("#fgselectTipoIM1").attr('id', 'fgselectTipoIM' + nSimulador);
            $(nombreid).find('#selectTipoIM1').attr('name', 'SelectTipoIM' + nSimulador);
            $(nombreid).find("#selectTipoIM1").attr('id', 'selectTipoIM' + nSimulador);
            $(nombreid).find("#fglblTI1").attr('id', 'fglblTI' + nSimulador);
            $(nombreid).find("#lblTI1").attr('id', 'lblTI' + nSimulador);
            $(nombreid).find('#selectTipoIM' + nSimulador).attr('onchange', 'cambiarTipoImp(' + nSimulador + ');');
            $(nombreid).find('#selectTipoIMH1').attr('name', 'SelectTipoIMH' + nSimulador);
            $(nombreid).find("#selectTipoIMH1").attr('id', 'selectTipoIMH' + nSimulador);

            // Modificamos el objeto *** Valor Compra ***
            $(nombreid).find("#fgvalCompra1").attr('id', 'fgvalCompra' + nSimulador);
            $(nombreid).find('#valCompra1').attr('name', 'ValCompra' + nSimulador);
            $(nombreid).find("#valCompra1").attr('id', 'valCompra' + nSimulador);

            // Modificamos el objeto *** Valor Mínimo ***
            $(nombreid).find("#fgvalMinimo1").attr('id', 'fgvalMinimo' + nSimulador);
            $(nombreid).find('#valMinimo1').attr('name', 'ValMinimo' + nSimulador);
            $(nombreid).find("#valMinimo1").attr('id', 'valMinimo' + nSimulador);

            // Modificamos el objeto *** Valor Adquisición ***
            $(nombreid).find("#fgvalAdquisi1").attr('id', 'fgvalAdquisi' + nSimulador);
            $(nombreid).find('#valAdquisi1').attr('name', 'ValAdquisi' + nSimulador);
            $(nombreid).find("#valAdquisi1").attr('id', 'valAdquisi' + nSimulador);

            // Modificamos el objeto *** Importe Subrogación ***
            $(nombreid).find("#fgvalSubro1").attr('id', 'fgvalSubro' + nSimulador);
            $(nombreid).find('#valSubro1').attr('name', 'ValSubro' + nSimulador);
            $(nombreid).find("#valSubro1").attr('id', 'valSubro' + nSimulador);

            // Modificamos el objeto *** Importe Ampliación ***
            $(nombreid).find("#fgvalAmpli1").attr('id', 'fgvalAmpli' + nSimulador);
            $(nombreid).find('#valAmpli1').attr('name', 'ValAmpli' + nSimulador);
            $(nombreid).find("#valAmpli1").attr('id', 'valAmpli' + nSimulador);

            // Modificamos el objeto *** Importe Fianza ***
            $(nombreid).find("#fgvalFianza1").attr('id', 'fgvalFianza' + nSimulador);
            $(nombreid).find('#valFianza1').attr('name', 'ValFianza' + nSimulador);
            $(nombreid).find("#valFianza1").attr('id', 'valFianza' + nSimulador);

            // Modificamos el objeto *** Valor Obra Nueva ***
            $(nombreid).find("#fgvalObraN1").attr('id', 'fgvalObraN' + nSimulador);
            $(nombreid).find('#valObraN1').attr('name', 'ValObraN' + nSimulador);
            $(nombreid).find("#valObraN1").attr('id', 'valObraN' + nSimulador);

            // Modificamos el objeto *** División Propiedad Horizontal ***
            $(nombreid).find("#fgvalDivi1").attr('id', 'fgvalDivi' + nSimulador);
            $(nombreid).find('#valDivi1').attr('name', 'ValDivi' + nSimulador);
            $(nombreid).find("#valDivi1").attr('id', 'valDivi' + nSimulador);

            // Modificamos el objeto *** Importe Préstamo ***
            $(nombreid).find("#fgvalPre1").attr('id', 'fgvalPre' + nSimulador);
            $(nombreid).find('#valPre1').attr('name', 'ValPre' + nSimulador);
            $(nombreid).find("#valPre1").attr('id', 'valPre' + nSimulador);

            // Modificamos el objeto *** Destinado a la adquisición de su vivienda habitual ***
            $(nombreid).find("#fgvalDesVH1").attr('id', 'fgvalDesVH' + nSimulador);
            $(nombreid).find('#valDesVH1').attr('name', 'ValDesVH' + nSimulador);
            $(nombreid).find("#valDesVH1").attr('id', 'valDesVH' + nSimulador);
            $(nombreid).find('#valDesVHH1').attr('name', 'ValDesVHH' + nSimulador);
            $(nombreid).find("#valDesVHH1").attr('id', 'valDesVHH' + nSimulador);

            // Si no hacía esto no funcionaban los iChek
            etiqueta = '#fgvalDesVH' + nSimulador + ' fieldset';
            $(etiqueta).remove();
            etiqueta = '#fgvalDesVH' + nSimulador;
            $(etiqueta).append('<fieldset class="checkbox"><label style="margin-right:0.6rem;">Destinado a la adquisición de su vivienda habitual</label><input type="checkbox" id="valDesVH' + nSimulador + '" name="ValDesVH' + nSimulador + '"></fieldset>');
            $('input').iCheck({
                checkboxClass: 'icheckbox_flat-green'
            });

            // Modificamos el objeto *** Importe Cancelación ***
            $(nombreid).find("#fgvalCan1").attr('id', 'fgvalCan' + nSimulador);
            $(nombreid).find('#valCan1').attr('name', 'ValCan' + nSimulador);
            $(nombreid).find("#valCan1").attr('id', 'valCan' + nSimulador);

            // Modificamos el objeto *** Número Acuerdo ***
            $(nombreid).find("#fgvalNAcuerdo1").attr('id', 'fgvalNAcuerdo' + nSimulador);
            $(nombreid).find('#valNAcuerdo1').attr('name', 'NAcuerdo' + nSimulador);
            $(nombreid).find("#valNAcuerdo1").attr('id', 'valNAcuerdo' + nSimulador);

            // Modificamos el objeto *** Cancelación ***
            $(nombreid).find("#fgselectTipoCancela1").attr('id', 'fgselectTipoCancela' + nSimulador);
            $(nombreid).find('#selectTipoCancela1').attr('name', 'SelectTipoCancela' + nSimulador);
            $(nombreid).find("#selectTipoCancela1").attr('id', 'SelectTipoCancela' + nSimulador);
            $(nombreid).find('#selectTipoCancelaH1').attr('name', 'SelectTipoCancelaH' + nSimulador);
            $(nombreid).find("#selectTipoCancelaH1").attr('id', 'selectTipoCancelaH' + nSimulador);
            $(nombreid).find('#selectTipoBI' + nSimulador).attr('onchange', 'mostrarNfinca(' + nSimulador + ');');


            // Modificamos el objeto *** Número Finca ***
            $(nombreid).find("#fgvalNFinca1").attr('id', 'fgvalNFinca' + nSimulador);
            $(nombreid).find('#valNFinca1').attr('name', 'NFinca' + nSimulador);
            $(nombreid).find("#valNFinca1").attr('id', 'valNFinca' + nSimulador);

            // Modificamos el objeto *** Número Teléfono ***
            $(nombreid).find("#fgvalNTelefono1").attr('id', 'fgvalNTelefono' + nSimulador);
            $(nombreid).find('#valNTelefono1').attr('name', 'NTelefono' + nSimulador);
            $(nombreid).find("#valNTelefono1").attr('id', 'valNTelefono' + nSimulador);

            // Modificamos el objeto *** Valor Póliza ***
            $(nombreid).find("#fgvalPol1").attr('id', 'fgvalPol' + nSimulador);
            $(nombreid).find('#valPol1').attr('name', 'ValPol' + nSimulador);
            $(nombreid).find("#valPol1").attr('id', 'valPol' + nSimulador);

            // Modificamos el objeto *** Es Vivienda Habitual ***
            //$(nombreid).find('#selectVivHab1').attr('name', 'SelectVivHab1' + nSimulador);
            //$(nombreid).find("#selectVivHab1").attr('id', 'selectVivHab' + nSimulador);        

            // Modificamos el objeto *** Destinado a la adquisición de su vivienda habitual (check) ***
            $(nombreid).find("#fgvalVivHab1").attr('id', 'fgvalVivHab' + nSimulador);
            $(nombreid).find('#valVivHab1').attr('name', 'ValVivHab' + nSimulador);
            $(nombreid).find("#valVivHab1").attr('id', 'valVivHab' + nSimulador);
            $(nombreid).find('#valVivHabH1').attr('name', 'ValVivHabH' + nSimulador);
            $(nombreid).find("#valVivHabH1").attr('id', 'valVivHabH' + nSimulador);

            // Si no hacía esto no funcionaban los iChek
            etiqueta = '#fgvalVivHab' + nSimulador + ' fieldset';
            $(etiqueta).remove();
            etiqueta = '#fgvalVivHab' + nSimulador;
            $(etiqueta).append('<fieldset class="checkbox"><label style="margin-right:0.6rem;">Vivienda Habitual</label><input type="checkbox" id="valVivHab' + nSimulador + '" name="ValVivHab' + nSimulador + '"></fieldset>');
            $('input').iCheck({
                checkboxClass: 'icheckbox_flat-green'
            });

            // Modificamos el objeto *** Tipo Base imponible ***
            $(nombreid).find("#fgselectTipoBI1").attr('id', 'fgselectTipoBI' + nSimulador);
            $(nombreid).find('#selectTipoBI1').attr('name', 'SelectTipoBI' + nSimulador);
            $(nombreid).find("#selectTipoBI1").attr('id', 'selectTipoBI' + nSimulador);
            $(nombreid).find('#selectTipoBIH1').attr('name', 'SelectTipoBIH' + nSimulador);
            $(nombreid).find("#selectTipoBIH1").attr('id', 'selectTipoBIH' + nSimulador);
            $(nombreid).find('#selectTipoBI' + nSimulador).attr('onchange', 'cambiarBI(' + nSimulador + ');');

            // Modificamos el objeto *** Base Imponible ***
            $(nombreid).find("#fgvalBI1").attr('id', 'fgvalBI' + nSimulador);
            $(nombreid).find('#valBI1').attr('name', 'ValBI' + nSimulador);
            $(nombreid).find("#valBI1").attr('id', 'valBI' + nSimulador);

            // Modificamos el objeto *** Única Vivienda ***
            $(nombreid).find("#fgvalUniViv1").attr('id', 'fgvalUniViv' + nSimulador);
            $(nombreid).find('#valUniViv1').attr('name', 'ValUniViv' + nSimulador);
            $(nombreid).find("#valUniViv1").attr('id', 'valUniViv' + nSimulador);
            $(nombreid).find('#valUniVivH1').attr('name', 'ValUniVivH' + nSimulador);
            $(nombreid).find("#valUniVivH1").attr('id', 'valUniVivH' + nSimulador);

            // Si no hacía esto no funcionaban los iChek
            etiqueta = '#fgvalUniViv' + nSimulador + ' fieldset';
            $(etiqueta).remove();
            etiqueta = '#fgvalUniViv' + nSimulador;
            $(etiqueta).append('<fieldset class="checkbox"><label style="margin-right:0.6rem;">Única Vivienda: </label><input type="checkbox" id="valUniViv' + nSimulador + '" name="ValUniViv' + nSimulador + '"></fieldset>');
            $('input').iCheck({
                checkboxClass: 'icheckbox_flat-green'
            });

            // Modificamos el objeto *** Liberación deudor ***
            $(nombreid).find("#fgvalLibera1").attr('id', 'fgvalLibera' + nSimulador);
            $(nombreid).find('#valLibera1').attr('name', 'ValLibera' + nSimulador);
            $(nombreid).find("#valLibera1").attr('id', 'valLibera' + nSimulador);

            // Modificamos el objeto *** Número Fincas Registrales ***
            $(nombreid).find("#fgselectFinca1").attr('id', 'fgselectFinca' + nSimulador);
            $(nombreid).find('#selectFinca1').attr('name', 'SelectFinca' + nSimulador);
            $(nombreid).find("#selectFinca1").attr('id', 'selectFinca' + nSimulador);

            // Modificamos el objeto *** ¿Existe Transmisión Previa? ***
            $(nombreid).find("#fgselectTransPrev1").attr('id', 'fgselectTransPrev' + nSimulador);
            $(nombreid).find('#selectTransPrev1').attr('name', 'SelectTransPrev' + nSimulador);
            $(nombreid).find("#selectTransPrev1").attr('id', 'selectTransPrev' + nSimulador);
            $(nombreid).find('#selectTransPrev' + nSimulador).attr('onchange', 'cambiarTransPrev(' + nSimulador + ');');

            // Modificamos el objeto *** ¿Tramita INGSA? SI ***
            $(nombreid).find("#fgselectTramINGSA1").attr('id', 'fgselectTramINGSA' + nSimulador);
            $(nombreid).find('#selectTramINGSA1').attr('name', 'SelectTramINGSA' + nSimulador);
            $(nombreid).find("#selectTramINGSA1").attr('id', 'selectTramINGSA' + nSimulador);

            // Modificamos el objeto *** Titular de la carga ***
            $(nombreid).find("#fgtitCarga1").attr('id', 'fgtitCarga' + nSimulador);
            $(nombreid).find('#titCarga1').attr('name', 'TitCarga' + nSimulador);
            $(nombreid).find("#titCarga1").attr('id', 'titCarga' + nSimulador);

            // Modificamos el objeto *** DNI ***
            $(nombreid).find("#fgDNICarga1").attr('id', 'fgDNICarga' + nSimulador);
            $(nombreid).find('#DNICarga1').attr('name', 'DNICarga' + nSimulador);
            $(nombreid).find("#DNICarga1").attr('id', 'DNICarga' + nSimulador);

            // Modificamos el objeto *** Entidad financiera ***
            $(nombreid).find("#fgentFin1").attr('id', 'fgentFin' + nSimulador);
            $(nombreid).find('#entFin1').attr('name', 'EntFin' + nSimulador);
            $(nombreid).find("#entFin1").attr('id', 'entFin' + nSimulador);

            // Modificamos el objeto *** Botón Adjunto *** btnAdjunto1            
            $(nombreid).find("#btnAdjunto1").attr('id', 'btnAdjunto' + nSimulador);
            $(nombreid).find('.classAdjunto').attr('onclick', 'hacerAdjunto(' + nSimulador + ');');                        

            // Modificamos el objeto *** Botón Calcular ***
            $(nombreid).find("#Calcular1").attr('id', 'Calcular' + nSimulador);
            $(nombreid).find('.classCalcular').attr('onclick', 'hacerCalculo(' + nSimulador + ');');           

            // Modificamos el objeto *** Tabla de resultados ***
            $(nombreid).find("#TablaResultados1").attr('id', 'TablaResultados' + nSimulador);
            $(nombreid).find('#celImpNota1').attr('name', 'CelImpNota' + nSimulador);
            $(nombreid).find("#celImpNota1").attr('id', 'celImpNota' + nSimulador);
            $(nombreid).find('#celImpImpu1').attr('name', 'CelImpImpu' + nSimulador);
            $(nombreid).find("#celImpImpu1").attr('id', 'celImpImpu' + nSimulador);
            $(nombreid).find('#celImpRegi1').attr('name', 'CelImpRegi' + nSimulador);
            $(nombreid).find("#celImpRegi1").attr('id', 'celImpRegi' + nSimulador);
            $(nombreid).find('#celImpGest1').attr('name', 'CelImpGest' + nSimulador);
            $(nombreid).find("#celImpGest1").attr('id', 'celImpGest' + nSimulador);
            $(nombreid).find('#celImpTota1').attr('name', 'CelImpTota' + nSimulador);
            $(nombreid).find("#celImpTota1").attr('id', 'celImpTota' + nSimulador);

            // Modificamos el objeto *** Tabla de resultados CRN ***
            $(nombreid).find("#TablaResultadosCRN1").attr('id', 'TablaResultadosCRN' + nSimulador);
            $(nombreid).find('#celImpNotaCRN1').attr('name', 'CelImpNotaCRN' + nSimulador);
            $(nombreid).find("#celImpNotaCRN1").attr('id', 'celImpNotaCRN' + nSimulador);
            $(nombreid).find('#celImpImpuCRN1').attr('name', 'CelImpImpuCRN' + nSimulador);
            $(nombreid).find("#celImpImpuCRN1").attr('id', 'celImpImpuCRN' + nSimulador);
            $(nombreid).find("#celImpRegiCRN1").attr('name', 'CelImpRegiCRN' + nSimulador);
            $(nombreid).find("#celImpRegiCRN1").attr('id', 'celImpRegiCRN' + nSimulador);
            $(nombreid).find("#celImpGestCRN1").attr('name', 'CelImpGestCRN' + nSimulador);
            $(nombreid).find("#celImpGestCRN1").attr('id', 'celImpGestCRN' + nSimulador);
            $(nombreid).find("#celImpTotaCRN1").attr('name', 'CelImpTotaCRN' + nSimulador);
            $(nombreid).find("#celImpTotaCRN1").attr('id', 'celImpTotaCRN' + nSimulador);

            // Vaciamos los datos de la nueva simulación
            vaciarCalculo(nSimulador);

            nSimulador = nSimulador + 1;
        }
    }
}

// Vacía todo el cálculo realizado
function vaciarCalculo(i) {

    elemento = '#selectDocu';
    elemento = elemento + i
    elemento = elemento.trim();
    $(elemento).val("0");

    elemento = '#selectDocuH';
    elemento = elemento + i
    elemento = elemento.trim();
    $(elemento).val("");

    // Añadir botón Adjunto que se va borrando    
    if ($(".classAdjunto").length > 0) {
        // hacer algo aquí si el elemento existe
    } else {
        $("#TablaResultadosCRN1").after(
            "<div id='btnAdjunto1' class='derecha novisible'><button type='submit' class='btn btn-outline-primary btn-min-width mr-1 mb-1 classAdjunto' title='Adjunto' onclick='hacerAdjunto(1);'>Adjunto</button></div >"
        );
    }
    
    vaciarCambioTipoDocumento(i);
}

// Vacía los datos necesarios al cambiar de documento
function vaciarCambioTipoDocumento(i) {

    verImportePrestamoO(i, 0);
    verTipoImpositivo(i, 0);
    verLabelTipoImpositivo(i, 0, "");
    verValorCompra(i, 0);
    verValorMinimo(i, 0);
    verValorAdquisicion(i, 0);
    verSubrogación(i, 0);
    verAmpliación(i, 0);
    verFianza(i, 0);
    verValorObraNueva(i, 0);
    verDivision(i, 0);
    verImportePrestamo(i, 0);
    verDestinadoVH(i, 0);
    verImporteCancelacion(i, 0);
    verValorPoliza(i, 0);
    verTipoBaseImponible(i, 0);
    vaciarTipoBaseImponible(i); // unica vivienda, vivienda habitual, base imponible, numero fincas    
    vaciarCambioBI(i);
    verImporteLiberacionD(i, 0);
    verExisteTransmision(i, 0);
    verTramitaIngsa(i, 0);
    verTitularCarga(i, 0);
    verDNICarga(i, 0);
    verEntidadFinanciera(i, 0);
    verNumeroAcuerdo(i, 0);
    verTipoCancelacion(i, 0);
    verNFinca(i, 0);
    verNumeroTelefono(i, 0);

    mostrarTabla(i, 0);
    mostrarTablaCRN(i, 0);
    verBotonCalcular(i, 0);
    verBotonAdjunto(i, 0);
    verBotonSimulacion(0);
}

// Vacía los datos relacionados con la base imponible
function vaciarTipoBaseImponible(i) {
    verBaseImponible(i, 0);
    verUnicaVivienda(i, 0);
    //vaciarEsViviendaHabitual(i);
    verViviendaHabitual(i, 0); // se desmarca
    verNumeroFincas(i, 0);
    $("#selectTipoBI" + i).val('0');
}

// Se dibula la pantalla según el tipo de documento y la zona
function montarPorTipoDocumento(i, zona, tipoDocu) {

    agregarfincas(i, zona, tipoDocu);
    
    switch (tipoDocu) {
        case "1": // 1 COMPRA 1ª TRANSMISIÓN (IVA)                        
            if (zona === "NA") // Si es Navarra aparece el Valor de Compra y Tipo base imponible
            {
                verValorCompra(i, 1);
                verTipoBaseImponible(i, 1); // Es la misma para todos los documentos                
            }
            if ((zona === "AL") || (zona === "GI") || (zona === "VI") || (zona === "LR")) // Resto de zonas aparece Tipo impositivo
            {
                verTipoImpositivo(i, 1, zona);
            }
            break;
        case "2": // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
            if (zona === "NA") {
                verValorCompra(i, 1);
                verSubrogación(i, 1);
                verAmpliación(i, 1);
                verFianza(i, 1);
                verTipoBaseImponible(i, 1); // Es la misma para todos los documentos
            }
            if ((zona === "AL") || (zona === "GI") || (zona === "VI") || (zona === "LR")) // Resto de zonas aparece Tipo impositivo
            {
                verTipoImpositivo(i, 1, zona);
            }
            break;
        case "4": // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)                        
            verValorCompra(i, 1);
            verSubrogación(i, 1);
            verAmpliación(i, 1);
            verFianza(i, 1);
            verTipoBaseImponible(i, 1); // Es la misma para todos los documentos
            if ((zona === "AL") || (zona === "GI")) {
                verUnicaVivienda(i, 1);
                verNumeroFincas(i, 1);
            }
            break;
        case "8": // 8 EXTINCIÓN DE CONDOMINIO (VIVIENDA)                        
            verValorCompra(i, 1);
            if (zona === "AL")
                verValorAdquisicion(i, 1);            
            verTipoBaseImponible(i, 1); // Es la misma para todos los documentos            
            break;
        case "3": // 3 COMPRA VPO 1ª TRANSMISIÓN(IVA)                        
            verValorCompra(i, 1);
            verNumeroFincas(i, 1);
            verBotonCalcular(i, 1);            
            break;
        case "5": // 5 OBRA NUEVA            
            verValorObraNueva(i, 1);
            verDivision(i, 1);
            verTipoBaseImponible(i, 1);
            break;
        case "6": // 6 COMPRA 2ª TRANSMISIÓN (USADA)
        case "7": // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA)
        case "9": // 9 PRÉSTAMO
        case "10": // 10 PRÉSTAMO CON AVALISTA            
            verTipoImpositivo(i, 1, zona);
            break;
        case "11": // 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD
        case "12": // 12 CANCELACIÓN DE HIPOTECA CRN            
            if ((zona === "NA") || (zona === "LR")) {
                verImporteCancelacion(i, 1);
                if (tipoDocu === "12")
                    verNumeroAcuerdo(i, 1);                                 
                verNumeroFincas(i, 1);
                if (tipoDocu === "11")
                    verExisteTransmision(i, 1);
            }
            if ((zona === "AL") || (zona === "GI") || (zona === "VI")) {
                verTipoImpositivo(i, 1, zona);
            }
            break;
        case "13": // 13 SUBROGACIÓN DE HIPOTECA                        
            verSubrogación(i, 1);
            verFianza(i, 1);
            verDestinadoVH(i, 1);
            verNumeroFincas(i, 1);
            break;
        case "14": // 14 CANCELACIÓN DE EMBARGO            
            verImporteCancelacion(i, 1);
            verNumeroFincas(i, 1);
            break;
        case "15": // 15 NOVACIÓN DE PRÉSTAMO
        case "16": // 16 NOVACIÓN DE PRÉSTAMO CON AMPLIACIÓN            
            verImportePrestamoO(i, 1);
            if (tipoDocu === "16")
                verAmpliación(i, 1);
            verFianza(i, 1);
            verImporteLiberacionD(i, 1);
            verNumeroFincas(i, 1);
            verBotonCalcular(i, 1);            
            break;
        case "17": // 17 FIN DE OBRA            
            verValorObraNueva(i, 1);
            verNumeroFincas(i, 1);
            verBotonCalcular(i, 1);            
            break;
        case "18": // 18 PÓLIZA PRÉSTAMO / AFIANZAMIENTO            
            verValorPoliza(i, 1);            
            verBotonCalcular(i, 1);            
            break;
        case "19": // 19 CANCELACIÓN NOTARIAL
            verImporteCancelacion(i, 1);
            verNumeroAcuerdo(i, 1);
            verTipoCancelacion(i, 1);
            verNFinca(i, 0); 
            verNumeroTelefono(i, 1);
            verBotonCalcular(i, 1);            
            break;
        default:
    }
}

// Valor de Compra
function verValorCompra(i, ver) {
    $("#valCompra" + i).val("");
    if (ver) {
        $("#fgvalCompra" + i).removeClass("novisible");
        $("#fgvalCompra" + i).addClass("sivisible");
    } else {
        $("#fgvalCompra" + i).removeClass("sivisible");
        $("#fgvalCompra" + i).addClass("novisible");
    }
}

// Valor Mínimo
function verValorMinimo(i, ver) {
    $("#valMinimo" + i).val("");
    if (ver) {
        $("#fgvalMinimo" + i).removeClass("novisible");
        $("#fgvalMinimo" + i).addClass("sivisible");
    } else {
        $("#fgvalMinimo" + i).removeClass("sivisible");
        $("#fgvalMinimo" + i).addClass("novisible");
    }
}

// Valor de Adquisición
function verValorAdquisicion(i, ver) {
    $("#valAdquisi" + i).val("");
    if (ver) {
        $("#fgvalAdquisi" + i).removeClass("novisible");
        $("#fgvalAdquisi" + i).addClass("sivisible");
    } else {
        $("#fgvalAdquisi" + i).removeClass("sivisible");
        $("#fgvalAdquisi" + i).addClass("novisible");
    }
}

// Subrogración
function verSubrogación(i, ver) {
    $("#valSubro" + i).val("");
    if (ver) {
        $("#fgvalSubro" + i).removeClass("novisible");
        $("#fgvalSubro" + i).addClass("sivisible");
    } else {
        $("#fgvalSubro" + i).removeClass("sivisible");
        $("#fgvalSubro" + i).addClass("novisible");
    }
}

// Ampliación
function verAmpliación(i, ver) {
    $("#valAmpli" + i).val("");
    if (ver) {
        $("#fgvalAmpli" + i).removeClass("novisible");
        $("#fgvalAmpli" + i).addClass("sivisible");
    } else {
        $("#fgvalAmpli" + i).removeClass("sivisible");
        $("#fgvalAmpli" + i).addClass("novisible");
    }
}

// Fianza
function verFianza(i, ver) {
    $("#valFianza" + i).val("");
    if (ver) {
        $("#fgvalFianza" + i).removeClass("novisible");
        $("#fgvalFianza" + i).addClass("sivisible");
    } else {
        $("#fgvalFianza" + i).removeClass("sivisible");
        $("#fgvalFianza" + i).addClass("novisible");
    }
}

// NumeroFincas
function verNumeroFincas(i, ver) {
    $("#selectFinca" + i).val("1");
    if (ver) {
        $("#fgselectFinca" + i).removeClass("novisible");
        $("#fgselectFinca" + i).addClass("sivisible");
    } else {
        $("#fgselectFinca" + i).removeClass("sivisible");
        $("#fgselectFinca" + i).addClass("novisible");
    }
}

// Unica Vivienda
function verUnicaVivienda(i, ver) {
    $("#valUniViv" + i).prop('checked', false);
    if (ver) {
        // Única vivienda
        $("#fgvalUniViv" + i).removeClass("novisible");
        $("#fgvalUniViv" + i).addClass("sivisible");
        $("#valUniVivH" + i).val("visible");
    } else {
        $("#fgvalUniViv" + i).removeClass("sivisible");
        $("#fgvalUniViv" + i).addClass("novisible");
        $("#valUniVivH" + i).val("novisible");
        $("#valUniViv" + i).parent().removeClass("checked");
        $("#valUniViv" + i).parent().removeClass("sinpuntero");
    }
}

// Vivienda Habitual
function verViviendaHabitual(i, ver) {
    $("#valVivHab" + i).prop('checked', false);
    if (ver) {
        // Vivienda Habitual
        $("#fgvalVivHab" + i).removeClass("novisible");
        $("#fgvalVivHab" + i).addClass("sivisible");
        $("#valVivHabH" + i).val("visible");
    } else {
        $("#fgvalVivHab" + i).removeClass("sivisible");
        $("#fgvalVivHab" + i).addClass("novisible");
        $("#valVivHabH" + i).val("novisible");
    }
}

// Tipo base imponible
function verTipoBaseImponible(i, ver) {
    $("#selectTipoBI" + i).val('0');
    if (ver) {
        $("#fgselectTipoBI" + i).removeClass("novisible");
        $("#fgselectTipoBI" + i).addClass("sivisible");
    } else {
        $("#fgselectTipoBI" + i).removeClass("sivisible");
        $("#fgselectTipoBI" + i).addClass("novisible");
    }
}

// Tipo Impositivo
function verTipoImpositivo(i, ver, prov) {

    var tipoDocu = $("#selectDocu" + i).val();

    $("#selectTipoIM" + i).empty();

    if (ver) {
        $("#fgselectTipoIM" + i).removeClass("novisible");
        $("#fgselectTipoIM" + i).addClass("sivisible");
        var seltipoim = document.getElementById("selectTipoIM" + i);
        var option = document.createElement('option');
        option.value = "0";
        option.text = "- Selecciona un tipo impositivo -";
        seltipoim.add(option);
        if ((prov === "AL") || (prov === "GI") || (prov === "VI") || (prov === "LR")) {
            // 1 COMPRA 1ª TRANSMISIÓN (IVA)
            // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
            // 9 PRESTAMO
            // 10 PRESTAMO CON AVALISTA
            if ((tipoDocu === "1") || (tipoDocu === "2") || (tipoDocu === "9") || (tipoDocu === "10") || (tipoDocu === "11") || (tipoDocu === "12")) {
                if (prov === "LR") {
                    option = document.createElement('option');
                    option.value = "1";
                    option.text = "Tipo general 1%";
                    seltipoim.add(option);
                    if ((tipoDocu === "9") || (tipoDocu === "10")) {                        
                        option = document.createElement('option');
                        option.value = "2";
                        option.text = "Exento";
                        seltipoim.add(option);
                    } else {                        
                        option = document.createElement('option');
                        option.value = "0.5";
                        option.text = "Tipo reducido 0.5%";
                        seltipoim.add(option);
                        option = document.createElement('option');
                        option.value = "0.4";
                        option.text = "Tipo reducido 0.4%";
                        seltipoim.add(option);
                    }
                }
                if ((prov === "AL") || (prov === "GI") || (prov === "VI")) {
                    option = document.createElement('option');
                    option.value = "0.5";
                    option.text = "Tipo general 0.5%";
                    seltipoim.add(option);
                    option = document.createElement('option');
                    option.value = "-1";
                    option.text = "Exento";
                    seltipoim.add(option);
                }
            }
            // 6 COMPRA 2ª TRANSMISIÓN (USADA)
            // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA)
            if ((tipoDocu === "6") || (tipoDocu === "7")) {
                if (prov === "LR") {
                    option = document.createElement('option');
                    option.value = "7";
                    option.text = "Tipo general 7%";
                    seltipoim.add(option);
                    option = document.createElement('option');
                    option.value = "5";
                    option.text = "Tipo reducido 5%";
                    seltipoim.add(option);
                    option = document.createElement('option');
                    option.value = "3";
                    option.text = "Tipo reducido 3%";
                    seltipoim.add(option);
                    option = document.createElement('option');
                    option.value = "1.5";
                    option.text = "Tipo reducido 1.5%";
                    seltipoim.add(option);
                }
                if ((prov === "AL") || (prov === "GI") || (prov === "VI")) {
                    option = document.createElement('option');
                    option.value = "4";
                    option.text = "Tipo general 4%";
                    seltipoim.add(option);
                    option = document.createElement('option');
                    option.value = "2.5";
                    option.text = "Tipo reducido 2.5%";
                    seltipoim.add(option);
                    option = document.createElement('option');
                    option.value = "7";
                    option.text = "Tipo reducido 7%";
                    seltipoim.add(option);
                }
            }
        }
        if (prov === "NA") {
            if ((tipoDocu === "6") || (tipoDocu === "7")) {
                // 6 COMPRA 2ª TRANSMISIÓN (USADA) 6, 5, 1
                // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA) 6, 5
                option = document.createElement('option');
                option.value = "6";
                option.text = "Tipo general 6%";
                seltipoim.add(option);
                option = document.createElement('option');
                option.value = "5";
                option.text = "Tipo reducido 5%";
                seltipoim.add(option);
                option = document.createElement('option');
                option.value = "4";
                option.text = "Tipo reducido 4%";
                seltipoim.add(option);                
                option = document.createElement('option');
                option.value = "1";
                option.text = "Tipo reducido 1%";
                seltipoim.add(option);                
            }
            if ((tipoDocu === "9") || (tipoDocu === "10")) {
                // 9 PRÉSTAMO 0.5
                // 10 PRÉSTAMO CON AVALISTA 0.5
                option = document.createElement('option');
                option.value = "0.5";
                option.text = "Tipo general 0.5%";
                seltipoim.add(option);
            }
        }
        $("#selectTipoIM" + i).val('0');
    } else {
        $("#fgselectTipoIM" + i).removeClass("sivisible");
        $("#fgselectTipoIM" + i).addClass("novisible");
    }
}

// Texto etiqueta Tipo Impositivo
function verLabelTipoImpositivo(i, ver, texto) {
    //document.getElementById(etiqueta).innerHTML = "";
    //$("#lblTI" + i).text("");
    $("#lblTI" + i).val("");
    if (ver) {
        $("#fglblTI" + i).removeClass("novisible");
        $("#fglblTI" + i).addClass("sivisible");                
        $("#lblTI" + i).val(texto);
    } else {
        $("#fglblTI" + i).removeClass("sivisible");
        $("#fglblTI" + i).addClass("novisible");
    }
}

// Base imponible
function verBaseImponible(i, ver) {
    $("#valBI" + i).val("");
    if (ver) {
        $("#fgvalBI" + i).removeClass("novisible");
        $("#fgvalBI" + i).addClass("sivisible");
    } else {
        $("#fgvalBI" + i).removeClass("sivisible");
        $("#fgvalBI" + i).addClass("novisible");
    }
}

// Valor Obra Nueva
function verValorObraNueva(i, ver) {
    $("#selectTipoBI" + i).val("0");
    if (ver) {
        $("#fgvalObraN" + i).removeClass("novisible");
        $("#fgvalObraN" + i).addClass("sivisible");
    } else {
        $("#fgvalObraN" + i).removeClass("sivisible");
        $("#fgvalObraN" + i).addClass("novisible");
    }
}

// División propiedad horizontal
function verDivision(i, ver) {
    $("#selectTipoBI" + i).val('0');
    if (ver) {
        $("#fgvalDivi" + i).removeClass("novisible");
        $("#fgvalDivi" + i).addClass("sivisible");
    } else {
        $("#fgvalDivi" + i).removeClass("sivisible");
        $("#fgvalDivi" + i).addClass("novisible");
    }
}

// Importe Cancelacion
function verImporteCancelacion(i, ver) {
    $("#valCan" + i).val("");
    if (ver) {
        $("#fgvalCan" + i).removeClass("novisible");
        $("#fgvalCan" + i).addClass("sivisible");
    } else {
        $("#fgvalCan" + i).removeClass("sivisible");
        $("#fgvalCan" + i).addClass("novisible");
    }
}

// ¿Existe transmisión previa?
function verExisteTransmision(i, ver) {
    $("#selectTransPrev" + i).val("");
    if (ver) {
        $("#fgselectTransPrev" + i).removeClass("novisible");
        $("#fgselectTransPrev" + i).addClass("sivisible");
    } else {
        $("#fgselectTransPrev" + i).removeClass("sivisible");
        $("#fgselectTransPrev" + i).addClass("novisible");
    }
}

// Importe Préstamo
function verImportePrestamo(i, ver) {
    $("#valPre" + i).val("");
    if (ver) {
        $("#fgvalPre" + i).removeClass("novisible");
        $("#fgvalPre" + i).addClass("sivisible");
    } else {
        $("#fgvalPre" + i).removeClass("sivisible");
        $("#fgvalPre" + i).addClass("novisible");
    }
}

// Destinado a la adquisición de su vivienda habitual
function verDestinadoVH(i, ver) {
    $("#valDesVH" + i).prop('checked', false);
    if (ver) {
        $("#fgvalDesVH" + i).removeClass("novisible");
        $("#fgvalDesVH" + i).addClass("sivisible");
        $("#valDesVHH" + i).val("visible");
    } else {
        $("#fgvalDesVH" + i).removeClass("sivisible");
        $("#fgvalDesVH" + i).addClass("novisible");
        $("#valDesVHH" + i).val("novisible");
    }
}

// Titular de la carga
function verTitularCarga(i, ver) {
    $("#titCarga" + i).val("");
    if (ver) {
        $("#fgtitCarga" + i).removeClass("novisible");
        $("#fgtitCarga" + i).addClass("sivisible");
    } else {
        $("#fgtitCarga" + i).removeClass("sivisible");
        $("#fgtitCarga" + i).addClass("novisible");
    }
}

// DNI
function verDNICarga(i, ver) {
    $("#DNICarga" + i).val("");
    if (ver) {
        $("#fgDNICarga" + i).removeClass("novisible");
        $("#fgDNICarga" + i).addClass("sivisible");
    } else {
        $("#fgDNICarga" + i).removeClass("sivisible");
        $("#fgDNICarga" + i).addClass("novisible");
    }
}

// Entidad financiera
function verEntidadFinanciera(i, ver) {
    $("#entFin" + i).val("");
    if (ver) {
        $("#fgentFin" + i).removeClass("novisible");
        $("#fgentFin" + i).addClass("sivisible");
    } else {
        $("#fgentFin" + i).removeClass("sivisible");
        $("#fgentFin" + i).addClass("novisible");
    }
}

// Tramita INGSA
function verTramitaIngsa(i, ver) {
    $("#selectTramINGSA" + i).val("");
    if (ver) {
        $("#fgselectTramINGSA" + i).removeClass("novisible");
        $("#fgselectTramINGSA" + i).addClass("sivisible");
    } else {
        $("#fgselectTramINGSA" + i).removeClass("sivisible");
        $("#fgselectTramINGSA" + i).addClass("novisible");
    }
}

// Importe préstamo original
function verImportePrestamoO(i, ver) {
    $("#valPreO" + i).val("");
    if (ver) {
        $("#fgvalPreO" + i).removeClass("novisible");
        $("#fgvalPreO" + i).addClass("sivisible");
    } else {
        $("#fgvalPreO" + i).removeClass("sivisible");
        $("#fgvalPreO" + i).addClass("novisible");
    }
}

// Importe liberación deudor
function verImporteLiberacionD(i, ver) {
    $("#valLibera" + i).val("");
    if (ver) {
        $("#fgvalLibera" + i).removeClass("novisible");
        $("#fgvalLibera" + i).addClass("sivisible");
    } else {
        $("#fgvalLibera" + i).removeClass("sivisible");
        $("#fgvalLibera" + i).addClass("novisible");
    }
}

// Número de Acuerdo
function verNumeroAcuerdo(i, ver) {
    $("#valNAcuerdo" + i).val("");
    if (ver) {
        $("#fgvalNAcuerdo" + i).removeClass("novisible");
        $("#fgvalNAcuerdo" + i).addClass("sivisible");
    } else {
        $("#fgvalNAcuerdo" + i).removeClass("sivisible");
        $("#fgvalNAcuerdo" + i).addClass("novisible");
    }
}

// Tipo Cancelación
function verTipoCancelacion(i, ver) {
    $("#selectTipoCancela" + i).val('0');
    if (ver) {
        $("#fgselectTipoCancela" + i).removeClass("novisible");
        $("#fgselectTipoCancela" + i).addClass("sivisible");
    } else {
        $("#fgselectTipoCancela" + i).removeClass("sivisible");
        $("#fgselectTipoCancela" + i).addClass("novisible");
    }
}

// Número de Finca
function verNFinca(i, ver) {
    $("#valNFinca" + i).val("");
    if (ver) {
        $("#fgvalNFinca" + i).removeClass("novisible");
        $("#fgvalNFinca" + i).addClass("sivisible");
    } else {
        $("#fgvalNFinca" + i).removeClass("sivisible");
        $("#fgvalNFinca" + i).addClass("novisible");
    }
}

// Número de Teléfono
function verNumeroTelefono(i, ver) {
    $("#valNTelefono" + i).val("");
    if (ver) {
        $("#fgvalNTelefono" + i).removeClass("novisible");
        $("#fgvalNTelefono" + i).addClass("sivisible");
    } else {
        $("#fgvalNTelefono" + i).removeClass("sivisible");
        $("#fgvalNTelefono" + i).addClass("novisible");
    }
}

// Valor póliza
function verValorPoliza(i, ver) {
    $("#valPol" + i).val("");
    if (ver) {
        $("#fgvalPol" + i).removeClass("novisible");
        $("#fgvalPol" + i).addClass("sivisible");
    } else {
        $("#fgvalPol" + i).removeClass("sivisible");
        $("#fgvalPol" + i).addClass("novisible");
    }
}

// Botón Calcular
function verBotonCalcular(i, ver) {
    if (ver) {
        $("#Calcular" + i).removeClass("novisible");
        $("#Calcular" + i).addClass("sivisible");
    } else {
        $("#Calcular" + i).removeClass("sivisible");
        $("#Calcular" + i).addClass("novisible");
    }
}

// Botón Nueva Simulación
function verBotonSimulacion(ver) {
    if (ver) {
        $("#addSimulacion").removeClass("novisible");        
    } else {        
        $("#addSimulacion").addClass("novisible");
    }
}

// Botón Imprimir Adjunto
function verBotonAdjunto(i, ver) {
    if (ver) {
        $("#btnAdjunto" + i).removeClass("novisible");
        $("#btnAdjunto" + i).addClass("sivisible");
    } else {
        $("#btnAdjunto" + i).removeClass("sivisible");
        $("#btnAdjunto" + i).addClass("novisible");
    }
}

// Botón Imprimir Cálculo
function verImpCalculo(ver) {
    if (ver) {
        $("#ImpCalculo").removeClass("novisible");        
    } else {        
        $("#ImpCalculo").addClass("novisible");
    }
}

function hacerCalculo(i) {

    var valorCompra = "0";
    var valorBaseImp = "0";
    var valorSubrog = "0";
    var valorAmplia = "0";
    var valorFianza = "0";
    var porImpuesto = "0";
    var valorObra = "0";
    var valorDivision = "0";
    var valorAdquisi = "0";
    var Error = 0;

    verBotonAdjunto(i, 0);

    // Si es visible Valor de Compra será obligatorio rellenarlo
    if (Error === 0) {
        if ($("#fgvalCompra" + i).hasClass("sivisible") && ($("#valCompra" + i).val() === "0" || $("#valCompra" + i).val() === "")) {
            bootbox.alert({
                message: 'El campo Valor de Compra es obligatorio'
            });
            Error++;
        }
    }

    // Si es visible Base Imponible será obligatorio rellenarlo
    if (Error === 0) {
        if ($("#fgvalBI" + i).hasClass("sivisible") && ($("#valBI" + i).val() === "0" || $("#valBI" + i).val() === "")) {
            bootbox.alert({
                message: 'El campo Base Imponible es obligatorio'
            });
            Error++;
        }
    }

    // Si es visible Subrogación será obligatorio rellenarlo
    if (Error === 0) {
        if ($("#fgvalSubro" + i).hasClass("sivisible") && ($("#valSubro" + i).val() === "0" || $("#valSubro" + i).val() === "")) {
            bootbox.alert({
                message: 'El campo Subrogación es obligatorio'
            });
            Error++;
        }
    }

    // Si es visible Nº Acuerdo será obligatorio rellenarlo
    if (Error === 0) {
        if ($("#fgvalNAcuerdo" + i).hasClass("sivisible") && ($("#valNAcuerdo" + i).val() === "0" || $("#valNAcuerdo" + i).val() === "") && ($("#selectDocu" + i).val() === "19")) {
            bootbox.alert({
                message: 'El campo Nº Acuerdo es obligatorio'
            });
            Error++;
        } else {                                     
            if ($("#fgvalNAcuerdo" + i).hasClass("sivisible") && ($("#valNAcuerdo" + i).val().length > 0) && ($("#valNAcuerdo" + i).val().length < 10)) {            
                bootbox.alert({
                    message: 'El número de acuerdo tiene que ser de 10 dígitos'
                });
                Error++;
            }
         }
    }

    // Si es visible Nº Teléfono será obligatorio rellenarlo
    if (Error === 0) {
        if ($("#fgvalNTelefono" + i).hasClass("sivisible") && ($("#valNTelefono" + i).val() === "0" || $("#valNTelefono" + i).val() === "")) {
            bootbox.alert({
                message: 'El campo Nº Telefono es obligatorio'
            });
            Error++;
        } else {
            if ($("#fgvalNTelefono" + i).hasClass("sivisible") && ($("#valNTelefono" + i).val().length > 0) && ($("#valNTelefono" + i).val().length < 9)) {            
                bootbox.alert({
                    message: 'Teléfono incorrecto'
                });
                Error++;
            }
        }
    }

    if (Error === 0) {
        var tipoDocu = $("#selectDocu" + i).val();
        var tipoBase = $("#selectTipoBI" + i).val();
        valorCompra = $("#valCompra" + i).val() === "" ? "0" : $("#valCompra" + i).val();

        switch (tipoDocu) {
            case "1": // 1 COMPRA 1ª TRANSMISIÓN (IVA)  
            case "2": // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)                            
                valorBaseImp = $("#valBI" + i).val() === "" ? "0" : $("#valBI" + i).val();
                valorSubrog = $("#valSubro" + i).val() === "" ? "0" : $("#valSubro" + i).val();
                valorAmplia = $("#valAmpli" + i).val() === "" ? "0" : $("#valAmpli" + i).val();
                valorFianza = $("#valFianza" + i).val() === "" ? "0" : $("#valFianza" + i).val();
                if (zona === "NA") {
                    porImpuesto = "0.005";
                }
                if ((zona === "AL") || (zona === "GI") || (zona === "VI") || (zona === "LR")) // Resto de zonas aparece Tipo impositivo
                {
                    porImpuesto = $("#selectTipoIM" + i).val();
                    porImpuesto = porImpuesto === "-1" ? "0" : porImpuesto
                    porImpuesto = parseFloat(porImpuesto).toFixed(2) / 100;
                }
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, valorBaseImp, valorSubrog, valorAmplia, valorFianza, porImpuesto, 0, 0, "0");
                if (tipoDocu === "2")
                    mostrarTablaCRN(i, 1);
                else
                    mostrarTablaCRN(i, 0);
                break;
            case "4": // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)                                        
                valorBaseImp = $("#valBI" + i).val() === "" ? "0" : $("#valBI" + i).val();
                valorSubrog = $("#valSubro" + i).val() === "" ? "0" : $("#valSubro" + i).val();
                valorAmplia = $("#valAmpli" + i).val() === "" ? "0" : $("#valAmpli" + i).val();
                valorFianza = $("#valFianza" + i).val() === "" ? "0" : $("#valFianza" + i).val();
                porImpuesto = 0;
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, valorBaseImp, valorSubrog, valorAmplia, valorFianza, porImpuesto, 0, 0, "0");
                mostrarTablaCRN(i, 1);
                break;
            case "8": // 8 EXTINCIÓN DE CONDOMINIO (VIVIENDA)                                        
                valorBaseImp = $("#valBI" + i).val() === "" ? "0" : $("#valBI" + i).val();
                valorAdquisi = $("#valAdquisi" + i).val() === "" ? "0" : $("#valAdquisi" + i).val()
                porImpuesto = "0.005";
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, valorBaseImp, "0", "0", "0", porImpuesto, 0, 0, valorAdquisi);
                mostrarTablaCRN(i, 0);
                break;
            case "3": // 3 COMPRA VPO 1ª TRANSMISIÓN(IVA)                                        
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, "0", "0", "0", "0", "0", 0, 0, "0");
                mostrarTablaCRN(i, 0);
                break;
            case "5": // 5 OBRA NUEVA                            
                valorObra = $("#valObraN" + i).val() === "" ? "0" : $("#valObraN" + i).val();
                valorDivision = $("#valDivi" + i).val() === "" ? "0" : $("#valDivi" + i).val();
                valorBaseImp = $("#valBI" + i).val() === "" ? "0" : $("#valBI" + i).val();
                porImpuesto = "0.005";
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, valorBaseImp, "0", "0", "0", porImpuesto, valorObra, valorDivision, "0");
                mostrarTablaCRN(i, 0);
                break;
            case "6": // 6 COMPRA 2ª TRANSMISIÓN (USADA)
            case "7": // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA)                            
                valorSubrog = $("#valSubro" + i).val() === "" ? "0" : $("#valSubro" + i).val();
                valorAmplia = $("#valAmpli" + i).val() === "" ? "0" : $("#valAmpli" + i).val();
                valorFianza = $("#valFianza" + i).val() === "" ? "0" : $("#valFianza" + i).val();
                valorCompra = $("#valCompra" + i).val() === "" ? "0" : $("#valCompra" + i).val();
                valorBaseImp = $("#valBI" + i).val() === "" ? "0" : $("#valBI" + i).val();
                valorMinimo = $("#valMinimo" + i).val() === "" ? "0" : $("#valMinimo" + i).val();
                porImpuesto = $("#selectTipoIM" + i).val();
                porImpuesto = parseFloat(porImpuesto).toFixed(2) / 100;
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, valorBaseImp, valorSubrog, valorAmplia, valorFianza, porImpuesto, valorObra, 0, "0", valorMinimo);
                if (tipoDocu === "6")
                    mostrarTablaCRN(i, 0);
                else
                    mostrarTablaCRN(i, 1);
                break;
            case "9": // 9 PRÉSTAMO
            case "10": // 10 PRÉSTAMO CON AVALISTA           
                valorCompra = $("#valPre" + i).val() === "" ? "0" : $("#valPre" + i).val();
                porImpuesto = $("#selectTipoIM" + i).val(); // Siemore 0.5%
                porImpuesto = parseFloat(porImpuesto).toFixed(2) / 100;
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, "0", "0", "0", "0", porImpuesto, 0, 0, "0", "0");
                mostrarTablaCRN(i, 1);
                break;
            case "11": // 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD
            case "12": // 12 CANCELACIÓN DE HIPOTECA CRN                 
                valorCompra = $("#valCan" + i).val() === "" ? "0" : $("#valCan" + i).val();                
                porImpuesto = 0;
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, "0", "0", "0", "0", porImpuesto, 0, 0, "0", "0");
                mostrarTablaCRN(i, 0);
                if (tipoDocu === "11")
                    verBotonAdjunto(i, 1);
                break;
            case "13": // 13 SUBROGACIÓN DE HIPOTECA                                        
                valorCompra = $("#valSubro" + i).val() === "" ? "0" : $("#valSubro" + i).val();
                valorFianza = $("#valFianza" + i).val() === "" ? "0" : $("#valFianza" + i).val();
                porImpuesto = "0.01";
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, "0", "0", "0", valorFianza, porImpuesto, 0, 0, "0", "0");
                mostrarTablaCRN(i, 1);
                break;
            case "14": // 14 CANCELACIÓN DE EMBARGO                            
                valorCompra = $("#valCan" + i).val() === "" ? "0" : $("#valCan" + i).val();
                calculoconBI(i, tipoDocu, valorCompra, tipoBase, "0", "0", "0", "0", "0", 0, 0, "0", "0");
                mostrarTablaCRN(i, 0);
                break;
            case "15": // 15 NOVACIÓN DE PRÉSTAMO
            case "16": // 16 NOVACIÓN DE PRÉSTAMO CON AMPLIACIÓN                            
                valorCompra = $("#valPreO" + i).val() === "" ? "0" : $("#valPreO" + i).val();
                valorFianza = $("#valFianza" + i).val() === "" ? "0" : $("#valFianza" + i).val();
                if (tipoDocu === "16")
                    valorAmplia = $("#valAmpli" + i).val() === "" ? "0" : $("#valAmpli" + i).val();
                // Uso la variable division para guardar el valor liberación
                valorDivision = $("#valLibera" + i).val() === "" ? "0" : $("#valLibera" + i).val();
                calculoconBI(i, tipoDocu, valorCompra, "", "0", "0", valorAmplia, valorFianza, "0", 0, valorDivision, "0", "0");
                mostrarTablaCRN(i, 1);
                break;
            case "17": // 17 FIN DE OBRA                            
                valorObra = $("#valObraN" + i).val() === "" ? "0" : $("#valObraN" + i).val();
                calculoconBI(i, tipoDocu, valorObra, "", "0", "0", "0", "0", "0", 0, 0, "0", "0");
                mostrarTablaCRN(i, 0);
                break;
            case "18": // 18 PÓLIZA PRÉSTAMO / AFIANZAMIENTO                            
                valorCompra = $("#valPol" + i).val() === "" ? "0" : $("#valPol" + i).val();
                calculoconBI(i, tipoDocu, valorCompra, "", "0", "0", "0", "0", "0", 0, 0, "0", "0");
                mostrarTablaCRN(i, 1);
                break;                
            case "19": // 19 CANCELACIÓN NOTARIAL
                valorCompra = $("#valCan" + i).val() === "" ? "0" : $("#valCan" + i).val();
                calculoconBI(i, tipoDocu, valorCompra, "", "0", "0", "0", "0", "0", 0, 0, "0", "0");                
                break;
            default:
        }
        mostrarTabla(i, 1);
    }
}

// Calculo de los importes de la simulación
function calculoconBI(i, tipoDocu, compra, tipoBase, BaseImp, subrogacion, ampliacion, fianza, impuesto, obra, division, adquisicion, minimo) {
    var valorNota = 0;      // Valor Notaria
    var valorNotaCRN = 0;   // Valor Notaria CRN
    var valorImpu = 0;      // valor Impuestos
    var valorImpuCRN = 0;   // valor Impuestos
    var valorRegi = 0;      // valor Registro
    var valorRegiCRN = 0;   // valor Registro CRN
    var valorGest = 0;      // valor Gestión
    var valorGestCRN = 0;   // valor Gestión CRN
    var valorTotal = 0;     // valor Total
    var valorTotalCRN = 0;  // valor Total CRN
    var valCom = 0;         // valor Compra
    var valDiv = 0;         // valor Division
    var valSub = 0;         // valor Subrogación
    var valAmp = 0;         // valor Division
    var aux = "0";
    var numFomateado = 0;
    const spanishNumberFormatter = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Dos dígitos    

    // Nº de Fincas
    var selNFincas = document.getElementById("selectFinca" + i);

    // Traigo el multiplicador en base al número de fincas para Notaría
    valNFincasN = buscarMNFincasN(selNFincas.value);

    // Traigo el multiplicador en base al número de fincas para Registro
    valNFincasR = buscarMNFincasR(selNFincas.value);

    // Valor del Tipo Impositivo
    valTipoImpo = document.getElementById("selectTipoIMH" + i).value;

    // Los importes se buscan de tipos de documentos diferentes a los que aparecen en el desplegable
    // Importe Notaria    **************************************************************************

    valCom = 0;
    
    if ((compra !== "0") || (tipoDocu === "5" && obra !== "0")) {
        switch (tipoDocu) {
            case "2": // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
            case "6": // 6 COMPRA 2ª TRANSMISION (USADA)
            case "7": // 7 COMPRA CON SUBROGACION 2ª TRANSMISION (USADA)
                // Buscar tarifa de la Notaría para ese importe de compra
                valCom = buscarINotaria("1", compra); // Compra                
                break;
            case "3": // 3 COMPRA VPO 1ª TRANSMISIÓN(IVA) 
            case "4": // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                // Buscar tarifa de la Notaría para ese importe de compra
                valCom = buscarINotaria("2", compra); // COMPRA VPO
                break;
            case "5": // 5 OBRA NUEVA
                // Buscar tarifa de la Notaría para ese importe de obra
                valCom = buscarINotaria("9", obra); // OBRA NUEVA
                // Si existe valor de división horizontal también busco 
                // para ese valor y lo añado al de la compra
                if (division !== "0")
                    valDiv = buscarINotaria("10", division); // DIVISION
                valCom = parseFloat(parseFloat(valCom) + parseFloat(valDiv)).toFixed(3);
                break;
            case "8": // 8 EXTINCIÓN DE CONDOMINIO (VIVIENDA)
                // Buscar tarifa de la Notaría para ese importe de compra
                valCom = buscarINotaria("11", compra); // Extincion de condominio
                break;
            case "9": // 9 PRÉSTAMO
                // Buscar tarifa de la Notaría para ese importe de compra
                valCom = buscarINotaria("3", compra); // Hipoteca
                aux = valCom;
                break;
            case "10": // 10 PRÉSTAMO CON AVALISTA
                // Buscar tarifa de la Notaría para ese importe de compra
                valCom = buscarINotaria("13", compra); // Hipoteca con avalista
                aux = valCom;
                break;
            case "11": // 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD
            case "12": // 12 CANCELACION DE HIPOTECA CRN
            case "14": // 14 CANCELACION DE EMBARGO
                if (tipoDocu === "14")                    
                    valCom = 0; // No lleva valor de compra, y por si acaso lo vacío
                else
                    valCom = buscarINotaria("8", compra); // Cancelación otra entidad
                break;
            case "13": // 13 SUBROGACIÓN DE HIPOTECA  
                valCom = buscarINotaria("6", compra); // Subrogacion (Suelta)
                break;
            case "15": // 15 NOVACIÓN DE PRÉSTAMO
            case "16": // 16 NOVACIÓN DE PRÉSTAMO CON AMPLIACIÓN
                valCom = buscarINotaria("4", compra); // Novación                                
                break;
            case "17": // 17 FIN DE OBRA
                valCom = buscarINotaria("12", compra); // Fin de obra
                break;
            case "18": // 18 PÓLIZA PRÉSTAMO / AFIANZAMIENTO                   
                valCom = compra <= 0 ? 0 : compra <= 6010 ? 110 : compra < 6000000 ? 110 + (compra - 6010) * 0.004 : -1; //-1 "CONSULTAR"
                break;
            default:
                valCom = buscarINotaria(tipoDocu, compra);
                break;
        }
    }

    valSub = "0";
    if (subrogacion !== "0")
        valSub = buscarINotaria("5", subrogacion); // SUBROGACIÓN (CV + SUB)
    valAmp = "0";
    if (ampliacion !== "0")
        valAmp = buscarINotaria("7", ampliacion); // AMPLIACIÓN    
    valFian = "0";

    // Gestion No Acogido, Acogido y CRN
    if (Acogido === "Si") {
        valorNota = parseFloat(valCom);
        if ((tipoDocu === "9") || (tipoDocu === "10") || (tipoDocu === "13") || (tipoDocu === "15") || (tipoDocu === "16") || (tipoDocu === "18")) {
            valorNota = 0;
            valorNotaCRN = parseFloat(valCom) + parseFloat(valAmp);
        } else
            valorNotaCRN = parseFloat(parseFloat(valSub) + parseFloat(valAmp));
    } else {
        valorNota = parseFloat(parseFloat(valCom) + parseFloat(valSub) + parseFloat(valAmp));
        valorNotaCRN = 0;
    }

    // Aplico las fincas
    if (valorNota < 0)
        $("#celImpNota" + i).val("CONSULTAR");        
    else {        
        valorNota = parseFloat(parseFloat(valorNota) * parseFloat(valNFincasN));
        //$("#celImpNota" + i).val(numberWithCommas(parseFloat(valorNota).toFixed(2)));
        numFomateado = spanishNumberFormatter.format(valorNota);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpNota" + i).val(numFomateado + " €");
    }
    if (valorNotaCRN < 0)
        $("#celImpNotaCRN" + i).val("CONSULTAR");
    else {
        valorNotaCRN = parseFloat(parseFloat(valorNotaCRN) * parseFloat(valNFincasN));        
        //$("#celImpNotaCRN" + i).val(numberWithCommas(parseFloat(valorNotaCRN).toFixed(2)));
        numFomateado = spanishNumberFormatter.format(valorNotaCRN);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpNotaCRN" + i).val(numFomateado + " €");
    }
        

    // Importe Impuesto    *********************************************************************
    valCom = "0";
    switch (tipoDocu) {
        case "5": // 5 OBRA NUEVA
            if (tipoBase === "1") // Valor de compra
            {
                if (zona === "LR")
                    impuesto = "0.01"
                aux = parseFloat(parseFloat(obra) * parseFloat(impuesto)).toFixed(3);
                valCom = parseFloat(parseFloat(division) * parseFloat(impuesto)).toFixed(3);
                valorImpu = parseFloat(parseFloat(aux) + parseFloat(valCom));
            } else {
                aux = parseFloat(parseFloat(BaseImp) * parseFloat(impuesto)).toFixed(3);
                valCom = parseFloat(parseFloat(division) * parseFloat(impuesto)).toFixed(3);
                valorImpu = parseFloat(parseFloat(aux) + parseFloat(valCom));
            }
            valorImpuCRN = 0;
            break;
        case "6": // 6 COMPRA 2ª TRANSMISION (USADA)
        case "7": // 7 COMPRA CON SUBROGACION 2ª TRANSMISION (USADA)
            if (((zona === "AL") || (zona === "GI") || (zona === "VI")) && (tipoDocu === "6")) tipoBase = "1";
            if (tipoBase !== "1") // Valor de compra            
                compra = BaseImp;
            var aux1 = 0;
            var aux2 = 0;
            if ((zona === "AL") || (zona === "GI") || (zona === "VI") || (zona === "LR")) {
                if ((tipoDocu === "7") && (Acogido === "Si")) {
                    if (impuesto !== 0.025) {
                        if ((zona === "LR") && (Acogido === "Si"))
                            valCom = parseFloat(compra) * impuesto;
                        else
                            valCom = (parseFloat(compra) * impuesto) + (parseFloat(ampliacion) * 1.3 * 0.005);
                    } else {
                        if ((parseFloat(ampliacion) + parseFloat(subrogacion) - parseFloat(compra)) <= 0) {
                            if (zona === "AL")
                                valCom = (parseFloat(compra) * impuesto) + (ampliacion * 1.3 * 0.005);
                            else
                                valCom = parseFloat(compra) * impuesto;
                        } else {
                            if ((zona === "AL") && (Acogido === "Si"))
                                valCom = (parseFloat(compra) * impuesto) + (parseFloat(ampliacion) * 1.3 * 0.005);
                            else
                                valCom = (parseFloat(compra) * impuesto) + ((parseFloat(ampliacion) + parseFloat(subrogacion) - parseFloat(compra)) * 1.3 * 0.005);
                        }
                    }
                } else {
                    if ((zona === "VI") && (tipoDocu === "6"))
                        valCom = parseFloat(minimo) * impuesto;
                    else {
                        if ((zona === "LR") && (tipoDocu === "7"))
                            valCom = parseFloat(parseFloat(compra) * parseFloat(impuesto)).toFixed(3);
                        else {
                            valCom = parseFloat(parseFloat(compra) * parseFloat(impuesto)).toFixed(3);
                            aux1 = ampliacion * 1.3 * 0.005;
                            valCom = parseFloat(parseFloat(valCom) + parseFloat(aux1)).toFixed(3); }
                    }
                }
            } else {
                if (impuesto === 0.05) {
                    if (compra <= 180303.63)
                        valCom = parseFloat(parseFloat(compra) * parseFloat(impuesto)).toFixed(3);
                    else {
                        aux1 = 180303.63 * 0.05;
                        aux2 = (compra - 180303.63) * 0.06;
                        valCom = aux1 + aux2; }
                } else
                    valCom = parseFloat(parseFloat(compra) * parseFloat(impuesto)).toFixed(3);                
            }            
            valorImpu = valCom;
            if ((zona === "AL") || (zona === "GI") || (zona === "VI"))
                valorImpuCRN = parseFloat(parseFloat(fianza) * 1.3 * 0.01);
            else {
                if (zona === "LR")
                    valorImpuCRN = parseFloat((parseFloat(ampliacion) * 1.3 * 0.01) + (parseFloat(fianza) * 1.3 * 0.01)); // NO ACOGIDO
                else
                    valorImpuCRN = parseFloat((parseFloat(ampliacion) * 1.3 * 0.005) + (parseFloat(fianza) * 1.3 * 0.01)); // NO ACOGIDO                
            }
            break;
        case "9":  // 9 PRÉSTAMO
        case "10": // 10 PRÉSTAMO CON AVALISTA
        case "13": // 13 SUBROGACIÓN DE HIPOTECA 
            valorImpu = 0;
            valorImpuCRN = parseFloat((parseFloat(fianza) * 1.3 * parseFloat(impuesto))).toFixed(3);
            if ((tipoDocu === "9") || (tipoDocu === "10")) {
                if (Acogido === "Si") {
                    valorImpuCRN = parseFloat(compra * 1.3 * parseFloat(impuesto)).toFixed(3);
                    if (((tipoDocu === "9") || (tipoDocu === "10")) && ((zona === "AL") || (zona === "GI") || (zona === "VI"))) {
                        if (impuesto === -0.01) impuesto = "0";
                        valorImpu = parseFloat(compra * 1.3 * parseFloat(impuesto)).toFixed(3);
                        valorImpuCRN = 0;
                    } else {
                        if ((zona === "LR") && (valTipoImpo === "Exento"))
                            valorImpuCRN = 0;
                        else {
                            valorImpu = 0;
                            valorImpuCRN = parseFloat(compra * 1.3 * parseFloat(impuesto)).toFixed(3);
                        }
                    }
                } else {
                    if (((tipoDocu === "9") || (tipoDocu === "10")) && ((zona === "AL") || (zona === "GI") || (zona === "VI"))) {
                        if (impuesto === -0.01) impuesto = "0";
                        valorImpu = parseFloat(compra * 1.3 * parseFloat(impuesto)).toFixed(3);
                        valorImpuCRN = 0;
                    } else {
                        if ((zona === "LR") && (valTipoImpo === "Exento"))
                            valorImpuCRN = 0;
                        else {
                            valorImpu = 0;
                            valorImpuCRN = parseFloat(compra * 1.3 * parseFloat(impuesto)).toFixed(3);
                        }
                    }
                }
            }
            break;
        case "15": // 15 NOVACIÓN DE PRÉSTAMO
        case "16": // 16 NOVACIÓN DE PRÉSTAMO CON AMPLIACIÓN  
            if (zona === "LR")
                valorImpu = parseFloat(division / 2 * 1.6 * 0.01).toFixed(3);
            else
                valorImpu = parseFloat(division / 2 * 1.6 * 0.005).toFixed(3);
            valorImpuCRN = parseFloat(fianza * 1.3 * 0.01).toFixed(3);
            if (tipoDocu === "16") //Hay ampliación
            {
                if (zona === "LR")
                    valAmp = parseFloat(ampliacion * 1.3 * 0.01).toFixed(3);
                else
                    valAmp = parseFloat(ampliacion * 1.3 * 0.005).toFixed(3);
            }
            if ((zona === "AL") || (zona === "GI") || (zona === "VI"))
                valorImpu = (parseFloat(valorImpu) + parseFloat(valAmp)).toFixed(3);
            else
                valorImpuCRN = (parseFloat(valorImpuCRN) + parseFloat(valAmp)).toFixed(3);            
            break;
        default:
            if (tipoBase === "1") // Valor de compra            
                valCom = parseFloat(parseFloat(compra) * parseFloat(impuesto)).toFixed(3);
             else
                valCom = parseFloat(parseFloat(BaseImp) * parseFloat(impuesto)).toFixed(3);            
            if (((zona === "AL") || (zona === "GI") || (zona === "VI") || (zona === "LR")) && (tipoDocu !== "8")) {
                var auxd1 = 0;
                var auxd = 0;
                if (tipoBase === "1") // Valor de compra
                    auxd1 = compra
                else
                    auxd1 = BaseImp
                if (document.getElementById("valVivHab" + i).checked) {
                    if ((parseFloat(ampliacion) + parseFloat(subrogacion) - parseFloat(auxd1)) <= 0)
                        auxd = 0;
                    else
                        auxd = (parseFloat(ampliacion) + parseFloat(subrogacion) - parseFloat(auxd1)) * 1.3 * 0.005;
                } else {
                    if ((tipoDocu === "11") || (tipoDocu === "12")) { // 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD, 12 CANCELACION DE HIPOTECA CRN
                        if ((impuesto !== -0.01) && (valTipoImpo !== "Exento")) {
                            if (zona === "AL")
                                auxd = compra * 1.3 * 0.005;
                            if (zona === "GI")
                                auxd = compra * 1.6 * 0.005;
                            if (zona === "VI")
                                auxd = compra * 0.005;
                        }
                        valCom = 0;
                    } else {
                        if ((tipoDocu === "4") && Acogido === "Si") { // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                            if (parseFloat(parseFloat(ampliacion) + parseFloat(subrogacion) - parseFloat(compra)) <= 0)
                                auxd = 0;
                            else
                                auxd = parseFloat(parseFloat(ampliacion) + parseFloat(subrogacion) - parseFloat(compra)) * 1.3 * 0.005;
                        } else {
                            if ((tipoDocu === "4") && Acogido === "No") { // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                                if (zona === "LR")
                                    auxd = 0;
                                else {
                                    if ((zona === "AL") || (zona === "VI")) {
                                        auxd = parseFloat(parseFloat(ampliacion) + parseFloat(subrogacion) - parseFloat(compra)) * 1.3 * 0.005;
                                        if (!((tipoDocu === "4") && (Acogido === "No") && (zona === "VI"))) { // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                                            auxd = auxd + (fianza * 1.3 * 0.01);
                                        }
                                    } else {
                                        if (zona === "GI")
                                            auxd = 0;
                                        else
                                            auxd = fianza * 1.3 * 0.01;
                                    }
                                }
                            } else {
                                if (((zona === "LR") || (zona === "AL")) && (tipoDocu === "2") && (Acogido === "Si")) { // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
                                    if (tipoBase === "1") // Valor de compra                                    
                                        valCom = compra * parseFloat(impuesto);
                                     else
                                        valCom = parseFloat(BaseImp) * parseFloat(impuesto);                                    
                                    if (!((zona === "LR") && (tipoDocu === "2") && (Acogido === "Si"))) // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
                                        auxd = ampliacion * 1.3 * 0.005;
                                    valorImpuCRN = 0;
                                } else {
                                    if (((zona === "LR") || (zona === "AL") || (zona === "VI")) && (tipoDocu === "2") && (Acogido === "No")) { // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
                                        if (((zona === "AL") || (zona === "VI")) && (tipoDocu === "2") && (Acogido === "No"))
                                            auxd = ampliacion * 1.3 * 0.005;
                                        else
                                            auxd = 0;
                                    } else
                                        auxd = ampliacion * 1.3 * 0.005;
                                }
                            }
                        }
                    }
                }
                valCom = parseFloat(parseFloat(auxd) + parseFloat(valCom)).toFixed(3);
            }
            if (((zona === "AL") || (zona === "GI") || (zona === "VI") || (zona === "LR")) && (tipoDocu === "8")) {
                if (tipoBase === "1") // Valor de compra
                {
                    valCom = parseFloat(parseFloat(compra) * parseFloat(impuesto)).toFixed(3);
                } else {
                    valCom = parseFloat(parseFloat(BaseImp) * parseFloat(impuesto)).toFixed(3);
                }
            }            
            valorImpu = valCom;
            if ((zona === "AL") || (zona === "GI") || (zona === "VI") || (zona === "LR")) {
                if ((tipoDocu === "4") && (Acogido === "No")) { // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                    if ((zona === "AL") || (zona === "GI") || (zona === "VI"))
                        valorImpuCRN = fianza * 1.3 * 0.01;
                    else
                        valorImpuCRN = 0;
                } else {
                    if (((tipoDocu !== "11") && (tipoDocu !== "12")) || (impuesto === -0.01)) { // 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD, 12 CANCELACION DE HIPOTECA CRN
                        valorImpuCRN = parseFloat(fianza) * 1.3 * 0.01; // NO ACOGIDO
                        if ((tipoDocu === "4") && (Acogido === "Si") && (zona === "LR")) { // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                            valorImpuCRN = valorImpuCRN + (ampliacion * 1.3 * 0.01);
                        }
                        //if (((zona === "AL") || (zona === "GI")) && (tipoDocu === "2"))
                        //    valorImpuCRN = 0;
                    }
                }
                if (tipoDocu === "8") { // 8 EXTINCIÓN DE CONDOMINIO (VIVIENDA)
                    if ((zona === "GI") || (zona === "VI"))
                        if (tipoBase === "1") // Valor de compra
                        {
                            valorImpuCRN = parseFloat(parseFloat(compra) * parseFloat(impuesto)).toFixed(3); // NO ACOGIDO
                        } else {
                            valorImpuCRN = parseFloat(parseFloat(BaseImp) * parseFloat(impuesto)).toFixed(3); // NO ACOGIDO
                        }
                    else {
                        if (zona === "LR") {
                            if (tipoBase === "1") // Valor de compra
                            {
                                valorImpuCRN = parseFloat(parseFloat(compra) * parseFloat("0.01")).toFixed(3); // NO ACOGIDO
                            } else {
                                valorImpuCRN = parseFloat(parseFloat(BaseImp) * parseFloat("0.01")).toFixed(3); // NO ACOGIDO
                            }
                        }                           
                        else
                            valorImpuCRN = parseFloat(parseFloat(adquisicion) * parseFloat(impuesto)).toFixed(3); // NO ACOGIDO                        
                    }
                    valorImpu = valorImpuCRN;
                    valorImpuCRN = 0;
                } else {
                    if (tipoDocu !== "4") { // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                        if (zona === "LR")
                            valorImpuCRN = parseFloat((parseFloat(ampliacion) * 1.3 * 0.01) + (parseFloat(fianza) * 1.3 * 0.01)); // NO ACOGIDO              
                        else {
                            if (((zona === "AL") || (zona === "VI")) && (tipoDocu === "2")) // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
                                valorImpuCRN = parseFloat(fianza) * 1.3 * 0.01;
                            else {
                                if (((zona !== "GI") && (zona !== "VI")) || (tipoDocu !== "2")) // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
                                    valorImpuCRN = parseFloat((parseFloat(ampliacion) * 1.3 * 0.005) + (parseFloat(fianza) * 1.3 * 0.01)); // NO ACOGIDO             
                                else {
                                    if ((zona === "VI") && (tipoDocu === "2") && (Acogido === "No")) // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)
                                        valorImpuCRN = valorImpuCRN + (parseFloat(ampliacion) * 1.3 * 0.005)
                                }

                            }
                        }
                    } else {
                        if ((zona === "LR") && (tipoDocu === "4") && (Acogido === "No")) // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                            valorImpuCRN = parseFloat((parseFloat(ampliacion) * 1.3 * 0.01) + (parseFloat(fianza) * 1.3 * 0.01)); // NO ACOGIDO     
                    }
                }
            } else
                valorImpuCRN = parseFloat((parseFloat(ampliacion) * 1.3 * 0.005) + (parseFloat(fianza) * 1.3 * 0.01)); // NO ACOGIDO    

            break;
    }

    // Afectará al valor del Impuesto
    if (valorImpu < 0) {
        $("#celImpImpu" + i).val("CONSULTAR");
    } else {        
        //$("#celImpImpu" + i).val(numberWithCommas(parseFloat(valorImpu).toFixed(2)));
        numFomateado = spanishNumberFormatter.format(valorImpu);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpImpu" + i).val(numFomateado + " €");
    }
    if (valorImpuCRN < 0) {
        $("#celImpImpuCRN" + i).val("CONSULTAR");
    } else {     
        //$("#celImpImpuCRN" + i).val(numberWithCommas(parseFloat(valorImpuCRN).toFixed(2)));
        numFomateado = spanishNumberFormatter.format(valorImpuCRN);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpImpuCRN" + i).val(numFomateado + " €");
    }        

    // Importe Registro    *********************************************************************
    valCom = "0";
    if ((compra !== "0") || (tipoDocu === "5" && obra !== "0")) {
        switch (tipoDocu) {
            case "2": // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)            
            case "6": // 6 COMPRA 2ª TRANSMISION (USADA)
            case "7": // 7 COMPRA CON SUBROGACION 2ª TRANSMISION (USADA)
                valCom = buscarIRegistro("1", compra); // Compra
                if (tipoDocu === "7") {
                    valSub = buscarIRegistro("5", subrogacion); // Subrogación
                    valAmp = buscarIRegistro("7", ampliacion); // Ampliación
                }
                break;
            case "3": // 3 COMPRA VPO 1ª TRANSMISIÓN(IVA) 
            case "4": // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                valCom = buscarIRegistro("2", compra); // COMPRA VPO
                break;
            case "5": // 5 OBRA NUEVA
                valCom = buscarIRegistro("9", obra); // OBRA NUEVA
                if (division !== "0")
                    valDiv = buscarIRegistro("10", division); // DIVISION
                valCom = parseFloat(parseFloat(valCom) + parseFloat(valDiv)).toFixed(3);
                break;
            case "8": // 8 EXTINCIÓN DE CONDOMINIO (VIVIENDA)
                valCom = buscarIRegistro("11", compra); // Extincion de condominio
                break;
            case "9": // 9 PRÉSTAMO
                if (Acogido === "Si") {
                    valCom = 0;
                    aux = buscarIRegistro("3", compra); // Hipoteca 
                } else
                    valCom = buscarIRegistro("3", compra); // Hipoteca                                    
                break;
            case "10": // 10 PRÉSTAMO CON AVALISTA           
                if (Acogido === "Si") {
                    valCom = 0;
                    aux = buscarIRegistro("13", compra); // Hipoteca con avalista
                } else
                    valCom = buscarIRegistro("13", compra); // Hipoteca con avalista
                break;
            case "11": // 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD
            case "12": // 12 CANCELACION DE HIPOTECA CRN
            case "14": // 14 CANCELACION DE EMBARGO
                valCom = buscarIRegistro("8", compra); // Cancelación otra entidad
                break;
            case "13": // SUBROGACION DE HIPOTECA       
                if (Acogido === "Si") {
                    valCom = 0;
                    aux = buscarIRegistro("6", compra); // Subrogacion Suelta
                } else
                    valCom = buscarIRegistro("6", compra); // Subrogacion Suelta
                break;
            case "15": // 15 NOVACIÓN DE PRÉSTAMO
            case "16": // 16 NOVACIÓN DE PRÉSTAMO CON AMPLIACIÓN                  
                if (Acogido === "Si") {
                    valCom = 0;
                    aux = buscarIRegistro("4", compra); // Hipoteca 
                } else
                    valCom = buscarIRegistro("4", compra); // Hipoteca
                //if (tipoDocu === "16")//Hay ampliación
                //    valAmp = buscarIRegistro("7", ampliacion); // Ampliacion                
                break;
            case "17": // 17 FIN DE OBRA
                valCom = buscarIRegistro("12", compra); // Fin de obra
                break;
            default:
                valCom = buscarIRegistro(tipoDocu, compra);
                break;
        }
    }
    valSub = "0";
    if (subrogacion !== "0")
        valSub = buscarIRegistro("5", subrogacion); // SUBROGACIÓN (CV + SUB)        
    valAmp = "0";
    if (ampliacion !== "0") {
        if (tipoDocu === "4") //&&(Acogido==="No"))
        {
            //if(zona==="LR")
            //                valAmp = buscarIRegistro("7", ampliacion); // SUBROGACIÓN (CV + SUB)
            //else
            if ((zona === "GI") || (zona === "VI"))
                valAmp = buscarIRegistro("5", ampliacion); // SUBROGACIÓN (CV + SUB)
            else
                valAmp = buscarIRegistro("7", ampliacion); // SUBROGACIÓN (CV + SUB)
        } else
            valAmp = buscarIRegistro("7", ampliacion); // AMPLIACIÓN        
    }
    valFian = "0";

    if (Acogido === "Si") {
        valorRegi = parseFloat(valCom);
        if ((tipoDocu === "9") || (tipoDocu === "10") || (tipoDocu === "13") || (tipoDocu === "15") || (tipoDocu === "16") || (tipoDocu === "18")) {
            valorRegi = 0;
            valorRegiCRN = parseFloat(aux);
            if (tipoDocu === "16")
                valorRegiCRN = parseFloat(aux) + parseFloat(valSub) + parseFloat(valAmp);
        } else {
            if ((tipoDocu === "4") && (zona === "VI"))
                valAmp = "0";
            valorRegiCRN = parseFloat(valSub) + parseFloat(valAmp);
        }
    } else {
        valorRegi = parseFloat(valCom) + parseFloat(valSub) + parseFloat(valAmp);
        valorRegiCRN = 0;
    }

    // Aplico las fincas
    if (valorRegi < 0) {
        $("#celImpRegi" + i).val("CONSULTAR");
    } else {
        valorRegi = valorRegi * valNFincasR;
        //$("#celImpRegi" + i).val(numberWithCommas(parseFloat(valorRegi).toFixed(2)));
        numFomateado = spanishNumberFormatter.format(valorRegi);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpRegi" + i).val(numFomateado + " €");
    }
    if (valorRegiCRN < 0) {
        $("#celImpRegiCRN" + i).val("CONSULTAR");
    } else {
        valorRegiCRN = valorRegiCRN * valNFincasR;
        //$("#celImpRegiCRN" + i).val(numberWithCommas(parseFloat(valorRegiCRN).toFixed(2)));
        numFomateado = spanishNumberFormatter.format(valorRegiCRN);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpRegiCRN" + i).val(numFomateado + " €");
    }

    // Importe Gestion    *********************************************************************
    valCom = "0";
    if ((compra !== "0") || (tipoDocu === "5" && obra !== "0")) {
        switch (tipoDocu) {
            case "2": // 2 COMPRA CON SUBRLOGACIÓN 1ª TRANSMISIÓN(IVA)                        
                if (Acogido === "Si") {
                    valorGest = buscarIGestion("5", compra, Acogido); // SUBROGACIÓN (CV + SUB)
                    valorGestCRN = buscarIGestion("5", compra, "Crn"); // SUBROGACIÓN (CV + SUB)
                } else {
                    valorGest = buscarIGestion("5", compra, Acogido); // SUBROGACIÓN (CV + SUB)                    
                    //if ((zona === "AL") || (zona === "GI") || (zona === "VI"))
                    //    valorGestCRN = 0;
                    //else
                    valorGestCRN = buscarIGestion("5", compra, "Crn"); // SUBROGACIÓN (CV + SUB)
                }
                break;
            case "3": // 3 COMPRA VPO 1ª TRANSMISIÓN(IVA) 
                valorGest = buscarIGestion("2", compra, Acogido); // COMPRA VPO
                break;
            case "4": // 4 COMPRA VPO CON SUBROGACIÓN 1ª TRANSMISIÓN(IVA)
                valorGest = buscarIGestion("5", compra, Acogido); // SUBROGACIÓN (CV + SUB)
                //if (((zona === "AL") || (zona === "GI") || (zona === "VI")) && (Acogido==="No"))
                //    valorGestCRN = "0";
                //else
                valorGestCRN = buscarIGestion("5", compra, "Crn"); // SUBROGACIÓN (CV + SUB)
                break;
            case "5": // 5 OBRA NUEVA
                valorGest = buscarIGestion("9", obra, Acogido);
                valorGestCRN = 0;
                break;
            case "6": // 6 COMPRA 2ª TRANSMISION (USADA)
                valorGest = buscarIGestion("1", compra, Acogido); // COMPRA
                break;
            case "7": // 7 COMPRA CON SUBROGACIÓN 2ª TRANSMISIÓN (USADA)  
                valorGest = buscarIGestion("5", compra, Acogido); // Subrogacion (CV+Sub.)                
                valorGestCRN = buscarIGestion("5", compra, "Crn"); // SUBROGACIÓN (CV + SUB)
                //if (((zona === "AL") || (zona === "GI") || (zona === "VI")) && (Acogido === "No"))
                //   valorGestCRN = 0;
                if ((zona === "VI") && (Acogido === "Si"))
                    valorGestCRN = buscarIGestion("5", subrogacion, "Crn"); // SUBROGACIÓN (CV + SUB)
                break;
            case "8": // 8 EXTINCIÓN DE CONDOMINIO (VIVIENDA)
                valorGest = buscarIGestion("11", compra, Acogido); // Extincion de condominio
                break;
            case "9": // 9 PRÉSTAMO
                valorGest = buscarIGestion("3", compra, Acogido); // Hipoteca
                if ((zona === "AL") || (zona === "GI") || (zona === "VI")) {
                    if (Acogido === "Si")
                        valorGestCRN = buscarIGestion("3", compra, "Crn"); // Hipoteca
                    else
                        valorGestCRN = 0;
                } else
                    valorGestCRN = buscarIGestion("3", compra, "Crn"); // Hipoteca
                break;
            case "10": // 10 PRÉSTAMO CON AVALISTA                
                valorGest = buscarIGestion("13", compra, Acogido); // Hipoteca con avalista
                if ((zona === "AL") || (zona === "GI") || (zona === "VI")) {
                    if (Acogido === "Si")
                        valorGestCRN = buscarIGestion("13", compra, "Crn"); // Hipoteca con avalista
                    else
                        valorGestCRN = 0;
                } else
                    valorGestCRN = buscarIGestion("13", compra, "Crn"); // Hipoteca con avalista
                break;
            case "11": // 11 CANCELACIÓN DE HIPOTECA OTRA ENTIDAD
            case "14": // 14 CANCELACION DE EMBARGO                
                valorGest = buscarIGestion("8", compra, Acogido); // Cancelación otra entidad
                break;
            case "12": // 12 CANCELACION DE HIPOTECA CRN            
                valorGest = buscarIGestion("14", compra, Acogido); // Cancelación CRN
                break;
            case "13": // 13 SUBROGACION DE HIPOTECA                
                valorGest = buscarIGestion("6", compra, Acogido); // Hipoteca con avalista
                //if ((zona === "VI") && (Acogido === "No"))
                //    valorGestCRN = 0;
                //else
                valorGestCRN = buscarIGestion("6", compra, "Crn"); // Hipoteca con avalista
                break;
            case "15": // 15 NOVACIÓN DE PRÉSTAMO
            case "16": // 16 NOVACIÓN DE PRÉSTAMO CON AMPLIACIÓN                  
                if (Acogido === "Si")
                    valorGest = 0; // Novación                
                else
                    valorGest = buscarIGestion("4", compra, Acogido); // Novación                                    
                //if (((zona === "NA") || (zona === "AL") || (zona === "GI") || (zona === "VI")) && (Acogido==="No") && (tipoDocu==="15"))
                //    valorGestCRN = 0
                //else
                //    valorGestCRN = buscarIGestion("4", compra, "Crn"); // Novación                 
                //if ((zona === "VI") || (zona === "AL") || (zona === "GI") || (zona === "LR"))
                if ((((fianza !== "0") || (ampliacion !== "0")) && (Acogido === "Si")) || ((fianza === "0") && (Acogido === "Si")) || (((fianza !== "0") || (ampliacion !== "0")) && (Acogido === "No")))
                    valorGestCRN = buscarIGestion("4", compra, "Crn"); // Novación
                else
                    valorGestCRN = 0; //buscarIGestion("4", compra, "Crn"); // Novación
                break;
            case "17": // 17 FIN DE OBRA
                valorGest = buscarIGestion("12", compra, Acogido); // Fin de obra
                break;
            case "18": // 18 POLIZA PRESTAMO / AFIANZAMIENTO
                if (Acogido === "Si")
                    valorGestCRN = 30;
                break;
            case "19": // 19 CANCELACIÓN NOTARIAL                
                valorGest = 121;
                valorGestCRN = 0;
                break;
            default:
                valorGest = buscarIGestion(tipoDocu, compra, Acogido);
                valorGestCRN = 0;
                break;
        }
    }


    if (valorGest < 0) {
        $("#celImpGest" + i).val("CONSULTAR");
    } else {        
        //$("#celImpGest" + i).val(numberWithCommas(parseFloat(valorGest).toFixed(2)));
        numFomateado = spanishNumberFormatter.format(valorGest);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpGest" + i).val(numFomateado + " €");
    }
    if (valorGestCRN < 0) {
        $("#celImpGestCRN" + i).val("CONSULTAR");
    } else {
        //$("#celImpGestCRN" + i).val(numberWithCommas(parseFloat(valorGestCRN).toFixed(2)));
        numFomateado = spanishNumberFormatter.format(valorGestCRN);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpGestCRN" + i).val(numFomateado + " €");
    }       

    // Totales    *********************************************************************
    if (tipoDocu === "19") // 19 CANCELACIÓN NOTARIAL
    {
        valorNota = 0;
        valorImpu = 0;
        valorRegi = 0;        
        valorNotaCRN = 0;
        valorImpuCRN = 0;
        valorRegiCRN = 0;
        valorGestCRN = 0;
    }    

    if ((valorNota < 0) || (valorImpu < 0) || (valorRegi < 0) || (valorGest < 0)) {    
        $("#celImpTota" + i).val("CONSULTAR");
    } else {
        valorTotal = parseFloat(valorNota) + parseFloat(valorImpu) + parseFloat(valorRegi) + parseFloat(valorGest);
        //$("#celImpTota" + i).val(numberWithCommas(valorTotal.toFixed(2)));        
        numFomateado = spanishNumberFormatter.format(valorTotal);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpTota" + i).val(numFomateado + " €");
    }
    if ((valorNotaCRN < 0) || (valorImpuCRN < 0) || (valorRegiCRN < 0) || (valorGestCRN < 0)) {
        $("#celImpTotaCRN" + i).val("CONSULTAR");
    } else {        
        valorTotalCRN = parseFloat(valorNotaCRN) + parseFloat(valorImpuCRN) + parseFloat(valorRegiCRN) + parseFloat(valorGestCRN);
        //$("#celImpTotaCRN" + i).val(numberWithCommas(valorTotalCRN.toFixed(2)));
        numFomateado = spanishNumberFormatter.format(valorTotalCRN);
        numFomateado = numberWithCommas(numFomateado);
        $("#celImpTotaCRN" + i).val(numFomateado + " €");
    }
}

// Busca la tarifa de la Notaría en la tabla del simulador SIMULA_1
function buscarINotaria(tipodoc, importe) {
    var impNota = 0;    
    $.ajax({
        type: "POST",
        cache: true,
        async: false,
        url: "/SimuladorPF/buscarNotaria",
        data: JSON.stringify({
            parm1: tipodoc,
            parm2: importe
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            impNota = parseFloat(data);
        },
        error: function (msg) { // Se ejecuta cuando hay algún fallo
            bootbox.alert({
                message: 'buscarNotaria ' + msg.responseText
            });
        }
    });    
    return impNota;
}

// Busca la tarifa del Registro en la tabla del simulador SIMULA_1
function buscarIRegistro(tipodoc, importe) {
    var impReg = 0;    
    $.ajax({
        type: "POST",
        cache: true,
        async: false,
        url: "/SimuladorPF/buscarRegistro",
        data: JSON.stringify({
            parm1: tipodoc,
            parm2: importe
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            impReg = parseFloat(data);
        },
        error: function (msg) { // Se ejecuta cuando hay algún fallo
            bootbox.alert({
                message: 'buscarRegistro ' + msg.responseText
            });
        }
    });    
    return impReg;
}

// Busca la tarifa de Gestión de Ingsa en la tabla del simulador SIMULA_1
function buscarIGestion(tipodoc, importe, acogido) {
    var impGes = 0;    
    $.ajax({
        type: "POST",
        cache: true,
        async: false,
        url: "/SimuladorPF/buscarGestion",
        data: JSON.stringify({
            parm1: tipodoc,
            parm2: importe,
            parm3: acogido
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            impGes = parseFloat(data);
        },
        error: function (msg) { // Se ejecuta cuando hay algún fallo
            bootbox.alert({
                message: 'buscarGestion ' + msg.responseText
            });
        }
    });    
    return impGes;
}

// Busca el multiplicador en base al número de fincas para Notaría NFINCAS
function buscarMNFincasN(nfincas) {
    var impMNFincas = 0;
    if (nfincas !== "0") {
        $.ajax({
            type: "POST",
            cache: true,
            async: false,
            url: "/SimuladorPF/buscarMNFincasN",
            data: JSON.stringify({
                parm1: nfincas
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                impMNFincas = parseFloat(data);
            },
            error: function (msg) { // Se ejecuta cuando hay algún fallo
                bootbox.alert({
                    message: 'buscarMNFincasN ' + msg.responseText
                });
            }
        });
    } else {
        bootbox.alert({
            message: 'Tiene que haber un nº de fincas.'
        });
    }
    return impMNFincas;
}

// Busca el multiplicador en base al número de fincas para Registro NFINCAS
function buscarMNFincasR(nfincas) {
    var impMNFincas = 0;
    if (nfincas !== "0") {
        $.ajax({
            type: "POST",
            cache: true,
            async: false,
            url: "/SimuladorPF/buscarMNFincasR",
            data: JSON.stringify({
                parm1: nfincas
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                impMNFincas = parseFloat(data);
            },
            error: function (msg) { // Se ejecuta cuando hay algún fallo
                bootbox.alert({
                    message: 'buscarMNFincasR ' + msg.responseText
                });
            }
        });
    } else {
        bootbox.alert({
            message: 'Tiene que haber un nº de fincas.'
        });
    }
    return impMNFincas;
}

// Pone a visible o no visible la tabla del cliente
function mostrarTabla(i, ver) {
    if (ver) {
        $("#TablaResultados" + i).removeClass("novisible");
        $("#TablaResultados" + i).addClass("sivisible");
        verImpCalculo(1);
        verBotonSimulacion(1);
    } else {
        $("#TablaResultados" + i).removeClass("sivisible");
        $("#TablaResultados" + i).addClass("novisible");
        verImpCalculo(0);
        verBotonSimulacion(0);
    }
}

// Pone a visible o no visible la tabla de CRN
function mostrarTablaCRN(i, ver) {
    if (ver) {
        $("#TablaResultadosCRN" + i).removeClass("novisible");
        $("#TablaResultadosCRN" + i).addClass("sivisible");
    } else {
        $("#TablaResultadosCRN" + i).removeClass("sivisible");
        $("#TablaResultadosCRN" + i).addClass("novisible");
    }
}

// Aplica el formato de número con separador de miles y comas decimales
function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1.$2");
    return x;
}

// Al cambiar la Base Imponible limpiará los datos necesarios
function vaciarCambioBI(i) {

    $("#fgvalBI" + i).val("");
    $("#fgvalUniViv" + i).prop('checked', false);
    $("#celImpNota" + i).val(parseFloat("0").toFixed(2));
    $("#celImpImpu" + i).val(parseFloat("0").toFixed(2));
    $("#celImpRegi" + i).val(parseFloat("0").toFixed(2));
    $("#celImpGest" + i).val(parseFloat("0").toFixed(2));
    $("#celImpTota" + i).val(parseFloat("0").toFixed(2));
    $("#celImpNotaCRN" + i).val(parseFloat("0").toFixed(2));
    $("#celImpImpuCRN" + i).val(parseFloat("0").toFixed(2));
    $("#celImpRegiCRN" + i).val(parseFloat("0").toFixed(2));
    $("#celImpGestCRN" + i).val(parseFloat("0").toFixed(2));
    $("#celImpTotaCRN" + i).val(parseFloat("0").toFixed(2));

}

// Oficina e Email del usuario activo de la tabla Usuarios de ExtranetIngsa
function datosUsuario() {
    var datos = "";
    $.ajax({
        type: "POST",
        cache: true,
        async: false,
        url: "/SimuladorPF/DatosUsuario",        
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            datos = data;
        },
        error: function (msg) { // Se ejecuta cuando hay algún fallo
            bootbox.alert({
                message: 'DatosUsuario ' + msg.responseText
            });
        }
    });    
    return datos;
}

// Función que muestra el número de fincas dependiendo del documento y sucursal
function agregarfincas(i, zona, tipoDocu) {

    let sel = document.getElementById("selectFinca" + i);
    while (sel.options.length) sel.options.remove(0);
    
    var option = document.createElement('option');
    option.value = "1";
    option.text = "1";
    sel.appendChild(option);

    if ((zona === "AL") && (tipoDocu === "8")) {
    } else {
        option = document.createElement('option');
        option.value = "2";
        option.text = "2";
        sel.appendChild(option);
        option = document.createElement('option');
        option.value = "3";
        option.text = "3";
        sel.appendChild(option);
        option = document.createElement('option');
        option.value = "4";
        option.text = "4";
        sel.appendChild(option);
        option = document.createElement('option');
        option.value = "5";
        option.text = "5";
        sel.appendChild(option);
    }
}

// CALCULOS PARA BIC e IBAN
/**
 * Función cálculo Dígito de control
 * Devuelve resultado del cálculo
 * Requiere la entidad, sucursal y cuenta bancaria
 *
 */
function calculoDigitoControl(entity, office, accountBank) {

    var first = 0,
        second = 0,
        calc = 0;

    var multi = new Array(1, 2, 4, 8, 5, 10, 9, 7, 3, 6);

    var arrEntity = entity.split('');
    arrEntity.forEach(function (v, i) {
        calc += (parseInt(v) * multi[i + 2]);
    });
    var arrOffice = office.split('');
    arrOffice.forEach(function (v, i) {
        calc += (parseInt(v) * multi[i + 6]);
    });

    calc = 11 - (calc % 11);

    switch (calc) {
        case 10:
            first = 1;
            break;
        case 11:
            first = 0;
            break;
        default:
            first = calc;
            break;
    }

    calc = 0;

    var arrAccountBank = accountBank.split('');
    arrAccountBank.forEach(function (v, i) {
        calc += (parseInt(v) * multi[i]);
    });

    calc = 11 - (calc % 11);

    switch (calc) {
        case 10:
            second = 1;
            break;
        case 11:
            second = 0;
            break;
        default:
            second = calc;
            break;
    }

    var digitControl = first.toString() + second.toString();
    return digitControl;
}

// Cálculo IBAN Requiere número de cuenta sin el IBAN
 function calculoIBAN(cuenta) {

    var iban = '';
    var iban_xx = '';
    var iban2 = '';
    var resto = 0;
    iban = cuenta;

    // Mayusculas.
    iban = iban.toUpperCase();
    iban2 = iban;
    iban_xx = iban;
    iban_xx = Equivalencia_Letras(iban_xx);
    iban = iban_xx;
    iban_xx = 'ES';
    iban_xx = Equivalencia_Letras(iban_xx);
    iban = iban + iban_xx + '00';
    
    // Cálculo Dígitos de Control.
    // Separar en Strings de 8 caracteres. Desbordamiento al intentar dividir un valor numérico de 24 dígitos.

    for (var i = 0; i < 34; i = i + 8) {
        iban_xx = resto.toString().trim() + iban.substr(i, 8);
        resto = parseInt(iban_xx) - (Math.trunc(parseInt(iban_xx) / 97) * 97);
    }

    // IBAN Formato Electrónico.
    resto = 98 - resto;
    if (resto == 0)
        iban = 'ES' + '00' + Trim(iban2);
    else {
        //iban = 'ES' + '0' + resto.toString.trim() + iban2.trim();
        if (resto < 10)
            iban = 'ES' + '0' + resto.toString() + iban2;
        else
            iban = 'ES' + resto.toString() + iban2;
    }
    return iban;
}

function Equivalencia_Letras(iban) {
    var iban_xx = iban;
    // Sustituir Letras por Números.    
    iban_xx = iban_xx.replace('A', '10');
    iban_xx = iban_xx.replace('B', '11');
    iban_xx = iban_xx.replace('C', '12');
    iban_xx = iban_xx.replace('D', '13');
    iban_xx = iban_xx.replace('E', '14');
    iban_xx = iban_xx.replace('F', '15');
    iban_xx = iban_xx.replace('G', '16');
    iban_xx = iban_xx.replace('H', '17');
    iban_xx = iban_xx.replace('I', '18');
    iban_xx = iban_xx.replace('J', '19');
    iban_xx = iban_xx.replace('K', '20');
    iban_xx = iban_xx.replace('L', '21');
    iban_xx = iban_xx.replace('M', '22');
    iban_xx = iban_xx.replace('N', '23');
    iban_xx = iban_xx.replace('O', '24');
    iban_xx = iban_xx.replace('P', '25');
    iban_xx = iban_xx.replace('Q', '26');
    iban_xx = iban_xx.replace('R', '27');
    iban_xx = iban_xx.replace('S', '28');
    iban_xx = iban_xx.replace('T', '29');
    iban_xx = iban_xx.replace('U', '30');
    iban_xx = iban_xx.replace('V', '31');
    iban_xx = iban_xx.replace('W', '32');
    iban_xx = iban_xx.replace('X', '33');
    iban_xx = iban_xx.replace('Y', '34');
    iban_xx = iban_xx.replace('Z', '35');
    return iban_xx;
}

function calculoBIC(cuenta) {
    var banco = cuenta.substr(0, 4);
    var BIC = "";
    if (banco.trim() !== "") {
        $.ajax({
            type: "POST",
            cache: true,
            async: false,
            url: "/SimuladorPF/buscarBIC",
            data: JSON.stringify({
                parm1: banco
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                BIC = data;
            },
            error: function (msg) { // Se ejecuta cuando hay algún fallo
                bootbox.alert({
                    message: 'calculoBIC ' + msg.responseText
                });
            }
        });
    }
    return BIC;
}

