const API_URL = "http://localhost:3000/productos";

document.addEventListener("DOMContentLoaded", listarProductos);

// Manejo del formulario para AGREGAR o ACTUALIZAR producto
document.getElementById('productoForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('productoId').value.trim();
    const codigo = document.getElementById('codigo').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const cantidad = parseInt(document.getElementById('cantidad').value, 10);
    const precio = parseFloat(document.getElementById('precio').value);

    if (!codigo || !nombre || !descripcion || isNaN(cantidad) || isNaN(precio)) {
        alert('Todos los campos son obligatorios y deben ser válidos.');
        return;
    }

    try {
        let response;
        if (id === "") {
            // AGREGAR (POST)
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo_referencia: codigo,
                    nombre,
                    descripcion,
                    cantidad,
                    precio
                })
            });
        } else {
            // ACTUALIZAR (PUT)
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo_referencia: codigo,
                    nombre,
                    descripcion,
                    cantidad,
                    precio
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error desconocido');
        }

        alert(id === "" ? 'Producto agregado correctamente' : 'Producto actualizado correctamente');
        document.getElementById('productoForm').reset();
        document.getElementById('productoId').value = "";
        document.getElementById('submitBtn').textContent = "Agregar Producto";
        listarProductos();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});
async function buscarPorNombre() {
    const nombre = document.getElementById('buscarNombre').value.trim();
    if (!nombre) {
        alert('Ingrese un nombre para buscar.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/productos/nombre/${nombre}`);
        if (!response.ok) throw new Error('No se encontraron productos');

        const productos = await response.json();
        mostrarResultadosBusqueda(productos);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
function mostrarResultadosBusqueda(productos) {
    const tbody = document.querySelector('#productosTabla tbody');
    tbody.innerHTML = ""; // Limpiar la tabla antes de mostrar los resultados

    productos.forEach(prod => {
        const precioCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(prod.precio);
        const precioTotal = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(prod.precio * prod.cantidad);
        
        // Asegurarse de manejar la fecha correctamente
        let fechaRegistro = "No registrada";
        if (prod.fecha) {  // Asegurar que el campo exista
            const fechaObj = new Date(prod.fecha);
            if (!isNaN(fechaObj)) {  // Verifica si la fecha es válida
                fechaRegistro = fechaObj.toLocaleString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "America/Bogota"
                });
            }
        }

        const row = `
            <tr>
                <td>${prod.id}</td>
                <td>${prod.codigo_referencia}</td>
                <td>${prod.nombre}</td>
                <td>${prod.descripcion}</td>
                <td>${prod.cantidad}</td>
                <td>${precioCOP}</td>
                <td>${precioTotal}</td>
                <td>${fechaRegistro}</td> <!-- Aquí se muestra la fecha correctamente -->
                <td>
                    <button class="btn-restar" onclick="restarCantidad(${prod.id})">Restar 1</button>
                    <button class="btn-eliminar" onclick="eliminarProducto(${prod.id})">Eliminar</button>
                    <button class="btn-editar" onclick='editarProducto(${prod.id}, ${JSON.stringify(prod.codigo_referencia)}, ${JSON.stringify(prod.nombre)}, ${JSON.stringify(prod.descripcion)}, ${prod.cantidad}, ${prod.precio})'>Editar</button>
                </td>
            </tr>`;

        tbody.insertAdjacentHTML("beforeend", row);
    });
}



// Función para listar productos con precio original y precio total
async function listarProductos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al obtener productos');
        const productos = await response.json();
        
        const tbody = document.querySelector('#productosTabla tbody');
        tbody.innerHTML = "";

        productos.forEach(prod => {
            const precioNum = parseFloat(prod.precio) || 0;
            const formatoCOP = new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP"
            }).format(precioNum);

            const precioTotal = precioNum * prod.cantidad;
            const formatoTotalCOP = new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP"
            }).format(precioTotal);

            const fechaFormateada = new Date(prod.fecha).toLocaleString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Bogota"
            });

            const row = `<tr>
                <td>${prod.id}</td>
                <td>${prod.codigo_referencia}</td>
                <td>${prod.nombre}</td>
                <td>${prod.descripcion}</td>
                <td>${prod.cantidad}</td>
                <td>${formatoCOP}</td> <!-- Precio Original -->
                <td>${formatoTotalCOP}</td> <!-- Precio Total -->
                <td>${fechaFormateada}</td>
                <td>
                    <button onclick="reducirCantidad(${prod.id})">Restar 1</button>
                    <button onclick="eliminarProducto(${prod.id})">Eliminar</button>
                    <button onclick="editarProducto(${prod.id}, '${prod.codigo_referencia}', '${prod.nombre}', '${prod.descripcion}', ${prod.cantidad}, ${precioNum})">Editar</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Consultar producto por código (ruta GET /productos/codigo/:codigo)
async function consultarProducto() {
    const codigo = document.getElementById('buscarCodigo').value.trim();
    if (!codigo) {
        alert('Ingrese un código de referencia para buscar.');
        return;
    }
    try {
        const response = await fetch(`${API_URL}/codigo/${codigo}`);
        if (!response.ok) throw new Error('Producto no encontrado');
        const producto = await response.json();

        const precioNum = parseFloat(producto.precio) || 0;
        const formatoCOP = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP"
        }).format(precioNum);

        const fechaFormateada = new Date(producto.fecha).toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Bogota"
        });

        document.getElementById('resultado').innerHTML = `
            <p>ID: ${producto.id}, 
            Código: ${producto.codigo_referencia}, 
            Nombre: ${producto.nombre}, 
            Cantidad: ${producto.cantidad}, 
            Precio: ${formatoCOP},
            Fecha: ${fechaFormateada}</p>
            <button onclick="editarProducto(${producto.id}, '${producto.codigo_referencia}', '${producto.nombre}', '${producto.descripcion}', ${producto.cantidad}, ${precioNum})">
                Editar
            </button>
        `;
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Reducir cantidad de un producto
async function reducirCantidad(id) {
    const cantidadReducir = prompt("¿Cuántas unidades deseas reducir?");
    if (!cantidadReducir || isNaN(cantidadReducir) || cantidadReducir <= 0) {
        alert("Debes ingresar un número válido.");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/reducir/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: parseInt(cantidadReducir, 10) })
        });
        if (!response.ok) throw new Error('No se pudo reducir la cantidad');
        alert('Cantidad reducida correctamente');
        listarProductos();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Eliminar un producto
async function eliminarProducto(id) {
    if (confirm("¿Seguro que quieres eliminar este producto?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar producto');
            alert('Producto eliminado correctamente');
            listarProductos();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}

// Editar producto: carga los datos en el formulario para actualizar
function editarProducto(id, codigo, nombre, descripcion, cantidad, precio) {
    document.getElementById('productoId').value = id;
    document.getElementById('codigo').value = codigo;
    document.getElementById('nombre').value = nombre;
    document.getElementById('descripcion').value = descripcion;
    document.getElementById('cantidad').value = cantidad;
    document.getElementById('precio').value = precio;
    document.getElementById('submitBtn').textContent = "Actualizar Producto";
}
