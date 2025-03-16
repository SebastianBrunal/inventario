const API_HERRAMIENTAS = "http://localhost:3000/herramientas";

document.addEventListener("DOMContentLoaded", listarHerramientas);

// Agregar o actualizar herramientas
document.getElementById('herramientaForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('herramientaId').value.trim();
    const nombre = document.getElementById('nombreHerramienta').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadHerramienta').value, 10);

    if (!nombre || isNaN(cantidad)) {
        alert('Todos los campos son obligatorios y deben ser válidos.');
        return;
    }

    try {
        let response;
        if (id === "") {
            response = await fetch(API_HERRAMIENTAS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, cantidad })
            });
        } else {
            response = await fetch(`${API_HERRAMIENTAS}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, cantidad })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error desconocido');
        }

        alert(id === "" ? 'Herramienta agregada correctamente' : 'Herramienta actualizada correctamente');
        document.getElementById('herramientaForm').reset();
        document.getElementById('herramientaId').value = "";
        listarHerramientas();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});
async function buscarHerramientaPorNombre() {
    const nombre = document.getElementById('buscarNombreHerramienta').value.trim();
    if (!nombre) {
        alert('Ingrese un nombre para buscar.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/herramientas/nombre/${nombre}`);
        if (!response.ok) throw new Error('No se encontraron herramientas');

        const herramientas = await response.json();
        mostrarResultadosBusquedaHerramientas(herramientas);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

function mostrarResultadosBusquedaHerramientas(herramientas) {
    const tbody = document.querySelector('#herramientasTabla tbody');
    tbody.innerHTML = ""; // Limpiar la tabla antes de mostrar los resultados

    herramientas.forEach(herr => {
        const row = `
            <tr>
                <td>${herr.id}</td>
                <td>${herr.nombre}</td>
                <td>${herr.cantidad}</td>
                <td>
                    <button onclick="editarHerramienta(${herr.id}, '${herr.nombre}', ${herr.cantidad})">Editar</button>
                    <button onclick="eliminarHerramienta(${herr.id})">Eliminar</button>
                </td>
            </tr>`;

        tbody.insertAdjacentHTML("beforeend", row);
    });
}

// Listar herramientas
async function listarHerramientas() {
    try {
        const response = await fetch(API_HERRAMIENTAS);
        if (!response.ok) throw new Error('Error al obtener herramientas');

        const herramientas = await response.json();
        const tbody = document.querySelector('#herramientasTabla tbody');
        tbody.innerHTML = "";

        herramientas.forEach(herr => {
            const row = `<tr>
                <td>${herr.id}</td>
                <td>${herr.nombre}</td>
                <td>${herr.cantidad}</td>
                <td>
                    <button onclick="editarHerramienta(${herr.id}, '${herr.nombre}', ${herr.cantidad})">Editar</button>
                    <button onclick="eliminarHerramienta(${herr.id})">Eliminar</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Eliminar herramienta
async function eliminarHerramienta(id) {
    if (confirm("¿Seguro que quieres eliminar esta herramienta?")) {
        try {
            const response = await fetch(`${API_HERRAMIENTAS}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar herramienta');
            alert('Herramienta eliminada correctamente');
            listarHerramientas();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}

// Editar herramienta
function editarHerramienta(id, nombre, cantidad) {
    document.getElementById('herramientaId').value = id;
    document.getElementById('nombreHerramienta').value = nombre;
    document.getElementById('cantidadHerramienta').value = cantidad;
}
