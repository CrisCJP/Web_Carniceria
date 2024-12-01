// JavaScript para controlar el modal
var modal = document.getElementById('modalEfectivo');
//var modal_envoice = document.getElementById('modalEnvoicedetails');
var btn = document.getElementById('btnTerminarVentar');
var span = document.getElementsByClassName('close_efectivo')[0];
var submitEfectivo = document.getElementById('submitEfectivo');

btn.onclick = function() {
  modal.style.display = 'block';
}

span.onclick = function() {
  modal.style.display = 'none';
}

submitEfectivo.onclick = function() {
    var efectivo = document.getElementById('inputEfectivo').value;
    var moneda = document.getElementById('cboMoney').value;
    if (efectivo != null && efectivo != '' && efectivo > 0) {
      if (moneda == 1) {
        get_sum_of_products(efectivo);
        modal.style.display = 'none';
      }
      else if (moneda == 2) {
        if (efectivo > 0) {
          getTypeMoney().then(value_money => {
            get_sum_of_products((efectivo * value_money));
            modal.style.display = 'none';
          }).catch(error => {
            alert(error);
          });
        }
        else {
          alert('Debes ingresar la cantidad de efectivo, asegurate que se mayor que 0 y evitar operaciones.');
        }
      }
      
    } else {
      alert('Debes ingresar la cantidad de efectivo, asegurate que se mayor que 0 y evitar operaciones.');
    }
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

function getTypeMoney() {
  return new Promise((resolve, reject) => {
    
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getTypeMoney', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        if ('message' in json) {
          reject('Hubo un error al obtener la moneda');
        } else if (json && typeof json === 'object' && Object.keys(json).length > 0) {
          resolve(json.money);
        } else {
          reject('Formato de respuesta inválido');
        }
      } else {
        reject('Solicitud fallida con estado ' + xhr.status);
      }
    };
    xhr.onerror = function() {
      reject('Solicitud fallida');
    };
    xhr.send();
  });
};