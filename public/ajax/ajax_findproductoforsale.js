const inputBusqueda = document.getElementById('cboBuscarProducto');
const listaResultados = document.getElementById('resultados');

inputBusqueda.addEventListener('input', async () => {
    const terminoBusqueda = inputBusqueda.value;

    // Make an AJAX request to the server (path '/search_productsale') with the search term
    const response = await fetch(`/search_productsale?term=${terminoBusqueda}`);
    const data = await response.json();

    // Update the results list with product names
    listaResultados.innerHTML = '';
    listaResultados.style.display = 'block';
    data.filteredProducts.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = producto.NombreProducto;

        li.addEventListener('click', () => {
            inputBusqueda.value = producto.NombreProducto;
            if (producto.UnidadDeMedida == 1)
                document.getElementById('txtCosto').value = producto.PrecioVenta + ' C$' + ' por unidad';

            else
            document.getElementById('txtCosto').value = producto.PrecioVenta + ' C$' + ' por libra';
            listaResultados.innerHTML = '';
        });

        listaResultados.appendChild(li);
    });
    if (inputBusqueda.value === '') {
        listaResultados.innerHTML = '';
        listaResultados.style.display = 'none';
        document.getElementById('txtCosto').value = '';
    }
});

