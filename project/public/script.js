$('#flash-message').fadeOut(2000, function() { 
  // Funzione di callback eseguita dopo la dissolvenza (opzionale) $(this).remove(); 
  // 
  // Rimuovi l'elemento dal DOM dopo la dissolvenza  
  });  


function aggiungiAlCarrello(codart, price, userId, qty) {
  fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ codart: codart, price: price, userId: userId, qty: qty })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Prodotto aggiunto al carrello');
      window.location.href = `/articolo/${data.codart}`;
    } else {
      console.error('Errore nell\'aggiunta del prodotto al carrello:', data.message);
    }
  })
  .catch(error => {
    console.error('Errore di rete:', error);
  });
}

async function eliminaArticoloCarrello(id) {
  try {
    const response = await fetch('/api/delete/cart/' + id, {
      method: 'DELETE',
    });

    if (response.ok) {
      const data = await response.json(); // Analizza la risposta JSON
      if (data.success) {
        console.log('Articolo eliminato con successo');
        // Aggiorna l'interfaccia utente qui (ad esempio, rimuovi l'elemento dal carrello)
        // Oppure, se vuoi ricaricare la pagina:
        window.location.href = '/cart';
      } else {
        console.error('Errore durante l\'eliminazione dell\'articolo: risposta non valida');
      }
    } else {
      console.error('Errore durante l\'eliminazione dell\'articolo:', response.status);
    }
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'articolo:', error);
  }
}

function modificaQuantitaCarrello(id, qty) {
  fetch('/api/update/cart/' + id, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id:id, qty: Number(qty) })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = '/cart';
    } else {
      console.error('Errore nell\'aggiornamento della quantità al carrello:', data.message);
    }
  })
  .catch(error => {
    console.error('Errore di rete:', error);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  recuperaTotaleCarrello();
});

function aggiornaTotaleCarrello(newValue) {
  // Lets suppose this is the element you are trying to modify.
  const totaleCarrelloElement = document.querySelector('#carrello-totale');
  if (totaleCarrelloElement) { // Check whether the element has been correctly selected
    totaleCarrelloElement.textContent = newValue;
  } else {
    console.error('Elemento #totaleCarrello non trovato!');
  }
}


function recuperaTotaleCarrello() {
  fetch('/api/cart/total') 
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        aggiornaTotaleCarrello(data.totale);
      } else {
        console.error('Errore nel recupero del totale del carrello:', data.message);
      }
    })
    .catch(error => {
      console.error('Errore di rete:', error);
    });
}