var map;
var markers = [];
var infoWindow;
var userMarker;
var searchMarkers = []; // Adicionamos um novo array para armazenar os marcadores da pesquisa

function initMap() {
  var pos = { lat: -23.4869, lng: -46.3483 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: pos,
    zoom: 8,
  });

  infoWindow = new google.maps.InfoWindow();

  var input = document.getElementById("searchInput");
  var searchBox = new google.maps.places.SearchBox(input);

  map.addListener("bounds_changed", function () {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener("places_changed", function () {
    clearSearchMarkers(); // Limpa os marcadores da pesquisa antes de adicionar novos

    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    var bounds = new google.maps.LatLngBounds();
    places.forEach(function (place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      var marker = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location,
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png", // Alterado para azul
      });

      searchMarkers.push(marker); // Adiciona ao array de marcadores da pesquisa

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });

    map.fitBounds(bounds);
    map.setZoom(15);
  });

  geolocate();
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Erro: O serviço de geolocalização falhou."
      : "Erro: Seu navegador não suporta geolocalização."
  );
  infoWindow.open(map);
}

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        clearSearchMarkers(); // Remova os marcadores da pesquisa antes de adicionar novos

        if (userMarker) {
          userMarker.setMap(null);
        }

        userMarker = new google.maps.Marker({
          position: pos,
          map: map,
          title: "Você está aqui!",
          icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        });

        map.setCenter(pos);
        map.setZoom(15);

        var queries = ["Pesqueiros", "Loja de Artigos de pesca", "Represa"];
        queries.forEach(function (query) {
          searchPlaces(query);
        });
      },
      function () {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

// Função para traçar a rota entre dois pontos
function calculateAndDisplayRoute(start, end) {
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();

  directionsRenderer.setMap(map);

  directionsService.route(
    {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    function (response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Falha ao calcular a rota: " + status);
      }
    }
  );
}

function searchPlaces(query) {
  var service = new google.maps.places.PlacesService(map);
  service.textSearch(
    {
      location: map.getCenter(),
      radius: "5000", // Aumente o raio conforme necessário
      query: query + " loja de pesca", // Adicione "loja de pesca" à consulta para melhorar a precisão
      type: ["store", "establishment"], // Limite a pesquisa a tipos específicos de lugares
    },
    function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        clearSearchMarkers();

        for (var i = 0; i < results.length; i++) {
          createSearchMarker(results[i]);
        }
      }
    }
  );
}

function createSearchMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    title: "Loja de Pesca",
    position: place.geometry.location,
    icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png", // Alterado para amarelo
  });

  searchMarkers.push(marker);
}

function clearSearchMarkers() {
  // Remove todos os marcadores da pesquisa do mapa e limpa o array
  searchMarkers.forEach(function (marker) {
    marker.setMap(null);
  });
  searchMarkers = [];
}
